-- Clean up orphan contributor record for michaeljlewis2@gmail.com
-- The account_owner_id e1046548-0b6f-4fbe-8eac-f0a314983856 no longer exists
DELETE FROM public.contributors 
WHERE id = 'bb682f25-f93e-42a2-8931-57ea5fd17e72';

-- Also clean up any other orphan contributor records where account owner no longer exists
DELETE FROM public.contributors c
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = c.account_owner_id
);