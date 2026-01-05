-- Add admin role for the main admin user (info@assetdocs.net)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('7f2ee41e-f3be-4921-88d0-b25c6c3f0b8e', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;