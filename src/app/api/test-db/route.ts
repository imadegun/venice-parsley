import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Simple query to test database connection
    const { data, error } = await supabase
      .from('apartments')
      .select('id, name')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: data
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: message
    }, { status: 500 })
  }
}