'use client'

import { useState, useEffect, useCallback } from 'react'
import { Container } from '@/components/layout/container'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/components/language-provider'
import { getLocalizedContent, getLocalizedTitle } from '@/lib/i18n-content'

interface MenuPageContent {
  title: { en: string; it: string }
  content: { en: string; it: string }
  image_url?: string | null
  map_embed?: string | null
}

interface MenuDetailPageProps {
  href: string
  defaultTitle: string
  showMap?: boolean
}

export default function MenuDetailPage({ href, defaultTitle, showMap = false }: MenuDetailPageProps) {
  const { language } = useLanguage()
  const [content, setContent] = useState<MenuPageContent | null>(null)
  const [loading, setLoading] = useState(true)

  const loadContent = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('*')
      .eq('href', href)
      .eq('is_active', true)
      .single()

    if (menuItem) {
      setContent(menuItem as MenuPageContent)
    }
    setLoading(false)
  }, [href])

  useEffect(() => {
    loadContent()
  }, [loadContent, language])

  const currentLang = language as 'en' | 'it'
  const title = getLocalizedTitle(content?.title, currentLang) || defaultTitle
  const pageContent = getLocalizedContent(content?.content, currentLang)

  if (loading) {
    return (
      <Container spacing="xxl">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container spacing="xxl">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <ScrollReveal direction="up" duration={1000} delay={0}>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-josefin">
              {title}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full"></div>
          </div>
        </ScrollReveal>

        {/* Featured Image */}
        {content?.image_url && (
          <ScrollReveal direction="up" duration={1000} delay={200}>
            <div className="mb-16">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={content.image_url}
                  alt={title}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Map Section (for contact page) */}
        {showMap && content?.map_embed && (
          <ScrollReveal direction="up" duration={1000} delay={300}>
            <div className="mb-16">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-bebas">
                    {currentLang === 'it' ? 'DOVE TROVARCI' : 'FIND US'}
                  </h2>
                  <div className="w-full h-80 md:h-96 rounded-xl overflow-hidden">
                    <div
                      className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:rounded-xl"
                      dangerouslySetInnerHTML={{ __html: content.map_embed }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Content Section */}
        {pageContent ? (
          <ScrollReveal direction="up" duration={1000} delay={400}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 md:p-12 lg:p-16">
                {/* Content with improved typography */}
                <div
                  className="menu-content text-lg leading-8 font-mulish text-gray-700
                    [&>*:first-child]:mt-0
                    [&>*:last-child]:mb-0
                    [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-6 [&_h1]:mt-8 [&_h1]:font-josefin [&_h1]:leading-tight
                    [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:font-bebas [&_h2]:tracking-wide [&_h2]:uppercase
                    [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:font-mulish [&_h3]:leading-snug
                    [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-mulish [&_h4]:leading-snug
                    [&_h5]:text-base [&_h5]:font-semibold [&_h5]:text-gray-900 [&_h5]:mt-4 [&_h5]:mb-2 [&_h5]:font-mulish [&_h5]:leading-snug
                    [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:text-gray-900 [&_h6]:mt-4 [&_h6]:mb-2 [&_h6]:font-mulish [&_h6]:leading-snug
                    [&_p]:text-gray-700 [&_p]:leading-8 [&_p]:mb-4 [&_p]:font-mulish [&_p]:text-base [&_p]:md:text-lg
                    [&_strong]:font-semibold [&_strong]:text-gray-900
                    [&_b]:font-semibold [&_b]:text-gray-900
                    [&_em]:italic [&_em]:text-gray-600
                    [&_i]:italic [&_i]:text-gray-600
                    [&_a]:text-blue-600 [&_a]:hover:text-blue-800 [&_a]:underline [&_a]:font-medium [&_a]:transition-colors [&_a]:duration-200
                    [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:pl-6
                    [&_ol]:space-y-2 [&_ol]:mb-4 [&_ol]:pl-6
                    [&_li]:text-gray-700 [&_li]:font-mulish [&_li]:leading-7 [&_li]:pl-2
                    [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:mb-4 [&_blockquote]:bg-blue-50 [&_blockquote]:py-2 [&_blockquote]:pr-4
                    [&_img]:rounded-lg [&_img]:shadow-md [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4
                    [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:mb-4 [&_table]:rounded-lg [&_table]:overflow-hidden
                    [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:text-gray-900
                    [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-left [&_td]:text-gray-700
                    [&_hr]:border-gray-300 [&_hr]:my-8 [&_hr]:border-t
                    [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-gray-800
                    [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:border
                    [&_div]:max-w-full
                    [&_span]:max-w-full
                    [&_figure]:my-6
                    [&_figcaption]:text-sm [&_figcaption]:text-gray-600 [&_figcaption]:text-center [&_figcaption]:mt-2 [&_figcaption]:font-mulish"
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal direction="up" duration={1000} delay={400}>
            <div className="bg-white rounded-2xl shadow-xl p-12 md:p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-mulish">
                {currentLang === 'it' ? 'Contenuto in Preparazione' : 'Content Coming Soon'}
              </h3>
              <p className="text-gray-600 font-mulish">
                {currentLang === 'it' ? 'Stiamo preparando contenuti interessanti per questa pagina.' : 'We\'re preparing interesting content for this page.'}
              </p>
            </div>
          </ScrollReveal>
        )}
      </div>
    </Container>
  )
}