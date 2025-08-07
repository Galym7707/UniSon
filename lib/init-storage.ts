/**
 * Initialize Supabase storage buckets for the application
 * This should be run once during deployment or setup
 */

import { createServerSupabaseAdmin } from '@/lib/supabase/admin'

export async function initializeStorageBuckets() {
  try {
    const supabase = createServerSupabaseAdmin()
    
    // Check if resumes bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }
    
    const resumesBucket = buckets?.find(bucket => bucket.id === 'resumes')
    
    if (resumesBucket) {
      console.log('✅ Resumes bucket already exists')
      return { success: true, message: 'Resumes bucket already exists' }
    }
    
    // Create the resumes bucket
    const { data: bucketData, error: createError } = await supabase.storage.createBucket('resumes', {
      public: true,
      fileSizeLimit: 10485760, // 10MB in bytes
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    })
    
    if (createError) {
      throw new Error(`Failed to create resumes bucket: ${createError.message}`)
    }
    
    console.log('✅ Resumes bucket created successfully')
    
    // Set up bucket policies (this should be done via SQL migration for security)
    console.log('⚠️  Remember to run the storage migration SQL to set up proper bucket policies')
    
    return {
      success: true,
      message: 'Resumes bucket created successfully. Remember to run the storage migration SQL to set up policies.'
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize storage buckets:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function verifyStorageSetup() {
  try {
    const supabase = createServerSupabaseAdmin()
    
    // List buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }
    
    const resumesBucket = buckets?.find(bucket => bucket.id === 'resumes')
    
    if (!resumesBucket) {
      return {
        success: false,
        error: 'Resumes bucket not found. Run initializeStorageBuckets() first.'
      }
    }
    
    console.log('✅ Storage setup verification passed')
    console.log(`📁 Resumes bucket: ${resumesBucket.id} (public: ${resumesBucket.public})`)
    
    return {
      success: true,
      message: 'Storage setup verified successfully',
      bucket: resumesBucket
    }
    
  } catch (error) {
    console.error('❌ Storage setup verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}