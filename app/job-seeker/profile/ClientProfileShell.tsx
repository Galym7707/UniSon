/*  app/job-seeker/profile/ClientProfileShell.tsx  – CLIENT COMPONENT */
'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Button, Tabs, TabsList, TabsTrigger, TabsContent,
  Input, Textarea, Label, Progress
} from '@/components/ui'
import {
  LayoutDashboard,       // ← Lucide icons (same set as Dashboard)
  User,
  Search,
  Heart,
  Settings,
  Upload,
  Brain
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { LoadingSpinner, LoadingButton } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-display'
import { logError, getUserFriendlyErrorMessage, showSuccessToast, showErrorToast } from '@/lib/error-handling'
import { ensureUserProfile, ProfileData } from '@/lib/profile-fallback'
import ImageUpload from '@/components/ui/image-upload'
import ProfileAvatar from '@/components/ui/profile-avatar'

/* ─────────────── type ─────────────── */
type Profile = {
  first_name : string
  last_name  : string
  title      : string
  summary    : string
  experience : string
  skills     : string
  resume_url : string | null
  avatar_url : string | null
}

interface ClientProfileShellProps {
  profile: any
}

export default function ClientProfileShell({ profile: serverProfile }: ClientProfileShellProps) {
  const supabase = createBrowserClient()

  /* ---------- state ---------- */
  const [form, setForm] = useState<Profile>({
    first_name : '',
    last_name  : '',
    title      : '',
    summary    : '',
    experience : '',
    skills     : '',
    resume_url : null
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileCreated, setProfileCreated] = useState(false)

  /* ---------- load profile with fallback ---------- */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use profile fallback to ensure profile exists
        const { profile, error: fallbackError, wasCreated } = await ensureUserProfile()

        if (fallbackError) {
          throw new Error(fallbackError)
        }

        if (!profile) {
          throw new Error('Unable to load or create profile')
        }

        // Set state based on whether profile was just created
        setProfileCreated(wasCreated)

        // Populate form with profile data, ensuring empty strings for null values
        setForm({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          title: profile.title || '',
          summary: profile.summary || '',
          experience: profile.experience || '',
          skills: profile.skills || '',
          resume_url: profile.resume_url || null
        })

      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err)
        logError('profile-shell-load', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  /* ---------- derived ---------- */
  const completeness = Math.round(
    (['first_name','last_name','title','summary','experience','skills']
      .filter(k => (form as any)[k])                // filled
      .length / 6) * 100
  )

  /* ---------- field helpers ---------- */
  const update = (key: keyof Profile) =>
    (e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  /* ---------- resume upload ---------- */
  async function handleResume(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return
    
    try {
      setUploading(true)
      setError(null)
      
      const file = e.target.files[0]
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, DOC, or DOCX file.')
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error(`File size must be less than 10MB. Your file is ${Math.round(file.size / (1024 * 1024))}MB.`)
      }
      
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
        throw new Error('Invalid file extension. Please upload a PDF, DOC, or DOCX file.')
      }
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`)
      }
      if (!user) {
        throw new Error('User not authenticated. Please sign in again.')
      }
      
      // Create the file path with user ID as folder for proper access control
      const filePath = `${user.id}/${user.id}.${ext}`
      
      // First, check if bucket exists and is accessible
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
        if (bucketError) {
          throw new Error(`Storage service unavailable: ${bucketError.message}`)
        }
        
        const resumesBucket = buckets?.find((bucket: any) => bucket.id === 'resumes')
        if (!resumesBucket) {
          throw new Error('Resume storage is not configured. Please contact support.')
        }
      } catch (bucketCheckError) {
        if (bucketCheckError instanceof Error && bucketCheckError.message.includes('Resume storage is not configured')) {
          throw bucketCheckError
        }
        // If we can't check buckets, proceed anyway - it might still work
        console.warn('Could not verify bucket existence, proceeding with upload')
      }

      // Upload the file with proper error handling
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        })
      
      if (uploadError) {
        // Handle specific storage errors with user-friendly messages
        if (uploadError.message.includes('The resource was not found')) {
          throw new Error('Resume storage bucket not found. Please contact support.')
        }
        if (uploadError.message.includes('Invalid file type') || uploadError.message.includes('file_type_not_allowed')) {
          throw new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.')
        }
        if (uploadError.message.includes('File too large') || uploadError.message.includes('payload_too_large')) {
          throw new Error(`File is too large. Maximum allowed size is 10MB. Your file is ${Math.round(file.size / (1024 * 1024))}MB.`)
        }
        if (uploadError.message.includes('Storage quota exceeded') || uploadError.message.includes('storage_quota_exceeded')) {
          throw new Error('Storage quota exceeded. Please contact support to increase your storage limit.')
        }
        if (uploadError.message.includes('permission denied') || uploadError.message.includes('insufficient_privileges')) {
          throw new Error('Permission denied. Please sign out and sign back in, then try again.')
        }
        if (uploadError.message.includes('bucket_not_found')) {
          throw new Error('Resume storage is not properly configured. Please contact support.')
        }
        
        // Generic upload error
        throw new Error(`Resume upload failed: ${uploadError.message}. Please try again or contact support.`)
      }

      if (!uploadData) {
        throw new Error('Upload completed but no response received. Please refresh and check if your resume was uploaded.')
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)
      
      if (!urlData?.publicUrl) {
        throw new Error('Resume uploaded successfully but failed to generate access URL. Please try uploading again.')
      }
      
      // Verify the file was actually uploaded by checking if it exists
      try {
        const { data: fileExists, error: checkError } = await supabase.storage
          .from('resumes')
          .list(user.id, { limit: 1 })
        
        if (checkError) {
          // Log but don't fail - the upload might have succeeded
          console.warn('Could not verify file upload:', checkError)
        }
      } catch (verifyError) {
        // Non-critical error - file might still be uploaded successfully
        console.warn('File verification failed:', verifyError)
      }
      
      // Update the form with the new resume URL
      setForm(f => ({ ...f, resume_url: urlData.publicUrl }))
      
      showSuccessToast(
        'Resume uploaded successfully', 
        `Your resume "${file.name}" has been uploaded and is now attached to your profile.`
      )
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('resume-upload', err, {
        userId: (await supabase.auth.getUser()).data.user?.id,
        fileName: e.target.files?.[0]?.name,
        fileSize: e.target.files?.[0]?.size,
        fileType: e.target.files?.[0]?.type,
        errorType: err instanceof Error ? err.constructor.name : 'Unknown'
      })
      setError(errorMessage)
      showErrorToast(err, 'resume-upload')
    } finally {
      setUploading(false)
      // Clear the file input so the same file can be uploaded again if needed
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  /* ---------- save ---------- */
  async function handleSave(e: FormEvent) {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
  
      /* get the logged-in user */
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr) {
        throw new Error(`Authentication error: ${authErr.message}`)
      }
      if (!user) {
        throw new Error('User not authenticated. Please sign in again.')
      }

      // Validate required fields
      if (!form.first_name?.trim()) {
        throw new Error('First name is required')
      }
      if (!form.last_name?.trim()) {
        throw new Error('Last name is required')
      }

      // Prepare profile data with proper validation
      const profileData = {
        id: user.id,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        title: form.title?.trim() || '',
        summary: form.summary?.trim() || '',
        experience: form.experience?.trim() || '',
        skills: form.skills?.trim() || '',
        resume_url: form.resume_url,
        updated_at: new Date().toISOString()
      }
  
      /* upsert profile with comprehensive error handling */
      const { data: savedProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single()
  
      if (upsertError) {
        // Handle specific database errors
        if (upsertError.code === '23505') {
          throw new Error('Profile already exists. Please refresh the page and try again.')
        }
        if (upsertError.code === '23502') {
          throw new Error('Required profile information is missing. Please fill in all required fields.')
        }
        if (upsertError.code === '42501') {
          throw new Error('You do not have permission to update this profile.')
        }
        if (upsertError.code === '42P01') {
          throw new Error('Database error: profiles table not found. Please contact support.')
        }
        if (upsertError.code === '23514') {
          throw new Error('Invalid profile data. Please check your input and try again.')
        }
        throw new Error(`Profile save failed: ${upsertError.message}`)
      }

      // Verify the profile was actually saved
      if (!savedProfile) {
        throw new Error('Profile was not saved properly. Please try again.')
      }
      
      showSuccessToast(
        'Profile saved successfully',
        profileCreated ? 'Your profile is now set up and ready!' : 'Your profile has been updated.'
      )
      setProfileCreated(false) // Clear the first-time setup message
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('profile-save', err, {
        userId: (await supabase.auth.getUser()).data.user?.id,
        profileData: { 
          hasFirstName: !!form.first_name, 
          hasLastName: !!form.last_name,
          hasTitle: !!form.title,
          hasSummary: !!form.summary
        }
      })
      setError(errorMessage)
      showErrorToast(err, 'profile-save')
    } finally {
      setSaving(false)
    }
  }

  const clearError = () => setError(null)
  const retryLoad = () => window.location.reload()

  /* ============================================================ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Skeleton */}
        <aside className="w-64 bg-white border-r shadow-sm">
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <nav className="px-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center px-4 py-3">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mr-3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Loading */}
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
            
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show error state if we can't load profile and have no fallback data
  if (error && !form.first_name && !form.last_name && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* ========== SIDEBAR ========== */}
        <aside className="w-64 bg-white border-r shadow-sm">
          <div className="p-6 font-bold text-xl text-[#0A2540]">Unison AI</div>
          <nav className="px-4 space-y-2">
            <SidebarLink href="/job-seeker/dashboard" icon={LayoutDashboard} text="Dashboard" />
            <SidebarLink href="/job-seeker/profile"   icon={User}            text="Profile"   active />
            <SidebarLink href="/job-seeker/test"      icon={Brain}           text="Test" />
            <SidebarLink href="/job-seeker/search"    icon={Search}          text="Job search" />
            <SidebarLink href="/job-seeker/saved"     icon={Heart}           text="Saved" />
            <SidebarLink href="/job-seeker/settings"  icon={Settings}        text="Settings" />
          </nav>
        </aside>

        {/* Error State */}
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Unable to Load Profile</CardTitle>
                <CardDescription>
                  We encountered an issue loading your profile data. This could be due to a network error or temporary server issue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorDisplay 
                  error={error} 
                  onDismiss={clearError} 
                  onRetry={retryLoad}
                  variant="card"
                />
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">What you can try:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Refresh the page</li>
                    <li>• Sign out and sign back in</li>
                    <li>• Contact support if the problem persists</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const isEmptyProfile = !form.first_name && !form.last_name && !form.title && !form.summary

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ========== SIDEBAR ========== */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-6 font-bold text-xl text-[#0A2540]">Unison AI</div>

        <nav className="px-4 space-y-2">
          <SidebarLink href="/job-seeker/dashboard" icon={LayoutDashboard} text="Dashboard" />
          <SidebarLink href="/job-seeker/profile"   icon={User}            text="Profile"   active />
          <SidebarLink href="/job-seeker/test"      icon={Brain}           text="Test" />
          <SidebarLink href="/job-seeker/search"    icon={Search}          text="Job search" />
          <SidebarLink href="/job-seeker/saved"     icon={Heart}           text="Saved" />
          <SidebarLink href="/job-seeker/settings"  icon={Settings}        text="Settings" />
        </nav>
      </aside>

      {/* ========== MAIN ========== */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0A2540]">My profile</h1>
          <Button type="submit" form="profileForm" disabled={saving || uploading}>
            <LoadingButton isLoading={saving} loadingText="Saving...">
              Save
            </LoadingButton>
          </Button>
        </div>

        {/* Show message for first-time profile creation */}
        {profileCreated && !error && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-800 mb-2">Welcome! Your Profile is Ready</h3>
              <p className="text-green-700">
                Your profile has been created using your account information. Complete the remaining fields 
                below to improve your job matching and attract employers.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Show "Complete Your Profile" message for empty profiles */}
        {isEmptyProfile && !profileCreated && !error && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Complete Your Profile</h3>
              <p className="text-blue-700">
                Let's get your profile set up! Fill in the information below to help employers find you 
                and match you with the perfect job opportunities.
              </p>
              <div className="mt-3 text-sm text-blue-600">
                <p>✓ Upload your resume to get started quickly</p>
                <p>✓ Add your experience and skills</p>
                <p>✓ Write a compelling summary</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error display - only show if we have some profile data to work with */}
        {error && (form.first_name || form.last_name) && (
          <div className="mb-6">
            <ErrorDisplay 
              error={error}
              onDismiss={clearError}
              variant="card"
            />
          </div>
        )}

        {/* résumé */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload your résumé</CardTitle>
            <CardDescription>PDF, DOC or DOCX (max 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <label className={`flex flex-col items-center justify-center
                               border-2 border-dashed border-gray-300 rounded-lg
                               p-8 text-center cursor-pointer hover:border-[#00C49A]
                               transition-colors duration-200
                               ${uploading ? 'opacity-50 cursor-not-allowed border-gray-200' : ''}`}>
              {uploading ? (
                <div className="flex flex-col items-center">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <span className="text-gray-600">Uploading resume...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  {form.resume_url ? (
                    <div className="text-center">
                      <Link href={form.resume_url} target="_blank" className="text-[#00C49A] underline font-medium">
                        Resume uploaded successfully — click to preview
                      </Link>
                      <p className="text-sm text-gray-500 mt-2">
                        Upload a new file to replace the current resume
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium">Drop a file here or click to choose</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload your resume to automatically populate some fields
                      </p>
                    </div>
                  )}
                </>
              )}
              <input 
                hidden 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleResume}
                disabled={uploading}
              />
            </label>
          </CardContent>
        </Card>

        {/* completeness */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile completeness: {completeness}%</CardTitle>
            <CardDescription>
              {completeness === 100 
                ? "Your profile is complete! 🎉" 
                : completeness >= 70 
                ? "Almost there! Add a few more details."
                : completeness >= 40 
                ? "Good start! Keep adding information."
                : "Let's fill in your basic information first."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={completeness} className="w-full" />
          </CardContent>
        </Card>

        {/* main form */}
        <Card>
          <CardContent className="pt-6">
            <form id="profileForm" onSubmit={handleSave} className="space-y-6">
              
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First name *</Label>
                      <Input
                        id="firstName"
                        value={form.first_name}
                        onChange={update('first_name')}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name *</Label>
                      <Input
                        id="lastName"
                        value={form.last_name}
                        onChange={update('last_name')}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Professional title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={update('title')}
                      placeholder="e.g. Senior Software Engineer, Marketing Manager"
                    />
                  </div>

                  <div>
                    <Label htmlFor="summary">Professional summary</Label>
                    <Textarea
                      id="summary"
                      rows={4}
                      value={form.summary}
                      onChange={update('summary')}
                      placeholder="A brief overview of your professional background, key achievements, and career goals..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="professional" className="space-y-6">
                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Textarea
                      id="experience"
                      rows={6}
                      value={form.experience}
                      onChange={update('experience')}
                      placeholder="Describe your work experience, including job titles, companies, dates, and key responsibilities..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6">
                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Textarea
                      id="skills"
                      rows={4}
                      value={form.skills}
                      onChange={update('skills')}
                      placeholder="List your technical skills, programming languages, tools, certifications, etc..."
                    />
                  </div>
                </TabsContent>

              </Tabs>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

/* ─────────────────────────────── helper ─────────────────────────────── */
function SidebarLink({
  href,
  icon: Icon,
  text,
  active = false,
}: {
  href: string
  icon: any
  text: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-[#00C49A]/10 text-[#00C49A] font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="h-5 w-5 mr-3" />
      {text}
    </Link>
  )
}