import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerSupabaseClient()

    // Fetch all non-cancelled bookings for this apartment
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date, status, check_in_actual, check_out_actual')
      .eq('apartment_id', id)
      .neq('status', 'cancelled')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process bookings to get booked date ranges
    const bookedDates: string[] = []
    const pendingDates: string[] = []

    bookings?.forEach(booking => {
      // Skip cancelled bookings
      if (booking.status === 'cancelled') return

      // For completed bookings that have actually checked out, don't block future dates
      if (booking.status === 'completed' && booking.check_out_actual) {
        const checkOutActual = new Date(booking.check_out_actual)
        if (new Date() > checkOutActual) {
          return
        }
      }

      // Use actual dates if available, otherwise scheduled dates
      const checkIn = booking.check_in_actual || booking.check_in_date
      const checkOut = booking.check_out_actual || booking.check_out_date

      if (!checkIn || !checkOut) return

      const startDate = new Date(checkIn)
      const endDate = new Date(checkOut)

      // Add all dates from check-in to check-out (excluding check-out date)
      const current = new Date(startDate)
      while (current < endDate) {
        const dateStr = current.toISOString().split('T')[0] // yyyy-MM-dd
        if (booking.status === 'confirmed') {
          bookedDates.push(dateStr)
        } else if (booking.status === 'pending') {
          pendingDates.push(dateStr)
        } else {
          bookedDates.push(dateStr)
        }
        current.setDate(current.getDate() + 1)
      }
    })

    return NextResponse.json({
      bookedDates: [...new Set(bookedDates)], // Remove duplicates
      pendingDates: [...new Set(pendingDates)]
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}