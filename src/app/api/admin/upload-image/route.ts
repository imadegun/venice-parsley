'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { requireRole } from '@/lib/auth'
import { NextResponse } from 'next/server'

const GENERAL_IMAGES_BUCKET = 'general-images'

async function ensureGeneralImagesBucketConfig() {
  const supabase = createServerSupabaseClient()

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) throw new Error(listError.message)

    const bucket = buckets?.find(bucket => bucket.name === GENERAL_IMAGES_BUCKET)

    if (!bucket) {
      const { error: createError } = await supabase.storage.createBucket(GENERAL_IMAGES_BUCKET, {
        public: true,
        fileSizeLimit: '10MB',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
      })

      if (createError && !createError.message.toLowerCase().includes('already exists')) {
        throw new Error(createError.message)
      }
    } else {
      if (!bucket.public) {
        throw new Error(`Bucket '${GENERAL_IMAGES_BUCKET}' exists but is not public. Please make it public in Supabase dashboard.`)
      }
    }
  } catch (error) {
    console.warn('Could not verify bucket configuration:', error)
  }
}

async function uploadFileToGeneralStorage(file: File) {
  await ensureGeneralImagesBucketConfig()

  const supabase = createServerSupabaseClient()
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const filePath = `uploads/${crypto.randomUUID()}-${Date.now()}.${extension}`

  const uploadOptions = {
    upsert: false,
    cacheControl: '31536000',
    contentType: file.type || 'image/jpeg',
  }

  let { error: uploadError } = await supabase.storage
    .from(GENERAL_IMAGES_BUCKET)
    .upload(filePath, file, uploadOptions)

  if (uploadError?.message?.toLowerCase().includes('bucket not found')) {
    const { error: createBucketError } = await supabase.storage.createBucket(GENERAL_IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: '10MB',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    })

    if (createBucketError && !createBucketError.message.toLowerCase().includes('already exists')) {
      throw new Error(createBucketError.message)
    }

    const retry = await supabase.storage
      .from(GENERAL_IMAGES_BUCKET)
      .upload(filePath, file, uploadOptions)

    uploadError = retry.error
  }

  if (uploadError) throw new Error(uploadError.message)

  const { data: publicData } = supabase.storage
    .from(GENERAL_IMAGES_BUCKET)
    .getPublicUrl(filePath)

  return publicData.publicUrl
}

export async function POST(request: Request) {
  try {
    await requireRole(['admin', 'administrator'])

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const url = await uploadFileToGeneralStorage(file)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}