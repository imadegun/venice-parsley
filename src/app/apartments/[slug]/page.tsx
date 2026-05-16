import ApartmentDetailClient from './apartment-detail-client'
import { createClient } from '@/lib/supabase'

export async function generateStaticParams() {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('apartments')
      .select('slug')
      .eq('is_active', true)

    return (data || []).map((apartment) => ({ slug: apartment.slug }))
  } catch {
    return []
  }
}

export default function ApartmentDetailPage() {
  return <ApartmentDetailClient />
}
