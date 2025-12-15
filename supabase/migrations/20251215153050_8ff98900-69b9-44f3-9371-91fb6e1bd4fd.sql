-- Fix profile for michaeljlewis2@gmail.com (user_id: b9bc021c-19d8-47ec-90fc-ee6434c85439)
UPDATE profiles 
SET plan_status = 'active', 
    property_limit = 3, 
    storage_quota_gb = 25,
    plan_id = 'standard',
    updated_at = NOW()
WHERE user_id = 'b9bc021c-19d8-47ec-90fc-ee6434c85439';