'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Container } from '@/components/layout/container'
import { useLanguage } from '@/components/language-provider'
import { getHomepageContent } from '@/lib/content'
import type { HomepageContent } from '@/lib/content'

interface ApartmentCard {
  id: string
  slug: string
  name: { en: string; it: string } | string
  short_description: { en: string; it: string } | string | null
  base_price_cents: number
  max_guests: number
  bedrooms: number
  image_url: string | null
}

export default function ApartmentsPage() {
  const { language } = useLanguage()
  const [apartments, setApartments] = useState<ApartmentCard[]>([])
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [language])

  const loadData = async () => {
    setLoading(true)
    try {
      const [content, supabase] = await Promise.all([
        getHomepageContent(),
        createClient()
      ])

      setHomepageContent(content)

      const { data } = await supabase
        .from('apartments')
        .select('id, slug, name, short_description, base_price_cents, max_guests, bedrooms, image_url, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setApartments((data || []) as ApartmentCard[])
    } catch (error) {
      console.error('Error loading apartments data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentLang = language as 'en' | 'it'

  const getLocalizedText = (field: { en: string; it: string } | string | null): string => {
    if (!field) return ''
    if (typeof field === 'string') return field
    return field[currentLang] || field.en || ''
  }

  if (loading) {
    return (
      <Container spacing="xxl">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading apartments...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container spacing="xxl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl text-gray-900 mb-8 animate-title font-playfair">
          {homepageContent?.featured.title?.[currentLang] ?? homepageContent?.featured.title?.en ?? 'Luxury Apartments'}
        </h1>
        <p className="text-lg text-gray-600 font-mulish leading-8 mb-12 max-w-4xl animate-title-delay-1">
          {homepageContent?.featured.description?.[currentLang] ?? homepageContent?.featured.description?.en ?? 'Discover our unique artistic apartments designed for art lovers and creative travelers.'}
        </p>
      </div>

      {apartments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No apartments available yet.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apartment) => (
            <Link
              key={apartment.id}
              href={`/apartments/${apartment.slug}`}
              className="group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative h-52 bg-gradient-to-br from-blue-100 to-teal-100 overflow-hidden">
                {apartment.image_url ? (
                  <Image
                    src={apartment.image_url}
                    alt={getLocalizedText(apartment.name)}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-blue-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
                    <div className="p-6 transition-colors duration-500 group-hover:bg-slate-50/80">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-violet-700">
                        {getLocalizedText(apartment.name)}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {getLocalizedText(apartment.short_description) || `${apartment.max_guests} guests • ${apartment.bedrooms} bedroom(s)`}
                      </p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{apartment.max_guests} guests • {apartment.bedrooms} bedrooms</span>
                  <span className="text-lg font-bold text-gray-900 transition-transform duration-300 group-hover:scale-105">€{(apartment.base_price_cents / 100).toFixed(0)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
       )}
     </Container>
   )
}
