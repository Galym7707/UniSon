import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export async function POST(req: NextRequest) {
  try {
    const { candidateProfile, jobRequirements } = await req.json()

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const prompt = `
Анализируй кандидата для вакансии. 

КАНДИДАТ:
- Имя: ${candidateProfile.first_name} ${candidateProfile.last_name}
- Позиция: ${candidateProfile.title}
- Опыт: ${candidateProfile.experience}
- Навыки: ${candidateProfile.skills}
- О себе: ${candidateProfile.summary}
- Результаты теста: ${JSON.stringify(candidateProfile.test_results?.scores || {})}

ТРЕБОВАНИЯ К ВАКАНСИИ:
${jobRequirements}

Проведи анализ и дай ответ на русском языке в следующем формате:

СООТВЕТСТВИЕ: [0-100]%
СИЛЬНЫЕ СТОРОНЫ:
- [список сильных сторон]
СЛАБЫЕ СТОРОНЫ:
- [список слабых сторон]
РЕКОМЕНДАЦИИ:
- [рекомендации для работодателя]
ОБЩИЙ ВЕРДИКТ: [краткое заключение]
`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Анализ недоступен'

    return NextResponse.json({ 
      success: true, 
      analysis,
      candidateId: candidateProfile.id 
    })

  } catch (error) {
    console.error('Gemini analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze candidate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 