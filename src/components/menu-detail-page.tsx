'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, FileText } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/components/language-provider'
import { getLocalizedContent, getLocalizedTitle } from '@/lib/i18n-content'
import ContactForm from '@/components/contact/contact-form'

interface DocumentItem {
  url: string
  title: string
}

interface MenuPageContent {
  title: { en: string; it: string }
  content: { en: string; it: string }
  image_url?: string | null
  map_embed?: string | null
  documents?: DocumentItem[] | null
  downloads_enabled?: boolean | null
}

interface MenuDetailPageProps {
  href: string
  defaultTitle: string
  showMap?: boolean
}

// Helper function to extract file name from URL
function getFileName(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const parts = pathname.split('/')
    const fileName = parts[parts.length - 1]
    // Remove UUID prefix and timestamp from filename
    const cleanedName = fileName.split('-').slice(2).join('-')
    return cleanedName || 'Document'
  } catch {
    return 'Document'
  }
}

export default function MenuDetailPage({ href, defaultTitle, showMap = false }: MenuDetailPageProps) {
  const { language } = useLanguage()
  const [content, setContent] = useState<MenuPageContent | null>(null)
  const [loading, setLoading] = useState(true)

  const loadContent = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: menuItem, error } = await supabase
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
  const rawContent = getLocalizedContent(content?.content, currentLang)

  // Convert plain text with newlines to proper HTML paragraphs
  const pageContent = rawContent ? formatContentToHtml(rawContent) : ''

  // Helper function to convert plain text/markdown to HTML
  function formatContentToHtml(text: string): string {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split(/\n\n+/)
    
    return paragraphs
      .map(p => {
        const trimmed = p.trim()
        if (!trimmed) return ''
        
        // Check if it's already HTML
        if (trimmed.startsWith('<')) return trimmed
        
        // Convert single newlines to <br>
        const withBreaks = trimmed.replace(/\n/g, '<br>')
        
        // Wrap in paragraph tag
        return `<p>${withBreaks}</p>`
      })
      .filter(Boolean)
      .join('\n')
  }

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
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <ScrollReveal direction="up" duration={1000} delay={0}>
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-3 font-playfair tracking-tight text-left">
              {title}
            </h1>
            {/* <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div> */}
          </div>
        </ScrollReveal>

        {/* Featured Image */}
        {content?.image_url && (
          <ScrollReveal direction="up" duration={1000} delay={200}>
            <div className="mb-8 md:mb-12">
              <div className="relative rounded-xl overflow-hidden shadow-xl group">
                <img
                  src={content.image_url}
                  alt={title}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Contact Form (for contact page) - Display FIRST */}
        {href === '/contact' && (
          <ScrollReveal direction="up" duration={1000} delay={200}>
            <div className="mb-8 md:mb-12">
              <ContactForm language={currentLang as 'en' | 'it'} />
            </div>
          </ScrollReveal>
        )}

        {/* Map Section (for contact page) - Display AFTER form */}
        {showMap && content?.map_embed && (
          <ScrollReveal direction="up" duration={1000} delay={300}>
            <div className="mb-8 md:mb-12">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-900 mb-4 md:mb-6 font-playfair tracking-wide">
                    {currentLang === 'it' ? 'DOVE TROVARCI' : 'FIND US'}
                  </h2>
                  <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-inner">
                    <div
                      className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:rounded-lg"
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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                {/* Content with improved typography */}
                <div
                  className="menu-content text-gray-700 prose prose-base sm:prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-3 prose-headings:mt-6
                    prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:md:text-4xl prose-h1:font-josefin prose-h1:tracking-tight prose-h1:leading-tight
                    prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:md:text-3xl prose-h2:font-bebas prose-h2:uppercase prose-h2:tracking-wide
                    prose-h3:text-lg prose-h3:sm:text-xl prose-h3:md:text-2xl prose-h3:font-mulish
                    prose-h4:text-base prose-h4:sm:text-lg prose-h4:font-mulish
                    prose-p:text-gray-700 prose-p:leading-7 sm:prose-p:leading-8 prose-p:mb-4 prose-p:font-mulish prose-p:text-sm sm:prose-p:text-base md:prose-p:text-lg
                    prose-strong:font-semibold prose-strong:text-gray-900
                    prose-em:italic prose-em:text-gray-600
                    prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-a:underline prose-a:font-medium
                    prose-ul:mb-4 prose-ul:pl-5 prose-ul:space-y-2
                    prose-ol:mb-4 prose-ol:pl-5 prose-ol:space-y-2
                    prose-li:text-gray-700 prose-li:font-mulish prose-li:leading-7 prose-li:pl-2
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:mb-4 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                    prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:h-auto prose-img:my-4
                    prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:mb-4 prose-table:rounded-lg prose-table:overflow-hidden
                    prose-th:border prose-th:border-gray-300 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:bg-gray-50 prose-th:font-semibold prose-th:text-gray-900 prose-th:text-sm
                    prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-td:text-left prose-td:text-gray-700 prose-td:text-sm
                    prose-hr:border-gray-200 prose-hr:my-8 prose-hr:border-t-2
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-gray-800
                    prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded prose-pre:overflow-x-auto prose-pre:mb-4 prose-pre:font-mono prose-pre:text-sm prose-pre:border
                    prose-figure:my-6
                    prose-figcaption:text-sm prose-figcaption:text-gray-600 prose-figcaption:text-center prose-figcaption:mt-2 prose-figcaption:font-mulish prose-figcaption:italic"
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal direction="up" duration={1000} delay={400}>
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-12 text-center border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 font-mulish">
                {currentLang === 'it' ? 'Contenuto in Preparazione' : 'Content Coming Soon'}
              </h3>
              <p className="text-gray-600 font-mulish text-sm sm:text-base md:text-lg max-w-md mx-auto">
                {currentLang === 'it' ? 'Stiamo preparando contenuti interessanti per questa pagina.' : 'We\'re preparing interesting content for this page.'}
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Downloads Section */}
        {content?.downloads_enabled && content?.documents && content.documents.length > 0 && (
          <ScrollReveal direction="up" duration={1000} delay={500}>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mt-8 md:mt-12">
              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-900 mb-4 md:mb-6 font-playfair tracking-wide">
                  {currentLang === 'it' ? 'DOCUMENTI SCARICABILI' : 'DOWNLOADABLE DOCUMENTS'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.documents.map((document, index) => (
                    <div key={index} className="flex flex-col p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-6 w-6 text-red-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{document.title}</p>
                          <p className="text-xs sm:text-sm text-gray-500">PDF Document</p>
                        </div>
                      </div>
                       <a
                         href={document.url}
                         download={document.title}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                       >
                        <Download className="h-4 w-4" />
                        {currentLang === 'it' ? 'Scarica' : 'Download'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </Container>
  )
}