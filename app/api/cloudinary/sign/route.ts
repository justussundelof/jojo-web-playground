import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    // Check Cloudinary configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary environment variables:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret
      })
      return NextResponse.json(
        { error: 'Cloudinary not configured. Please set environment variables.' },
        { status: 500 }
      )
    }

    // Check if user is authenticated
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to upload images.' },
        { status: 401 }
      )
    }

    // Get timestamp for signature
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Define upload parameters
    const uploadParams = {
      timestamp: timestamp,
      folder: 'jojo-shop/products',
      upload_preset: undefined, // Don't use preset with signed uploads
    }

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      apiSecret
    )

    // Return signature and params to client
    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder: 'jojo-shop/products',
    })
  } catch (error) {
    console.error('Error generating signature:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    )
  }
}
