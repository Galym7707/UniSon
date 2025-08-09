const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function executeMigration() {
  // Get migration file path from command line argument
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error('Please provide a migration file path as an argument');
    console.error('Usage: node execute-migration-single.js database/migrations/filename.sql');
    process.exit(1);
  }

  // Use environment variables or hard-coded values for testing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing required environment variables:');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Set' : 'Missing');
    console.error('Please set these environment variables and try again.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, migrationFile);
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    const migrationName = path.basename(migrationFile);

    console.log(`Executing migration: ${migrationName}`);
    console.log('Migration file size:', migrationSql.length, 'characters');

    // Split migration into statements and execute one by one
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`Found ${statements.length} statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (statementError) {
        console.error(`Error executing statement ${i + 1}:`, statementError);
      }
    }

    console.log('Migration execution completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

executeMigration();