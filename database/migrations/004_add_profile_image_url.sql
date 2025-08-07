-- Add profile image URL field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;