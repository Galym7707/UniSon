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
  const benefits = ["ДМС", "Гибкий график", "Удаленная работа"]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/employer/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />К списку вакансий
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#0A2540]">Создание вакансии</h1>
            <p className="text-[#333333] mt-1">Заполните информацию о новой позиции</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Основная информация</CardTitle>
                <CardDescription>Базовые данные о вакансии</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Название должности *</Label>
                  <Input id="title" placeholder="Senior Frontend Developer" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Отдел</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Разработка</SelectItem>
                        <SelectItem value="design">Дизайн</SelectItem>
                        <SelectItem value="mobile">Мобильная разработка</SelectItem>
                        <SelectItem value="qa">Тестирование</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Уровень</Label>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Местоположение</Label>
                    <Input id="location" placeholder="Москва" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment">Тип занятости</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">Полная занятость</SelectItem>
                        <SelectItem value="parttime">Частичная занятость</SelectItem>
                        <SelectItem value="contract">Контракт</SelectItem>
                        <SelectItem value="internship">Стажировка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remote" />
                  <Label htmlFor="remote">Возможна удаленная работа</Label>
                </div>
              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Заработная плата</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryFrom">От</Label>
                    <Input id="salaryFrom" placeholder="200000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryTo">До</Label>
                    <Input id="salaryTo" placeholder="300000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Валюта</Label>
                    <Select defaultValue="rub">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rub">₽ Рубли</SelectItem>
                        <SelectItem value="usd">$ Доллары</SelectItem>
                        <SelectItem value="eur">€ Евро</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hideSalary" />
                  <Label htmlFor="hideSalary">Не показывать зарплату в объявлении</Label>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Описание вакансии</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Описание позиции *</Label>
                  <Textarea
                    id="description"
                    placeholder="Опишите основные обязанности, задачи и цели позиции..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Требования *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Укажите необходимые навыки, опыт работы и образование..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Обязанности</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Детально опишите рабочие обязанности..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Навыки и технологии</CardTitle>
                <CardDescription>Добавьте ключевые навыки для этой позиции</CardDescription>
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
                  <Input placeholder="Добавить навык..." />
                  <Button className="bg-[#00C49A] hover:bg-[#00A085]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Льготы и преимущества</CardTitle>
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
                  <Input placeholder="Добавить льготу..." />
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
                <CardTitle className="text-[#0A2540]">Действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#FF7A00] hover:bg-[#E66A00]">
                  <Save className="w-4 h-4 mr-2" />
                  Опубликовать
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить черновик
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  Предварительный просмотр
                </Button>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Настройки публикации</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Срок подачи заявок</Label>
                  <Input id="deadline" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positions">Количество позиций</Label>
                  <Input id="positions" type="number" defaultValue="1" min="1" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoClose" />
                  <Label htmlFor="autoClose" className="text-sm">
                    Автоматически закрыть после найма
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* AI Matching */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">ИИ-подбор кандидатов</CardTitle>
                <CardDescription>Настройте параметры автоматического поиска</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="aiMatching" defaultChecked />
                  <Label htmlFor="aiMatching" className="text-sm">
                    Включить ИИ-анализ кандидатов
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoNotify" defaultChecked />
                  <Label htmlFor="autoNotify" className="text-sm">
                    Уведомлять о новых подходящих кандидатах
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minMatch">Минимальный Match Score</Label>
                  <Input id="minMatch" type="number" defaultValue="70" min="0" max="100" />
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Советы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-[#333333]">
                  <p>• Четко опишите обязанности и требования</p>
                  <p>• Укажите реальный уровень зарплаты</p>
                  <p>• Добавьте ключевые технологии и навыки</p>
                  <p>• Расскажите о преимуществах работы в компании</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
