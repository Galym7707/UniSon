import { useState, useEffect } from 'react'

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  description: string
  details?: Record<string, any>
  created_at: string
}

export function useActivityLogs() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/activity-logs')
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }
      
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }

  const logActivity = async (action: string, description: string, details?: Record<string, any>) => {
    try {
      const response = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, description, details }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to log activity')
      }
      
      // Refresh activities after logging new one
      await fetchActivities()
    } catch (err) {
      console.error('Failed to log activity:', err)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
    logActivity
  }
}