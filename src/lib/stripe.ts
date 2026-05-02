import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('Missing Stripe secret key')
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
  }

  return stripeInstance
}

// For backward compatibility, export a getter
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return (getStripe() as any)[prop]
  }
})

export function formatAmount(amount: number): string {
  return `€${(amount / 100).toFixed(2)}`
}

export function centsToEuros(cents: number): number {
  return cents / 100
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}