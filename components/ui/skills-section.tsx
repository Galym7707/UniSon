'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus, Code, Languages } from 'lucide-react'

export interface ProgrammingSkill {
  id: string
  language: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface RegularLanguage {
  id: string
  language: string
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
}

interface SkillsSectionProps {
  programmingSkills?: ProgrammingSkill[]
  regularLanguages?: RegularLanguage[]
  onChange: (skills: { programmingSkills: ProgrammingSkill[], regularLanguages: RegularLanguage[] }) => void
}

const PROGRAMMING_PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
] as const

const LANGUAGE_PROFICIENCY_LEVELS = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' }
] as const

const POPULAR_PROGRAMMING_LANGUAGES = [
  'JavaScript', 'Python', 'Java', 'C#', 'C++', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS', 'React', 'Angular',
  'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring', '.NET', 'Laravel', 'Rails'
]

const POPULAR_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese (Mandarin)',
  'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Swedish', 'Norwegian', 'Danish',
  'Polish', 'Czech', 'Hungarian', 'Finnish', 'Greek', 'Turkish', 'Hebrew', 'Thai'
]

export default function SkillsSection({ 
  programmingSkills = [], 
  regularLanguages = [], 
  onChange 
}: SkillsSectionProps) {
  const [localProgrammingSkills, setLocalProgrammingSkills] = useState<ProgrammingSkill[]>(programmingSkills)
  const [localRegularLanguages, setLocalRegularLanguages] = useState<RegularLanguage[]>(regularLanguages)
  
  // Input states for adding new skills
  const [newProgrammingLanguage, setNewProgrammingLanguage] = useState('')
  const [newProgrammingProficiency, setNewProgrammingProficiency] = useState<ProgrammingSkill['proficiency']>('beginner')
  const [newRegularLanguage, setNewRegularLanguage] = useState('')
  const [newLanguageProficiency, setNewLanguageProficiency] = useState<RegularLanguage['proficiency']>('basic')

  // Update parent component when local state changes
  useEffect(() => {
    onChange({
      programmingSkills: localProgrammingSkills,
      regularLanguages: localRegularLanguages
    })
  }, [localProgrammingSkills, localRegularLanguages, onChange])

  // Programming Skills Functions
  const addProgrammingSkill = () => {
    if (!newProgrammingLanguage.trim()) return
    
    const newSkill: ProgrammingSkill = {
      id: Date.now().toString(),
      language: newProgrammingLanguage.trim(),
      proficiency: newProgrammingProficiency
    }
    
    setLocalProgrammingSkills(prev => [...prev, newSkill])
    setNewProgrammingLanguage('')
    setNewProgrammingProficiency('beginner')
  }

  const removeProgrammingSkill = (id: string) => {
    setLocalProgrammingSkills(prev => prev.filter(skill => skill.id !== id))
  }

  const updateProgrammingSkill = (id: string, field: keyof ProgrammingSkill, value: string) => {
    setLocalProgrammingSkills(prev => 
      prev.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    )
  }

  // Regular Languages Functions
  const addRegularLanguage = () => {
    if (!newRegularLanguage.trim()) return
    
    const newLanguage: RegularLanguage = {
      id: Date.now().toString(),
      language: newRegularLanguage.trim(),
      proficiency: newLanguageProficiency
    }
    
    setLocalRegularLanguages(prev => [...prev, newLanguage])
    setNewRegularLanguage('')
    setNewLanguageProficiency('basic')
  }

  const removeRegularLanguage = (id: string) => {
    setLocalRegularLanguages(prev => prev.filter(lang => lang.id !== id))
  }

  const updateRegularLanguage = (id: string, field: keyof RegularLanguage, value: string) => {
    setLocalRegularLanguages(prev => 
      prev.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    )
  }

  const handleProgrammingKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addProgrammingSkill()
    }
  }

  const handleLanguageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRegularLanguage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Programming Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Programming Languages & Technologies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Programming Skills */}
          <div className="space-y-3">
            {localProgrammingSkills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Input
                    value={skill.language}
                    onChange={(e) => updateProgrammingSkill(skill.id, 'language', e.target.value)}
                    placeholder="Programming language or technology"
                    list="programming-languages"
                  />
                </div>
                <div className="w-40">
                  <Select
                    value={skill.proficiency}
                    onValueChange={(value) => updateProgrammingSkill(skill.id, 'proficiency', value as ProgrammingSkill['proficiency'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMMING_PROFICIENCY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeProgrammingSkill(skill.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Programming Skill */}
          <div className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex-1">
              <Input
                value={newProgrammingLanguage}
                onChange={(e) => setNewProgrammingLanguage(e.target.value)}
                onKeyPress={handleProgrammingKeyPress}
                placeholder="Add programming language or technology"
                list="programming-languages"
              />
              <datalist id="programming-languages">
                {POPULAR_PROGRAMMING_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} />
                ))}
              </datalist>
            </div>
            <div className="w-40">
              <Select
                value={newProgrammingProficiency}
                onValueChange={(value) => setNewProgrammingProficiency(value as ProgrammingSkill['proficiency'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMING_PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addProgrammingSkill}
              disabled={!newProgrammingLanguage.trim()}
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regular Languages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Languages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Languages */}
          <div className="space-y-3">
            {localRegularLanguages.map((language) => (
              <div key={language.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Input
                    value={language.language}
                    onChange={(e) => updateRegularLanguage(language.id, 'language', e.target.value)}
                    placeholder="Language"
                    list="regular-languages"
                  />
                </div>
                <div className="w-40">
                  <Select
                    value={language.proficiency}
                    onValueChange={(value) => updateRegularLanguage(language.id, 'proficiency', value as RegularLanguage['proficiency'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_PROFICIENCY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeRegularLanguage(language.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Language */}
          <div className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex-1">
              <Input
                value={newRegularLanguage}
                onChange={(e) => setNewRegularLanguage(e.target.value)}
                onKeyPress={handleLanguageKeyPress}
                placeholder="Add language"
                list="regular-languages"
              />
              <datalist id="regular-languages">
                {POPULAR_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} />
                ))}
              </datalist>
            </div>
            <div className="w-40">
              <Select
                value={newLanguageProficiency}
                onValueChange={(value) => setNewLanguageProficiency(value as RegularLanguage['proficiency'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addRegularLanguage}
              disabled={!newRegularLanguage.trim()}
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}