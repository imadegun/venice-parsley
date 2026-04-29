'use server'


import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'

const MENU_DOCUMENTS_BUCKET = 'menu-documents'

function getStoragePublicMarker() {
  return `/storage/v1/object/public/${MENU_DOCUMENTS_BUCKET}/`
}

function isMenuDocumentStorageUrl(url: string) {
  return url.includes(getStoragePublicMarker())
}

function getStoragePathFromPublicUrl(url: string) {
  try {
    const parsed = new URL(url)
    const marker = `/object/public/${MENU_DOCUMENTS_BUCKET}/`
    const index = parsed.pathname.indexOf(marker)
    if (index === -1) return null
    return decodeURIComponent(parsed.pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

async function ensureMenuDocumentsBucketConfig() {
  const supabase = createServerSupabaseClient()

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) throw new Error(listError.message)

    const bucket = buckets?.find(bucket => bucket.name === MENU_DOCUMENTS_BUCKET)

    if (!bucket) {
      const { error: createError } = await supabase.storage.createBucket(MENU_DOCUMENTS_BUCKET, {
        public: true,
        fileSizeLimit: '10MB',
      })

      if (createError && !createError.message.toLowerCase().includes('already exists')) {
        throw new Error(createError.message)
      }
    } else {
      // Check if bucket is public
      if (!bucket.public) {
        throw new Error(`Bucket '${MENU_DOCUMENTS_BUCKET}' exists but is not public. Please make it public in Supabase dashboard or delete it to allow recreation.`)
      }
    }
  } catch (error) {
    console.warn('Could not verify bucket configuration:', error)
  }
}

async function uploadFileToMenuDocumentsStorage(file: File, menuItemId: string) {
  await ensureMenuDocumentsBucketConfig()

  const supabase = createServerSupabaseClient()
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'pdf'
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `menu-items/${menuItemId}/${crypto.randomUUID()}-${Date.now()}-${sanitizedFileName}.${extension}`

  const uploadOptions = {
    upsert: false,
    cacheControl: '31536000',
    contentType: file.type || 'application/pdf',
  }

  let { error: uploadError } = await supabase.storage
    .from(MENU_DOCUMENTS_BUCKET)
    .upload(filePath, file, uploadOptions)

  if (uploadError?.message?.toLowerCase().includes('bucket not found')) {
    const { error: createBucketError } = await supabase.storage.createBucket(MENU_DOCUMENTS_BUCKET, {
      public: true,
      fileSizeLimit: '10MB',
    })

    if (createBucketError && !createBucketError.message.toLowerCase().includes('already exists')) {
      throw new Error(createBucketError.message)
    }

    const retry = await supabase.storage
      .from(MENU_DOCUMENTS_BUCKET)
      .upload(filePath, file, uploadOptions)

    uploadError = retry.error
  }

  if (uploadError) throw new Error(uploadError.message)

  const { data: publicData } = supabase.storage
    .from(MENU_DOCUMENTS_BUCKET)
    .getPublicUrl(filePath)

  console.log('Uploaded file URL:', publicData.publicUrl)
  return publicData.publicUrl
}

export async function uploadMenuDocuments(formData: FormData) {
  await requireRole(['admin', 'administrator'])

  const menuItemId = formData.get('menuItemId')?.toString()
  if (!menuItemId) throw new Error('Menu item ID is required')

  const files = formData
    .getAll('files')
    .filter((value): value is File => value instanceof File)

  if (files.length === 0) {
    return { urls: [] as string[] }
  }

  const urls: string[] = []
  for (const file of files) {
    urls.push(await uploadFileToMenuDocumentsStorage(file, menuItemId))
  }

  return { urls }
}

export async function deleteMenuDocuments(urls: string[]) {
  await requireRole(['admin', 'administrator'])
  const supabase = createServerSupabaseClient()

  const paths = urls
    .map(getStoragePathFromPublicUrl)
    .filter((value): value is string => Boolean(value))

  if (paths.length === 0) return

  const { error } = await supabase.storage.from(MENU_DOCUMENTS_BUCKET).remove(paths)
  if (error?.message?.toLowerCase().includes('bucket not found')) return
  if (error) throw new Error(error.message)
}

export async function ensureMenuDocumentUrls(documents: string[]) {
  const migrated: string[] = []

  for (const url of documents) {
    if (isMenuDocumentStorageUrl(url)) {
      migrated.push(url)
      continue
    }
    // For now, we'll assume all URLs are already in storage
    // In the future, we could add migration logic for external URLs
    migrated.push(url)
  }

  return migrated
}