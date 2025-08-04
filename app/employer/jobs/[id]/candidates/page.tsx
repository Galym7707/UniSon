//app/employer/jobs/[id]/candidates/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, Briefcase, Building2, Calendar, MessageSquare, X, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function JobCandidates() {
  const candidates = [
    {
      id: 1,
      name: "Алексей Петров",
      avatar: "/placeholder.svg?height=40&width=40",
      matchScore: 92,
      experience: "5 лет",
      location: "Москва",
      aiSummary:
        "Опытный React-разработчик с сильными навыками TypeScript. Показывает высокую инициативность и аналитическое мышление. Идеально подходит для лидерских ролей.",
      skills: ["React", "TypeScript", "Node.js"],
      status: "new",
    },
    {
      id: 2,
      name: "Мария Сидорова",
      avatar: "/placeholder.svg?height=40&width=40",
      matchScore: 88,
      experience: "4 года",
      location: "СПб",
      aiSummary:
        "Талантливый фронтенд-разработчик с отличными навыками UI/UX. Креативный подход к решению задач и высокая адаптивность к новым технологиям.",
      skills: ["React", "Vue.js", "CSS"],
      status: "reviewed",
    },
    {
      id: 3,
      name: "Дмитрий Козлов",
      avatar: "/placeholder.svg?height=40&width=40",
      matchScore: 85,
      experience: "6 лет",
      location: "Москва",
      aiSummary:
        "Опытный full-stack разработчик с глубокими знаниями архитектуры. Предпочитает командную работу, отличные коммуникативные навыки.",
      skills: ["React", "Python", "Docker"],
      status: "interview",
    },
    {
      id: 4,
      name: "Анна Волкова",
      avatar: "/placeholder.svg?height=40&width=40",
      matchScore: 79,
      experience: "3 года",
      location: "Казань",
      aiSummary:
        "Молодой перспективный разработчик с быстрым обучением. Показывает высокую мотивацию к профессиональному росту и изучению новых технологий.",
      skills: ["React", "JavaScript", "Git"],
      status: "new",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500"
      case "reviewed":
        return "bg-yellow-500"
      case "interview":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "Новый"
      case "reviewed":
        return "Просмотрен"
      case "interview":
        return "Интервью"
      default:
        return "Неизвестно"
    }
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
            <p className="text-sm text-[#333333] mt-1">TechCorp Inc.</p>
          </div>
          <nav className="px-4 space-y-2">
            <Link
              href="/employer/dashboard"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Дашборд
            </Link>
            <Link
              href="/employer/jobs"
              className="flex items-center px-4 py-3 text-[#FF7A00] bg-[#FF7A00]/10 rounded-lg"
            >
              <Briefcase className="w-5 h-5 mr-3" />
              Вакансии
            </Link>
            <Link
              href="/employer/company"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Building2 className="w-5 h-5 mr-3" />
              Профиль компании
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
              <Link href="/employer/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[#0A2540]">Senior Frontend Developer</h1>
                <p className="text-[#333333] mt-1">Кандидаты отсортированы по Match Score</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Кандидаты ({candidates.length})</CardTitle>
                <CardDescription>ИИ-анализ помогает найти лучших кандидатов для вашей позиции</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        {/* Avatar and Basic Info */}
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {candidate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-[#0A2540]">{candidate.name}</h3>
                            <p className="text-sm text-[#333333]">
                              {candidate.experience} опыта • {candidate.location}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(candidate.status)}`}></div>
                              <span className="text-xs text-[#333333]">{getStatusText(candidate.status)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Match Score */}
                        <div className="text-center">
                          <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                                strokeDasharray={`${candidate.matchScore}, 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-[#FF7A00]">{candidate.matchScore}</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#333333] mt-1">Match Score</p>
                        </div>

                        {/* AI Summary and Skills */}
                        <div className="flex-1">
                          <div className="bg-gradient-to-r from-[#00C49A]/10 to-[#FF7A00]/10 p-4 rounded-lg mb-4">
                            <h4 className="font-semibold text-[#0A2540] mb-2">ИИ-анализ:</h4>
                            <p className="text-sm text-[#333333] leading-relaxed">{candidate.aiSummary}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          <Link href={`/employer/candidates/${candidate.id}`}>
                            <Button size="sm" className="bg-[#00C49A] hover:bg-[#00A085] text-white w-full">
                              Полный профиль
                            </Button>
                          </Link>
                          <Button size="sm" className="bg-[#FF7A00] hover:bg-[#E66A00] text-white">
                            <Calendar className="w-4 h-4 mr-1" />
                            Интервью
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#0A2540] text-[#0A2540] bg-transparent"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Сообщение
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50 bg-transparent"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
