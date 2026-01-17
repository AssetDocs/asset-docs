-- Set test account AD010110 to inactive (billing period ended 2026-01-15)
UPDATE profiles 
SET plan_status = 'inactive', updated_at = now()
WHERE user_id = 'b9bc021c-19d8-47ec-90fc-ee6434c85439';

-- Also update the subscribers table for consistency
UPDATE subscribers
SET subscribed = false, updated_at = now()
WHERE user_id = 'b9bc021c-19d8-47ec-90fc-ee6434c85439';