'use client'

import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'

// UK Flag SVG Component
function UKFlag({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="15" viewBox="0 0 20 15" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="15" fill="#012169"/>
      <path d="M0 0L20 15M20 0L0 15" stroke="#FFFFFF" strokeWidth="2"/>
      <path d="M10 0V15M0 7.5H20" stroke="#FFFFFF" strokeWidth="3"/>
      <path d="M10 0V15M0 7.5H20" stroke="#C8102E" strokeWidth="1"/>
      <path d="M0 0L20 15M20 0L0 15" stroke="#C8102E" strokeWidth="1"/>
    </svg>
  )
}

// Italy Flag SVG Component
function ItalyFlag({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="15" viewBox="0 0 20 15" xmlns="http://www.w3.org/2000/svg">
      <rect width="6.67" height="15" fill="#009246"/>
      <rect x="6.67" width="6.66" height="15" fill="#FFFFFF"/>
      <rect x="13.33" width="6.67" height="15" fill="#CE2B37"/>
    </svg>
  )
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`px-3 py-1 text-xs font-medium transition-colors flex items-center gap-2 ${
          language === 'en'
            ? 'text-yellow-300 bg-white/10'
            : 'text-white/70 hover:text-white'
        }`}
        onClick={() => setLanguage('en')}
      >
        <UKFlag className="w-5 h-auto" />
        <span>EN</span>
      </Button>
      <span className="text-white/30">|</span>
      <Button
        variant="ghost"
        size="sm"
        className={`px-3 py-1 text-xs font-medium transition-colors flex items-center gap-2 ${
          language === 'it'
            ? 'text-yellow-300 bg-white/10'
            : 'text-white/70 hover:text-white'
        }`}
        onClick={() => setLanguage('it')}
      >
        <ItalyFlag className="w-5 h-auto" />
        <span>IT</span>
      </Button>
    </div>
  )
}
