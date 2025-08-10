'use client'
//app/employer/jobs/create/page.tsx
'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Save, Eye, LayoutDashboard, Briefcase, Building2, Users, Settings } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header-landing"
import { Footer } from "@/components/footer"
import { createBrowserClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export default function CreateJob() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState(["React", "TypeScript", "JavaScript", "Node.js", "GraphQL"])
  const [benefits, setBenefits] = useState(["Health Insurance", "Flexible Hours", "Remote Work"])
  const [newSkill, setNewSkill] = useState("")
  const [newBenefit, setNewBenefit] = useState("")
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    level: "",
    location: "",
    employment_type: "",
    remote_work: false,
    salary_from: "",
    salary_to: "",
    currency: "rub",
    hide_salary: false,
    description: "",
    requirements: "",
    responsibilities: "",
    application_deadline: "",
    positions_count: "1",
    auto_close: false,
    ai_matching: true,
    auto_notify: true,
    min_match_score: "70"
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()])
      setNewBenefit("")
    }
  }

  const removeBenefit = (benefitToRemove: string) => {
    setBenefits(benefits.filter(benefit => benefit !== benefitToRemove))
  }

  const handleSubmit = async (isDraft = false) => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      // Prepare job data
      const jobData = {
        title: formData.title,
        department: formData.department,
        level: formData.level,
        location: formData.location,
        employment_type: formData.employment_type,
        remote_work: formData.remote_work,
        salary_from: formData.salary_from ? parseInt(formData.salary_from) : null,
        salary_to: formData.salary_to ? parseInt(formData.salary_to) : null,
        currency: formData.currency,
        hide_salary: formData.hide_salary,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        skills: skills,
        benefits: benefits,
        application_deadline: formData.application_deadline || null,
        positions_count: parseInt(formData.positions_count),
        auto_close: formData.auto_close,
        ai_matching: formData.ai_matching,
        auto_notify: formData.auto_notify,
        min_match_score: parseInt(formData.min_match_score),
        status: isDraft ? 'draft' : 'active',
        employer_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert job into database
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single()

      if (error) throw error

      // Redirect to jobs page
      router.push('/employer/jobs')
      
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Error creating job. Please try again.')
    } finally {
      setLoading(false)
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
              <p className="text-sm text-[#333333] mt-1">Create Job</p>
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
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-8">
                <Link href="/employer/jobs">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />Back to Jobs
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-[#0A2540]">Create Job</h1>
                  <p className="text-[#333333] mt-1">Fill in the information for the new position</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">Basic Information</CardTitle>
                      <CardDescription>Basic details about the job</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title *</Label>
                        <Input 
                          id="title" 
                          placeholder="Senior Frontend Developer" 
                          value={formData.title}
                          onChange={(e) => updateFormData('title', e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select value={formData.department} onValueChange={(value) => updateFormData('department', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="development">Development</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="mobile">Mobile Development</SelectItem>
                              <SelectItem value="qa">Quality Assurance</SelectItem>
                              <SelectItem value="devops">DevOps</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level">Level</Label>
                          <Select value={formData.level} onValueChange={(value) => updateFormData('level', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location" 
                            placeholder="Moscow" 
                            value={formData.location}
                            onChange={(e) => updateFormData('location', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employment">Employment Type</Label>
                          <Select value={formData.employment_type} onValueChange={(value) => updateFormData('employment_type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fulltime">Full-time</SelectItem>
                              <SelectItem value="parttime">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remote" 
                          checked={formData.remote_work}
                          onCheckedChange={(checked) => updateFormData('remote_work', checked)}
                        />
                        <Label htmlFor="remote">Remote work available</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Salary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">Salary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="salaryFrom">From</Label>
                          <Input 
                            id="salaryFrom" 
                            placeholder="200000" 
                            value={formData.salary_from}
                            onChange={(e) => updateFormData('salary_from', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salaryTo">To</Label>
                          <Input 
                            id="salaryTo" 
                            placeholder="300000" 
                            value={formData.salary_to}
                            onChange={(e) => updateFormData('salary_to', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rub">₽ Rubles</SelectItem>
                              <SelectItem value="usd">$ Dollars</SelectItem>
                              <SelectItem value="eur">€ Euros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hideSalary" 
                          checked={formData.hide_salary}
                          onCheckedChange={(checked) => updateFormData('hide_salary', checked)}
                        />
                        <Label htmlFor="hideSalary">Don't show salary in job posting</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">Job Description</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="description">Position Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the main duties, tasks, and goals of the position..."
                          className="min-h-[120px]"
                          value={formData.description}
                          onChange={(e) => updateFormData('description', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements *</Label>
                        <Textarea
                          id="requirements"
                          placeholder="Specify required skills, work experience, and education..."
                          className="min-h-[120px]"
                          value={formData.requirements}
                          onChange={(e) => updateFormData('requirements', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="responsibilities">Responsibilities</Label>
                        <Textarea
                          id="responsibilities"
                          placeholder="Detail the work responsibilities..."
                          className="min-h-[100px]"
                          value={formData.responsibilities}
                          onChange={(e) => updateFormData('responsibilities', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">Skills and Technologies</CardTitle>
                      <CardDescription>Add key skills for this position</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1">
                            {skill}
                            <X 
                              className="w-3 h-3 ml-2 cursor-pointer" 
                              onClick={() => removeSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Add skill..." 
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addSkill()
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={addSkill}
                          className="bg-[#00C49A] hover:bg-[#00A085]"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Benefits */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">Benefits and Perks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {benefits.map((benefit) => (
                          <Badge key={benefit} variant="outline" className="px-3 py-1">
                            {benefit}
                            <X 
                              className="w-3 h-3 ml-2 cursor-pointer" 
                              onClick={() => removeBenefit(benefit)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Add benefit..." 
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addBenefit()
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={addBenefit}
                          className="bg-[#00C49A] hover:bg-[#00A085]"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        className="w-full bg-[#FF7A00] hover:bg-[#E66A00]"
                        onClick={() => handleSubmit(false)}
                        disabled={loading || !formData.title || !formData.description || !formData.requirements}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Publishing...' : 'Publish'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full bg-transparent"
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Draft'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">Publishing Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deadline">Application deadline</Label>
                        <Input 
                          id="deadline" 
                          type="date" 
                          value={formData.application_deadline}
                          onChange={(e) => updateFormData('application_deadline', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="positions">Number of positions</Label>
                        <Input 
                          id="positions" 
                          type="number" 
                          min="1" 
                          value={formData.positions_count}
                          onChange={(e) => updateFormData('positions_count', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="autoClose" 
                          checked={formData.auto_close}
                          onCheckedChange={(checked) => updateFormData('auto_close', checked)}
                        />
                        <Label htmlFor="autoClose" className="text-sm">
                          Automatically close after hiring
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Matching */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">AI Candidate Matching</CardTitle>
                      <CardDescription>Configure automatic candidate search parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="aiMatching" 
                          checked={formData.ai_matching}
                          onCheckedChange={(checked) => updateFormData('ai_matching', checked)}
                        />
                        <Label htmlFor="aiMatching" className="text-sm">
                          Enable AI candidate analysis
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="autoNotify" 
                          checked={formData.auto_notify}
                          onCheckedChange={(checked) => updateFormData('auto_notify', checked)}
                        />
                        <Label htmlFor="autoNotify" className="text-sm">
                          Notify about new matching candidates
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minMatch">Minimum Match Score</Label>
                        <Input 
                          id="minMatch" 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={formData.min_match_score}
                          onChange={(e) => updateFormData('min_match_score', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540]">Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-[#333333]">
                        <p>• Clearly describe duties and requirements</p>
                        <p>• Specify realistic salary range</p>
                        <p>• Add key technologies and skills</p>
                        <p>• Highlight company benefits</p>
                      </div>
                    </CardContent>
                  </Card>
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