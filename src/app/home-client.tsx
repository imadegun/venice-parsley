'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero/hero-section"
import { MapPin, Star, Users } from "lucide-react"
import { getHomepageContent } from "@/lib/content"
import { createClient } from "@/lib/supabase"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { useLanguage } from "@/components/language-provider"
import type { HeroContent, HomepageContent } from "@/lib/content"

export default function HomeClient() {
  const { language } = useLanguage()
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [contactMenuItem, setContactMenuItem] = useState<{ map_embed?: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [language])

  const loadContent = async () => {
    setLoading(true)
    try {
      const [content, supabase] = await Promise.all([
        getHomepageContent(),
        createClient()
      ])

      setHomepageContent(content)

      // Fetch hero images
      const { data: heroApartments } = await supabase
        .from('apartments')
        .select('gallery_images, image_url')
        .eq('is_active', true)

      const images = Array.from(
        new Set(
          (heroApartments || []).flatMap((apartment) => {
            const gallery = Array.isArray(apartment.gallery_images) ? apartment.gallery_images : []
            if (gallery.length > 0) return gallery
            return apartment.image_url ? [apartment.image_url] : []
          }).filter(Boolean)
        )
      )

      setHeroImages(images)

      // Fetch contact menu item for map
      const { data: contactItem } = await supabase
        .from('menu_items')
        .select('map_embed')
        .eq('href', '/contact')
        .eq('is_active', true)
        .single()

      setContactMenuItem(contactItem)
    } catch (error) {
      console.error('Error loading home content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !homepageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const currentLang = language as 'en' | 'it'

  const heroContent: HeroContent = {
    ...homepageContent.hero,
    backgroundImages: heroImages.length > 0
      ? heroImages
      : homepageContent.hero.backgroundImages,
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Hero Section */}
      <HeroSection heroContentData={heroContent} />

      {/* Mobile Intro Copy */}
      <ScrollReveal direction="up" duration={1000} delay={0}>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs md:text-sm uppercase tracking-[0.28em] text-gray-600 font-playfair mb-4">
                {homepageContent.intro?.tagline?.[currentLang] ?? homepageContent.intro?.tagline?.en ?? ''}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-playfair">
                {homepageContent.intro?.title?.[currentLang] ?? homepageContent.intro?.title?.en ?? ''}
              </h1>
              <div className="mx-auto mb-8 h-[2px] w-24 bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
              <p className="text-lg text-gray-600 font-mulish leading-8 max-w-2xl mx-auto px-4 md:px-0">
                {homepageContent.intro?.description?.[currentLang] ?? homepageContent.intro?.description?.en ?? ''}
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* About Section */}
      <ScrollReveal direction="up" duration={1000} delay={400}>
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-playfair">
                  {homepageContent.about.title?.[currentLang] ?? homepageContent.about.title?.en ?? ''}
                </h2>
                <p className="text-lg text-gray-600 mb-6 font-mulish leading-8 max-w-2xl">
                  {homepageContent.about.content?.[currentLang] ?? homepageContent.about.content?.en ?? ''}
                </p>
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">Curated Selection</p>
                    <p className="text-sm text-gray-600">Handpicked artistic spaces</p>
                  </div>
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">Prime Locations</p>
                    <p className="text-sm text-gray-600">Heart of Venice</p>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">5-Star Experience</p>
                    <p className="text-sm text-gray-600">Exceptional service</p>
                  </div>
                </div>
                <Link href="/about">
                  <Button variant="outline">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
              <div className="h-96 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg flex items-center justify-center overflow-hidden">
                {contactMenuItem?.map_embed ? (
                  <div
                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: contactMenuItem.map_embed }}
                  />
                ) : (
                  <MapPin className="h-24 w-24 text-blue-400" />
                )}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal direction="up" duration={1000} delay={800}>
        <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">Ready for an Artistic Experience?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-mulish leading-8">
              Book your stay in one of Venice's most unique and inspiring apartments today.
            </p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Link href="/apartments">
                <Button size="lg" variant="secondary">
                  Browse Apartments
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Sticky Mobile Bottom CTA */}
      <div className="mobile-bottom-cta fixed bottom-0 left-0 right-0 md:hidden px-3 pb-3">
        <Link
          href="/apartments"
          className="flex h-14 w-full items-center justify-center rounded-t-[20px] bg-pink-500 text-white font-playfair text-sm font-semibold uppercase tracking-[0.18em] shadow-[0_-6px_20px_rgba(0,0,0,0.2)]"
        >
          BOOK NOW
        </Link>
      </div>
    </div>
  )
}