// Script to create the companies table in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createCompaniesTable() {
  // Initialize Supabase client with admin privileges
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', supabaseUrl);
  console.log('Key available:', !!supabaseServiceRoleKey);

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Supabase credentials are missing. Check your environment variables.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Creating companies table...');
    
    // Try to query the companies table to see if it exists
    const { data: existingCompanies, error: checkError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    // If no error, table exists
    if (!checkError) {
      console.log('Companies table already exists!');
      return;
    }
    
    // If error is not a "not found" error, it's a real error
    if (checkError.code !== 'PGRST204') {
      console.error('Error checking if table exists:', checkError);
      process.exit(1);
    }
    
    // If we get here, table doesn't exist (404 error)
    
    // Create the companies table using REST API
    console.log('Creating companies table...');
    
    // First, create the table structure
    const { error: createError } = await supabase
      .from('companies')
      .insert({
        id: '00000000-0000-0000-0000-000000000000', // Placeholder row that we'll delete
        owner_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        name: 'Placeholder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (createError) {
      console.error('Error creating companies table:', createError);
      process.exit(1);
    }
    
    // Delete the placeholder row
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('Error deleting placeholder row:', deleteError);
      // Continue anyway
    }

    console.log('Companies table created successfully!');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createCompaniesTable();