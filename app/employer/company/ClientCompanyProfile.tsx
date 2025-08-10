//app/employer/company/ClientCompanyProfile.tsx
'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import EmployerLayout from '@/components/EmployerLayout'
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
          new Error(accessError || 'Access denied'), 
          'employer-access-check'
        )
        router.push('/unauthorized?reason=insufficient_permissions')
        return
      }

      // Profile is verified, proceed with loading company profile
      loadCompanyProfile()
    }

    verifyAccess()
  }, [router])

  // Load or create company profile
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

      // Double-check employer access before saving
      const { error: accessError } = await clientAuth.requireEmployerAccess()
      if (accessError) {
        throw new Error('You must have employer privileges to save company profiles')
      }

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
      <EmployerLayout userProfile={userProfile} companyName="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </EmployerLayout>
    )
  }

  if (!profile) {
    return (
      <EmployerLayout userProfile={userProfile} companyName="Company Profile">
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
      </EmployerLayout>
    )
  }

  return (
    <EmployerLayout userProfile={userProfile} companyName={profile.company_name || 'Company Profile'}>
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
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <Input 
                      id="employeeCount" 
                      value={profile.employee_count || ''} 
                      onChange={(e) => updateProfile('employee_count', e.target.value)}
                      placeholder="e.g., 75"
                      disabled={saving || uploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Company Website</Label>
                  <Input 
                    id="website" 
                    value={profile.website || ''} 
                    onChange={(e) => updateProfile('website', e.target.value)}
                    placeholder="https://yourcompany.com"
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
                  Company Location
                </CardTitle>
                <CardDescription>Where is your company located?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      value={profile.country || ''} 
                      onChange={(e) => updateProfile('country', e.target.value)}
                      placeholder="e.g., Russia"
                      disabled={saving || uploading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={profile.city || ''} 
                      onChange={(e) => updateProfile('city', e.target.value)}
                      placeholder="e.g., Moscow"
                      disabled={saving || uploading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input 
                    id="address" 
                    value={profile.address || ''} 
                    onChange={(e) => updateProfile('address', e.target.value)}
                    placeholder="e.g., 123 Business Street, Business District"
                    disabled={saving || uploading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Employee Benefits</CardTitle>
                <CardDescription>What benefits do you offer to your employees?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a benefit (e.g., Health insurance, Remote work)"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addBenefit()
                      }
                    }}
                    disabled={saving || uploading}
                  />
                  <Button type="button" onClick={addBenefit} disabled={!newBenefit.trim() || saving || uploading}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {benefit}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => removeBenefit(index)}
                        disabled={saving || uploading}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Technologies & Tools</CardTitle>
                <CardDescription>What technologies does your company use?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add technology (e.g., React, Node.js, AWS)"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTechnology()
                      }
                    }}
                    disabled={saving || uploading}
                  />
                  <Button type="button" onClick={addTechnology} disabled={!newTechnology.trim() || saving || uploading}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {tech}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => removeTechnology(index)}
                        disabled={saving || uploading}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Company Culture */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Company Culture</CardTitle>
                <CardDescription>Describe your company culture and work environment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="culture">Culture Description</Label>
                  <Textarea
                    id="culture"
                    placeholder="Tell candidates about your company culture, work environment, and values..."
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
                <CardDescription>How can candidates reach you?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input 
                      id="contactPerson" 
                      value={profile.contact_person || ''} 
                      onChange={(e) => updateProfile('contact_person', e.target.value)}
                      placeholder="e.g., John Smith"
                      disabled={saving || uploading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hrEmail">HR Email</Label>
                    <Input 
                      id="hrEmail" 
                      type="email"
                      value={profile.hr_email || ''} 
                      onChange={(e) => updateProfile('hr_email', e.target.value)}
                      placeholder="hr@yourcompany.com"
                      disabled={saving || uploading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={profile.phone || ''} 
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    placeholder="e.g., +7 (495) 123-45-67"
                    disabled={saving || uploading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </EmployerLayout>
  )
}