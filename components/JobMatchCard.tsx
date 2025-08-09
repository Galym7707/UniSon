import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MapPin, Clock, Building2, ChevronDown, ChevronUp, Brain, Target, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SkillMatch {
  skill: string
  matched: boolean
  relevance: number
  weight: number
  reasoning: string
}

interface ExperienceAssessment {
  requiredLevel: string
  candidateLevel: string
  match: 'under_qualified' | 'qualified' | 'over_qualified'
  reasoning: string
}

interface MatchExplanation {
  overallMatchPercentage: number
  skillMatches: SkillMatch[]
  experienceAssessment: ExperienceAssessment
  personalityFit: {
    score: number
    reasoning: string
  }
  strengths: string[]
  concerns: string[]
  recommendation: string
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary_min: number
  salary_max: number
  employment_type: string
  remote: boolean
  posted_at: string
  skills: string[]
  description: string
  match_score?: number
}

interface JobMatchCardProps {
  job: Job
  onSave: (jobId: string) => void
  onApply?: (jobId: string) => void
  savingJob: string | null
  aiMatchingEnabled?: boolean
  candidateProfile?: any
}

export default function JobMatchCard({ 
  job, 
  onSave, 
  onApply, 
  savingJob, 
  aiMatchingEnabled = false, 
  candidateProfile 
}: JobMatchCardProps) {
  const [matchExplanation, setMatchExplanation] = useState<MatchExplanation | null>(null)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)
  const [explanationOpen, setExplanationOpen] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const formatSalary = (min: number, max: number) => {
    if (min === max) return `${min.toLocaleString()} ₽`
    return `${min.toLocaleString()}–${max.toLocaleString()} ₽`
  }

  const getExperienceMatchIcon = (match: string) => {
    switch (match) {
      case 'qualified': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'over_qualified': return <Target className="w-4 h-4 text-blue-600" />
      case 'under_qualified': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default: return null
    }
  }

  const getExperienceMatchColor = (match: string) => {
    switch (match) {
      case 'qualified': return 'text-green-700 bg-green-50 border-green-200'
      case 'over_qualified': return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'under_qualified': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const loadMatchExplanation = async () => {
    if (!candidateProfile || matchExplanation || loadingMatch) return

    setLoadingMatch(true)
    setMatchError(null)

    try {
      const response = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          candidateProfile
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze match')
      }

      if (data.success && data.matchExplanation) {
        setMatchExplanation(data.matchExplanation)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error loading match explanation:', error)
      setMatchError(error instanceof Error ? error.message : 'Failed to load match analysis')
    } finally {
      setLoadingMatch(false)
    }
  }

  const handleExplanationToggle = () => {
    if (!explanationOpen && aiMatchingEnabled && !matchExplanation) {
      loadMatchExplanation()
    }
    setExplanationOpen(!explanationOpen)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-[#0A2540]">{job.title}</h3>
              {job.match_score && (
                <Badge className="bg-[#00C49A] text-white">
                  {job.match_score}% match
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-[#333333] mb-3">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {job.company}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatDate(job.posted_at)}
              </div>
            </div>

            <p className="text-[#333333] mb-4 line-clamp-2">{job.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                {job.skills?.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills?.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.skills.length - 3} more
                  </Badge>
                )}
                {job.remote && (
                  <Badge className="bg-[#00C49A] text-white text-xs">Remote</Badge>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0A2540]">
                  {formatSalary(job.salary_min, job.salary_max)}
                </p>
                <p className="text-sm text-[#333333]">{job.employment_type}</p>
              </div>
            </div>

            {/* AI Match Explanation Toggle */}
            {aiMatchingEnabled && candidateProfile && (
              <Collapsible open={explanationOpen} onOpenChange={setExplanationOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between mb-4"
                    onClick={handleExplanationToggle}
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      <span>AI Match Analysis</span>
                    </div>
                    {explanationOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4">
                  {loadingMatch ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <LoadingSpinner className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Analyzing match...</p>
                      </div>
                    </div>
                  ) : matchError ? (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <p className="text-red-700 text-sm">{matchError}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setMatchError(null)
                          loadMatchExplanation()
                        }}
                        className="mt-2"
                      >
                        Retry Analysis
                      </Button>
                    </div>
                  ) : matchExplanation ? (
                    <div className="space-y-4 p-4 border border-gray-200 bg-gray-50 rounded-lg">
                      {/* Overall Match Score */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Overall Match</span>
                          <span className="text-lg font-bold text-[#00C49A]">
                            {matchExplanation.overallMatchPercentage}%
                          </span>
                        </div>
                        <Progress 
                          value={matchExplanation.overallMatchPercentage} 
                          className="h-2"
                        />
                      </div>

                      {/* Experience Assessment */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Experience Level</h4>
                        <div className={`flex items-center gap-2 p-3 rounded-lg border ${getExperienceMatchColor(matchExplanation.experienceAssessment.match)}`}>
                          {getExperienceMatchIcon(matchExplanation.experienceAssessment.match)}
                          <div className="flex-1">
                            <p className="font-medium">
                              Required: {matchExplanation.experienceAssessment.requiredLevel}
                            </p>
                            <p className="text-sm">
                              Your Level: {matchExplanation.experienceAssessment.candidateLevel}
                            </p>
                            <p className="text-sm mt-1">
                              {matchExplanation.experienceAssessment.reasoning}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Skill Matches */}
                      {matchExplanation.skillMatches.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Skill Analysis</h4>
                          <div className="space-y-2">
                            {matchExplanation.skillMatches.slice(0, 5).map((skillMatch, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center gap-2">
                                  {skillMatch.matched ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                  <span className="font-medium text-sm">{skillMatch.skill}</span>
                                </div>
                                <div className="text-right">
                                  <Badge variant={skillMatch.matched ? "default" : "secondary"} className="text-xs">
                                    {skillMatch.relevance}% relevance
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Personality Fit */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Personality Fit</h4>
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Compatibility Score</span>
                            <span className="font-bold text-[#00C49A]">
                              {matchExplanation.personalityFit.score}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {matchExplanation.personalityFit.reasoning}
                          </p>
                        </div>
                      </div>

                      {/* Strengths and Concerns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                          <ul className="text-sm space-y-1">
                            {matchExplanation.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {matchExplanation.concerns.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-orange-700 mb-2">Areas to Address</h4>
                            <ul className="text-sm space-y-1">
                              {matchExplanation.concerns.map((concern, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                                  <span>{concern}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Recommendation */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-1">Recommendation</h4>
                        <p className="text-sm text-blue-800">
                          {matchExplanation.recommendation}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          <div className="ml-6 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave(job.id)}
              disabled={savingJob === job.id}
            >
              {savingJob === job.id ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                'Save'
              )}
            </Button>
            <Button 
              className="bg-[#FF7A00] hover:bg-[#E66A00] text-white" 
              size="sm"
              onClick={() => onApply?.(job.id)}
            >
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}