-- Create activity_logs table to track user activities
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own activity logs
CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Allow inserting activity logs for authenticated users
CREATE POLICY "Allow inserting activity logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some sample activity data for testing
INSERT INTO activity_logs (user_id, action, description, details)
SELECT 
  p.id,
  'profile_updated',
  'Profile information was updated',
  '{"fields_updated": ["skills", "experience"]}'::jsonb
FROM profiles p
LIMIT 5;

INSERT INTO activity_logs (user_id, action, description, details, created_at)
SELECT 
  p.id,
  'job_saved',
  'Job was saved to favorites',
  '{"job_title": "Software Engineer", "company": "Tech Corp"}'::jsonb,
  NOW() - INTERVAL '3 days'
FROM profiles p
WHERE p.user_type = 'job_seeker'
LIMIT 3;

INSERT INTO activity_logs (user_id, action, description, details, created_at)
SELECT 
  p.id,
  'assessment_completed',
  'AI skills assessment was completed',
  '{"score": 85, "category": "Technical Skills"}'::jsonb,
  NOW() - INTERVAL '1 week'
FROM profiles p
WHERE p.user_type = 'job_seeker'
LIMIT 2;