'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Mail, Users } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'
import EmployerLayout from '@/components/EmployerLayout'

type Candidate = {
  id: string
  first_name: string
  last_name: string
  title: string
  summary: string
  experience: string
  skills: string
  test_results?: {
    scores: {
      analytical_thinking: number
      teamwork: number
      creativity: number
      initiative: number
      adaptability: number
      empathy: number
    }
    overall_score: number
  }
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')

  const supabase = createBrowserClient()

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, title, summary, experience, skills, test_results')
        .not('first_name', 'is', null)

      if (error) {
        console.error('Error loading candidates:', error)
        return
      }

      setCandidates(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === '' ||
      `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterBy === 'all') return matchesSearch
    if (filterBy === 'tested') return matchesSearch && candidate.test_results
    if (filterBy === 'not_tested') return matchesSearch && !candidate.test_results

    return matchesSearch
  })

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getSkillsArray = (skills: string) => {
    if (!skills) return []
    try {
      return typeof skills === 'string' ? JSON.parse(skills) : skills
    } catch {
      return skills.split(',').map((s: string) => s.trim())
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <EmployerLayout companyName="TechCorp Inc.">
          <div className="min-h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
              <p className="text-[#333333]">Loading candidates...</p>
            </div>
          </div>
        </EmployerLayout>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <EmployerLayout companyName="TechCorp Inc.">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#0A2540]">Candidates</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredCandidates.length} candidates found
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Search candidates by name, title, or skills..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Candidates</SelectItem>
                    <SelectItem value="tested">With Test Results</SelectItem>
                    <SelectItem value="not_tested">Without Test Results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-[#0A2540] text-white">
                        {getInitials(candidate.first_name, candidate.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-[#0A2540] text-lg">
                        {candidate.first_name} {candidate.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{candidate.title || 'No title specified'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {candidate.summary || 'No summary available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {getSkillsArray(candidate.skills).slice(0, 3).map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {getSkillsArray(candidate.skills).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{getSkillsArray(candidate.skills).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {candidate.test_results && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Test Score</p>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={candidate.test_results.overall_score} 
                          className="flex-1 h-2"
                        />
                        <span className="text-sm font-medium text-[#00C49A]">
                          {candidate.test_results.overall_score}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <Link href={`/employer/candidates/${candidate.id}`}>
                      <Button className="flex-1 bg-[#00C49A] hover:bg-[#00A085] text-white text-sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="px-3">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#0A2540] mb-2">No Candidates Found</h3>
                <p className="text-[#333333]">Try adjusting your search criteria or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </EmployerLayout>
      <Footer />
    </>
  )
}