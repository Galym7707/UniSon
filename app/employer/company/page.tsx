import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, Briefcase, Building2, Upload, MapPin, Plus, X } from "lucide-react"
import Link from "next/link"

export default function CompanyProfile() {
  const benefits = ["ДМС", "Гибкий график", "Удаленная работа", "Обучение", "Спортзал"]
  const technologies = ["React", "Node.js", "Python", "Docker", "AWS", "PostgreSQL"]

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
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Briefcase className="w-5 h-5 mr-3" />
              Вакансии
            </Link>
            <Link
              href="/employer/company"
              className="flex items-center px-4 py-3 text-[#FF7A00] bg-[#FF7A00]/10 rounded-lg"
            >
              <Building2 className="w-5 h-5 mr-3" />
              Профиль компании
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-[#0A2540]">Профиль компании</h1>
              <Button className="bg-[#FF7A00] hover:bg-[#E66A00]">Сохранить изменения</Button>
            </div>

            <div className="space-y-6">
              {/* Company Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" />
                        <AvatarFallback className="text-2xl">TC</AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Название компании</Label>
                          <Input id="companyName" defaultValue="TechCorp Inc." className="text-lg font-semibold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="industry">Отрасль</Label>
                            <Input id="industry" defaultValue="Информационные технологии" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="size">Размер компании</Label>
                            <Input id="size" defaultValue="50-100 сотрудников" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Основная информация</CardTitle>
                  <CardDescription>Расскажите о вашей компании кандидатам</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание компании</Label>
                    <Textarea
                      id="description"
                      placeholder="Расскажите о миссии, ценностях и деятельности компании..."
                      className="min-h-[120px]"
                      defaultValue="TechCorp - инновационная IT-компания, специализирующаяся на разработке современных веб-приложений и мобильных решений. Мы создаем продукты, которые меняют жизнь людей к лучшему."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="founded">Год основания</Label>
                      <Input id="founded" defaultValue="2018" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employees">Количество сотрудников</Label>
                      <Input id="employees" defaultValue="75" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Веб-сайт</Label>
                    <Input id="website" defaultValue="https://techcorp.com" />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540] flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Местоположение
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Страна</Label>
                      <Input id="country" defaultValue="Россия" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Город</Label>
                      <Input id="city" defaultValue="Москва" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Адрес офиса</Label>
                    <Input id="address" defaultValue="ул. Тверская, 15, стр. 1" />
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Льготы и преимущества</CardTitle>
                  <CardDescription>Что вы предлагаете своим сотрудникам</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {benefits.map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="px-3 py-1">
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

              {/* Technologies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Технологии и инструменты</CardTitle>
                  <CardDescription>Технологический стек вашей компании</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="px-3 py-1">
                        {tech}
                        <X className="w-3 h-3 ml-2 cursor-pointer" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input placeholder="Добавить технологию..." />
                    <Button className="bg-[#00C49A] hover:bg-[#00A085]">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Company Culture */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Корпоративная культура</CardTitle>
                  <CardDescription>Расскажите о рабочей атмосфере и ценностях</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="culture">Описание культуры</Label>
                    <Textarea
                      id="culture"
                      placeholder="Опишите рабочую атмосферу, ценности команды, подход к работе..."
                      className="min-h-[100px]"
                      defaultValue="В TechCorp мы ценим открытость, инновации и взаимопомощь. Наша команда работает в дружественной атмосфере, где каждый может предложить свои идеи и расти профессионально."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hrEmail">Email HR-отдела</Label>
                      <Input id="hrEmail" type="email" defaultValue="hr@techcorp.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" defaultValue="+7 (495) 123-45-67" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hrName">Контактное лицо</Label>
                    <Input id="hrName" defaultValue="Анна Петрова, HR-менеджер" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
