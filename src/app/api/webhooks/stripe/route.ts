import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Get booking ID from metadata
    const bookingId = session.metadata?.booking_id
    if (!bookingId) {
      console.error('No booking ID in session metadata')
      return NextResponse.json({ received: true })
    }

    const supabase = createServerSupabaseClient()

    // Update booking status to confirmed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking status:', updateError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Get booking details
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, apartments(name)')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      console.error('Booking not found')
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Send confirmation email
    const apartmentName = (booking.apartments as any)?.name?.en || (booking.apartments as any)?.name || 'Apartment'

    try {
      await resend.emails.send({
        from: 'noreply@resend.com',
        to: session.customer_details?.email || booking.contact_info?.guest_email,
        subject: `Booking Confirmed - ${apartmentName}`,
        html: `
          <h1>Booking Confirmed!</h1>
          <p>Dear ${booking.contact_info?.guest_name || 'Guest'},</p>
          <p>Your booking for ${apartmentName} has been confirmed.</p>
          <p><strong>Booking ID:</strong> ${booking.id.slice(0, 8).toUpperCase()}</p>
          <p><strong>Check-in:</strong> ${booking.check_in_date}</p>
          <p><strong>Check-out:</strong> ${booking.check_out_date}</p>
          <p><strong>Guests:</strong> ${booking.total_guests || 1}</p>
          <p><strong>Total:</strong> €${(booking.total_cents / 100).toFixed(2)}</p>
          <p>Thank you for choosing us!</p>
        `,
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the webhook for email errors
    }
  }

  return NextResponse.json({ received: true })
}