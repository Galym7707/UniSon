//app/employer/company/ClientCompanyProfile.tsx

'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner, LoadingButton } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-display'
import { Upload, MapPin, Plus, X } from "lucide-react"
import { createBrowserClient } from '@/lib/supabase/browser'
import { logError, getUserFriendlyErrorMessage, showSuccessToast, showErrorToast } from '@/lib/error-handling'
import { UserProfile, clientAuth } from '@/lib/auth-helpers-client'
import ProfileAvatar from '@/components/ui/profile-avatar'

interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  industry: string
  company_size: string
  description: string
  founded_year: string
  employee_count: string
  website: string
  country: string
  city: string
  address: string
  benefits: string[]
  technologies: string[]
  culture: string
  hr_email: string
  phone: string
  contact_person: string
  logo_url: string | null
}

interface ClientCompanyProfileProps {
  userProfile: UserProfile
}

export default function ClientCompanyProfile({ userProfile }: ClientCompanyProfileProps) {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false)
  const [newBenefit, setNewBenefit] = useState('')
  const [newTechnology, setNewTechnology] = useState('')

  // Verify employer access on component mount
  useEffect(() => {
    const verifyAccess = async () => {
      const { profile: currentProfile, error: accessError } = await clientAuth.requireEmployerAccess()
      
      if (accessError || !currentProfile) {
        showErrorToast(
          accessError || 'Access denied'
        )
        router.push('/unauthorized?reason=insufficient_permissions')
        return
      }

      // Profile is verified, proceed with loading company profile
      loadCompanyProfile()
    }

    verifyAccess()
  }, [router])

  const loadCompanyProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!data) {
        setIsFirstTimeSetup(true)
        setProfile(null)
      } else {
        setProfile(data)
        setIsFirstTimeSetup(false)
      }
    } catch (err) {
      logError('company-profile-load', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => prev ? { ...prev, [name]: value } : null)
  }

  const addBenefit = () => {
    if (newBenefit.trim() && profile) {
      setProfile(prev => prev ? {
        ...prev,
        benefits: [...(prev.benefits || []), newBenefit.trim()]
      } : null)
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setProfile(prev => prev ? {
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    } : null)
  }

  const addTechnology = () => {
    if (newTechnology.trim() && profile) {
      setProfile(prev => prev ? {
        ...prev,
        technologies: [...(prev.technologies || []), newTechnology.trim()]
      } : null)
      setNewTechnology('')
    }
  }

  const removeTechnology = (index: number) => {
    setProfile(prev => prev ? {
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    } : null)
  }

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `company-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath)
      
      const updatedProfile = { ...profile, logo_url: data.publicUrl }
      setProfile(updatedProfile)
      
      showSuccessToast('Logo uploaded successfully')
    } catch (err) {
      logError('logo-upload', err)
      showErrorToast(getUserFriendlyErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      const profileData = {
        ...profile,
        user_id: user.id
      }

      if (isFirstTimeSetup) {
        const { error } = await supabase
          .from('company_profiles')
          .insert([profileData])
        if (error) throw error
        setIsFirstTimeSetup(false)
      } else {
        const { error } = await supabase
          .from('company_profiles')
          .update(profileData)
          .eq('user_id', user.id)
        if (error) throw error
      }

      showSuccessToast('Company profile saved successfully!')
      setError(null)
    } catch (err) {
      logError('company-profile-save', err)
      showErrorToast(getUserFriendlyErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const clearError = () => setError(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {isFirstTimeSetup ? 'Setup Company Profile' : 'Company Profile'}
          </h1>
          <p className="text-muted-foreground">
            {isFirstTimeSetup 
              ? 'Complete your company profile to start posting jobs and attract top talent'
              : 'Manage your company information and profile'
            }
          </p>
        </div>

        <ErrorDisplay error={error} onDismiss={clearError} />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic details about your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.logo_url || ''} alt="Company Logo" />
                    <AvatarFallback className="text-lg">
                      {profile?.company_name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <Label htmlFor="logo" className="block text-sm font-medium mb-2">
                    Company Logo
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && <LoadingSpinner size="sm" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a high-quality logo (recommended: 400x400px)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={profile?.company_name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={profile?.industry || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size</Label>
                  <Input
                    id="company_size"
                    name="company_size"
                    value={profile?.company_size || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., 10-50, 50-200, 200+"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founded_year">Founded Year</Label>
                  <Input
                    id="founded_year"
                    name="founded_year"
                    type="number"
                    value={profile?.founded_year || ''}
                    onChange={handleInputChange}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_count">Number of Employees</Label>
                  <Input
                    id="employee_count"
                    name="employee_count"
                    type="number"
                    value={profile?.employee_count || ''}
                    onChange={handleInputChange}
                    placeholder="50"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={profile?.website || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={profile?.description || ''}
                  onChange={handleInputChange}
                  placeholder="Describe your company, mission, and values..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location</span>
              </CardTitle>
              <CardDescription>
                Where your company is located
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={profile?.country || ''}
                    onChange={handleInputChange}
                    placeholder="United States"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={profile?.city || ''}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={profile?.address || ''}
                  onChange={handleInputChange}
                  placeholder="123 Main St, Suite 100, New York, NY 10001"
                />
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Company Benefits</CardTitle>
              <CardDescription>
                List the benefits and perks you offer to employees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile?.benefits?.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Technologies Used</CardTitle>
              <CardDescription>
                Technologies, tools, and frameworks your team uses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="Add a technology..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                />
                <Button type="button" onClick={addTechnology} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile?.technologies?.map((tech, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => removeTechnology(index)}
                      className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Culture */}
          <Card>
            <CardHeader>
              <CardTitle>Company Culture</CardTitle>
              <CardDescription>
                Describe your company culture and work environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="culture"
                name="culture"
                value={profile?.culture || ''}
                onChange={handleInputChange}
                placeholder="Describe your company culture, values, and work environment..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Contact details for HR and recruiting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    value={profile?.contact_person || ''}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hr_email">HR Email</Label>
                  <Input
                    id="hr_email"
                    name="hr_email"
                    type="email"
                    value={profile?.hr_email || ''}
                    onChange={handleInputChange}
                    placeholder="hr@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile?.phone || ''}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-between">
            <Link href="/employer/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <LoadingButton isLoading={saving} type="submit">
              {isFirstTimeSetup ? 'Create Profile' : 'Save Changes'}
            </LoadingButton>
          </div>
        </form>
      </div>
  )
}