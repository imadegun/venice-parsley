'use client'

import { ReactNode, createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'it'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Detect language based on browser locale
const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en'
  
  // Check localStorage first for user preference
  const stored = localStorage.getItem('preferred-language') as Language | null
  if (stored && (stored === 'en' || stored === 'it')) {
    return stored
  }

  // Auto-detect based on browser language
  const browserLang = navigator.language || 'en'
  const country = browserLang.split('-')[1]?.toLowerCase()

  // Italy = Italian, everything else = English
  if (country === 'it' || browserLang.startsWith('it')) {
    return 'it'
  }

  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    setLanguageState(detectLanguage())
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('preferred-language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
