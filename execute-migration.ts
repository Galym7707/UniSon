import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function executeMigration() {
  // Use environment variables or prompt user to set them
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅ Set' : '❌ Missing');
    console.error('\n📝 Please create a .env.local file with the following variables:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
    console.error('\n💡 You can find these values in your Supabase project settings');
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

    // First check if jobs table exists
    console.log('\nChecking if jobs table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.error('❌ Jobs table does not exist. Please run table creation migrations first.');
      process.exit(1);
    }

    console.log('✅ Jobs table exists');

    // Execute ALTER TABLE statements first
    console.log('\nExecuting ALTER TABLE statements...');
    const alterStatements = [
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_logo_url TEXT`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}'`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS nice_to_have_skills TEXT[] DEFAULT '{}'`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')) DEFAULT 'mid'`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS remote_work_option BOOLEAN DEFAULT false`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}'`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS psychological_traits TEXT[] DEFAULT '{}'`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'technology'`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS department TEXT`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_requirements TEXT`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT`,
      `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')) DEFAULT 'medium'`
    ];

    for (const statement of alterStatements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error) {
          console.warn(`Warning on ALTER statement: ${error.message}`);
        } else {
          console.log('✅ ALTER statement executed successfully');
        }
      } catch (err) {
        console.warn(`Warning on ALTER statement: ${err}`);
      }
    }

    // Now insert the seed data using Supabase client
    console.log('\nInserting seed data...');
    
    const jobsData = [
      {
        title: 'Senior Software Engineer',
        description: 'Join our dynamic engineering team to build scalable web applications that serve millions of users worldwide. You will work with cutting-edge technologies and contribute to architectural decisions that shape our platform.',
        company: 'TechNova Inc.',
        country: 'United States',
        city: 'San Francisco',
        salary_min: 150000,
        salary_max: 220000,
        employment_type: 'full-time',
        company_logo_url: 'https://logo.clearbit.com/technova.com',
        required_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
        nice_to_have_skills: ['TypeScript', 'GraphQL', 'Kubernetes', 'Redis', 'Microservices'],
        experience_level: 'senior',
        remote_work_option: true,
        benefits: ['Health Insurance', '401k Match', 'Flexible PTO', 'Stock Options', 'Learning Budget'],
        psychological_traits: ['Problem Solving', 'Leadership', 'Innovation', 'Collaboration'],
        industry: 'technology',
        department: 'Engineering',
        job_requirements: '5+ years of software development experience, Strong proficiency in JavaScript and modern frameworks, Experience with cloud platforms, Bachelor\'s degree in Computer Science or equivalent',
        responsibilities: 'Design and implement scalable software solutions, Mentor junior developers, Participate in code reviews, Collaborate with cross-functional teams, Contribute to technical architecture decisions',
        company_size: 'large'
      },
      {
        title: 'Frontend Developer',
        description: 'Create beautiful, responsive user interfaces for our next-generation web applications. Work closely with designers and backend engineers to deliver exceptional user experiences.',
        company: 'PixelPerfect Studios',
        country: 'United States',
        city: 'New York',
        salary_min: 95000,
        salary_max: 140000,
        employment_type: 'full-time',
        company_logo_url: 'https://logo.clearbit.com/pixelperfect.com',
        required_skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Sass', 'Webpack'],
        nice_to_have_skills: ['Vue.js', 'Angular', 'Figma', 'Adobe Creative Suite', 'Storybook'],
        experience_level: 'mid',
        remote_work_option: true,
        benefits: ['Health Insurance', 'Dental', 'Flexible Hours', 'Remote Work', 'Professional Development'],
        psychological_traits: ['Creativity', 'Attention to Detail', 'User Empathy', 'Adaptability'],
        industry: 'technology',
        department: 'Product',
        job_requirements: '3+ years of frontend development experience, Proficiency in modern JavaScript frameworks, Strong CSS and responsive design skills, Portfolio of web applications',
        responsibilities: 'Develop responsive web applications, Implement pixel-perfect designs, Optimize performance and accessibility, Collaborate with UX/UI designers, Write clean, maintainable code',
        company_size: 'medium'
      },
      {
        title: 'DevOps Engineer',
        description: 'Build and maintain robust infrastructure and deployment pipelines. Help scale our platform to handle increasing traffic while ensuring reliability and security.',
        company: 'CloudScale Solutions',
        country: 'United States',
        city: 'Austin',
        salary_min: 120000,
        salary_max: 170000,
        employment_type: 'full-time',
        company_logo_url: 'https://logo.clearbit.com/cloudscale.com',
        required_skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Python'],
        nice_to_have_skills: ['GCP', 'Azure', 'Ansible', 'Prometheus', 'Grafana', 'Helm'],
        experience_level: 'senior',
        remote_work_option: false,
        benefits: ['Health Insurance', '401k', 'Flexible PTO', 'Conference Budget', 'Home Office Setup'],
        psychological_traits: ['Analytical Thinking', 'Problem Solving', 'Reliability', 'Continuous Learning'],
        industry: 'technology',
        department: 'Infrastructure',
        job_requirements: '4+ years of DevOps/Infrastructure experience, Strong knowledge of cloud platforms, Experience with containerization and orchestration, Infrastructure as Code experience',
        responsibilities: 'Design and maintain CI/CD pipelines, Manage cloud infrastructure, Monitor system performance, Implement security best practices, Automate deployment processes',
        company_size: 'medium'
      },
      {
        title: 'Data Scientist',
        description: 'Unlock insights from complex datasets to drive business decisions. Build machine learning models and work with stakeholders to translate data into actionable recommendations.',
        company: 'DataDriven Analytics',
        country: 'United States',
        city: 'Seattle',
        salary_min: 130000,
        salary_max: 185000,
        employment_type: 'full-time',
        company_logo_url: 'https://logo.clearbit.com/datadriven.com',
        required_skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Pandas', 'Scikit-learn'],
        nice_to_have_skills: ['TensorFlow', 'PyTorch', 'Spark', 'Tableau', 'A/B Testing', 'Statistics'],
        experience_level: 'mid',
        remote_work_option: true,
        benefits: ['Health Insurance', 'Stock Options', 'Learning Budget', 'Flexible Schedule', '401k Match'],
        psychological_traits: ['Analytical Thinking', 'Curiosity', 'Communication', 'Problem Solving'],
        industry: 'technology',
        department: 'Data Science',
        job_requirements: 'MS in Data Science/Statistics or equivalent, 3+ years of data analysis experience, Strong statistical knowledge, Experience with ML algorithms and tools',
        responsibilities: 'Develop predictive models, Analyze large datasets, Create data visualizations, Present findings to stakeholders, Collaborate with engineering teams',
        company_size: 'large'
      },
      {
        title: 'Junior Full Stack Developer',
        description: 'Start your career in software development with mentorship from senior engineers. Work on exciting projects while learning industry best practices.',
        company: 'StartupXYZ',
        country: 'United States',
        city: 'Los Angeles',
        salary_min: 75000,
        salary_max: 95000,
        employment_type: 'full-time',
        company_logo_url: 'https://logo.clearbit.com/startupxyz.com',
        required_skills: ['JavaScript', 'HTML', 'CSS', 'Git', 'Basic Database Knowledge'],
        nice_to_have_skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'RESTful APIs'],
        experience_level: 'entry',
        remote_work_option: false,
        benefits: ['Health Insurance', 'Learning Budget', 'Mentorship Program', 'Flexible Hours'],
        psychological_traits: ['Eagerness to Learn', 'Adaptability', 'Teamwork', 'Growth Mindset'],
        industry: 'technology',
        department: 'Engineering',
        job_requirements: 'Bachelor\'s degree in Computer Science or bootcamp graduate, Basic programming experience, Strong problem-solving skills, Passion for technology',
        responsibilities: 'Write clean, maintainable code, Participate in code reviews, Learn from senior developers, Work on feature development, Contribute to testing efforts',
        company_size: 'startup'
      }
    ];

    // Insert jobs in batches
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < jobsData.length; i += batchSize) {
      const batch = jobsData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        insertedCount += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} jobs`);
      }
    }

    console.log(`\n✅ Migration completed! Inserted ${insertedCount} jobs.`);

    // Verify the data was inserted
    console.log('\nVerifying seeded data...');
    const { data: jobs, error: queryError } = await supabase
      .from('jobs')
      .select('id, title, company, country, city, remote_work_option, required_skills, experience_level, salary_min, salary_max')
      .order('created_at', { ascending: false })
      .limit(10);

    if (queryError) {
      console.error('Error querying jobs:', queryError);
    } else {
      console.log(`\n📊 Found ${jobs.length} recent jobs in the database`);
      
      if (jobs.length > 0) {
        console.log('\n🔍 Sample job data:');
        jobs.slice(0, 3).forEach((job, index) => {
          console.log(`${index + 1}. ${job.title} at ${job.company}`);
          console.log(`   📍 Location: ${job.city}, ${job.country}`);
          console.log(`   🏠 Remote: ${job.remote_work_option ? 'Yes' : 'No'}`);
          console.log(`   💼 Experience: ${job.experience_level}`);
          console.log(`   💰 Salary: $${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`);
          console.log(`   🛠️ Skills: ${job.required_skills ? job.required_skills.join(', ') : 'None listed'}`);
          console.log('');
        });

        // Check for required columns
        const requiredColumns = ['country', 'city', 'remote_work_option', 'required_skills'];
        const firstJob = jobs[0] as any;
        const hasAllColumns = requiredColumns.every(col => 
          firstJob.hasOwnProperty(col) && firstJob[col] !== undefined && firstJob[col] !== null
        );

        if (hasAllColumns) {
          console.log('✅ All required columns are present with data');
        } else {
          console.log('❌ Some required columns are missing or empty');
          requiredColumns.forEach(col => {
            const hasData = firstJob[col] !== undefined && firstJob[col] !== null;
            console.log(`   ${col}: ${hasData ? '✅' : '❌'}`);
          });
        }
      }
    }

    // Get total count and test basic filtering queries
    const { data: countData, error: countError } = await supabase
      .from('jobs')
      .select('id');

    if (!countError && countData) {
      console.log(`\n📈 Total jobs in database: ${countData.length}`);
    }

    // Test basic filtering queries
    console.log('\n🧪 Testing job search filtering queries...');
    
    // Test 1: Filter by remote work
    const { data: remoteJobs, error: remoteError } = await supabase
      .from('jobs')
      .select('title, company, remote_work_option')
      .eq('remote_work_option', true)
      .limit(3);

    if (!remoteError && remoteJobs) {
      console.log(`✅ Remote jobs query: Found ${remoteJobs.length} remote positions`);
    } else {
      console.log(`❌ Remote jobs query failed:`, remoteError?.message);
    }

    // Test 2: Filter by experience level
    const { data: seniorJobs, error: seniorError } = await supabase
      .from('jobs')
      .select('title, company, experience_level')
      .eq('experience_level', 'senior')
      .limit(3);

    if (!seniorError && seniorJobs) {
      console.log(`✅ Experience level query: Found ${seniorJobs.length} senior positions`);
    } else {
      console.log(`❌ Experience level query failed:`, seniorError?.message);
    }

    // Test 3: Filter by salary range
    const { data: highSalaryJobs, error: salaryError } = await supabase
      .from('jobs')
      .select('title, company, salary_min, salary_max')
      .gte('salary_min', 120000)
      .limit(3);

    if (!salaryError && highSalaryJobs) {
      console.log(`✅ Salary filter query: Found ${highSalaryJobs.length} high-salary positions`);
    } else {
      console.log(`❌ Salary filter query failed:`, salaryError?.message);
    }

    // Test 4: Search by skills (array contains)
    const { data: skillJobs, error: skillError } = await supabase
      .from('jobs')
      .select('title, company, required_skills')
      .contains('required_skills', ['JavaScript'])
      .limit(3);

    if (!skillError && skillJobs) {
      console.log(`✅ Skills search query: Found ${skillJobs.length} JavaScript positions`);
    } else {
      console.log(`❌ Skills search query failed:`, skillError?.message);
    }

    console.log('\n🎉 Migration verification complete!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

executeMigration().catch(console.error);