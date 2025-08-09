const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function executeMigration() {
  // Use command line argument or default to 010 migration
  const migrationFile = process.argv[2] || 'database/migrations/010_standardize_jobs_table_schema.sql';
  
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
    const migrationPath = path.resolve(migrationFile);
    if (!fs.existsSync(migrationPath)) {
      console.error('Migration file not found:', migrationPath);
      process.exit(1);
    }
    
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`Executing migration: ${path.basename(migrationFile)}`);
    console.log('Migration file size:', migrationSql.length, 'characters');

    // Split migration into statements and execute them one by one
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Execute each statement using raw SQL
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          // Some errors might be expected (like table already exists)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.warn(`Warning: ${error.message}`);
          } else {
            console.error(`Error executing statement ${i + 1}:`, error.message);
            throw error;
          }
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (statementError) {
        console.error(`Fatal error executing statement ${i + 1}:`, statementError);
        throw statementError;
      }
    }

    console.log('Migration completed successfully!');

    // Verify the jobs table structure
    console.log('\nVerifying jobs table structure...');
    const { data: jobs, error: queryError } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);

    if (queryError) {
      console.error('Error querying jobs table:', queryError);
    } else {
      console.log('✅ Jobs table is accessible');
      
      if (jobs.length > 0) {
        const job = jobs[0];
        const requiredColumns = [
          'id', 'employer_id', 'title', 'company', 'description', 
          'country', 'city', 'remote_work_option', 'required_skills',
          'salary_min', 'salary_max', 'employment_type', 'experience_level',
          'posted_at', 'created_at', 'updated_at'
        ];
        
        console.log('\nColumn verification:');
        requiredColumns.forEach(col => {
          const hasColumn = job.hasOwnProperty(col);
          console.log(`   ${col}: ${hasColumn ? '✅' : '❌'}`);
        });
      } else {
        console.log('Table exists but no sample data found');
      }
    }

    // Get total count
    const { data: countData, error: countError } = await supabase
      .from('jobs')
      .select('id');

    if (!countError && countData) {
      console.log(`\nTotal jobs in database: ${countData.length}`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

executeMigration();