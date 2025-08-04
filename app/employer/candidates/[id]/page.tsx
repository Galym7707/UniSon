//app/employer/candidates/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Target,
  Users,
  Brain,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'

type CandidateProfile = {
  id: string
  first_name: string
  last_name: string
  title: string
  summary: string
  experience: string
  skills: string
  resume_url: string | null
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

type GeminiAnalysis = {
  analysis: string
  matchScore: number
}

export default function CandidateProfile({ params }: { params: { id: string } }) {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null)
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) {
          console.error('Error loading candidate:', error)
          return
        }

        setCandidate(data)
        
        // Try to get existing analysis or create new one
        await analyzeCandidate(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCandidate()
  }, [params.id, supabase])

  const analyzeCandidate = async (candidateData: CandidateProfile) => {
    setAnalyzing(true)
    try {
      // Mock job requirements for now - in real app this would come from job posting
      const jobRequirements = `
        Требования к позиции Senior Frontend Developer:
        - Опыт работы с React, TypeScript
        - Знание современных инструментов разработки
        - Умение работать в команде
        - Инициативность и самостоятельность
        - Адаптивность к изменениям
      `

      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile: candidateData,
          jobRequirements
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeminiAnalysis({
          analysis: data.analysis,
          matchScore: candidateData.test_results?.overall_score || 75
        })
      }
    } catch (error) {
      console.error('Error analyzing candidate:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
          <p className="text-[#333333]">Загрузка профиля кандидата...</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#333333] mb-4">Кандидат не найден</p>
          <Link href="/employer/dashboard">
            <Button className="bg-[#00C49A] hover:bg-[#00A085]">Вернуться к дашборду</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/employer/jobs/1/candidates">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />К списку кандидатов
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#0A2540]">Профиль кандидата</h1>
            <p className="text-[#333333] mt-1">Детальный анализ и резюме</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={candidate.resume_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#0A2540] mb-2">
                      {candidate.first_name} {candidate.last_name}
                    </h2>
                    <p className="text-lg text-[#333333] mb-3">{candidate.title}</p>
                    <div className="flex items-center space-x-6 text-sm text-[#333333]">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {candidate.experience || 'Опыт не указан'}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="bg-[#00C49A] hover:bg-[#00A085]">
                      <Calendar className="w-4 h-4 mr-2" />
                      Запланировать интервью
                    </Button>
                    <Button variant="outline" className="border-[#FF7A00] text-[#FF7A00] bg-transparent">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Написать
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">О кандидате</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#333333] leading-relaxed">{candidate.summary}</p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540] flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Опыт работы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#FF7A00] rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#333333] leading-relaxed">
                        {candidate.experience || 'Опыт работы не указан'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Навыки и технологии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills ? candidate.skills.split(',').map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill.trim()}
                    </Badge>
                  )) : (
                    <p className="text-gray-500">Навыки не указаны</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="space-y-6">
            {/* Match Score */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-[#0A2540]">Match Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#FF7A00"
                      strokeWidth="2"
                      strokeDasharray={`${geminiAnalysis?.matchScore || candidate.test_results?.overall_score || 75}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-[#FF7A00]">
                      {geminiAnalysis?.matchScore || candidate.test_results?.overall_score || 75}
                    </span>
                  </div>
                </div>
                <p className="text-[#333333]">
                  {analyzing ? 'Анализируем...' : 'Соответствие позиции'}
                </p>
              </CardContent>
            </Card>

            {/* AI Analysis Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">ИИ-анализ личности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.test_results ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-[#FF7A00]" />
                          <span className="text-sm">Аналитическое мышление</span>
                        </div>
                        <span className="text-sm font-medium">{candidate.test_results.scores.analytical_thinking}%</span>
                      </div>
                      <Progress value={candidate.test_results.scores.analytical_thinking} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-[#00C49A]" />
                          <span className="text-sm">Инициативность</span>
                        </div>
                        <span className="text-sm font-medium">{candidate.test_results.scores.initiative}%</span>
                      </div>
                      <Progress value={candidate.test_results.scores.initiative} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-[#0A2540]" />
                          <span className="text-sm">Командная работа</span>
                        </div>
                        <span className="text-sm font-medium">{candidate.test_results.scores.teamwork}%</span>
                      </div>
                      <Progress value={candidate.test_results.scores.teamwork} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-[#FF7A00]" />
                          <span className="text-sm">Адаптивность</span>
                        </div>
                        <span className="text-sm font-medium">{candidate.test_results.scores.adaptability}%</span>
                      </div>
                      <Progress value={candidate.test_results.scores.adaptability} className="h-2" />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center">Результаты теста недоступны</p>
                )}

                <Separator />

                {analyzing ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C49A] mx-auto mb-2"></div>
                    <p className="text-sm text-[#333333]">Анализируем кандидата...</p>
                  </div>
                ) : geminiAnalysis ? (
                  <div className="bg-gradient-to-r from-[#00C49A]/10 to-[#FF7A00]/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#0A2540] mb-2">Анализ Gemini</h4>
                    <div className="text-sm text-[#333333] leading-relaxed whitespace-pre-line">
                      {geminiAnalysis.analysis}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Анализ недоступен</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#00C49A] hover:bg-[#00A085]">Сделать предложение</Button>
                <Button className="w-full bg-[#FF7A00] hover:bg-[#E66A00]">
                  <Calendar className="w-4 h-4 mr-2" />
                  Запланировать интервью
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Скачать резюме
                </Button>
                <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-50 bg-transparent">
                  Отклонить кандидата
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
