import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LayoutDashboard, User, Search, Settings, Heart, MapPin, Clock, Building2, Filter } from "lucide-react"
import Link from "next/link"

export default function JobSearch() {
  const jobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp",
      location: "Москва",
      salary: "200-300k",
      type: "Полная занятость",
      remote: true,
      posted: "2 дня назад",
      matchScore: 95,
      skills: ["React", "TypeScript", "GraphQL"],
      description: "Ищем опытного React-разработчика для работы над инновационными проектами...",
    },
    {
      id: 2,
      title: "Frontend Team Lead",
      company: "StartupXYZ",
      location: "СПб",
      salary: "250-350k",
      type: "Полная занятость",
      remote: false,
      posted: "1 день назад",
      matchScore: 88,
      skills: ["React", "Vue.js", "Leadership"],
      description: "Возглавьте команду талантливых фронтенд-разработчиков...",
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "InnovateLab",
      location: "Удаленно",
      salary: "180-250k",
      type: "Полная занятость",
      remote: true,
      posted: "3 дня назад",
      matchScore: 82,
      skills: ["React", "Node.js", "MongoDB"],
      description: "Разрабатывайте полнофункциональные веб-приложения...",
    },
    {
      id: 4,
      title: "React Native Developer",
      company: "MobileFirst",
      location: "Казань",
      salary: "150-220k",
      type: "Полная занятость",
      remote: true,
      posted: "1 неделю назад",
      matchScore: 79,
      skills: ["React Native", "JavaScript", "iOS"],
      description: "Создавайте мобильные приложения для iOS и Android...",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <Link href="/" className="text-xl font-bold text-[#0A2540]">
              Unison AI
            </Link>
          </div>
          <nav className="px-4 space-y-2">
            <Link
              href="/job-seeker/dashboard"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Дашборд
            </Link>
            <Link
              href="/job-seeker/profile"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5 mr-3" />
              Мой профиль
            </Link>
            <Link
              href="/job-seeker/search"
              className="flex items-center px-4 py-3 text-[#00C49A] bg-[#00C49A]/10 rounded-lg"
            >
              <Search className="w-5 h-5 mr-3" />
              Поиск вакансий
            </Link>
            <Link
              href="/job-seeker/saved"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Heart className="w-5 h-5 mr-3" />
              Избранное
            </Link>
            <Link
              href="/job-seeker/settings"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 mr-3" />
              Настройки
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#0A2540] mb-8">Поиск вакансий</h1>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540] flex items-center">
                      <Filter className="w-5 h-5 mr-2" />
                      Фильтры
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search Input */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Поиск по ключевым словам</Label>
                      <Input id="search" placeholder="React, JavaScript..." />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Местоположение</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите город" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moscow">Москва</SelectItem>
                          <SelectItem value="spb">Санкт-Петербург</SelectItem>
                          <SelectItem value="kazan">Казань</SelectItem>
                          <SelectItem value="remote">Удаленно</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Salary Range */}
                    <div className="space-y-2">
                      <Label>Зарплата (₽)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="От" />
                        <Input placeholder="До" />
                      </div>
                    </div>

                    {/* Employment Type */}
                    <div className="space-y-2">
                      <Label>Тип занятости</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="fulltime" />
                          <Label htmlFor="fulltime" className="text-sm">
                            Полная занятость
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="parttime" />
                          <Label htmlFor="parttime" className="text-sm">
                            Частичная занятость
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="contract" />
                          <Label htmlFor="contract" className="text-sm">
                            Контракт
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Remote Work */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remote" />
                        <Label htmlFor="remote" className="text-sm">
                          Удаленная работа
                        </Label>
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                      <Label>Уровень опыта</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите уровень" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="middle">Middle</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full bg-[#00C49A] hover:bg-[#00A085]">Применить фильтры</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Job Results */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[#333333]">Найдено {jobs.length} вакансий</p>
                  <Select defaultValue="match">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match">По соответствию</SelectItem>
                      <SelectItem value="date">По дате</SelectItem>
                      <SelectItem value="salary">По зарплате</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-semibold text-[#0A2540] mb-1">{job.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-[#333333]">
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
                                    {job.posted}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                                <Heart className="w-5 h-5" />
                              </Button>
                            </div>

                            <p className="text-[#333333] mb-4 line-clamp-2">{job.description}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.remote && <Badge className="bg-[#00C49A] text-white text-xs">Удаленно</Badge>}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-[#0A2540]">{job.salary} ₽</p>
                                <p className="text-sm text-[#333333]">{job.type}</p>
                              </div>
                            </div>
                          </div>

                          <div className="ml-6 text-center">
                            <div className="relative w-16 h-16 mb-2">
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#00C49A"
                                  strokeWidth="2"
                                  strokeDasharray={`${job.matchScore}, 100`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-[#00C49A]">{job.matchScore}</span>
                              </div>
                            </div>
                            <p className="text-xs text-[#333333] mb-3">Match</p>
                            <Button className="bg-[#FF7A00] hover:bg-[#E66A00] text-white">Откликнуться</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-8">
                  <Button variant="outline" className="bg-transparent">
                    Загрузить еще
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
