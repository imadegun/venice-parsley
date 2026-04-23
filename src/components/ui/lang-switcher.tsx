'use client'

import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`px-2 py-1 text-xs font-medium transition-colors ${
          language === 'en'
            ? 'text-yellow-300 bg-white/10'
            : 'text-white/70 hover:text-white'
        }`}
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <span className="text-white/30">|</span>
      <Button
        variant="ghost"
        size="sm"
        className={`px-2 py-1 text-xs font-medium transition-colors ${
          language === 'it'
            ? 'text-yellow-300 bg-white/10'
            : 'text-white/70 hover:text-white'
        }`}
        onClick={() => setLanguage('it')}
      >
        IT
      </Button>
    </div>
  )
}
