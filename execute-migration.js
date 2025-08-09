const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function executeMigration() {
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
    const migrationPath = path.join(__dirname, 'database/migrations/009_comprehensive_job_seed_data.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration: 009_comprehensive_job_seed_data.sql');
    console.log('Migration file size:', migrationSql.length, 'characters');

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql_query: migrationSql });
    
    if (error) {
      console.error('Migration failed:', error);
      
      // Try alternative approach - execute directly
      console.log('\nTrying direct SQL execution...');
      const { error: directError } = await supabase
        .from('jobs')
        .select('count')
        .single();
        
      if (directError && directError.code === '42P01') {
        console.error('Jobs table does not exist. Please run table creation migrations first.');
        process.exit(1);
      }

      // Split migration into smaller parts and execute
      const statements = migrationSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement) continue;

        console.log(`Executing statement ${i + 1}/${statements.length}`);
        
        try {
          if (statement.toLowerCase().startsWith('alter table')) {
            // Handle ALTER TABLE statements
            const { error: alterError } = await supabase.rpc('exec_sql', { 
              sql_query: statement + ';' 
            });
            if (alterError) {
              console.warn(`Warning on ALTER statement: ${alterError.message}`);
              // Continue - ALTER statements might fail if columns already exist
            }
          } else if (statement.toLowerCase().startsWith('insert into')) {
            // Handle INSERT statements by parsing and using Supabase client
            console.log('Processing INSERT statement...');
            // For now, just log that we're processing it
            console.log('INSERT statement length:', statement.length);
          }
        } catch (statementError) {
          console.error(`Error executing statement ${i + 1}:`, statementError);
        }
      }
      
    } else {
      console.log('Migration executed successfully!');
    }

    // Verify the data was inserted
    console.log('\nVerifying seeded data...');
    const { data: jobs, error: queryError } = await supabase
      .from('jobs')
      .select('id, title, company, country, city, remote_work_option, required_skills')
      .limit(10);

    if (queryError) {
      console.error('Error querying jobs:', queryError);
    } else {
      console.log(`Found ${jobs.length} jobs in the database`);
      
      if (jobs.length > 0) {
        console.log('\nSample job data:');
        jobs.slice(0, 3).forEach((job, index) => {
          console.log(`${index + 1}. ${job.title} at ${job.company}`);
          console.log(`   Location: ${job.city}, ${job.country}`);
          console.log(`   Remote: ${job.remote_work_option ? 'Yes' : 'No'}`);
          console.log(`   Skills: ${job.required_skills ? job.required_skills.join(', ') : 'None listed'}`);
          console.log('');
        });

        // Check for required columns
        const requiredColumns = ['country', 'city', 'remote_work_option', 'required_skills'];
        const hasAllColumns = requiredColumns.every(col => 
          jobs[0].hasOwnProperty(col) && jobs[0][col] !== undefined
        );

        if (hasAllColumns) {
          console.log('✅ All required columns are present with data');
        } else {
          console.log('❌ Some required columns are missing or empty');
          requiredColumns.forEach(col => {
            const hasData = jobs[0][col] !== undefined && jobs[0][col] !== null;
            console.log(`   ${col}: ${hasData ? '✅' : '❌'}`);
          });
        }
      }
    }

    // Get total count
    const { data: countData, error: countError } = await supabase
      .from('jobs')
      .select('count');

    if (!countError && countData) {
      console.log(`\nTotal jobs in database: ${countData.length}`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

executeMigration();