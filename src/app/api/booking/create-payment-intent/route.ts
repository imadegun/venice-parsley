import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createServerAuthClient } from '@/lib/supabase-server'

const createPaymentIntentSchema = z.object({
  apartmentId: z.string().uuid(),
  checkInDate: z.string().min(10),
  checkOutDate: z.string().min(10),
  totalGuests: z.number().int().positive(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().nullable().optional(),
  specialRequests: z.string().nullable().optional(),
})

export async function POST(request: Request) {
  try {
    const authClient = await createServerAuthClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          loginUrl: '/login?next=/apartments',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = createPaymentIntentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid booking payload' },
        { status: 400 }
      )
    }

    const payload = parsed.data
    const supabase = createServerSupabaseClient()

    // Get apartment with Stripe Payment Link URL
    const { data: apartment, error: apartmentError } = await supabase
      .from('apartments')
      .select('id, slug, name, base_price_cents, max_guests, is_active, stripe_payment_link_url')
      .eq('id', payload.apartmentId)
      .eq('is_active', true)
      .single()

    if (apartmentError || !apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 })
    }

    if (payload.totalGuests > apartment.max_guests) {
      return NextResponse.json({ error: 'Guest count exceeds apartment capacity' }, { status: 400 })
    }

    const checkIn = new Date(payload.checkInDate)
    const checkOut = new Date(payload.checkOutDate)
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    const totalCents = nights * apartment.base_price_cents

    // Create booking record first
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        apartment_id: apartment.id,
        check_in_date: payload.checkInDate,
        check_out_date: payload.checkOutDate,
        total_guests: payload.totalGuests,
        total_cents: totalCents,
        status: 'pending',
        special_requests: payload.specialRequests || null,
        contact_info: {
          guest_name: payload.guestName,
          guest_email: payload.guestEmail,
          guest_phone: payload.guestPhone || null,
        },
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: bookingError?.message || 'Unable to create booking' }, { status: 500 })
    }

    // Return the apartment's Stripe Payment Link URL for redirect
    // The payment link should be configured by the apartment owner in their Stripe dashboard
    return NextResponse.json({
      bookingId: booking.id,
      paymentUrl: apartment.stripe_payment_link_url || null,
      amount: totalCents,
      currency: 'eur',
      apartmentName: apartment.name,
      nights,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected booking error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}