-- Create function to sync email changes across tables
CREATE OR REPLACE FUNCTION public.sync_user_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if email actually changed
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    
    -- Update subscribers table
    UPDATE public.subscribers
    SET email = NEW.email,
        updated_at = NOW()
    WHERE user_id = NEW.id;
    
    -- Update contacts table
    UPDATE public.contacts
    SET email = NEW.email
    WHERE user_id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to sync email changes
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.sync_user_email_change();