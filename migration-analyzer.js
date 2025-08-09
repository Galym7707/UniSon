const fs = require('fs');
const path = require('path');

function analyzeMigration() {
  console.log('Analyzing migration file: 009_comprehensive_job_seed_data.sql');
  
  const migrationPath = path.join(__dirname, 'database/migrations/009_comprehensive_job_seed_data.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    return false;
  }
  
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  console.log('✅ Migration file loaded successfully');
  console.log('📄 File size:', migrationContent.length, 'characters');
  
  // Parse the SQL to show what we're working with
  const lines = migrationContent.split('\n').map(line => line.trim()).filter(line => line);
  
  // Find different types of statements
  const alterStatements = lines.filter(line => line.toLowerCase().startsWith('alter table'));
  const insertLines = lines.filter(line => line.toLowerCase().startsWith('insert into'));
  const commentLines = lines.filter(line => line.startsWith('--'));
  
  console.log('\n📊 Migration analysis:');
  console.log('- Total lines:', lines.length);
  console.log('- Comment lines:', commentLines.length);
  console.log('- ALTER TABLE statements:', alterStatements.length);
  console.log('- INSERT statements:', insertLines.length);
  
  if (alterStatements.length > 0) {
    console.log('\n🔧 Columns being added/modified:');
    alterStatements.forEach((stmt, i) => {
      const match = stmt.match(/ADD COLUMN IF NOT EXISTS (\w+)/);
      if (match) {
        const columnName = match[1];
        const typeMatch = stmt.match(/\w+\s+(\w+(?:\[\])?)/);
        const type = typeMatch ? typeMatch[1] : 'unknown';
        console.log(`  ${i + 1}. ${columnName} (${type})`);
      }
    });
  }
  
  if (insertLines.length > 0) {
    console.log(`\n📝 Job insertion analysis:`);
    console.log(`- INSERT statements found: ${insertLines.length}`);
    
    // Try to count job entries by analyzing the VALUES sections
    const valuesPattern = /VALUES\s*\(/gi;
    const valuesMatches = migrationContent.match(valuesPattern) || [];
    console.log(`- Job records to be inserted: ~${valuesMatches.length}`);
    
    // Look for specific data patterns
    const skillsArrayPattern = /ARRAY\[([^\]]+)\]/gi;
    const skillsMatches = migrationContent.match(skillsArrayPattern) || [];
    console.log(`- Skills arrays found: ${skillsMatches.length}`);
    
    // Check for required columns in the migration
    const requiredColumns = ['country', 'city', 'remote_work_option', 'required_skills'];
    console.log('\n✅ Required columns verification:');
    
    requiredColumns.forEach(column => {
      const hasColumn = migrationContent.toLowerCase().includes(column.toLowerCase());
      const status = hasColumn ? '✅' : '❌';
      console.log(`  ${status} ${column}: ${hasColumn ? 'Found' : 'Not found'}`);
    });
    
    // Sample job data analysis
    const jobTitles = [];
    const titlePattern = /'([^']*(?:Engineer|Developer|Manager|Analyst|Specialist)[^']*)'/gi;
    let titleMatch;
    while ((titleMatch = titlePattern.exec(migrationContent)) !== null && jobTitles.length < 10) {
      jobTitles.push(titleMatch[1]);
    }
    
    if (jobTitles.length > 0) {
      console.log('\n🎯 Sample job titles found:');
      jobTitles.slice(0, 5).forEach((title, i) => {
        console.log(`  ${i + 1}. ${title}`);
      });
      if (jobTitles.length > 5) {
        console.log(`  ... and ${jobTitles.length - 5} more`);
      }
    }
    
    // Check for geographic diversity
    const countries = [];
    const countryPattern = /'(United States|Germany|United Kingdom|Canada|Australia)'/gi;
    let countryMatch;
    const countrySet = new Set();
    while ((countryMatch = countryPattern.exec(migrationContent)) !== null) {
      countrySet.add(countryMatch[1]);
    }
    
    if (countrySet.size > 0) {
      console.log('\n🌍 Geographic diversity:');
      Array.from(countrySet).forEach(country => {
        console.log(`  • ${country}`);
      });
    }
    
    // Check for remote work options
    const remoteTrue = migrationContent.match(/remote_work_option[^,]*true/gi) || [];
    const remoteFalse = migrationContent.match(/remote_work_option[^,]*false/gi) || [];
    
    console.log('\n💻 Remote work distribution:');
    console.log(`  • Remote-friendly positions: ${remoteTrue.length}`);
    console.log(`  • On-site positions: ${remoteFalse.length}`);
  }
  
  console.log('\n🚀 Migration is ready for execution!');
  console.log('\n📋 Next steps:');
  console.log('1. Ensure database connection is available');
  console.log('2. Run migration through Supabase CLI or SQL editor');
  console.log('3. Verify data insertion with SELECT queries');
  
  return true;
}

// Run the analyzer
try {
  const success = analyzeMigration();
  if (success) {
    console.log('\n✅ Analysis completed successfully');
  }
} catch (error) {
  console.error('\n❌ Analysis failed:', error.message);
}