import ApartmentDetailClient from './apartment-detail-client'
import { createClient } from '@/lib/supabase'

const FALLBACK_SLUGS = ['ca-biri', 'ca-asia', 'ca-tera']

export async function generateStaticParams() {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('apartments')
      .select('slug')
      .eq('is_active', true)

    if (data && data.length > 0) {
      return data.map((apartment) => ({ slug: apartment.slug }))
    }
  } catch {
    console.warn('Could not fetch apartment slugs, using fallback')
  }

  return FALLBACK_SLUGS.map((slug) => ({ slug }))
}

export default function ApartmentDetailPage() {
  return <ApartmentDetailClient />
}
