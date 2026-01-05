-- Add RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_app_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all subscribers
CREATE POLICY "Admins can view all subscribers" 
ON public.subscribers 
FOR SELECT 
USING (public.has_app_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all contributors
CREATE POLICY "Admins can view all contributors" 
ON public.contributors 
FOR SELECT 
USING (public.has_app_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all gift subscriptions
CREATE POLICY "Admins can view all gift subscriptions" 
ON public.gift_subscriptions 
FOR SELECT 
USING (public.has_app_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all payment events
CREATE POLICY "Admins can view all payment events" 
ON public.payment_events 
FOR SELECT 
USING (public.has_app_role(auth.uid(), 'admin'));