export type Language = 'en' | 'it'

/**
 * Get the user's preferred language from cookies.
 * This is for use in Client Components.
 */
export function getClientLanguage(): Language {
  const cookies = document.cookie.split(';')
  const langCookie = cookies.find(c => c.trim().startsWith('preferred-language='))

  if (langCookie) {
    const value = langCookie.split('=')[1]?.trim()
    if (value === 'en' || value === 'it') {
      return value as Language
    }
  }

  // Default to English if no valid cookie found
  return 'en'
}
