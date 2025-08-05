-- Check which extensions are in public schema and move them to extensions
DO $$
DECLARE
    ext_name text;
    ext_schema text;
BEGIN
    -- Get all extensions in public schema
    FOR ext_name, ext_schema IN 
        SELECT extname, n.nspname 
        FROM pg_extension e 
        JOIN pg_namespace n ON e.extnamespace = n.oid 
        WHERE n.nspname = 'public'
    LOOP
        -- Drop and recreate in extensions schema
        EXECUTE format('DROP EXTENSION IF EXISTS %I CASCADE', ext_name);
        EXECUTE format('CREATE EXTENSION IF NOT EXISTS %I WITH SCHEMA extensions', ext_name);
        RAISE NOTICE 'Moved extension % from public to extensions schema', ext_name;
    END LOOP;
END $$;