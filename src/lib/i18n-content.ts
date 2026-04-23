/**
 * Helper to get localized content from menu items or other sources.
 * Content can be:
 * - A string (fallback to default language)
 * - An object with { en: string, it: string }
 * - null/undefined
 */
export function getLocalizedContent(content: string | Record<string, string> | null | undefined, lang: 'en' | 'it' = 'en'): string {
  if (!content) return ''
  
  if (typeof content === 'string') {
    // Try to parse as JSON (for stored bilingual content)
    try {
      const parsed = JSON.parse(content)
      if (typeof parsed === 'object' && parsed[lang]) {
        return parsed[lang]
      }
      if (typeof parsed === 'object' && parsed.en) {
        return parsed.en
      }
    } catch {
      // Not JSON, return as-is
      return content
    }
  }
  
  if (typeof content === 'object') {
    return content[lang] || content.en || ''
  }
  
  return ''
}

/**
 * Helper to get localized title from menu items
 */
export function getLocalizedTitle(title: Record<string, string> | null | undefined, lang: 'en' | 'it' = 'en'): string {
  if (!title) return ''
  return title[lang] || title.en || ''
}
