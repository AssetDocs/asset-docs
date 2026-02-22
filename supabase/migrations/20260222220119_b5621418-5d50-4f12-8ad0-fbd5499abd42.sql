
-- Add new billing columns to entitlements table
ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_plan_price_id text,
  ADD COLUMN IF NOT EXISTS plan_lookup_key text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS base_storage_gb integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_addon_blocks_qty integer NOT NULL DEFAULT 0;

-- Add generated column for total storage
ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS total_storage_gb integer GENERATED ALWAYS AS (base_storage_gb + (storage_addon_blocks_qty * 25)) STORED;

-- Create index on stripe identifiers for webhook lookups
CREATE INDEX IF NOT EXISTS idx_entitlements_stripe_customer_id ON public.entitlements (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_stripe_subscription_id ON public.entitlements (stripe_subscription_id);
