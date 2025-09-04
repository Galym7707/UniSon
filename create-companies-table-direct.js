// Script to create the companies table in Supabase using direct API calls
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createCompaniesTable() {
  // Initialize Supabase client with admin privileges
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    console.log('Checking if companies table exists...');
    
    // Try to query the companies table
    const { error: checkError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    // If no error, table exists
    if (!checkError) {
      console.log('Companies table already exists!');
      return;
    }
    
    // If we get here, we need to create the table
    console.log('Creating companies table...');
    
    // Create a test record in the profiles table to verify connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Error connecting to database:', testError);
      process.exit(1);
    }
    
    console.log('Database connection verified. Found profiles:', testData);
    console.log('\nTo create the companies table, please:');
    console.log('1. Go to the Supabase dashboard at https://app.supabase.com');
    console.log('2. Open your project');
    console.log('3. Go to the SQL Editor');
    console.log('4. Run the following SQL:');
    console.log('\n----------------------------------------');
    console.log(`
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  industry TEXT,
  size TEXT,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policies for companies table
-- Only authenticated users can view companies
CREATE POLICY "Authenticated users can view companies" ON public.companies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only company owners can update their own company
CREATE POLICY "Owners can update their own company" ON public.companies
    FOR UPDATE USING (auth.uid() = owner_id);

-- Only company owners can delete their own company
CREATE POLICY "Owners can delete their own company" ON public.companies
    FOR DELETE USING (auth.uid() = owner_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies(name);
CREATE INDEX IF NOT EXISTS companies_industry_idx ON public.companies(industry);
`);
    console.log('----------------------------------------');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createCompaniesTable();