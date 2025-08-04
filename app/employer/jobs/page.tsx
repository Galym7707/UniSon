//app/employer/jobs/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Plus,
  Search,
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Pause,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function EmployerJobs() {
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Разработка",
      posted: "2024-01-15",
      status: "active",
      candidates: 45,
      newCandidates: 12,
      views: 234,
      salary: "200-300k",
      location: "Москва",
    },
    {
      id: 2,
      title: "React Native Developer",
      department: "Мобильная разработка",
      posted: "2024-01-10",
      status: "active",
      candidates: 32,
      newCandidates: 8,
      views: 189,
      salary: "180-250k",
      location: "СПб",
    },
    {
      id: 3,
      title: "DevOps Engineer",
      department: "Инфраструктура",
      posted: "2024-01-12",
      status: "active",
      candidates: 28,
      newCandidates: 15,
      views: 156,
      salary: "220-320k",
      location: "Удаленно",
    },
    {
      id: 4,
      title: "UI/UX Designer",
      department: "Дизайн",
      posted: "2024-01-05",
      status: "paused",
      candidates: 67,
      newCandidates: 3,
      views: 445,
      salary: "150-200k",
      location: "Москва",
    },
    {
      id: 5,
      title: "Backend Developer",
      department: "Разработка",
      posted: "2024-01-08",
      status: "draft",
      candidates: 0,
      newCandidates: 0,
      views: 0,
      salary: "180-280k",
      location: "Казань",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "draft":
        return "bg-gray-500"
      case "closed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Активна"
      case "paused":
        return "На паузе"
      case "draft":
        return "Черновик"
      case "closed":
        return "Закрыта"
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
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-[#0A2540]">Управление вакансиями</h1>
              <Button className="bg-[#FF7A00] hover:bg-[#E66A00] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Создать вакансию
              </Button>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input placeholder="Поиск по названию вакансии..." className="h-10" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="active">Активные</SelectItem>
                      <SelectItem value="paused">На паузе</SelectItem>
                      <SelectItem value="draft">Черновики</SelectItem>
                      <SelectItem value="closed">Закрытые</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all-dept">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-dept">Все отделы</SelectItem>
                      <SelectItem value="dev">Разработка</SelectItem>
                      <SelectItem value="design">Дизайн</SelectItem>
                      <SelectItem value="mobile">Мобильная разработка</SelectItem>
                      <SelectItem value="infra">Инфраструктура</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-[#00C49A] hover:bg-[#00A085]">
                    <Search className="w-4 h-4 mr-2" />
                    Найти
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Ваши вакансии ({jobs.length})</CardTitle>
                <CardDescription>Управляйте всеми открытыми позициями</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#0A2540]">{job.title}</h3>
                            <Badge className={`${getStatusColor(job.status)} text-white`}>
                              {getStatusText(job.status)}
                            </Badge>
                            {job.newCandidates > 0 && (
                              <Badge className="bg-[#FF7A00] text-white">+{job.newCandidates} новых</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-[#333333] mb-3">
                            <span>{job.department}</span>
                            <span>{job.location}</span>
                            <span>{job.salary} ₽</span>
                            <span>Опубликовано: {new Date(job.posted).toLocaleDateString("ru-RU")}</span>
                          </div>
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1 text-[#00C49A]" />
                              <span className="font-medium">{job.candidates}</span>
                              <span className="text-[#333333] ml-1">кандидатов</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-[#FF7A00]" />
                              <span className="font-medium">{job.views}</span>
                              <span className="text-[#333333] ml-1">просмотров</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {job.status === "active" && (
                            <Link href={`/employer/jobs/${job.id}/candidates`}>
                              <Button className="bg-[#00C49A] hover:bg-[#00A085] text-white">
                                Кандидаты ({job.candidates})
                              </Button>
                            </Link>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pause className="w-4 h-4 mr-2" />
                                {job.status === "active" ? "Поставить на паузу" : "Активировать"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
