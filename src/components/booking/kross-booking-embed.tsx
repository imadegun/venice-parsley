'use client'

interface KrossBookingEmbedProps {
  className?: string
}

export function KrossBookingEmbed({ className = '' }: KrossBookingEmbedProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full overflow-hidden rounded-lg border" style={{ height: '85vh', minHeight: '600px' }}>
        <iframe
          src="https://venice-parsley.kross.travel/"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          title="Booking System"
          allowFullScreen
        />
      </div>
    </div>
  )
}
