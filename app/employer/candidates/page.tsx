'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Eye,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Brain,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'

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
    const loadCandidates = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
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

    loadCandidates()
  }, [supabase])

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filterBy === 'test_completed') {
      return candidate.test_results !== null
    }
    if (filterBy === 'test_not_completed') {
      return candidate.test_results === null
    }

    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
          <p className="text-[#333333]">Загрузка кандидатов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2540]">Кандидаты</h1>
            <p className="text-[#333333] mt-1">Найдено {filteredCandidates.length} кандидатов</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по имени, позиции или навыкам..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все кандидаты</SelectItem>
                  <SelectItem value="test_completed">Прошли тест</SelectItem>
                  <SelectItem value="test_not_completed">Не проходили тест</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0A2540]">
                      {candidate.first_name} {candidate.last_name}
                    </h3>
                    <p className="text-sm text-[#333333]">{candidate.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <Briefcase className="w-3 h-3" />
                      <span>{candidate.experience || 'Опыт не указан'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#333333] mb-4 line-clamp-2">
                  {candidate.summary || 'Описание не указано'}
                </p>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills ? 
                      candidate.skills.split(',').slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))
                    : (
                      <span className="text-xs text-gray-500">Навыки не указаны</span>
                    )}
                  </div>
                </div>

                {/* Test Results */}
                {candidate.test_results ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Результаты теста</span>
                      <span className="text-sm font-bold text-[#00C49A]">
                        {candidate.test_results.overall_score}%
                      </span>
                    </div>
                    <Progress value={candidate.test_results.overall_score} className="h-2" />
                    
                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      <div className="flex items-center space-x-1">
                        <Brain className="w-3 h-3 text-[#FF7A00]" />
                        <span>{candidate.test_results.scores.analytical_thinking}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-[#0A2540]" />
                        <span>{candidate.test_results.scores.teamwork}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-[#FF7A00]" />
                        <span>{candidate.test_results.scores.adaptability}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 text-center">
                      Тест не пройден
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link href={`/employer/candidates/${candidate.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-[#00C49A] hover:bg-[#00A085]">
                      <Eye className="w-4 h-4 mr-1" />
                      Просмотр
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Кандидаты не найдены</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterBy('all')
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 