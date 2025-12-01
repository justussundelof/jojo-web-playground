import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { CreateArticleRequest } from '@/types/article'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Parse request body
    const body: CreateArticleRequest = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.price || !body.category || !body.size || !body.color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate price and stock_quantity are positive numbers
    if (body.price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    if (body.stock_quantity < 0) {
      return NextResponse.json(
        { error: 'Stock quantity cannot be negative' },
        { status: 400 }
      )
    }

    // Insert article into database
    const { data, error } = await supabase
      .from('articles')
      .insert([
        {
          title: body.title,
          description: body.description,
          price: body.price,
          category: body.category,
          size: body.size,
          color: body.color,
          material: body.material || null,
          brand: body.brand || null,
          stock_quantity: body.stock_quantity,
          image_url: body.image_url || null,
          is_featured: body.is_featured || false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create article', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Article created successfully', article: data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ articles }, { status: 200 })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
