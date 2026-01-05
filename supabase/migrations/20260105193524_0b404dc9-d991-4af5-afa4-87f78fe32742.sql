-- Add admin role for the primary admin user (support@assetsafe.net)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('e71b4d2e-60d7-45f4-91e6-1480e65fb0f9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;