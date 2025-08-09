import { formatDistanceToNow } from 'date-fns'
import { 
  Calendar, 
  Users, 
  Star, 
  Heart, 
  User, 
  Search, 
  FileText, 
  Trophy,
  Building2,
  Settings
} from 'lucide-react'
import { ActivityLog } from '@/hooks/use-activity-logs'

interface ActivityFeedProps {
  activities: ActivityLog[]
  loading: boolean
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'profile_updated':
      return <User className="h-3 w-3 text-green-600" />
    case 'job_saved':
      return <Heart className="h-3 w-3 text-red-600" />
    case 'job_applied':
      return <Users className="h-3 w-3 text-blue-600" />
    case 'assessment_completed':
      return <Star className="h-3 w-3 text-purple-600" />
    case 'job_searched':
      return <Search className="h-3 w-3 text-gray-600" />
    case 'resume_uploaded':
      return <FileText className="h-3 w-3 text-orange-600" />
    case 'skill_added':
      return <Trophy className="h-3 w-3 text-yellow-600" />
    case 'company_viewed':
      return <Building2 className="h-3 w-3 text-indigo-600" />
    case 'settings_updated':
      return <Settings className="h-3 w-3 text-gray-600" />
    default:
      return <Calendar className="h-3 w-3 text-green-600" />
  }
}

const getActivityBgColor = (action: string) => {
  switch (action) {
    case 'profile_updated':
      return 'bg-green-50'
    case 'job_saved':
      return 'bg-red-50'
    case 'job_applied':
      return 'bg-blue-50'
    case 'assessment_completed':
      return 'bg-purple-50'
    case 'job_searched':
      return 'bg-gray-50'
    case 'resume_uploaded':
      return 'bg-orange-50'
    case 'skill_added':
      return 'bg-yellow-50'
    case 'company_viewed':
      return 'bg-indigo-50'
    case 'settings_updated':
      return 'bg-gray-50'
    default:
      return 'bg-green-50'
  }
}

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No recent activity</p>
        <p className="text-xs text-gray-400 mt-1">
          Start exploring jobs to see your activity here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3">
          <div className={`p-1 rounded-full ${getActivityBgColor(activity.action)}`}>
            {getActivityIcon(activity.action)}
          </div>
          <div className="text-sm flex-1">
            <p className="font-medium text-gray-900">{activity.description}</p>
            <p className="text-gray-600">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
            {activity.details && Object.keys(activity.details).length > 0 && (
              <div className="mt-1">
                {activity.details.job_title && activity.details.company && (
                  <p className="text-xs text-gray-500">
                    {activity.details.job_title} at {activity.details.company}
                  </p>
                )}
                {activity.details.score && (
                  <p className="text-xs text-gray-500">
                    Score: {activity.details.score}%
                  </p>
                )}
                {activity.details.fields_updated && Array.isArray(activity.details.fields_updated) && (
                  <p className="text-xs text-gray-500">
                    Updated: {activity.details.fields_updated.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}