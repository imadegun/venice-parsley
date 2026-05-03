// DISABLED: Using Payment Links only via /api/booking/create-payment-intent
// See: src/components/booking/embedded-booking-flow.tsx

export async function POST(request: Request) {
  return new Response(
    JSON.stringify({ 
      error: 'Booking endpoint disabled. Use Payment Links flow instead.' 
    }),
    { 
      status: 410, 
      headers: { 'Content-Type': 'application/json' } 
    }
  )
}

