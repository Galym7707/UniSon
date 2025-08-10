import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError, logInfo, getUserFriendlyErrorMessage } from '@/lib/error-handling'

interface CompanyProfileUpdateRequest {
  company_name?: string
  industry?: string
  company_description?: string
  website?: string
  company_size?: string
  founded_year?: number
  headquarters?: string
  contact_email?: string
  contact_phone?: string
}

// Middleware to verify employer authentication and role
async function verifyEmployerAuth(supabase: any) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify user role is employer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error(`Profile lookup error: ${profileError.message}`)
    }

    if (!profile || profile.role !== 'employer') {
      throw new Error('Access denied: Employer role required')
    }

    return { user, profile }
  } catch (error) {
    throw error
  }
}

// Validate company profile update data
function validateCompanyProfileData(data: any): CompanyProfileUpdateRequest {
  const errors: string[] = []
  const validatedData: CompanyProfileUpdateRequest = {}

  // Company name validation
  if (data.company_name !== undefined) {
    if (typeof data.company_name !== 'string') {
      errors.push('Company name must be a string')
    } else if (data.company_name.trim().length === 0) {
      errors.push('Company name cannot be empty')
    } else if (data.company_name.length > 100) {
      errors.push('Company name must be 100 characters or less')
    } else {
      validatedData.company_name = data.company_name.trim()
    }
  }

  // Industry validation
  if (data.industry !== undefined) {
    if (typeof data.industry !== 'string') {
      errors.push('Industry must be a string')
    } else if (data.industry.trim().length === 0) {
      errors.push('Industry cannot be empty')
    } else if (data.industry.length > 100) {
      errors.push('Industry must be 100 characters or less')
    } else {
      validatedData.industry = data.industry.trim()
    }
  }

  // Company description validation
  if (data.company_description !== undefined) {
    if (typeof data.company_description !== 'string') {
      errors.push('Company description must be a string')
    } else if (data.company_description.length > 2000) {
      errors.push('Company description must be 2000 characters or less')
    } else {
      validatedData.company_description = data.company_description.trim()
    }
  }

  // Website validation
  if (data.website !== undefined) {
    if (typeof data.website !== 'string') {
      errors.push('Website must be a string')
    } else if (data.website.trim().length > 0) {
      const websiteUrl = data.website.trim()
      // Basic URL validation
      try {
        new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
        validatedData.website = websiteUrl
      } catch {
        errors.push('Website must be a valid URL')
      }
    } else {
      validatedData.website = ''
    }
  }

  // Company size validation
  if (data.company_size !== undefined) {
    if (typeof data.company_size !== 'string') {
      errors.push('Company size must be a string')
    } else {
      const validSizes = [
        '1-10', '11-50', '51-200', '201-500', 
        '501-1000', '1001-5000', '5001-10000', '10000+'
      ]
      if (data.company_size.trim().length > 0 && !validSizes.includes(data.company_size)) {
        errors.push(`Company size must be one of: ${validSizes.join(', ')}`)
      } else {
        validatedData.company_size = data.company_size.trim()
      }
    }
  }

  // Founded year validation
  if (data.founded_year !== undefined) {
    const currentYear = new Date().getFullYear()
    const foundedYear = Number(data.founded_year)
    if (isNaN(foundedYear)) {
      errors.push('Founded year must be a number')
    } else if (foundedYear < 1800 || foundedYear > currentYear) {
      errors.push(`Founded year must be between 1800 and ${currentYear}`)
    } else {
      validatedData.founded_year = foundedYear
    }
  }

  // Headquarters validation
  if (data.headquarters !== undefined) {
    if (typeof data.headquarters !== 'string') {
      errors.push('Headquarters must be a string')
    } else if (data.headquarters.length > 200) {
      errors.push('Headquarters must be 200 characters or less')
    } else {
      validatedData.headquarters = data.headquarters.trim()
    }
  }

  // Contact email validation
  if (data.contact_email !== undefined) {
    if (typeof data.contact_email !== 'string') {
      errors.push('Contact email must be a string')
    } else if (data.contact_email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.contact_email.trim())) {
        errors.push('Contact email must be a valid email address')
      } else {
        validatedData.contact_email = data.contact_email.trim().toLowerCase()
      }
    } else {
      validatedData.contact_email = ''
    }
  }

  // Contact phone validation
  if (data.contact_phone !== undefined) {
    if (typeof data.contact_phone !== 'string') {
      errors.push('Contact phone must be a string')
    } else if (data.contact_phone.trim().length > 0) {
      // Basic phone validation - allow various formats
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,20}$/
      if (!phoneRegex.test(data.contact_phone.trim())) {
        errors.push('Contact phone must be a valid phone number')
      } else {
        validatedData.contact_phone = data.contact_phone.trim()
      }
    } else {
      validatedData.contact_phone = ''
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join('; ')}`)
  }

  // Check if any fields were provided
  if (Object.keys(validatedData).length === 0) {
    throw new Error('At least one field must be provided for update')
  }

  return validatedData
}

export async function PUT(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const requestStartTime = performance.now()

  try {
    logInfo('employer-company-profile-update-start', {
      requestId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    // Initialize Supabase client
    let supabase
    try {
      supabase = await createRouteHandlerClient()
    } catch (supabaseError) {
      logError('employer-company-profile-supabase-init', supabaseError, {
        requestId,
        context: 'Failed to initialize Supabase client'
      })
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    // Verify employer authentication
    let authResult
    try {
      authResult = await verifyEmployerAuth(supabase)
    } catch (authError) {
      logError('employer-company-profile-auth', authError, {
        requestId,
        context: 'Authentication/authorization failed'
      })
      
      const errorMessage = authError instanceof Error ? authError.message : 'Unknown auth error'
      if (errorMessage.includes('not authenticated')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      } else if (errorMessage.includes('Access denied')) {
        return NextResponse.json(
          { error: 'Access denied: Employer role required' },
          { status: 403 }
        )
      } else {
        return NextResponse.json(
          { error: 'Authentication verification failed' },
          { status: 401 }
        )
      }
    }

    // Parse and validate request body
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      logError('employer-company-profile-parse', parseError, {
        requestId,
        context: 'Failed to parse request body'
      })
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate company profile data
    let validatedData
    try {
      validatedData = validateCompanyProfileData(requestBody)
    } catch (validationError) {
      logError('employer-company-profile-validation', validationError, {
        requestId,
        context: 'Company profile data validation failed',
        requestBody
      })
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Validation failed' },
        { status: 400 }
      )
    }

    // Update company profile in database
    try {
      // Add updated_at timestamp
      const updateData = {
        ...validatedData,
        updated_at: new Date().toISOString()
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', authResult.user.id)
        .select(`
          id,
          email,
          role,
          first_name,
          last_name,
          name,
          company_name,
          industry,
          company_description,
          website,
          company_size,
          founded_year,
          headquarters,
          contact_email,
          contact_phone,
          created_at,
          updated_at
        `)
        .single()

      if (updateError) {
        logError('employer-company-profile-db-update', updateError, {
          requestId,
          context: 'Database update failed',
          updateData,
          employerId: authResult.user.id,
          supabaseError: {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          }
        })

        // Handle specific database errors
        if (updateError.code === '23505') { // Unique constraint
          return NextResponse.json(
            { error: 'Company profile data conflicts with existing record' },
            { status: 409 }
          )
        } else if (updateError.code?.startsWith('23')) { // Other constraint violations
          return NextResponse.json(
            { error: 'Data constraint violation' },
            { status: 400 }
          )
        }

        return NextResponse.json(
          { error: process.env.NODE_ENV === 'production' 
            ? 'Failed to update company profile' 
            : `Database error: ${updateError.message}` 
          },
          { status: 500 }
        )
      }

      if (!updatedProfile) {
        logError('employer-company-profile-no-result', new Error('No profile returned after update'), {
          requestId,
          context: 'Profile update succeeded but no data returned',
          employerId: authResult.user.id
        })
        return NextResponse.json(
          { error: 'Profile update failed - no data returned' },
          { status: 500 }
        )
      }

      const requestDurationMs = performance.now() - requestStartTime

      logInfo('employer-company-profile-update-success', {
        requestId,
        employerId: authResult.user.id,
        updatedFields: Object.keys(validatedData),
        companyName: validatedData.company_name,
        industry: validatedData.industry,
        requestDurationMs,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        {
          success: true,
          profile: updatedProfile,
          message: 'Company profile updated successfully'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logError('employer-company-profile-db-error', dbError, {
        requestId,
        context: 'Database operation failed',
        validatedData,
        employerId: authResult.user.id
      })
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      )
    }

  } catch (unexpectedError) {
    const requestDurationMs = performance.now() - requestStartTime
    logError('employer-company-profile-unexpected', unexpectedError, {
      requestId,
      context: 'Unexpected error in company profile update API',
      requestDurationMs,
      stack: unexpectedError instanceof Error ? unexpectedError.stack : undefined
    })

    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : getUserFriendlyErrorMessage(unexpectedError)
      },
      { status: 500 }
    )
  }
}

// GET method to retrieve current company profile
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const requestStartTime = performance.now()

  try {
    logInfo('employer-company-profile-get-start', {
      requestId,
      timestamp: new Date().toISOString()
    })

    // Initialize Supabase client
    let supabase
    try {
      supabase = await createRouteHandlerClient()
    } catch (supabaseError) {
      logError('employer-company-profile-get-supabase-init', supabaseError, {
        requestId,
        context: 'Failed to initialize Supabase client'
      })
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    // Verify employer authentication
    let authResult
    try {
      authResult = await verifyEmployerAuth(supabase)
    } catch (authError) {
      logError('employer-company-profile-get-auth', authError, {
        requestId,
        context: 'Authentication/authorization failed'
      })
      
      const errorMessage = authError instanceof Error ? authError.message : 'Unknown auth error'
      if (errorMessage.includes('not authenticated')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      } else if (errorMessage.includes('Access denied')) {
        return NextResponse.json(
          { error: 'Access denied: Employer role required' },
          { status: 403 }
        )
      } else {
        return NextResponse.json(
          { error: 'Authentication verification failed' },
          { status: 401 }
        )
      }
    }

    const requestDurationMs = performance.now() - requestStartTime

    logInfo('employer-company-profile-get-success', {
      requestId,
      employerId: authResult.user.id,
      companyName: authResult.profile.company_name,
      requestDurationMs,
      timestamp: new Date().toISOString()
    })

    // Return the profile (already fetched in auth verification)
    return NextResponse.json(
      {
        success: true,
        profile: {
          id: authResult.profile.id,
          email: authResult.profile.email,
          role: authResult.profile.role,
          first_name: authResult.profile.first_name,
          last_name: authResult.profile.last_name,
          name: authResult.profile.name,
          company_name: authResult.profile.company_name,
          industry: authResult.profile.industry,
          company_description: authResult.profile.company_description,
          website: authResult.profile.website,
          company_size: authResult.profile.company_size,
          founded_year: authResult.profile.founded_year,
          headquarters: authResult.profile.headquarters,
          contact_email: authResult.profile.contact_email,
          contact_phone: authResult.profile.contact_phone,
          created_at: authResult.profile.created_at,
          updated_at: authResult.profile.updated_at
        }
      },
      { status: 200 }
    )

  } catch (unexpectedError) {
    const requestDurationMs = performance.now() - requestStartTime
    logError('employer-company-profile-get-unexpected', unexpectedError, {
      requestId,
      context: 'Unexpected error in company profile get API',
      requestDurationMs,
      stack: unexpectedError instanceof Error ? unexpectedError.stack : undefined
    })

    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : getUserFriendlyErrorMessage(unexpectedError)
      },
      { status: 500 }
    )
  }
}