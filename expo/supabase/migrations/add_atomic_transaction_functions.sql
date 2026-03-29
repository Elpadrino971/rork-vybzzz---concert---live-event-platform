-- ============================================
-- ATOMIC TRANSACTION FUNCTIONS
-- ============================================
-- These functions ensure data consistency by wrapping
-- multiple operations in a single database transaction

-- ============================================
-- 1. Confirm Ticket Purchase (called by webhook)
-- ============================================
-- This function atomically:
-- - Updates ticket status to 'confirmed'
-- - Increments event attendee count
-- - Confirms affiliate commissions
CREATE OR REPLACE FUNCTION confirm_ticket_purchase(
  p_payment_intent_id TEXT
)
RETURNS TABLE (
  ticket_id UUID,
  event_id UUID,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket_id UUID;
  v_event_id UUID;
  v_affiliate_id UUID;
BEGIN
  -- Start transaction (implicit in function)

  -- Update ticket status
  UPDATE tickets
  SET
    status = 'confirmed',
    updated_at = NOW()
  WHERE payment_intent_id = p_payment_intent_id
  RETURNING id, event_id, affiliate_id
  INTO v_ticket_id, v_event_id, v_affiliate_id;

  -- Check if ticket was found
  IF v_ticket_id IS NULL THEN
    RETURN QUERY SELECT
      NULL::UUID,
      NULL::UUID,
      FALSE,
      'Ticket not found'::TEXT;
    RETURN;
  END IF;

  -- Increment event attendee count
  UPDATE events
  SET
    current_attendees = current_attendees + 1,
    updated_at = NOW()
  WHERE id = v_event_id;

  -- Confirm affiliate commissions if exists
  IF v_affiliate_id IS NOT NULL THEN
    UPDATE affiliate_commissions
    SET
      status = 'confirmed',
      updated_at = NOW()
    WHERE ticket_id = v_ticket_id
      AND status = 'pending';
  END IF;

  -- Return success
  RETURN QUERY SELECT
    v_ticket_id,
    v_event_id,
    TRUE,
    NULL::TEXT;
END;
$$;

-- ============================================
-- 2. Process Event Payout (called by cron)
-- ============================================
-- This function atomically:
-- - Calculates artist payout amount
-- - Creates payout record
-- - Updates event status
CREATE OR REPLACE FUNCTION process_event_payout(
  p_event_id UUID
)
RETURNS TABLE (
  payout_id UUID,
  artist_id UUID,
  amount DECIMAL,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_event RECORD;
  v_total_revenue DECIMAL;
  v_artist_share DECIMAL;
  v_platform_fee DECIMAL;
  v_payout_id UUID;
  v_subscription_tier TEXT;
  v_artist_share_rate DECIMAL;
BEGIN
  -- Get event details
  SELECT
    e.*,
    a.subscription_tier,
    a.id as artist_id
  INTO v_event
  FROM events e
  JOIN artists a ON a.id = e.artist_id
  WHERE e.id = p_event_id;

  -- Check if event exists
  IF v_event.id IS NULL THEN
    RETURN QUERY SELECT
      NULL::UUID,
      NULL::UUID,
      NULL::DECIMAL,
      FALSE,
      'Event not found'::TEXT;
    RETURN;
  END IF;

  -- Check if event is eligible for payout (must be ended + 21 days)
  IF v_event.ended_at IS NULL OR v_event.ended_at > NOW() - INTERVAL '21 days' THEN
    RETURN QUERY SELECT
      NULL::UUID,
      v_event.artist_id,
      NULL::DECIMAL,
      FALSE,
      'Event not eligible for payout yet (J+21 required)'::TEXT;
    RETURN;
  END IF;

  -- Check if already paid
  IF EXISTS (
    SELECT 1 FROM payouts
    WHERE event_id = p_event_id
    AND status IN ('completed', 'processing')
  ) THEN
    RETURN QUERY SELECT
      NULL::UUID,
      v_event.artist_id,
      NULL::DECIMAL,
      FALSE,
      'Payout already processed'::TEXT;
    RETURN;
  END IF;

  -- Calculate total revenue from tickets
  SELECT COALESCE(SUM(purchase_price), 0)
  INTO v_total_revenue
  FROM tickets
  WHERE event_id = p_event_id
    AND status = 'confirmed';

  -- Calculate artist share based on subscription tier
  v_artist_share_rate := CASE v_event.subscription_tier
    WHEN 'starter' THEN 0.50
    WHEN 'pro' THEN 0.60
    WHEN 'elite' THEN 0.70
    ELSE 0.50
  END;

  v_artist_share := v_total_revenue * v_artist_share_rate;
  v_platform_fee := v_total_revenue - v_artist_share;

  -- Create payout record
  INSERT INTO payouts (
    event_id,
    artist_id,
    amount,
    platform_fee,
    subscription_tier,
    status,
    scheduled_for
  )
  VALUES (
    p_event_id,
    v_event.artist_id,
    v_artist_share,
    v_platform_fee,
    v_event.subscription_tier,
    'pending',
    NOW()
  )
  RETURNING id INTO v_payout_id;

  -- Update event status
  UPDATE events
  SET
    payout_status = 'pending',
    updated_at = NOW()
  WHERE id = p_event_id;

  -- Return success
  RETURN QUERY SELECT
    v_payout_id,
    v_event.artist_id,
    v_artist_share,
    TRUE,
    NULL::TEXT;
END;
$$;

-- ============================================
-- 3. Cancel Ticket (with refund)
-- ============================================
-- This function atomically:
-- - Updates ticket status to 'refunded'
-- - Decrements event attendee count
-- - Cancels affiliate commissions
CREATE OR REPLACE FUNCTION cancel_ticket(
  p_ticket_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_event_id UUID;
  v_affiliate_id UUID;
  v_ticket_status TEXT;
BEGIN
  -- Get ticket details
  SELECT event_id, affiliate_id, status
  INTO v_event_id, v_affiliate_id, v_ticket_status
  FROM tickets
  WHERE id = p_ticket_id;

  -- Check if ticket exists
  IF v_event_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Ticket not found'::TEXT;
    RETURN;
  END IF;

  -- Check if ticket is already refunded/cancelled
  IF v_ticket_status IN ('refunded', 'cancelled') THEN
    RETURN QUERY SELECT FALSE, 'Ticket already cancelled'::TEXT;
    RETURN;
  END IF;

  -- Update ticket status
  UPDATE tickets
  SET
    status = 'refunded',
    updated_at = NOW()
  WHERE id = p_ticket_id;

  -- Decrement event attendee count (only if was confirmed)
  IF v_ticket_status = 'confirmed' THEN
    UPDATE events
    SET
      current_attendees = GREATEST(current_attendees - 1, 0),
      updated_at = NOW()
    WHERE id = v_event_id;
  END IF;

  -- Cancel affiliate commissions
  IF v_affiliate_id IS NOT NULL THEN
    UPDATE affiliate_commissions
    SET
      status = 'cancelled',
      updated_at = NOW()
    WHERE ticket_id = p_ticket_id
      AND status IN ('pending', 'confirmed');
  END IF;

  -- Return success
  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$;

-- ============================================
-- 4. Complete Tip Payment (called by webhook)
-- ============================================
-- This function atomically:
-- - Updates tip status to 'completed'
-- - Updates artist total tips received
CREATE OR REPLACE FUNCTION complete_tip_payment(
  p_payment_intent_id TEXT
)
RETURNS TABLE (
  tip_id UUID,
  artist_id UUID,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tip_id UUID;
  v_artist_id UUID;
  v_amount DECIMAL;
BEGIN
  -- Update tip status
  UPDATE tips
  SET
    status = 'completed',
    updated_at = NOW()
  WHERE payment_intent_id = p_payment_intent_id
  RETURNING id, to_artist_id, amount
  INTO v_tip_id, v_artist_id, v_amount;

  -- Check if tip was found
  IF v_tip_id IS NULL THEN
    RETURN QUERY SELECT
      NULL::UUID,
      NULL::UUID,
      FALSE,
      'Tip not found'::TEXT;
    RETURN;
  END IF;

  -- Update artist stats (total tips received)
  UPDATE artists
  SET
    total_tips_received = COALESCE(total_tips_received, 0) + v_amount,
    updated_at = NOW()
  WHERE id = v_artist_id;

  -- Return success
  RETURN QUERY SELECT
    v_tip_id,
    v_artist_id,
    TRUE,
    NULL::TEXT;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION confirm_ticket_purchase IS 'Atomically confirms a ticket purchase after successful payment';
COMMENT ON FUNCTION process_event_payout IS 'Atomically processes J+21 payout for an event';
COMMENT ON FUNCTION cancel_ticket IS 'Atomically cancels a ticket and updates all related data';
COMMENT ON FUNCTION complete_tip_payment IS 'Atomically completes a tip payment and updates artist stats';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- These functions should only be callable by the service role
GRANT EXECUTE ON FUNCTION confirm_ticket_purchase TO service_role;
GRANT EXECUTE ON FUNCTION process_event_payout TO service_role;
GRANT EXECUTE ON FUNCTION cancel_ticket TO service_role;
GRANT EXECUTE ON FUNCTION complete_tip_payment TO service_role;
