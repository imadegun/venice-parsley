import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'NOT SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'
    }
  }

  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        status: 'error',
        message: 'NEXT_PUBLIC_SUPABASE_URL environment variable is not set',
        debug: debugInfo
      }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set',
        debug: debugInfo
      }, { status: 500 })
    }

    const supabase = createServerSupabaseClient()

    // First, let's just test the connection without querying tables
    try {
      // Try to get the current user (this tests basic auth connection)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      debugInfo.authTest = authError ? `Error: ${authError.message}` : 'Success (user may be null)'

      // Now try to query the apartments table
      const { data, error } = await supabase
        .from('apartments')
        .select('id, name, slug, is_active')
        .limit(5)

      if (error) {
        return NextResponse.json({
          status: 'error',
          message: 'Database query failed',
          error: error.message,
          errorDetails: error,
          debug: debugInfo
        }, { status: 500 })
      }

      return NextResponse.json({
        status: 'success',
        message: 'Database connection and query successful',
        data: data,
        recordCount: data?.length || 0,
        debug: debugInfo
      })
    } catch (connectionError) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase connection failed',
        error: connectionError instanceof Error ? connectionError.message : 'Unknown connection error',
        debug: debugInfo
      }, { status: 500 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error during database test',
      error: message,
      debug: debugInfo
    }, { status: 500 })
  }
}