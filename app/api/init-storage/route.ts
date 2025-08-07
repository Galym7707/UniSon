import { NextResponse } from 'next/server'
import { initializeStorageBuckets, verifyStorageSetup } from '@/lib/init-storage'

/**
 * API endpoint to initialize Supabase storage buckets
 * This is primarily for development/setup purposes
 */
export async function POST() {
  try {
    const result = await initializeStorageBuckets()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * API endpoint to verify storage setup
 */
export async function GET() {
  try {
    const result = await verifyStorageSetup()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        bucket: result.bucket
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}