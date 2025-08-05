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

/* ─────────────── type ─────────────── */
type Profile = {
  first_name : string
  last_name  : string
  title      : string
  summary    : string
  experience : string
  skills     : string
  resume_url : string | null
}

export default function ClientProfileShell() {
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

        // Populate form with profile data
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
      const ext = file.name.split('.').pop()
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('User not authenticated')
      
      const path = `${user.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(path, file, { upsert: true })
      
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(path)
      
      setForm(f => ({ ...f, resume_url: publicUrl }))
      showSuccessToast('Resume uploaded successfully')
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('resume-upload', err)
      setError(errorMessage)
      showErrorToast(err, 'resume-upload')
    } finally {
      setUploading(false)
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
      if (authErr) throw authErr
      if (!user) throw new Error('User not authenticated')
  
      /* upsert profile */
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          ...form, 
          updated_at: new Date().toISOString() 
        })
  
      if (upsertError) throw upsertError
      
      showSuccessToast('Profile saved successfully')
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('profile-save', err)
      setError(errorMessage)
      showErrorToast(err, 'profile-save')
    } finally {
      setSaving(false)
    }
  }

  const clearError = () => setError(null)

  /* ============================================================ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

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

        {/* Show success message if profile was just created */}
        {profileCreated && !error && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              <span className="font-semibold">Profile created successfully!</span> Your profile has been automatically set up using your account information. 
              Complete the remaining fields to get better job matches.
            </p>
          </div>
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

        {/* résumé */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload your résumé</CardTitle>
            <CardDescription>PDF, DOC or DOCX</CardDescription>
          </CardHeader>
          <CardContent>
            <label className={`flex flex-col items-center justify-center
                               border-2 border-dashed border-gray-300 rounded-lg
                               p-8 text-center cursor-pointer hover:border-[#00C49A]
                               ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploading ? (
                <div className="flex flex-col items-center">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  {form.resume_url ? (
                    <Link href={form.resume_url} target="_blank" className="text-[#00C49A] underline">
                      Résumé uploaded — click to preview
                    </Link>
                  ) : (
                    'Drop a file here or click to choose'
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
          <CardHeader><CardTitle>Profile completeness: {completeness}%</CardTitle></CardHeader>
          <CardContent><Progress value={completeness} className="h-3"/></CardContent>
        </Card>

        {/* form */}
        <form id="profileForm" onSubmit={handleSave}>
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal" disabled={saving || uploading}>Personal</TabsTrigger>
              <TabsTrigger value="experience" disabled={saving || uploading}>Experience</TabsTrigger>
              <TabsTrigger value="skills" disabled={saving || uploading}>Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Field 
                      label="First name" 
                      value={form.first_name} 
                      onChange={update('first_name')}
                      disabled={saving || uploading}
                    />
                    <Field 
                      label="Last name"  
                      value={form.last_name}  
                      onChange={update('last_name')}
                      disabled={saving || uploading}
                    />
                  </div>
                  <Field 
                    label="Desired position" 
                    value={form.title} 
                    onChange={update('title')}
                    disabled={saving || uploading}
                  />
                  <FieldArea 
                    label="About me" 
                    value={form.summary} 
                    onChange={update('summary')}
                    disabled={saving || uploading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience">
              <Card>
                <CardHeader><CardTitle>Work experience</CardTitle></CardHeader>
                <CardContent>
                  <FieldArea 
                    value={form.experience} 
                    onChange={update('experience')}
                    disabled={saving || uploading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card>
                <CardHeader><CardTitle>Key skills</CardTitle></CardHeader>
                <CardContent>
                  <Field 
                    placeholder="React, TypeScript…" 
                    value={form.skills} 
                    onChange={update('skills')}
                    disabled={saving || uploading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </main>
    </div>
  )
}

/* ========== tiny helpers ========== */
function Field({ label, disabled, ...rest }: { label?: string; disabled?: boolean } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input disabled={disabled} {...rest}/>
    </div>
  )
}
function FieldArea({ label, disabled, ...rest }: { label?: string; disabled?: boolean } & React.ComponentProps<typeof Textarea>) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Textarea rows={4} disabled={disabled} {...rest}/>
    </div>
  )
}
function SidebarLink({ href, icon: Icon, text, active = false }:{
  href:string; icon: React.ElementType; text:string; active?:boolean
}) {
  return (
    <Link href={href}
          className={`flex items-center px-4 py-3 rounded-lg
                      ${active
                        ? 'bg-[#00C49A]/10 text-[#00C49A]'
                        : 'text-[#333] hover:bg-gray-100'}`}>
      <Icon className="h-5 w-5 mr-3"/> {text}
    </Link>
  )
}