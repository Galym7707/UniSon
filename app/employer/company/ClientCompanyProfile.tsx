//app/employer/company/ClientCompanyProfile.tsx
'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner, LoadingButton } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LayoutDashboard, Briefcase, Building2, Upload, MapPin, Plus, X } from "lucide-react"
import { createBrowserClient } from '@/lib/supabase/browser'
import { logError, getUserFriendlyErrorMessage, showSuccessToast, showErrorToast } from '@/lib/error-handling'
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

export default function ClientCompanyProfile() {
  const supabase = createBrowserClient()

  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false)
  const [newBenefit, setNewBenefit] = useState('')
  const [newTechnology, setNewTechnology] = useState('')

  // Load or create company profile
  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!user) throw new Error('User not authenticated')

        // Try to fetch existing company profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (existingProfile && !profileError) {
          setProfile(existingProfile)
          return
        }

        // If error is not "no rows returned", it's a real error
        if (profileError && profileError.code !== 'PGRST116') {
          throw new Error(`Profile fetch error: ${profileError.message}`)
        }

        // Create new profile with default values
        const newProfile: Partial<CompanyProfile> = {
          user_id: user.id,
          company_name: '',
          industry: '',
          company_size: '',
          description: '',
          founded_year: '',
          employee_count: '',
          website: '',
          country: '',
          city: '',
          address: '',
          benefits: [],
          technologies: [],
          culture: '',
          hr_email: user.email || '',
          phone: '',
          contact_person: '',
          logo_url: null
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('company_profiles')
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          throw new Error(`Profile creation error: ${createError.message}`)
        }

        setProfile(createdProfile)
        setIsFirstTimeSetup(true)

      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err)
        logError('company-profile-load', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadCompanyProfile()
  }, [])

  const updateProfile = (field: keyof CompanyProfile, value: any) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  const addBenefit = () => {
    if (!profile || !newBenefit.trim()) return
    const updatedBenefits = [...profile.benefits, newBenefit.trim()]
    setProfile({ ...profile, benefits: updatedBenefits })
    setNewBenefit('')
  }

  const removeBenefit = (index: number) => {
    if (!profile) return
    const updatedBenefits = profile.benefits.filter((_, i) => i !== index)
    setProfile({ ...profile, benefits: updatedBenefits })
  }

  const addTechnology = () => {
    if (!profile || !newTechnology.trim()) return
    const updatedTechnologies = [...profile.technologies, newTechnology.trim()]
    setProfile({ ...profile, technologies: updatedTechnologies })
    setNewTechnology('')
  }

  const removeTechnology = (index: number) => {
    if (!profile) return
    const updatedTechnologies = profile.technologies.filter((_, i) => i !== index)
    setProfile({ ...profile, technologies: updatedTechnologies })
  }

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !profile) return
    
    try {
      setUploading(true)
      setError(null)
      
      const file = e.target.files[0]
      const ext = file.name.split('.').pop()
      const path = `company-logos/${profile.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(path, file, { upsert: true })
      
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(path)
      
      setProfile({ ...profile, logo_url: publicUrl })
      showSuccessToast('Logo uploaded successfully')
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('logo-upload', err)
      setError(errorMessage)
      showErrorToast(err, 'logo-upload')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return
    
    try {
      setSaving(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('company_profiles')
        .update({ 
          ...profile, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', profile.id)

      if (updateError) throw updateError
      
      showSuccessToast('Company profile saved successfully')
      setIsFirstTimeSetup(false)
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('company-profile-save', err)
      setError(errorMessage)
      showErrorToast(err, 'company-profile-save')
    } finally {
      setSaving(false)
    }
  }

  const clearError = () => setError(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="w-64 bg-white shadow-sm border-r">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
            <nav className="px-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center px-4 py-3">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mr-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content Loading */}
          <div className="flex-1 p-8">
            <div className="flex items-center justify-center min-h-96">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm border-r">
            <div className="p-6">
              <Link href="/" className="text-xl font-bold text-[#0A2540]">
                Unison AI
              </Link>
              <p className="text-sm text-[#333333] mt-1">Company Profile</p>
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
                className="flex items-center px-4 py-3 text-[#FF7A00] bg-[#FF7A00]/10 rounded-lg"
              >
                <Building2 className="w-5 h-5 mr-3" />
                Company Profile
              </Link>
            </nav>
          </div>

          {/* Error State */}
          <div className="flex-1 p-8">
            <div className="max-w-2xl mx-auto">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Unable to Load Company Profile</CardTitle>
                  <CardDescription>
                    We encountered an issue loading your company profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && <ErrorDisplay error={error} onDismiss={clearError} />}
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-[#FF7A00] hover:bg-[#E66A00]"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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
            <p className="text-sm text-[#333333] mt-1">
              {profile.company_name || 'Company Profile'}
            </p>
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
              className="flex items-center px-4 py-3 text-[#FF7A00] bg-[#FF7A00]/10 rounded-lg"
            >
              <Building2 className="w-5 h-5 mr-3" />
              Company Profile
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-[#0A2540]">Company Profile</h1>
              <Button 
                form="companyProfileForm" 
                type="submit" 
                className="bg-[#FF7A00] hover:bg-[#E66A00]"
                disabled={saving || uploading}
              >
                <LoadingButton isLoading={saving} loadingText="Saving...">
                  Save Changes
                </LoadingButton>
              </Button>
            </div>

            {/* First time setup message */}
            {isFirstTimeSetup && !error && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Welcome! Complete Your Company Profile</h3>
                  <p className="text-blue-700">
                    Your company profile has been created. Complete the information below to attract the best candidates 
                    and showcase what makes your company special.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Error display */}
            {error && (
              <div className="mb-6">
                <ErrorDisplay 
                  error={error}
                  onDismiss={clearError}
                  variant="card"
                />
              </div>
            )}

            <form id="companyProfileForm" onSubmit={handleSave}>
              <div className="space-y-6">
                {/* Company Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profile.logo_url || ""} />
                          <AvatarFallback className="text-2xl">
                            {profile.company_name?.substring(0, 2).toUpperCase() || 'CO'}
                          </AvatarFallback>
                        </Avatar>
                        <label className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white border cursor-pointer hover:bg-gray-50 flex items-center justify-center">
                          {uploading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploading || saving}
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input 
                              id="companyName" 
                              value={profile.company_name || ''} 
                              onChange={(e) => updateProfile('company_name', e.target.value)}
                              className="text-lg font-semibold" 
                              placeholder="Enter your company name"
                              disabled={saving || uploading}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="industry">Industry</Label>
                              <Input 
                                id="industry" 
                                value={profile.industry || ''} 
                                onChange={(e) => updateProfile('industry', e.target.value)}
                                placeholder="e.g., Information Technology"
                                disabled={saving || uploading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="size">Company Size</Label>
                              <Input 
                                id="size" 
                                value={profile.company_size || ''} 
                                onChange={(e) => updateProfile('company_size', e.target.value)}
                                placeholder="e.g., 50-100 employees"
                                disabled={saving || uploading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Basic Information</CardTitle>
                    <CardDescription>Tell candidates about your company</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="description">Company Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell us about your company's mission, values, and what you do..."
                        className="min-h-[120px]"
                        value={profile.description || ''}
                        onChange={(e) => updateProfile('description', e.target.value)}
                        disabled={saving || uploading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="founded">Founded Year</Label>
                        <Input 
                          id="founded" 
                          value={profile.founded_year || ''} 
                          onChange={(e) => updateProfile('founded_year', e.target.value)}
                          placeholder="e.g., 2018"
                          disabled={saving || uploading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employees">Number of Employees</Label>
                        <Input 
                          id="employees" 
                          value={profile.employee_count || ''} 
                          onChange={(e) => updateProfile('employee_count', e.target.value)}
                          placeholder="e.g., 75"
                          disabled={saving || uploading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        value={profile.website || ''} 
                        onChange={(e) => updateProfile('website', e.target.value)}
                        placeholder="https://your-company.com"
                        disabled={saving || uploading}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540] flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input 
                          id="country" 
                          value={profile.country || ''} 
                          onChange={(e) => updateProfile('country', e.target.value)}
                          placeholder="e.g., United States"
                          disabled={saving || uploading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          value={profile.city || ''} 
                          onChange={(e) => updateProfile('city', e.target.value)}
                          placeholder="e.g., San Francisco"
                          disabled={saving || uploading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Office Address</Label>
                      <Input 
                        id="address" 
                        value={profile.address || ''} 
                        onChange={(e) => updateProfile('address', e.target.value)}
                        placeholder="Full office address"
                        disabled={saving || uploading}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Benefits & Perks</CardTitle>
                    <CardDescription>What do you offer your employees?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(profile.benefits || []).map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {benefit}
                          <X 
                            className="w-3 h-3 ml-2 cursor-pointer" 
                            onClick={() => removeBenefit(index)}
                          />
                        </Badge>
                      ))}
                      {(!profile.benefits || profile.benefits.length === 0) && (
                        <p className="text-gray-500 text-sm">No benefits added yet. Add some below!</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add a benefit..." 
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                        disabled={saving || uploading}
                      />
                      <Button 
                        type="button"
                        onClick={addBenefit}
                        className="bg-[#00C49A] hover:bg-[#00A085]"
                        disabled={!newBenefit.trim() || saving || uploading}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Technologies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Technologies & Tools</CardTitle>
                    <CardDescription>Your company's technology stack</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(profile.technologies || []).map((tech, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {tech}
                          <X 
                            className="w-3 h-3 ml-2 cursor-pointer" 
                            onClick={() => removeTechnology(index)}
                          />
                        </Badge>
                      ))}
                      {(!profile.technologies || profile.technologies.length === 0) && (
                        <p className="text-gray-500 text-sm">No technologies added yet. Add some below!</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add a technology..." 
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                        disabled={saving || uploading}
                      />
                      <Button 
                        type="button"
                        onClick={addTechnology}
                        className="bg-[#00C49A] hover:bg-[#00A085]"
                        disabled={!newTechnology.trim() || saving || uploading}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Culture */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Company Culture</CardTitle>
                    <CardDescription>Describe your work environment and values</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="culture">Culture Description</Label>
                      <Textarea
                        id="culture"
                        placeholder="Describe your work atmosphere, team values, and approach to work..."
                        className="min-h-[100px]"
                        value={profile.culture || ''}
                        onChange={(e) => updateProfile('culture', e.target.value)}
                        disabled={saving || uploading}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hrEmail">HR Department Email</Label>
                        <Input 
                          id="hrEmail" 
                          type="email" 
                          value={profile.hr_email || ''} 
                          onChange={(e) => updateProfile('hr_email', e.target.value)}
                          placeholder="hr@company.com"
                          disabled={saving || uploading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={profile.phone || ''} 
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          disabled={saving || uploading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hrName">Contact Person</Label>
                      <Input 
                        id="hrName" 
                        value={profile.contact_person || ''} 
                        onChange={(e) => updateProfile('contact_person', e.target.value)}
                        placeholder="Jane Smith, HR Manager"
                        disabled={saving || uploading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}