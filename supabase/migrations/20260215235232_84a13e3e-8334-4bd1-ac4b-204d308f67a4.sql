
-- Fix overly permissive INSERT policy
DROP POLICY "Service role can insert notifications" ON public.user_notifications;

-- Only allow users to insert their own notifications (edge functions use service role which bypasses RLS)
CREATE POLICY "Users can insert own notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
