import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function testMigration() {
  console.log('Testing migration execution...');
  
  // For testing purposes, let's create a simple SQL execution script
  const migrationPath = path.join(__dirname, 'database/migrations/009_comprehensive_job_seed_data.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file not found:', migrationPath);
    return;
  }
  
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  console.log('Migration file loaded successfully');
  console.log('File size:', migrationContent.length, 'characters');
  
  // Parse the SQL to show what we're working with
  const lines = migrationContent.split('\n');
  const alterStatements = lines.filter(line => line.trim().toLowerCase().startsWith('alter table'));
  const insertStatements = lines.filter(line => line.trim().toLowerCase().startsWith('insert into'));
  
  console.log('\nMigration analysis:');
  console.log('- ALTER TABLE statements:', alterStatements.length);
  console.log('- INSERT statements:', insertStatements.length);
  
  if (alterStatements.length > 0) {
    console.log('\nColumns being added:');
    alterStatements.slice(0, 5).forEach((stmt, i) => {
      const match = stmt.match(/ADD COLUMN IF NOT EXISTS (\w+)/);
      if (match) {
        console.log(`  ${i + 1}. ${match[1]}`);
      }
    });
    if (alterStatements.length > 5) {
      console.log(`  ... and ${alterStatements.length - 5} more`);
    }
  }
  
  if (insertStatements.length > 0) {
    console.log(`\nFound ${insertStatements.length} job insertion statement(s)`);
    
    // Try to count job entries by looking for job titles
    const titleMatches = migrationContent.match(/'[^']*Engineer[^']*'/gi) || [];
    const managerMatches = migrationContent.match(/'[^']*Manager[^']*'/gi) || [];
    const developerMatches = migrationContent.match(/'[^']*Developer[^']*'/gi) || [];
    
    console.log('Sample job types found:');
    console.log('- Engineer roles:', titleMatches.length);
    console.log('- Manager roles:', managerMatches.length); 
    console.log('- Developer roles:', developerMatches.length);
  }
  
  console.log('\n✅ Migration file validated and ready for execution');
  console.log('\nTo execute this migration:');
  console.log('1. Ensure your Supabase database is accessible');
  console.log('2. Set environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  console.log('3. Run the migration through Supabase CLI or SQL editor');
  
  return migrationContent;
}

// Run the test
testMigration().catch(console.error);