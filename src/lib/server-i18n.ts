import { cookies } from 'next/headers'

export type Language = 'en' | 'it'

/**
 * Get the user's preferred language from cookies or auto-detect.
 * This is for use in Server Components.
 */
export async function getServerLanguage(): Promise<Language> {
  try {
    const cookieStore = await cookies()
    const langCookie = cookieStore.get('preferred-language')
    
    if (langCookie && (langCookie.value === 'en' || langCookie.value === 'it')) {
      return langCookie.value as Language
    }
  } catch {
    // cookies() may throw in some contexts
  }

  // Auto-detect based on Accept-Language header
  try {
    const headersList = await import('next/headers').then(m => m.headers())
    const acceptLang = headersList.get('accept-language') || ''
    
    // Check if Italian is preferred
    if (acceptLang.includes('it') && !acceptLang.includes('en')) {
      return 'it'
    }
    
    // Check priority - if Italian appears before English
    const itIndex = acceptLang.indexOf('it')
    const enIndex = acceptLang.indexOf('en')
    if (itIndex >= 0 && (enIndex < 0 || itIndex < enIndex)) {
      return 'it'
    }
  } catch {
    // headers() may not be available in all contexts
  }

  return 'en'
}
