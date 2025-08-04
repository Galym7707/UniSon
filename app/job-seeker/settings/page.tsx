'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, User, Search, Settings, Heart, Bell, Shield, Eye, Brain } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from '@/lib/supabase/browser'

type Settings = {
  account: {
    first_name: string
    last_name: string
    email: string
    phone: string
    timezone: string
  }
  notifications: {
    email_notifications: boolean
    new_jobs: boolean
    responses: boolean
    interviews: boolean
    marketing: boolean
  }
  privacy: {
    public_profile: boolean
    show_contacts: boolean
    search_history: boolean
    analytics: boolean
  }
  preferences: {
    preferred_location: string
    employment_type: string
    min_salary: string
    experience_level: string
    remote_only: boolean
  }
  security: {
    two_factor: boolean
  }
}

export default function JobSeekerSettings() {
  const [settings, setSettings] = useState<Settings>({
    account: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      timezone: 'moscow'
    },
    notifications: {
      email_notifications: true,
      new_jobs: true,
      responses: true,
      interviews: true,
      marketing: false
    },
    privacy: {
      public_profile: true,
      show_contacts: false,
      search_history: true,
      analytics: true
    },
    preferences: {
      preferred_location: 'moscow',
      employment_type: 'fulltime',
      min_salary: '',
      experience_level: 'middle',
      remote_only: false
    },
    security: {
      two_factor: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, settings')
        .eq('id', user.id)
        .single()

      if (data) {
        let loadedSettings = data.settings ? JSON.parse(data.settings) : {};
        setSettings(prev => ({
          ...prev,
          account: {
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            timezone: loadedSettings.account?.timezone || 'Europe/Moscow',
          },
          notifications: loadedSettings.notifications || prev.notifications,
          privacy: loadedSettings.privacy || prev.privacy,
          preferences: loadedSettings.preferences || prev.preferences,
          security: loadedSettings.security || prev.security,
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: settings.account.first_name,
          last_name: settings.account.last_name,
          email: settings.account.email,
          phone: settings.account.phone,
          settings: JSON.stringify({
            account: { timezone: settings.account.timezone },
            notifications: settings.notifications,
            privacy: settings.privacy,
            preferences: settings.preferences,
            security: settings.security
          }),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordMessage(null)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all password fields.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')
      // Re-authenticate user (Supabase does not require current password for update, but you may want to check it in your flow)
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Failed to change password.' })
    }
  }

  const updateSettings = (section: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
          <p className="text-[#333333]">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <Link href="/" className="text-xl font-bold text-[#0A2540]">
              Unison AI
            </Link>
          </div>
          <nav className="px-4 space-y-2">
            <Link
              href="/job-seeker/dashboard"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link
              href="/job-seeker/profile"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5 mr-3" />
              Profile
            </Link>
            <Link
              href="/job-seeker/test"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Brain className="w-5 h-5 mr-3" />
              Test
            </Link>
            <Link
              href="/job-seeker/search"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Search className="w-5 h-5 mr-3" />
              Job Search
            </Link>
            <Link
              href="/job-seeker/saved"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Heart className="w-5 h-5 mr-3" />
              Saved
            </Link>
            <Link
              href="/job-seeker/settings"
              className="flex items-center px-4 py-3 text-[#00C49A] bg-[#00C49A]/10 rounded-lg"
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-[#0A2540]">Settings</h1>
              <Button 
                className="bg-[#00C49A] hover:bg-[#00A085]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <Tabs defaultValue="account" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540] flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Account Settings
                    </CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={settings.account.first_name}
                          onChange={(e) => updateSettings('account', 'first_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={settings.account.last_name}
                          onChange={(e) => updateSettings('account', 'last_name', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={settings.account.email}
                        onChange={(e) => updateSettings('account', 'email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={settings.account.phone}
                        onChange={(e) => updateSettings('account', 'phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Select 
                        value={settings.account.timezone}
                        onValueChange={(value) => updateSettings('account', 'timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pacific/Midway">Midway (UTC-11:00)</SelectItem>
                          <SelectItem value="America/Adak">Adak (UTC-10:00)</SelectItem>
                          <SelectItem value="Pacific/Honolulu">Honolulu (UTC-10:00)</SelectItem>
                          <SelectItem value="America/Anchorage">Anchorage (UTC-09:00)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Los Angeles (UTC-08:00)</SelectItem>
                          <SelectItem value="America/Denver">Denver (UTC-07:00)</SelectItem>
                          <SelectItem value="America/Chicago">Chicago (UTC-06:00)</SelectItem>
                          <SelectItem value="America/New_York">New York (UTC-05:00)</SelectItem>
                          <SelectItem value="America/Caracas">Caracas (UTC-04:00)</SelectItem>
                          <SelectItem value="America/Santiago">Santiago (UTC-04:00)</SelectItem>
                          <SelectItem value="America/Sao_Paulo">Sao Paulo (UTC-03:00)</SelectItem>
                          <SelectItem value="Atlantic/South_Georgia">South Georgia (UTC-02:00)</SelectItem>
                          <SelectItem value="Atlantic/Azores">Azores (UTC-01:00)</SelectItem>
                          <SelectItem value="Europe/London">London (UTC+00:00)</SelectItem>
                          <SelectItem value="Europe/Berlin">Berlin (UTC+01:00)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (UTC+01:00)</SelectItem>
                          <SelectItem value="Europe/Athens">Athens (UTC+02:00)</SelectItem>
                          <SelectItem value="Europe/Istanbul">Istanbul (UTC+03:00)</SelectItem>
                          <SelectItem value="Europe/Moscow">Moscow (UTC+03:00)</SelectItem>
                          <SelectItem value="Asia/Dubai">Dubai (UTC+04:00)</SelectItem>
                          <SelectItem value="Asia/Karachi">Karachi (UTC+05:00)</SelectItem>
                          <SelectItem value="Asia/Dhaka">Dhaka (UTC+06:00)</SelectItem>
                          <SelectItem value="Asia/Bangkok">Bangkok (UTC+07:00)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai (UTC+08:00)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (UTC+09:00)</SelectItem>
                          <SelectItem value="Australia/Sydney">Sydney (UTC+10:00)</SelectItem>
                          <SelectItem value="Pacific/Noumea">Noumea (UTC+11:00)</SelectItem>
                          <SelectItem value="Pacific/Auckland">Auckland (UTC+12:00)</SelectItem>
                          <SelectItem value="Pacific/Chatham">Chatham (UTC+12:45)</SelectItem>
                          <SelectItem value="Pacific/Tongatapu">Nuku'alofa (UTC+13:00)</SelectItem>
                          <SelectItem value="Pacific/Kiritimati">Kiritimati (UTC+14:00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540] flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                    </CardTitle>
                    <CardDescription>Configure which notifications you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Email Notifications</h4>
                        <p className="text-sm text-[#333333]">Receive notifications via email</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.email_notifications}
                        onCheckedChange={(checked) => updateSettings('notifications', 'email_notifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">New Jobs</h4>
                        <p className="text-sm text-[#333333]">Notifications about suitable job openings</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.new_jobs}
                        onCheckedChange={(checked) => updateSettings('notifications', 'new_jobs', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Resume Responses</h4>
                        <p className="text-sm text-[#333333]">Notifications about employer responses</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.responses}
                        onCheckedChange={(checked) => updateSettings('notifications', 'responses', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Interview Invitations</h4>
                        <p className="text-sm text-[#333333]">Notifications about interview invitations</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.interviews}
                        onCheckedChange={(checked) => updateSettings('notifications', 'interviews', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Marketing Emails</h4>
                        <p className="text-sm text-[#333333]">News and job search tips</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.marketing}
                        onCheckedChange={(checked) => updateSettings('notifications', 'marketing', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540] flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Privacy
                    </CardTitle>
                    <CardDescription>Control your profile visibility</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Public Profile</h4>
                        <p className="text-sm text-[#333333]">Allow employers to find your profile</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.public_profile}
                        onCheckedChange={(checked) => updateSettings('privacy', 'public_profile', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Show Contacts</h4>
                        <p className="text-sm text-[#333333]">Display contact information in profile</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.show_contacts}
                        onCheckedChange={(checked) => updateSettings('privacy', 'show_contacts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Search History</h4>
                        <p className="text-sm text-[#333333]">Save search query history</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.search_history}
                        onCheckedChange={(checked) => updateSettings('privacy', 'search_history', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Profile Analytics</h4>
                        <p className="text-sm text-[#333333]">Allow data collection to improve service</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked) => updateSettings('privacy', 'analytics', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Job Search Preferences</CardTitle>
                    <CardDescription>Configure default job search parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredLocation">Preferred Location</Label>
                        <Select 
                          value={settings.preferences.preferred_location}
                          onValueChange={(value) => updateSettings('preferences', 'preferred_location', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="moscow">Moscow</SelectItem>
                            <SelectItem value="spb">St. Petersburg</SelectItem>
                            <SelectItem value="kazan">Kazan</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employmentType">Employment Type</Label>
                        <Select 
                          value={settings.preferences.employment_type}
                          onValueChange={(value) => updateSettings('preferences', 'employment_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fulltime">Full-time</SelectItem>
                            <SelectItem value="parttime">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minSalary">Minimum Salary (₽)</Label>
                        <Input 
                          id="minSalary" 
                          placeholder="150000"
                          value={settings.preferences.min_salary}
                          onChange={(e) => updateSettings('preferences', 'min_salary', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <Select 
                          value={settings.preferences.experience_level}
                          onValueChange={(value) => updateSettings('preferences', 'experience_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="middle">Middle</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#0A2540]">Remote Work Only</h4>
                        <p className="text-sm text-[#333333]">Show only remote job openings</p>
                      </div>
                      <Switch 
                        checked={settings.preferences.remote_only}
                        onCheckedChange={(checked) => updateSettings('preferences', 'remote_only', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540] flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security
                    </CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <Button className="bg-[#FF7A00] hover:bg-[#E66A00]" onClick={handlePasswordChange}>Change Password</Button>
                    {passwordMessage && (
                      <div className={`mt-2 p-2 rounded-lg ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{passwordMessage.text}</div>
                    )}

                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-[#0A2540]">Two-Factor Authentication</h4>
                          <p className="text-sm text-[#333333]">Additional protection for your account</p>
                        </div>
                        <Switch 
                          checked={settings.security.two_factor}
                          onCheckedChange={(checked) => updateSettings('security', 'two_factor', checked)}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-[#0A2540] mb-4">Active Sessions</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-[#0A2540]">Current Session</p>
                            <p className="text-sm text-[#333333]">Chrome on Windows • Moscow</p>
                          </div>
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                        Delete Account
                      </Button>
                      <p className="text-sm text-[#333333] mt-2">
                        This action cannot be undone. All your data will be deleted.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
