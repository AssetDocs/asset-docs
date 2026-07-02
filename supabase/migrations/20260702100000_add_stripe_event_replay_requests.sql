ALTER TABLE public.stripe_events
  ADD COLUMN IF NOT EXISTS last_error_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS replay_status text NOT NULL DEFAULT 'not_requested',
  ADD COLUMN IF NOT EXISTS replay_requested_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS replay_requested_by uuid,
  ADD COLUMN IF NOT EXISTS last_replayed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS replay_request_count integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stripe_events_replay_status_check'
      AND conrelid = 'public.stripe_events'::regclass
  ) THEN
    ALTER TABLE public.stripe_events
      ADD CONSTRAINT stripe_events_replay_status_check
      CHECK (replay_status IN ('not_requested', 'requested', 'processing', 'replayed', 'failed', 'cancelled'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_stripe_events_replay_status
  ON public.stripe_events(replay_status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.stripe_event_replay_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL REFERENCES public.stripe_events(stripe_event_id) ON DELETE CASCADE,
  requested_by uuid,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'requested',
  notes text,
  processed_at timestamp with time zone,
  result_outcome text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT stripe_event_replay_requests_status_check
    CHECK (status IN ('requested', 'processing', 'succeeded', 'failed', 'cancelled'))
);

ALTER TABLE public.stripe_event_replay_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages stripe event replay requests"
ON public.stripe_event_replay_requests
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view stripe event replay requests"
ON public.stripe_event_replay_requests
FOR SELECT
USING (public.has_app_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_stripe_event_replay_requests_event
  ON public.stripe_event_replay_requests(stripe_event_id, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_event_replay_requests_status
  ON public.stripe_event_replay_requests(status, requested_at DESC);

CREATE OR REPLACE FUNCTION public.request_stripe_event_replay(
  p_stripe_event_id text,
  p_requested_by uuid,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event public.stripe_events%ROWTYPE;
  v_request_id uuid;
BEGIN
  SELECT *
  INTO v_event
  FROM public.stripe_events
  WHERE stripe_event_id = p_stripe_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'stripe_event_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_event.outcome <> 'error' THEN
    RAISE EXCEPTION 'stripe_event_not_error' USING ERRCODE = 'P0001';
  END IF;

  IF v_event.replay_status IN ('requested', 'processing') THEN
    SELECT id
    INTO v_request_id
    FROM public.stripe_event_replay_requests
    WHERE stripe_event_id = p_stripe_event_id
      AND status IN ('requested', 'processing')
    ORDER BY requested_at DESC
    LIMIT 1;

    RETURN v_request_id;
  END IF;

  INSERT INTO public.stripe_event_replay_requests (
    stripe_event_id,
    requested_by,
    notes,
    status
  )
  VALUES (
    p_stripe_event_id,
    p_requested_by,
    NULLIF(BTRIM(COALESCE(p_notes, '')), ''),
    'requested'
  )
  RETURNING id INTO v_request_id;

  UPDATE public.stripe_events
  SET
    replay_status = 'requested',
    replay_requested_at = now(),
    replay_requested_by = p_requested_by,
    replay_request_count = replay_request_count + 1
  WHERE stripe_event_id = p_stripe_event_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.request_stripe_event_replay(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_stripe_event_replay(text, uuid, text) TO service_role;
