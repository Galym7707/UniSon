'use client'
//app/employer/jobs/create/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Save, Eye } from "lucide-react"
import Link from "next/link"

export default function CreateJob() {
  const skills = ["React", "TypeScript", "JavaScript", "Node.js", "GraphQL"]
  const benefits = ["Health Insurance", "Flexible Hours", "Remote Work"]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
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
                  <Input id="title" placeholder="Senior Frontend Developer" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
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
                    <Select>
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
                    <Input id="location" placeholder="Moscow" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment">Employment Type</Label>
                    <Select>
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
                  <Checkbox id="remote" />
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
                    <Input id="salaryFrom" placeholder="200000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryTo">To</Label>
                    <Input id="salaryTo" placeholder="300000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="rub">
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
                  <Checkbox id="hideSalary" />
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Specify required skills, work experience, and education..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Detail the work responsibilities..."
                    className="min-h-[100px]"
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
                      <X className="w-3 h-3 ml-2 cursor-pointer" />
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input placeholder="Add skill..." />
                  <Button className="bg-[#00C49A] hover:bg-[#00A085]">
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
                      <X className="w-3 h-3 ml-2 cursor-pointer" />
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input placeholder="Add benefit..." />
                  <Button className="bg-[#00C49A] hover:bg-[#00A085]">
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
                <Button className="w-full bg-[#FF7A00] hover:bg-[#E66A00]">
                  <Save className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
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
                  <Input id="deadline" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positions">Number of positions</Label>
                  <Input id="positions" type="number" defaultValue="1" min="1" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoClose" />
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
                  <Checkbox id="aiMatching" defaultChecked />
                  <Label htmlFor="aiMatching" className="text-sm">
                    Enable AI candidate analysis
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoNotify" defaultChecked />
                  <Label htmlFor="autoNotify" className="text-sm">
                    Notify about new matching candidates
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minMatch">Minimum Match Score</Label>
                  <Input id="minMatch" type="number" defaultValue="70" min="0" max="100" />
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
  )
}