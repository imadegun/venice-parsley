'use client'

import { ExternalLink } from 'lucide-react'

interface KrossBookingEmbedProps {
  className?: string
  language?: 'en' | 'it'
}

const KROSS_BASE_URL = 'https://venice-parsley.kross.travel'

function getKrossUrl(language: 'en' | 'it' = 'en'): string {
  return language === 'it'
    ? `${KROSS_BASE_URL}/it/camere`
    : `${KROSS_BASE_URL}/en/rooms`
}

export function KrossBookingEmbed({ className = '', language = 'en' }: KrossBookingEmbedProps) {
  const krossUrl = getKrossUrl(language)

  return (
    <div className={`w-full ${className}`}>
      <a
        href={krossUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-3 w-full rounded-lg bg-primary px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-primary/90"
      >
        <span>Open Booking Calendar</span>
        <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>
  )
}