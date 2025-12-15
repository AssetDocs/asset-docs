-- Fix storage quota for user who purchased 50GB add-on (user_id: b9bc021c-19d8-47ec-90fc-ee6434c85439)
-- Current quota is 25GB, should be 75GB (25 base + 50 add-on)

UPDATE public.profiles 
SET storage_quota_gb = 75, updated_at = NOW()
WHERE user_id = 'b9bc021c-19d8-47ec-90fc-ee6434c85439';