'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Settings, 
  Users, 
  Mail, 
  Lock, 
  Bell, 
  CreditCard, 
  ExternalLink 
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header-landing"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

// Validation schemas
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type EmailFormData = z.infer<typeof emailSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function EmployerSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    jobApplications: true,
    candidateMatches: true,
    weeklyReports: false,
    marketingEmails: false,
  })
  
  const { toast } = useToast()

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: 'john.doe@techcorp.com', // This would come from user context/API
      currentPassword: '',
    },
  })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to update email
      // await updateEmail(data)
      console.log('Email update:', data)
      
      toast({
        title: "Email updated successfully",
        description: "Your email address has been updated.",
      })
      
      emailForm.setValue('currentPassword', '')
    } catch (error) {
      toast({
        title: "Error updating email",
        description: "There was a problem updating your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to update password
      // await updatePassword(data)
      console.log('Password update:', data)
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed.",
      })
      
      passwordForm.reset()
    } catch (error) {
      toast({
        title: "Error updating password",
        description: "There was a problem updating your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      // TODO: Implement API call to update notification preferences
      // await updateNotificationPreference(key, value)
      console.log('Notification update:', key, value)
      
      setNotifications(prev => ({
        ...prev,
        [key]: value
      }))
      
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error updating preferences",
        description: "There was a problem saving your notification settings.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm border-r">
            <div className="p-6">
              <Link href="/" className="text-xl font-bold text-[#0A2540]">
                Unison AI
              </Link>
              <p className="text-sm text-[#333333] mt-1">TechCorp Inc.</p>
            </div>
            <nav className="px-4 space-y-2">
              <Link
                href="/employer/dashboard"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link
                href="/employer/jobs"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <Briefcase className="w-5 h-5 mr-3" />
                Jobs
              </Link>
              <Link
                href="/employer/company"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <Building2 className="w-5 h-5 mr-3" />
                Company Profile
              </Link>
              <Link
                href="/employer/candidates"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <Users className="w-5 h-5 mr-3" />
                Candidates
              </Link>
              <Link
                href="/employer/settings"
                className="flex items-center px-4 py-3 text-[#FF7A00] bg-[#FF7A00]/10 rounded-lg"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0A2540]">Settings</h1>
                <p className="text-[#333333] mt-1">Manage your account preferences and company settings</p>
              </div>

              <div className="space-y-8">
                {/* Account Preferences Section */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#0A2540] mb-2">Account Preferences</h2>
                    <p className="text-[#333333]">Update your email address and password</p>
                  </div>

                  {/* Email Update Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-[#0A2540]">
                        <Mail className="w-5 h-5 mr-2" />
                        Email Address
                      </CardTitle>
                      <CardDescription>
                        Change your account email address
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            {...emailForm.register('email')}
                            className="max-w-md"
                          />
                          {emailForm.formState.errors.email && (
                            <p className="text-sm text-red-600">
                              {emailForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currentPasswordEmail">Current Password</Label>
                          <Input
                            id="currentPasswordEmail"
                            type="password"
                            {...emailForm.register('currentPassword')}
                            className="max-w-md"
                            placeholder="Enter your current password"
                          />
                          {emailForm.formState.errors.currentPassword && (
                            <p className="text-sm text-red-600">
                              {emailForm.formState.errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="bg-[#00C49A] hover:bg-[#00A085] text-white"
                        >
                          {isLoading ? 'Updating...' : 'Update Email'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Password Update Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-[#0A2540]">
                        <Lock className="w-5 h-5 mr-2" />
                        Change Password
                      </CardTitle>
                      <CardDescription>
                        Update your account password for better security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPasswordChange">Current Password</Label>
                          <Input
                            id="currentPasswordChange"
                            type="password"
                            {...passwordForm.register('currentPassword')}
                            className="max-w-md"
                            placeholder="Enter your current password"
                          />
                          {passwordForm.formState.errors.currentPassword && (
                            <p className="text-sm text-red-600">
                              {passwordForm.formState.errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            {...passwordForm.register('newPassword')}
                            className="max-w-md"
                            placeholder="Enter your new password"
                          />
                          {passwordForm.formState.errors.newPassword && (
                            <p className="text-sm text-red-600">
                              {passwordForm.formState.errors.newPassword.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            {...passwordForm.register('confirmPassword')}
                            className="max-w-md"
                            placeholder="Confirm your new password"
                          />
                          {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-600">
                              {passwordForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="bg-[#00C49A] hover:bg-[#00A085] text-white"
                        >
                          {isLoading ? 'Updating...' : 'Change Password'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Notification Settings Section */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#0A2540] mb-2">Notification Settings</h2>
                    <p className="text-[#333333]">Configure how you receive notifications</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-[#0A2540]">
                        <Bell className="w-5 h-5 mr-2" />
                        Email Notifications
                      </CardTitle>
                      <CardDescription>
                        Choose which notifications you'd like to receive via email
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Job Application Alerts</Label>
                          <p className="text-sm text-[#333333]">
                            Get notified when candidates apply to your jobs
                          </p>
                        </div>
                        <Switch
                          checked={notifications.jobApplications}
                          onCheckedChange={(checked) => 
                            handleNotificationChange('jobApplications', checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Candidate Match Notifications</Label>
                          <p className="text-sm text-[#333333]">
                            Receive alerts for candidates that match your job criteria
                          </p>
                        </div>
                        <Switch
                          checked={notifications.candidateMatches}
                          onCheckedChange={(checked) => 
                            handleNotificationChange('candidateMatches', checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Weekly Reports</Label>
                          <p className="text-sm text-[#333333]">
                            Get weekly summaries of your job performance and analytics
                          </p>
                        </div>
                        <Switch
                          checked={notifications.weeklyReports}
                          onCheckedChange={(checked) => 
                            handleNotificationChange('weeklyReports', checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Marketing & Product Updates</Label>
                          <p className="text-sm text-[#333333]">
                            Receive updates about new features and marketing content
                          </p>
                        </div>
                        <Switch
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) => 
                            handleNotificationChange('marketingEmails', checked)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Company Management Section */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#0A2540] mb-2">Company Management</h2>
                    <p className="text-[#333333]">Manage your company profile and billing information</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-[#0A2540]">
                          <Building2 className="w-5 h-5 mr-2" />
                          Company Profile
                        </CardTitle>
                        <CardDescription>
                          Update your company information and branding
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm text-[#333333]">
                          <p>• Company name and description</p>
                          <p>• Logo and brand colors</p>
                          <p>• Contact information</p>
                          <p>• Social media links</p>
                        </div>
                        <Link href="/employer/company">
                          <Button className="w-full mt-4 bg-[#FF7A00] hover:bg-[#E66A00] text-white">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Edit Company Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-[#0A2540]">
                          <CreditCard className="w-5 h-5 mr-2" />
                          Billing & Subscription
                        </CardTitle>
                        <CardDescription>
                          Manage your billing information and subscription plan
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm text-[#333333]">
                          <p>• Current plan: Professional</p>
                          <p>• Monthly billing: $99/month</p>
                          <p>• Next billing: March 15, 2024</p>
                          <p>• Payment method: •••• 4242</p>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Manage Billing
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}