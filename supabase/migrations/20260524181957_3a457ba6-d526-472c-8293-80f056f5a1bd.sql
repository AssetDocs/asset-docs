
-- 1. Restrict storage_usage writes to service_role only
DROP POLICY IF EXISTS "Users can insert their own storage usage" ON public.storage_usage;
DROP POLICY IF EXISTS "Users can update their own storage usage" ON public.storage_usage;

CREATE POLICY "Service role can insert storage usage"
  ON public.storage_usage FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update storage usage"
  ON public.storage_usage FOR UPDATE
  TO service_role
  USING (true) WITH CHECK (true);

-- 2. Restrict user_notifications inserts to service_role only (prevents users forging system notifications)
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.user_notifications;

CREATE POLICY "Service role can insert notifications"
  ON public.user_notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. Add RLS policies on realtime.messages to prevent unauthenticated channel subscriptions
-- Allow only authenticated users to use realtime; further per-topic restrictions can be added later.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='realtime' AND c.relname='messages') THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can receive realtime messages" ON realtime.messages';
    EXECUTE 'CREATE POLICY "Authenticated users can receive realtime messages" ON realtime.messages FOR SELECT TO authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can send realtime messages" ON realtime.messages';
    EXECUTE 'CREATE POLICY "Authenticated users can send realtime messages" ON realtime.messages FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
END $$;
