-- Create activity_logs table for tracking user activities
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs table
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id_created_at 
ON public.activity_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type 
ON public.activity_logs (action_type);

-- Insert some sample activity data for testing
INSERT INTO public.activity_logs (user_id, action_type, description, metadata)
SELECT 
  p.id,
  'profile_updated',
  'Profile information was updated',
  '{"fields_updated": ["skills", "experience"]}'::jsonb
FROM public.profiles p
WHERE p.role = 'job-seeker'
LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO public.activity_logs (user_id, action_type, description, metadata, created_at)
SELECT 
  p.id,
  'job_saved',
  'Job was saved to favorites',
  '{"job_title": "Software Engineer", "company": "Tech Corp"}'::jsonb,
  NOW() - INTERVAL '3 days'
FROM public.profiles p
WHERE p.role = 'job-seeker'
LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO public.activity_logs (user_id, action_type, description, metadata, created_at)
SELECT 
  p.id,
  'assessment_completion',
  'AI skills assessment was completed',
  '{"score": 85, "category": "Technical Skills"}'::jsonb,
  NOW() - INTERVAL '1 week'
FROM public.profiles p
WHERE p.role = 'job-seeker'
LIMIT 2
ON CONFLICT DO NOTHING;