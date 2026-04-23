'use client'

import { useLanguage } from '@/components/language-provider'
import { useEffect } from 'react'

/**
 * Client component that syncs the selected language to a cookie
 * so server components can read it.
 */
export function LanguageCookieSync() {
  const { language } = useLanguage()

  useEffect(() => {
    // Set cookie with 1 year expiry
    document.cookie = `preferred-language=${language}; path=/; max-age=31536000; SameSite=Lax`
  }, [language])

  return null
}
