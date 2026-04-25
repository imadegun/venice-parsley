'use client'

import { useEffect } from 'react'

export default function PaymentReturnPage() {
  useEffect(() => {
    const lastBookingId = sessionStorage.getItem('lastBookingId')
    if (lastBookingId) {
      sessionStorage.removeItem('lastBookingId')
      window.location.href = `/booking/confirmation/${lastBookingId}`
    } else {
      // No booking ID found, redirect to home
      window.location.href = '/'
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing your payment...</p>
      </div>
    </div>
  )
}
