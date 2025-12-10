import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { name } = body

    // Validate name
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check length
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Tag name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = generateSlug(trimmedName)

    // Check for duplicate tag name (case-insensitive)
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .ilike('name', trimmedName)
      .single()

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 409 }
      )
    }

    // Check for duplicate slug
    const { data: existingSlug } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      return NextResponse.json(
        { error: 'A tag with this slug already exists' },
        { status: 409 }
      )
    }

    // Create the tag
    const { data: newTag, error: insertError } = await supabase
      .from('tags')
      .insert([{ name: trimmedName, slug }])
      .select()
      .single()

    if (insertError) {
      console.error('Tag creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create tag' },
        { status: 500 }
      )
    }

    return NextResponse.json(newTag, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
