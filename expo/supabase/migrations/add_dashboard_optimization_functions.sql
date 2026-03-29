-- ============================================
-- DASHBOARD OPTIMIZATION FUNCTIONS
-- ============================================
-- These RPC functions consolidate multiple queries into single
-- database calls to eliminate N+1 query problems

-- ============================================
-- 1. Get Artist Dashboard (optimized)
-- ============================================
-- Replaces 6 separate queries with 1 RPC function
-- Returns all dashboard data in a single call
CREATE OR REPLACE FUNCTION get_artist_dashboard(p_artist_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSON;
  v_artist RECORD;
  v_subscription_tier TEXT;
  v_tier_share DECIMAL;
BEGIN
  -- Get artist profile
  SELECT * INTO v_artist
  FROM artists
  WHERE id = p_artist_id;

  IF v_artist IS NULL THEN
    RETURN json_build_object('error', 'Artist not found');
  END IF;

  -- Determine revenue share based on tier
  v_subscription_tier := v_artist.subscription_tier;
  v_tier_share := CASE v_subscription_tier
    WHEN 'starter' THEN 0.5
    WHEN 'pro' THEN 0.6
    WHEN 'elite' THEN 0.7
    ELSE 0.5
  END;

  -- Build complete dashboard data in one query
  SELECT json_build_object(
    'artist', json_build_object(
      'id', v_artist.id,
      'stageName', v_artist.stage_name,
      'bio', v_artist.bio,
      'avatarUrl', v_artist.avatar_url,
      'bannerUrl', v_artist.banner_url,
      'instagramHandle', v_artist.instagram_handle,
      'tiktokHandle', v_artist.tiktok_handle,
      'youtubeChannel', v_artist.youtube_channel,
      'totalFollowers', v_artist.total_followers,
      'totalEvents', v_artist.total_events
    ),
    'subscription', json_build_object(
      'tier', v_artist.subscription_tier,
      'active', v_artist.subscription_ends_at IS NULL OR v_artist.subscription_ends_at > NOW(),
      'endsAt', v_artist.subscription_ends_at,
      'daysRemaining', CASE
        WHEN v_artist.subscription_ends_at IS NOT NULL
        THEN CEIL(EXTRACT(EPOCH FROM (v_artist.subscription_ends_at - NOW())) / 86400)
        ELSE NULL
      END,
      'stripeConnectCompleted', v_artist.stripe_connect_completed
    ),
    'events', (
      SELECT json_build_object(
        'counts', json_build_object(
          'total', COUNT(*),
          'draft', COUNT(*) FILTER (WHERE status = 'draft'),
          'scheduled', COUNT(*) FILTER (WHERE status = 'scheduled'),
          'live', COUNT(*) FILTER (WHERE status = 'live'),
          'ended', COUNT(*) FILTER (WHERE status = 'ended'),
          'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled')
        ),
        'recent', (
          SELECT COALESCE(json_agg(e ORDER BY e.scheduled_at DESC), '[]'::json)
          FROM (
            SELECT id, title, status, scheduled_at, ticket_price, current_attendees, max_attendees
            FROM events
            WHERE artist_id = p_artist_id
            ORDER BY scheduled_at DESC
            LIMIT 5
          ) e
        )
      )
      FROM events
      WHERE artist_id = p_artist_id
    ),
    'tickets', (
      SELECT json_build_object(
        'total', COUNT(*),
        'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'failed', COUNT(*) FILTER (WHERE status IN ('failed', 'refunded'))
      )
      FROM tickets t
      INNER JOIN events e ON e.id = t.event_id
      WHERE e.artist_id = p_artist_id
    ),
    'revenue', (
      SELECT json_build_object(
        'total', COALESCE(SUM(t.purchase_price), 0),
        'artistShare', COALESCE(SUM(t.purchase_price), 0) * v_tier_share,
        'platformShare', COALESCE(SUM(t.purchase_price), 0) * (1 - v_tier_share),
        'fromTips', (
          SELECT COALESCE(SUM(amount), 0) * 0.9
          FROM tips
          WHERE to_artist_id = p_artist_id AND status = 'completed'
        ),
        'totalEarnings', (
          COALESCE(SUM(t.purchase_price), 0) * v_tier_share
        ) + (
          SELECT COALESCE(SUM(amount), 0) * 0.9
          FROM tips
          WHERE to_artist_id = p_artist_id AND status = 'completed'
        )
      )
      FROM tickets t
      INNER JOIN events e ON e.id = t.event_id
      WHERE e.artist_id = p_artist_id AND t.status = 'confirmed'
    ),
    'tips', (
      SELECT json_build_object(
        'stats', json_build_object(
          'total', COUNT(*),
          'totalAmount', COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0)
        ),
        'recent', (
          SELECT COALESCE(json_agg(tip_data ORDER BY tip_data.created_at DESC), '[]'::json)
          FROM (
            SELECT
              t.id,
              t.amount,
              t.message,
              t.status,
              t.created_at,
              json_build_object(
                'fullName', p.full_name,
                'avatarUrl', p.avatar_url
              ) as fan
            FROM tips t
            LEFT JOIN profiles p ON p.id = t.from_user_id
            WHERE t.to_artist_id = p_artist_id
            ORDER BY t.created_at DESC
            LIMIT 5
          ) tip_data
        )
      )
      FROM tips
      WHERE to_artist_id = p_artist_id
    ),
    'payouts', (
      SELECT json_build_object(
        'totalPaid', COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0),
        'nextPayout', (
          SELECT row_to_json(p)
          FROM (
            SELECT id, amount, scheduled_for as "scheduledAt", status
            FROM payouts
            WHERE artist_id = p_artist_id
              AND status IN ('pending', 'processing')
            ORDER BY scheduled_for ASC
            LIMIT 1
          ) p
        ),
        'recent', (
          SELECT COALESCE(json_agg(payout_data ORDER BY payout_data.scheduled_for DESC), '[]'::json)
          FROM (
            SELECT id, amount, scheduled_for as "scheduledAt", paid_at as "paidAt", status
            FROM payouts
            WHERE artist_id = p_artist_id
            ORDER BY scheduled_for DESC
            LIMIT 5
          ) payout_data
        )
      )
      FROM payouts
      WHERE artist_id = p_artist_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================
-- 2. Get Fan Dashboard (optimized)
-- ============================================
-- Replaces 5 separate queries with 1 RPC function
CREATE OR REPLACE FUNCTION get_fan_dashboard(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT row_to_json(p)
      FROM (
        SELECT id, full_name, email, avatar_url, bio, city, country
        FROM profiles
        WHERE id = p_user_id
      ) p
    ),
    'tickets', (
      SELECT json_build_object(
        'stats', json_build_object(
          'total', COUNT(*),
          'upcoming', COUNT(*) FILTER (WHERE e.scheduled_at > NOW() AND e.status IN ('scheduled', 'live')),
          'past', COUNT(*) FILTER (WHERE e.ended_at < NOW() OR e.status = 'ended')
        ),
        'upcoming', (
          SELECT COALESCE(json_agg(ticket_data ORDER BY ticket_data.scheduled_at ASC), '[]'::json)
          FROM (
            SELECT
              t.id,
              t.purchase_price as "purchasePrice",
              t.is_happy_hour as "isHappyHour",
              t.status,
              json_build_object(
                'id', e.id,
                'title', e.title,
                'scheduledAt', e.scheduled_at,
                'thumbnailUrl', e.thumbnail_url,
                'status', e.status,
                'artist', json_build_object(
                  'id', a.id,
                  'stageName', a.stage_name,
                  'avatarUrl', a.avatar_url
                )
              ) as event
            FROM tickets t
            INNER JOIN events e ON e.id = t.event_id
            INNER JOIN artists a ON a.id = e.artist_id
            WHERE t.user_id = p_user_id
              AND e.scheduled_at > NOW()
              AND e.status IN ('scheduled', 'live')
            ORDER BY e.scheduled_at ASC
            LIMIT 10
          ) ticket_data
        ),
        'past', (
          SELECT COALESCE(json_agg(ticket_data ORDER BY ticket_data.ended_at DESC), '[]'::json)
          FROM (
            SELECT
              t.id,
              t.purchase_price as "purchasePrice",
              json_build_object(
                'id', e.id,
                'title', e.title,
                'endedAt', e.ended_at,
                'thumbnailUrl', e.thumbnail_url
              ) as event
            FROM tickets t
            INNER JOIN events e ON e.id = t.event_id
            WHERE t.user_id = p_user_id
              AND (e.ended_at < NOW() OR e.status = 'ended')
            ORDER BY e.ended_at DESC
            LIMIT 10
          ) ticket_data
        )
      )
      FROM tickets t
      INNER JOIN events e ON e.id = t.event_id
      WHERE t.user_id = p_user_id
    ),
    'following', (
      SELECT json_build_object(
        'total', COUNT(*),
        'artists', (
          SELECT COALESCE(json_agg(artist_data), '[]'::json)
          FROM (
            SELECT
              a.id,
              a.stage_name as "stageName",
              a.avatar_url as "avatarUrl",
              a.genre,
              af.followed_at as "followedAt"
            FROM artist_followers af
            INNER JOIN artists a ON a.id = af.artist_id
            WHERE af.fan_id = p_user_id
            ORDER BY af.followed_at DESC
            LIMIT 20
          ) artist_data
        )
      )
      FROM artist_followers
      WHERE fan_id = p_user_id
    ),
    'tips', (
      SELECT json_build_object(
        'total', COUNT(*),
        'totalAmount', COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0),
        'recent', (
          SELECT COALESCE(json_agg(tip_data ORDER BY tip_data.created_at DESC), '[]'::json)
          FROM (
            SELECT
              t.id,
              t.amount,
              t.message,
              t.status,
              t.created_at as "createdAt",
              json_build_object(
                'id', a.id,
                'stageName', a.stage_name,
                'avatarUrl', a.avatar_url
              ) as artist
            FROM tips t
            INNER JOIN artists a ON a.id = t.to_artist_id
            WHERE t.from_user_id = p_user_id
            ORDER BY t.created_at DESC
            LIMIT 10
          ) tip_data
        )
      )
      FROM tips
      WHERE from_user_id = p_user_id
    ),
    'spending', (
      SELECT json_build_object(
        'totalTickets', COALESCE(SUM(t.purchase_price), 0),
        'totalTips', (
          SELECT COALESCE(SUM(amount), 0)
          FROM tips
          WHERE from_user_id = p_user_id AND status = 'completed'
        ),
        'totalSpent', COALESCE(SUM(t.purchase_price), 0) + (
          SELECT COALESCE(SUM(amount), 0)
          FROM tips
          WHERE from_user_id = p_user_id AND status = 'completed'
        )
      )
      FROM tickets t
      WHERE t.user_id = p_user_id AND t.status = 'confirmed'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION get_artist_dashboard IS 'Optimized dashboard for artists - replaces 6 queries with 1 RPC call';
COMMENT ON FUNCTION get_fan_dashboard IS 'Optimized dashboard for fans - replaces 5 queries with 1 RPC call';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION get_artist_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_fan_dashboard TO authenticated;
