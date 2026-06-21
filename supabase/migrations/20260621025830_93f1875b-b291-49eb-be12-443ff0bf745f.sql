
CREATE OR REPLACE FUNCTION public.validate_subscription_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Allow the anonymization path: clearing email while linking to a tombstone.
    IF OLD.email IS DISTINCT FROM NEW.email AND OLD.email IS NOT NULL THEN
      IF NEW.email IS NULL
         AND NEW.deleted_account_id IS NOT NULL
         AND OLD.deleted_account_id IS DISTINCT FROM NEW.deleted_account_id THEN
        -- anonymization: allowed
        NULL;
      ELSE
        RAISE EXCEPTION 'Email address cannot be modified once set';
      END IF;
    END IF;

    IF NEW.subscription_tier IS NOT NULL AND
       NEW.subscription_tier NOT IN ('basic', 'standard', 'premium', 'enterprise') THEN
      RAISE EXCEPTION 'Invalid subscription tier: %', NEW.subscription_tier;
    END IF;

    IF NEW.subscribed = true AND NEW.subscription_end IS NOT NULL AND NEW.subscription_end < NOW() THEN
      RAISE EXCEPTION 'Cannot set active subscription with past end date';
    END IF;

    NEW.updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$function$;
