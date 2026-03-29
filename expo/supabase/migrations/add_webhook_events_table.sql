-- Add webhook_events table for idempotency
-- This table stores processed Stripe webhook events to prevent duplicate processing

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on stripe_event_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);

-- Index on event_type for analytics
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);

-- Index on processed_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

-- Enable Row Level Security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage webhook events
CREATE POLICY "Service role can manage webhook events"
  ON webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Optional: Cleanup function to delete old webhook events (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM webhook_events
  WHERE processed_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Comment on table
COMMENT ON TABLE webhook_events IS 'Stores processed Stripe webhook events to ensure idempotency and prevent duplicate processing';
COMMENT ON COLUMN webhook_events.stripe_event_id IS 'Unique Stripe event ID (e.g., evt_1234...)';
COMMENT ON COLUMN webhook_events.event_type IS 'Type of webhook event (e.g., payment_intent.succeeded)';
COMMENT ON COLUMN webhook_events.payload IS 'Full webhook event payload from Stripe';
