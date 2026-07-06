COMMENT ON COLUMN public.property_files.pending_delete IS 'Recoverable delete lease flag (cache-buster refresh)';
NOTIFY pgrst, 'reload schema';