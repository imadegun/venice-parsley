import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerAuthClient } from '@/lib/supabase-server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function MyBookingsPage() {
  const authClient = await createServerAuthClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    redirect('/login?next=/bookings')
  }

  const supabase = createServerSupabaseClient()
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, check_in_date, check_out_date, total_guests, total_cents, status, created_at, apartments(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  // Function to create Stripe checkout session
  async function createCheckoutSession(bookingId: string, amount: number, apartmentName: string) {
    'use server'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Booking for ${apartmentName}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/confirmation/${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings`,
      metadata: {
        booking_id: bookingId,
      },
    })

    redirect(session.url!)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">My Bookings</h1>
        <p className="text-gray-600">Track your reservations and payment status.</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-gray-600">No bookings yet.</p>
            <Button asChild>
              <Link href="/apartments">Browse apartments</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const apartmentName = (booking.apartments as any)?.name 
              ? typeof (booking.apartments as any).name === 'object' 
                ? (booking.apartments as any).name?.en || (booking.apartments as any).name?.it || 'Apartment stay'
                : (booking.apartments as any).name
              : 'Apartment stay'

            return (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{apartmentName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <p>
                    Booking ID: <strong>{booking.id}</strong>
                  </p>
                  <p>
                    Dates: <strong>{booking.check_in_date}</strong> to <strong>{booking.check_out_date}</strong>
                  </p>
                  <p>
                    Guests: <strong>{booking.total_guests || 1}</strong>
                  </p>
                  <p>
                    Total: <strong>€{(booking.total_cents / 100).toFixed(2)}</strong>
                  </p>
                  <p>
                    Status: <strong className="uppercase">{booking.status}</strong>
                  </p>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <form action={createCheckoutSession.bind(null, booking.id, booking.total_cents, apartmentName)}>
                        <Button type="submit" size="sm" variant="default">
                          Pay Now
                        </Button>
                      </form>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/booking/confirmation/${booking.id}`}>View details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}

