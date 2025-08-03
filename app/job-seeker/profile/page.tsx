import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, User, Search, Settings, Upload, Plus, X, Heart } from "lucide-react"
import Link from "next/link"

export default function JobSeekerProfile() {
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
              className="flex items-center px-4 py-3 text-[#00C49A] bg-[#00C49A]/10 rounded-lg"
            >
              <User className="w-5 h-5 mr-3" />
              Мой профиль
            </Link>
            <Link
              href="/job-seeker/search"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-[#0A2540]">Мой профиль</h1>
              <Button className="bg-[#00C49A] hover:bg-[#00A085]">Сохранить изменения</Button>
            </div>

            {/* Resume Upload */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Загрузите ваше резюме</CardTitle>
                <CardDescription>Поддерживаются форматы PDF, DOC, DOCX</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#00C49A] transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-[#333333] mb-2">Перетащите файл сюда или нажмите для выбора</p>
                  <Button variant="outline" className="border-[#00C49A] text-[#00C49A] bg-transparent">
                    Выбрать файл
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Tabs */}
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">Личные данные</TabsTrigger>
                <TabsTrigger value="experience">Опыт работы</TabsTrigger>
                <TabsTrigger value="education">Образование</TabsTrigger>
                <TabsTrigger value="skills">Навыки</TabsTrigger>
                <TabsTrigger value="contacts">Контакты</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Личная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Имя</Label>
                        <Input id="firstName" placeholder="Иван" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input id="lastName" placeholder="Иванов" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Желаемая должность</Label>
                      <Input id="title" placeholder="Frontend Developer" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="summary">О себе</Label>
                      <Textarea
                        id="summary"
                        placeholder="Расскажите о себе, своих целях и мотивации..."
                        className="min-h-[120px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#0A2540]">Опыт работы</CardTitle>
                      <Button size="sm" className="bg-[#00C49A] hover:bg-[#00A085]">
                        <Plus className="w-4 h-4 mr-1" />
                        Добавить
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="position">Должность</Label>
                          <Input id="position" placeholder="Frontend Developer" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Компания</Label>
                          <Input id="company" placeholder="TechCorp" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Начало работы</Label>
                          <Input id="startDate" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">Окончание работы</Label>
                          <Input id="endDate" type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Описание обязанностей</Label>
                        <Textarea
                          id="description"
                          placeholder="Опишите ваши основные обязанности и достижения..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="education">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#0A2540]">Образование</CardTitle>
                      <Button size="sm" className="bg-[#00C49A] hover:bg-[#00A085]">
                        <Plus className="w-4 h-4 mr-1" />
                        Добавить
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="institution">Учебное заведение</Label>
                          <Input id="institution" placeholder="МГУ им. М.В. Ломоносова" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="degree">Степень</Label>
                          <Input id="degree" placeholder="Бакалавр" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="field">Специальность</Label>
                          <Input id="field" placeholder="Информатика и вычислительная техника" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Год окончания</Label>
                          <Input id="graduationYear" type="number" placeholder="2020" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Навыки и технологии</CardTitle>
                    <CardDescription>Добавьте ваши ключевые навыки</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="skillInput">Добавить навык</Label>
                      <div className="flex space-x-2">
                        <Input id="skillInput" placeholder="Например: React, JavaScript, Python..." />
                        <Button className="bg-[#00C49A] hover:bg-[#00A085]">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-[#0A2540]">Ваши навыки:</h4>
                      <div className="flex flex-wrap gap-2">
                        {["React", "JavaScript", "TypeScript", "Node.js", "Python", "Git", "Docker"].map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1">
                            {skill}
                            <X className="w-3 h-3 ml-2 cursor-pointer" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Контактная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input id="phone" placeholder="+7 (999) 123-45-67" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="ivan@example.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Город</Label>
                      <Input id="location" placeholder="Москва" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input id="linkedin" placeholder="https://linkedin.com/in/username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input id="github" placeholder="https://github.com/username" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
