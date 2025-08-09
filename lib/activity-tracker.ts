import { createServerSupabase } from '@/lib/supabase/server';
import { createBrowserClient } from '@/lib/supabase/browser';

// TypeScript interfaces for activity data structures
export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CreateActivityLog {
  action_type: string;
  description: string;
  metadata?: Record<string, any>;
}

export type ActivityType = 
  | 'profile_update'
  | 'job_application'
  | 'assessment_completion'
  | 'resume_upload'
  | 'skill_update'
  | 'profile_view'
  | 'job_view'
  | 'search_performed';

// Server-side activity tracking service
export class ActivityTracker {
  /**
   * Log a new activity for the authenticated user (server-side)
   */
  static async logActivity(activity: CreateActivityLog): Promise<ActivityLog | null> {
    try {
      const supabase = await createServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action_type: activity.action_type,
          description: activity.description,
          metadata: activity.metadata || {}
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  /**
   * Retrieve recent activities for the authenticated user (server-side)
   */
  static async getRecentActivities(limit = 50): Promise<ActivityLog[]> {
    try {
      const supabase = await createServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  /**
   * Retrieve activities filtered by action type for the authenticated user
   */
  static async getActivitiesByType(actionType: ActivityType, limit = 50): Promise<ActivityLog[]> {
    try {
      const supabase = await createServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('action_type', actionType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching activities by type:', error);
      return [];
    }
  }
}

// Client-side activity tracking service
export class ClientActivityTracker {
  /**
   * Log a new activity for the authenticated user (client-side)
   */
  static async logActivity(activity: CreateActivityLog): Promise<ActivityLog | null> {
    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action_type: activity.action_type,
          description: activity.description,
          metadata: activity.metadata || {}
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  /**
   * Retrieve recent activities for the authenticated user (client-side)
   */
  static async getRecentActivities(limit = 50): Promise<ActivityLog[]> {
    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }
}

// Convenience functions for common activity types
export const trackProfileUpdate = (details: string, metadata?: Record<string, any>) =>
  ActivityTracker.logActivity({
    action_type: 'profile_update',
    description: details,
    metadata
  });

export const trackJobApplication = (jobTitle: string, jobId: string, metadata?: Record<string, any>) =>
  ActivityTracker.logActivity({
    action_type: 'job_application',
    description: `Applied to ${jobTitle}`,
    metadata: { job_id: jobId, ...metadata }
  });

export const trackAssessmentCompletion = (assessmentType: string, score?: number, metadata?: Record<string, any>) =>
  ActivityTracker.logActivity({
    action_type: 'assessment_completion',
    description: `Completed ${assessmentType} assessment`,
    metadata: { score, ...metadata }
  });

export const trackResumeUpload = (filename: string, metadata?: Record<string, any>) =>
  ActivityTracker.logActivity({
    action_type: 'resume_upload',
    description: `Uploaded resume: ${filename}`,
    metadata
  });