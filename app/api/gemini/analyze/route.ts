import { NextRequest, NextResponse } from 'next/server'
import { logError, ErrorType } from '@/lib/error-handling'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export async function POST(req: NextRequest) {
  try {
    const { candidateProfile, jobRequirements } = await req.json()

    if (!GEMINI_API_KEY) {
      const structuredError = logError('gemini-api-config', new Error('Gemini API key not configured'))
      return NextResponse.json({ 
        error: 'Service configuration error',
        errorId: structuredError.id 
      }, { status: 500 })
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
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`
      const structuredError = logError('gemini-api-request', new Error(errorMessage), {
        status: response.status,
        statusText: response.statusText,
        apiUrl: GEMINI_API_URL
      })
      
      const statusCode = response.status === 429 ? 429 : 
                        response.status >= 500 ? 503 : 400
      const message = response.status === 429 ? 'AI service rate limit exceeded. Please try again later.' :
                     response.status >= 500 ? 'AI service temporarily unavailable' :
                     'Invalid request to AI service'
      
      return NextResponse.json({ 
        error: message,
        errorId: structuredError.id 
      }, { status: statusCode })
    }

    const data = await response.json()
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Анализ недоступен'

    return NextResponse.json({ 
      success: true, 
      analysis,
      candidateId: candidateProfile.id 
    })

  } catch (error) {
    const structuredError = logError('gemini-analysis-error', error, {
      hasApiKey: !!GEMINI_API_KEY,
      candidateId: (req as any).candidateProfile?.id
    })
    
    // Determine appropriate error response
    const isNetworkError = error instanceof Error && 
      (error.message.includes('fetch') || error.message.includes('network'))
    
    const statusCode = isNetworkError ? 503 : 500
    const message = isNetworkError ? 
      'Network error communicating with AI service' : 
      'Failed to analyze candidate'
    
    return NextResponse.json({ 
      error: message,
      errorId: structuredError.id
    }, { status: statusCode })
  }
}