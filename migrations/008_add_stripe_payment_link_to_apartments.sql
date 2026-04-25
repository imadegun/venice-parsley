-- Migration to add Stripe Payment Link URL to apartments
-- Each apartment owner creates their own Stripe Payment Link and stores it here

ALTER TABLE apartments ADD COLUMN IF NOT EXISTS stripe_payment_link_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_apartments_stripe_payment_link ON apartments(stripe_payment_link_url);

-- Add comment for documentation
COMMENT ON COLUMN apartments.stripe_payment_link_url IS 'Stripe Payment Link URL for this apartment. Owner creates this in their Stripe dashboard.';
