
-- Create user_notifications table to store alerts for users
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'security', 'billing', 'property', 'info'
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.user_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert notifications (from edge functions)
CREATE POLICY "Service role can insert notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (true);

-- Index for quick unread count queries
CREATE INDEX idx_user_notifications_unread ON public.user_notifications (user_id, is_read) WHERE is_read = false;
