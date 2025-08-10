//app/employer/settings/page.tsx

import { requireAuth } from '@/lib/auth-helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Briefcase, Building2, Users, Settings, Trash2, Shield, Bell } from "lucide-react"
import Link from "next/link"
// Employer section layout provides Header and Sidebar

export const dynamic = 'force-dynamic'

export default async function EmployerSettings() {
  // Require authentication and employer role
  const { user, profile } = await requireAuth({ role: 'employer' })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-8 pt-16">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#0A2540]">Account Settings</h1>
                  <p className="text-[#333333] mt-1">Manage your account preferences and notifications</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Profile Settings</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={profile.name || ''} placeholder="Enter your full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={profile.email || ''} placeholder="Enter your email" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="Enter your phone number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input id="timezone" defaultValue="Europe/Moscow" placeholder="Select your timezone" />
                      </div>
                    </div>
                    <Button className="bg-[#FF7A00] hover:bg-[#E66A00] text-white">
                      Save Profile Changes
                    </Button>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">
                      <Bell className="w-5 h-5 inline mr-2" />
                      Notifications
                    </CardTitle>
                    <CardDescription>Configure how you want to be notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="newApplications">New Application Notifications</Label>
                          <p className="text-sm text-gray-500">Get notified when candidates apply to your jobs</p>
                        </div>
                        <Switch id="newApplications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weeklyReports">Weekly Reports</Label>
                          <p className="text-sm text-gray-500">Receive weekly summaries of your job performance</p>
                        </div>
                        <Switch id="weeklyReports" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketingEmails">Marketing Emails</Label>
                          <p className="text-sm text-gray-500">Receive updates about new features and tips</p>
                        </div>
                        <Switch id="marketingEmails" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="candidateMatches">AI Candidate Matches</Label>
                          <p className="text-sm text-gray-500">Get notified about AI-suggested candidate matches</p>
                        </div>
                        <Switch id="candidateMatches" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy & Security */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">
                      <Shield className="w-5 h-5 inline mr-2" />
                      Privacy & Security
                    </CardTitle>
                    <CardDescription>Manage your privacy and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="profileVisibility">Public Profile</Label>
                          <p className="text-sm text-gray-500">Allow job seekers to view your company profile</p>
                        </div>
                        <Switch id="profileVisibility" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="contactInfo">Show Contact Information</Label>
                          <p className="text-sm text-gray-500">Display your contact details on job postings</p>
                        </div>
                        <Switch id="contactInfo" defaultChecked />
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full mb-3">
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full">
                        Download My Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing & Subscription */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Billing & Subscription</CardTitle>
                    <CardDescription>Manage your subscription and billing information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-green-800">Professional Plan</h3>
                          <p className="text-sm text-green-600">Active until March 15, 2024</p>
                        </div>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-[#0A2540]">10</div>
                        <div className="text-sm text-gray-500">Job Posts</div>
                        <div className="text-xs text-green-600">5 remaining</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-[#0A2540]">∞</div>
                        <div className="text-sm text-gray-500">AI Matches</div>
                        <div className="text-xs text-green-600">Unlimited</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-[#0A2540]">24/7</div>
                        <div className="text-sm text-gray-500">Support</div>
                        <div className="text-xs text-green-600">Priority</div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="outline" className="flex-1">
                        View Billing History
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Update Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      <Trash2 className="w-5 h-5 inline mr-2" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>Irreversible and destructive actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-600 mb-4">
                        Once you delete your account, there is no going back. This will permanently delete your 
                        company profile, all job postings, and candidate data.
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete My Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
      </div>
    </div>
  )
}