-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    country_id BIGINT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, country_id)
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company TEXT NOT NULL,
    location_country_id BIGINT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    location_city_id BIGINT NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    salary_min INTEGER,
    salary_max INTEGER,
    employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_cities_country_id ON public.cities(country_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location_country_id ON public.jobs(location_country_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location_city_id ON public.jobs(location_city_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_min ON public.jobs(salary_min);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_max ON public.jobs(salary_max);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- Enable Row Level Security (optional - can be configured later based on requirements)
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Insert sample countries
INSERT INTO public.countries (name) VALUES
    ('United States'),
    ('Canada'),
    ('United Kingdom'),
    ('Germany'),
    ('France'),
    ('Australia'),
    ('Japan'),
    ('Netherlands'),
    ('Sweden'),
    ('Singapore')
ON CONFLICT (name) DO NOTHING;

-- Insert sample cities
INSERT INTO public.cities (name, country_id) VALUES
    -- United States cities
    ('New York', (SELECT id FROM public.countries WHERE name = 'United States')),
    ('San Francisco', (SELECT id FROM public.countries WHERE name = 'United States')),
    ('Los Angeles', (SELECT id FROM public.countries WHERE name = 'United States')),
    ('Chicago', (SELECT id FROM public.countries WHERE name = 'United States')),
    ('Seattle', (SELECT id FROM public.countries WHERE name = 'United States')),
    ('Austin', (SELECT id FROM public.countries WHERE name = 'United States')),
    
    -- Canada cities
    ('Toronto', (SELECT id FROM public.countries WHERE name = 'Canada')),
    ('Vancouver', (SELECT id FROM public.countries WHERE name = 'Canada')),
    ('Montreal', (SELECT id FROM public.countries WHERE name = 'Canada')),
    
    -- United Kingdom cities
    ('London', (SELECT id FROM public.countries WHERE name = 'United Kingdom')),
    ('Manchester', (SELECT id FROM public.countries WHERE name = 'United Kingdom')),
    ('Edinburgh', (SELECT id FROM public.countries WHERE name = 'United Kingdom')),
    
    -- Germany cities
    ('Berlin', (SELECT id FROM public.countries WHERE name = 'Germany')),
    ('Munich', (SELECT id FROM public.countries WHERE name = 'Germany')),
    ('Hamburg', (SELECT id FROM public.countries WHERE name = 'Germany')),
    
    -- France cities
    ('Paris', (SELECT id FROM public.countries WHERE name = 'France')),
    ('Lyon', (SELECT id FROM public.countries WHERE name = 'France')),
    
    -- Australia cities
    ('Sydney', (SELECT id FROM public.countries WHERE name = 'Australia')),
    ('Melbourne', (SELECT id FROM public.countries WHERE name = 'Australia')),
    
    -- Japan cities
    ('Tokyo', (SELECT id FROM public.countries WHERE name = 'Japan')),
    ('Osaka', (SELECT id FROM public.countries WHERE name = 'Japan')),
    
    -- Netherlands cities
    ('Amsterdam', (SELECT id FROM public.countries WHERE name = 'Netherlands')),
    
    -- Sweden cities
    ('Stockholm', (SELECT id FROM public.countries WHERE name = 'Sweden')),
    
    -- Singapore cities
    ('Singapore', (SELECT id FROM public.countries WHERE name = 'Singapore'))
ON CONFLICT (name, country_id) DO NOTHING;

-- Insert sample jobs
INSERT INTO public.jobs (title, description, company, location_country_id, location_city_id, salary_min, salary_max, employment_type) VALUES
    -- Tech jobs
    ('Senior Software Engineer', 'Build scalable web applications using React and Node.js. Work with a distributed team on cutting-edge projects.', 'TechCorp', 
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'San Francisco'), 120000, 180000, 'full-time'),
    
    ('Frontend Developer', 'Create beautiful user interfaces with modern JavaScript frameworks. Experience with React, Vue, or Angular required.', 'WebStudio',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'New York'), 80000, 120000, 'full-time'),
    
    ('DevOps Engineer', 'Manage cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes preferred.', 'CloudSolutions',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'Seattle'), 100000, 150000, 'full-time'),
    
    ('Data Scientist', 'Analyze large datasets to extract meaningful insights. Python, R, and machine learning experience required.', 'DataInsights',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'Chicago'), 90000, 140000, 'full-time'),
    
    ('Mobile App Developer', 'Develop iOS and Android applications using React Native or native technologies.', 'MobileFirst',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'Austin'), 85000, 130000, 'full-time'),
    
    ('Junior Developer', 'Entry-level position for recent graduates. Training provided in full-stack development.', 'StartupXYZ',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'Los Angeles'), 60000, 80000, 'full-time'),
    
    -- Canadian jobs
    ('Product Manager', 'Lead product development from conception to launch. Experience with agile methodologies required.', 'InnovateCanada',
     (SELECT id FROM public.countries WHERE name = 'Canada'), (SELECT id FROM public.cities WHERE name = 'Toronto'), 85000, 120000, 'full-time'),
    
    ('UX Designer', 'Design intuitive user experiences for web and mobile applications. Figma and Sketch experience preferred.', 'DesignStudio',
     (SELECT id FROM public.countries WHERE name = 'Canada'), (SELECT id FROM public.cities WHERE name = 'Vancouver'), 70000, 100000, 'full-time'),
    
    ('Backend Engineer', 'Build robust APIs and microservices using Python or Go. Experience with PostgreSQL and Redis.', 'BackendSystems',
     (SELECT id FROM public.countries WHERE name = 'Canada'), (SELECT id FROM public.cities WHERE name = 'Montreal'), 75000, 110000, 'full-time'),
    
    -- UK jobs
    ('Software Architect', 'Design system architecture for enterprise applications. 8+ years of experience required.', 'LondonTech',
     (SELECT id FROM public.countries WHERE name = 'United Kingdom'), (SELECT id FROM public.cities WHERE name = 'London'), 70000, 100000, 'full-time'),
    
    ('Machine Learning Engineer', 'Implement ML models in production environments. TensorFlow and PyTorch experience required.', 'AILimited',
     (SELECT id FROM public.countries WHERE name = 'United Kingdom'), (SELECT id FROM public.cities WHERE name = 'London'), 65000, 95000, 'full-time'),
    
    ('Cybersecurity Analyst', 'Protect systems from security threats. CISSP or similar certification preferred.', 'SecureIT',
     (SELECT id FROM public.countries WHERE name = 'United Kingdom'), (SELECT id FROM public.cities WHERE name = 'Manchester'), 50000, 75000, 'full-time'),
    
    ('Game Developer', 'Create engaging games using Unity or Unreal Engine. Portfolio of shipped games required.', 'GameStudio',
     (SELECT id FROM public.countries WHERE name = 'United Kingdom'), (SELECT id FROM public.cities WHERE name = 'Edinburgh'), 45000, 70000, 'full-time'),
    
    -- German jobs
    ('Senior Java Developer', 'Develop enterprise Java applications using Spring framework. German language skills preferred.', 'GermanSoft',
     (SELECT id FROM public.countries WHERE name = 'Germany'), (SELECT id FROM public.cities WHERE name = 'Berlin'), 60000, 85000, 'full-time'),
    
    ('Quality Assurance Engineer', 'Ensure software quality through automated and manual testing. Selenium experience required.', 'QualityFirst',
     (SELECT id FROM public.countries WHERE name = 'Germany'), (SELECT id FROM public.cities WHERE name = 'Munich'), 45000, 65000, 'full-time'),
    
    ('Systems Administrator', 'Manage Linux servers and network infrastructure. Experience with virtualization technologies.', 'InfraTech',
     (SELECT id FROM public.countries WHERE name = 'Germany'), (SELECT id FROM public.cities WHERE name = 'Hamburg'), 50000, 70000, 'full-time'),
    
    -- French jobs
    ('Full Stack Developer', 'Work on both frontend and backend development using modern technologies. French language required.', 'ParisCode',
     (SELECT id FROM public.countries WHERE name = 'France'), (SELECT id FROM public.cities WHERE name = 'Paris'), 45000, 70000, 'full-time'),
    
    ('Data Analyst', 'Analyze business data to provide actionable insights. SQL and Python experience required.', 'DataFrance',
     (SELECT id FROM public.countries WHERE name = 'France'), (SELECT id FROM public.cities WHERE name = 'Lyon'), 40000, 60000, 'full-time'),
    
    -- Australian jobs
    ('Cloud Engineer', 'Design and implement cloud solutions on AWS or Azure. Terraform experience preferred.', 'CloudAustralia',
     (SELECT id FROM public.countries WHERE name = 'Australia'), (SELECT id FROM public.cities WHERE name = 'Sydney'), 80000, 120000, 'full-time'),
    
    ('Software Developer', 'Develop custom software solutions for clients. .NET or Java experience required.', 'DevAustralia',
     (SELECT id FROM public.countries WHERE name = 'Australia'), (SELECT id FROM public.cities WHERE name = 'Melbourne'), 70000, 100000, 'full-time'),
    
    -- Japanese jobs
    ('Senior Software Engineer', 'Lead development of web applications. Japanese language skills required.', 'TokyoTech',
     (SELECT id FROM public.countries WHERE name = 'Japan'), (SELECT id FROM public.cities WHERE name = 'Tokyo'), 5000000, 8000000, 'full-time'),
    
    ('Mobile Developer', 'Create mobile applications for Japanese market. iOS and Android experience required.', 'MobileJapan',
     (SELECT id FROM public.countries WHERE name = 'Japan'), (SELECT id FROM public.cities WHERE name = 'Osaka'), 4000000, 6000000, 'full-time'),
    
    -- Netherlands jobs
    ('Backend Developer', 'Build scalable backend systems using microservices architecture. English required, Dutch preferred.', 'DutchTech',
     (SELECT id FROM public.countries WHERE name = 'Netherlands'), (SELECT id FROM public.cities WHERE name = 'Amsterdam'), 55000, 80000, 'full-time'),
    
    -- Swedish jobs
    ('Software Engineer', 'Join our agile development team working on innovative products. English required, Swedish preferred.', 'NordicTech',
     (SELECT id FROM public.countries WHERE name = 'Sweden'), (SELECT id FROM public.cities WHERE name = 'Stockholm'), 450000, 650000, 'full-time'),
    
    -- Singapore jobs
    ('Fintech Developer', 'Build financial technology solutions for Asian markets. Experience with trading systems preferred.', 'SingaporeFin',
     (SELECT id FROM public.countries WHERE name = 'Singapore'), (SELECT id FROM public.cities WHERE name = 'Singapore'), 80000, 120000, 'full-time'),
    
    -- Contract and freelance positions
    ('Freelance Web Developer', 'Create websites for small businesses. Portfolio of WordPress and custom PHP sites required.', 'FreelanceHub',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'New York'), 50, 150, 'freelance'),
    
    ('Part-time UI Designer', 'Design user interfaces for mobile apps. Work remotely 20 hours per week.', 'PartTimeDesign',
     (SELECT id FROM public.countries WHERE name = 'United Kingdom'), (SELECT id FROM public.cities WHERE name = 'London'), 25000, 35000, 'part-time'),
    
    ('Contract DevOps Consultant', 'Help migrate legacy systems to cloud infrastructure. 6-month contract.', 'ConsultingPro',
     (SELECT id FROM public.countries WHERE name = 'Canada'), (SELECT id FROM public.cities WHERE name = 'Toronto'), 80000, 120000, 'contract'),
    
    ('Software Engineering Intern', 'Summer internship program for computer science students. Mentorship and training provided.', 'InternshipCorp',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'San Francisco'), 6000, 8000, 'internship'),
    
    ('Contract Frontend Developer', 'Build responsive web applications using React. 3-month project.', 'ProjectStudio',
     (SELECT id FROM public.countries WHERE name = 'Germany'), (SELECT id FROM public.cities WHERE name = 'Berlin'), 60000, 80000, 'contract'),
    
    ('Part-time Data Entry Specialist', 'Process and validate data for machine learning projects. Flexible hours.', 'DataProcessing',
     (SELECT id FROM public.countries WHERE name = 'Australia'), (SELECT id FROM public.cities WHERE name = 'Sydney'), 30000, 40000, 'part-time'),
    
    -- Additional varied positions
    ('Technical Writer', 'Create documentation for software products. Experience with API documentation preferred.', 'DocuTech',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'Austin'), 65000, 85000, 'full-time'),
    
    ('Database Administrator', 'Manage PostgreSQL and MySQL databases. Performance tuning and backup strategies required.', 'DataManagement',
     (SELECT id FROM public.countries WHERE name = 'Canada'), (SELECT id FROM public.cities WHERE name = 'Vancouver'), 70000, 95000, 'full-time'),
    
    ('Site Reliability Engineer', 'Ensure system reliability and performance. Experience with monitoring tools and incident response.', 'ReliabilityFirst',
     (SELECT id FROM public.countries WHERE name = 'Netherlands'), (SELECT id FROM public.cities WHERE name = 'Amsterdam'), 65000, 90000, 'full-time'),
    
    ('Blockchain Developer', 'Develop smart contracts and DeFi applications. Solidity and Web3 experience required.', 'CryptoTech',
     (SELECT id FROM public.countries WHERE name = 'Singapore'), (SELECT id FROM public.cities WHERE name = 'Singapore'), 90000, 140000, 'full-time'),
    
    ('AI Research Scientist', 'Conduct research in natural language processing and computer vision. PhD preferred.', 'AI Research Lab',
     (SELECT id FROM public.countries WHERE name = 'United Kingdom'), (SELECT id FROM public.cities WHERE name = 'London'), 80000, 120000, 'full-time'),
    
    ('iOS Developer', 'Build native iOS applications using Swift. App Store publishing experience required.', 'MobileCreators',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'Los Angeles'), 85000, 125000, 'full-time'),
    
    ('Platform Engineer', 'Build and maintain development platforms and tooling. Kubernetes and Docker experience required.', 'PlatformTech',
     (SELECT id FROM public.countries WHERE name = 'Germany'), (SELECT id FROM public.cities WHERE name = 'Munich'), 70000, 100000, 'full-time'),
    
    ('Security Engineer', 'Implement security measures and conduct penetration testing. Ethical hacking certification preferred.', 'CyberDefense',
     (SELECT id FROM public.countries WHERE name = 'France'), (SELECT id FROM public.cities WHERE name = 'Paris'), 55000, 80000, 'full-time'),
    
    ('Growth Engineer', 'Build tools and systems to drive user acquisition and retention. A/B testing experience required.', 'GrowthLab',
     (SELECT id FROM public.countries WHERE name = 'Sweden'), (SELECT id FROM public.cities WHERE name = 'Stockholm'), 500000, 750000, 'full-time'),
    
    ('Embedded Systems Engineer', 'Develop firmware for IoT devices. C/C++ and hardware debugging experience required.', 'IoTSolutions',
     (SELECT id FROM public.countries WHERE name = 'Japan'), (SELECT id FROM public.cities WHERE name = 'Tokyo'), 4500000, 7000000, 'full-time'),
    
    ('Solutions Architect', 'Design technical solutions for enterprise clients. Cloud architecture and consulting experience required.', 'Enterprise Solutions',
     (SELECT id FROM public.countries WHERE name = 'Australia'), (SELECT id FROM public.cities WHERE name = 'Melbourne'), 100000, 140000, 'full-time'),
    
    ('React Native Developer', 'Build cross-platform mobile applications. Experience with both iOS and Android deployment.', 'CrossPlatform',
     (SELECT id FROM public.countries WHERE name = 'Canada'), (SELECT id FROM public.cities WHERE name = 'Montreal'), 75000, 105000, 'full-time'),
    
    ('Staff Engineer', 'Technical leadership role overseeing multiple engineering teams. 10+ years experience required.', 'TechLeadership',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'Seattle'), 180000, 250000, 'full-time'),
    
    ('Engineering Manager', 'Lead a team of 5-8 engineers building customer-facing products. Previous management experience required.', 'TeamLead',
     (SELECT id FROM public.countries WHERE name = 'United Kingdom'), (SELECT id FROM public.cities WHERE name = 'Manchester'), 70000, 95000, 'full-time'),
    
    ('Freelance Graphic Designer', 'Create visual designs for marketing materials and web interfaces. Adobe Creative Suite expertise required.', 'DesignFreelance',
     (SELECT id FROM public.countries WHERE name = 'France'), (SELECT id FROM public.cities WHERE name = 'Lyon'), 30, 80, 'freelance'),
    
    ('Contract Business Analyst', 'Analyze business requirements and translate them into technical specifications. 12-month contract.', 'BusinessTech',
     (SELECT id FROM public.countries WHERE name = 'Australia'), (SELECT id FROM public.cities WHERE name = 'Sydney'), 90000, 120000, 'contract'),
    
    ('Part-time Customer Success Engineer', 'Help customers integrate our API and troubleshoot technical issues. 25 hours per week.', 'CustomerFirst',
     (SELECT id FROM public.countries WHERE name = 'Netherlands'), (SELECT id FROM public.cities WHERE name = 'Amsterdam'), 35000, 50000, 'part-time'),
    
    ('Summer Research Intern', 'Work on machine learning research projects with our data science team. PhD students preferred.', 'Research Institute',
     (SELECT id FROM public.countries WHERE name = 'United States'), (SELECT id FROM public.cities WHERE name = 'Chicago'), 7000, 9000, 'internship'),
    
    ('Contract Automation Engineer', 'Build automated testing frameworks and CI/CD pipelines. 9-month contract.', 'AutomationPro',
     (SELECT id FROM public.countries WHERE name = 'Germany'), (SELECT id FROM public.cities WHERE name = 'Hamburg'), 65000, 85000, 'contract'),
    
    ('Video Game Programmer', 'Develop gameplay systems for AAA video games. C++ and Unreal Engine experience required.', 'GameDev Studio',
     (SELECT id FROM public.countries WHERE name = 'United Kingdom'), (SELECT id FROM public.cities WHERE name = 'Edinburgh'), 50000, 75000, 'full-time'),
    
    ('Quantum Computing Researcher', 'Research quantum algorithms and their applications. PhD in Physics or Computer Science required.', 'Quantum Labs',
     (SELECT id FROM public.countries WHERE name = 'Canada'), (SELECT id FROM public.cities WHERE name = 'Toronto'), 120000, 160000, 'full-time');

-- Add constraint to ensure salary_max is greater than salary_min when both are provided
ALTER TABLE public.jobs ADD CONSTRAINT chk_salary_range 
    CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min);