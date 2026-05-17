ALTER TABLE public.account_memberships REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.account_memberships;