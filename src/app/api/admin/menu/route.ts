import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching menu items:', error)
      return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in menu API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Menu API POST - Request received')
    console.log('Content-Type:', request.headers.get('content-type'))

    const supabase = createServerClient()

    // Log the raw request body for debugging
    const rawBody = await request.text()
    console.log('Raw request body:', rawBody)

    let body
    try {
      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    console.log('Parsed body:', body)

    const { title, href, is_active = true, sort_order = 0, content, map_embed, image_url, documents, downloads_enabled } = body

    if (!title || !href) {
      return NextResponse.json({ error: 'Title and href are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ title, href, is_active, sort_order, content, map_embed, image_url, documents, downloads_enabled }])
      .select()
      .single()

    if (error) {
      console.error('Error creating menu item:', error)
      return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in menu API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}