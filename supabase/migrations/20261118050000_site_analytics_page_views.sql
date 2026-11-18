-- First-party site analytics: one row per page view.
-- Anyone (signed in or not) may INSERT their own page views; nobody can read
-- raw rows through the API. Admins read aggregates via get_site_analytics().

CREATE TABLE IF NOT EXISTS public.page_views (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_id  text        NOT NULL CHECK (char_length(visitor_id) BETWEEN 8 AND 64),
  session_id  text        NOT NULL CHECK (char_length(session_id) BETWEEN 8 AND 64),
  path        text        NOT NULL CHECK (char_length(path) BETWEEN 1 AND 512),
  referrer    text        CHECK (referrer IS NULL OR char_length(referrer) <= 512),
  browser     text        CHECK (browser IS NULL OR char_length(browser) <= 32),
  os          text        CHECK (os IS NULL OR char_length(os) <= 32),
  device_type text        CHECK (device_type IS NULL OR device_type IN ('desktop', 'mobile', 'tablet')),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_session_idx    ON public.page_views (session_id, created_at);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Visitors can record views. A signed-in user may only attribute a view to
-- themselves; anonymous visitors must leave user_id empty. created_at is
-- pinned near now() so rows can't be back-dated to skew history.
DROP POLICY IF EXISTS "Anyone can record page views" ON public.page_views;
CREATE POLICY "Anyone can record page views"
  ON public.page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '5 minutes'
  );

-- Admins may read raw rows (e.g. for exports); everyone else cannot.
DROP POLICY IF EXISTS "Admins can read page views" ON public.page_views;
CREATE POLICY "Admins can read page views"
  ON public.page_views
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;

-- Aggregated analytics for the admin dashboard.
CREATE OR REPLACE FUNCTION public.get_site_analytics(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _since  timestamptz;
  _prev   timestamptz;
  _result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can view site analytics' USING ERRCODE = '42501';
  END IF;

  _days  := LEAST(GREATEST(COALESCE(_days, 30), 1), 365);
  _since := now() - make_interval(days => _days);
  _prev  := _since - make_interval(days => _days);

  WITH v AS (
    SELECT * FROM public.page_views WHERE created_at >= _since
  ),
  sessions AS (
    SELECT session_id,
           count(*)                                              AS views,
           EXTRACT(EPOCH FROM max(created_at) - min(created_at)) AS duration_sec
    FROM v
    GROUP BY session_id
  )
  SELECT jsonb_build_object(
    'days',                 _days,
    'unique_visitors',      (SELECT count(DISTINCT visitor_id) FROM v),
    'page_views',           (SELECT count(*) FROM v),
    'sessions',             (SELECT count(*) FROM sessions),
    'signed_in_visitors',   (SELECT count(DISTINCT user_id) FROM v WHERE user_id IS NOT NULL),
    'avg_session_sec',      (SELECT COALESCE(round(avg(duration_sec)), 0) FROM sessions),
    'pages_per_session',    (SELECT COALESCE(round(avg(views)::numeric, 1), 0) FROM sessions),
    'active_now',           (SELECT count(DISTINCT visitor_id) FROM public.page_views
                               WHERE created_at >= now() - interval '5 minutes'),
    'prev_unique_visitors', (SELECT count(DISTINCT visitor_id) FROM public.page_views
                               WHERE created_at >= _prev AND created_at < _since),
    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('date', d.day, 'visitors', d.visitors, 'views', d.views) ORDER BY d.day)
      FROM (
        SELECT gs::date AS day,
               count(DISTINCT v.visitor_id) AS visitors,
               count(v.id)                  AS views
        FROM generate_series(_since::date, now()::date, interval '1 day') gs
        LEFT JOIN v ON v.created_at::date = gs::date
        GROUP BY gs
      ) d
    ), '[]'::jsonb),
    'top_pages', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.views DESC)
      FROM (
        SELECT path, count(*) AS views, count(DISTINCT visitor_id) AS visitors
        FROM v GROUP BY path ORDER BY count(*) DESC LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_referrers', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.visitors DESC)
      FROM (
        SELECT referrer, count(DISTINCT visitor_id) AS visitors
        FROM v WHERE referrer IS NOT NULL AND referrer <> ''
        GROUP BY referrer ORDER BY count(DISTINCT visitor_id) DESC LIMIT 8
      ) t
    ), '[]'::jsonb),
    'devices', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.visitors DESC)
      FROM (
        SELECT COALESCE(device_type, 'unknown') AS device_type, count(DISTINCT visitor_id) AS visitors
        FROM v GROUP BY 1
      ) t
    ), '[]'::jsonb),
    'recent', COALESCE((
      SELECT jsonb_agg(r ORDER BY r.created_at DESC)
      FROM (
        SELECT path, browser, os, device_type, created_at, (user_id IS NOT NULL) AS signed_in
        FROM public.page_views ORDER BY created_at DESC LIMIT 15
      ) r
    ), '[]'::jsonb)
  ) INTO _result;

  RETURN _result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_site_analytics(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_site_analytics(integer) TO authenticated, service_role;
