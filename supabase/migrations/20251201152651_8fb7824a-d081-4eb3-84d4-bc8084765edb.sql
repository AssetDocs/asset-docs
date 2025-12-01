ALTER TABLE public.legacy_locker
ADD CONSTRAINT fk_delegate_user FOREIGN KEY (delegate_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.recovery_requests
ADD CONSTRAINT fk_legacy_locker FOREIGN KEY (legacy_locker_id) REFERENCES public.legacy_locker(id) ON DELETE CASCADE;

CREATE INDEX idx_recovery_requests_status ON public.recovery_requests(status);
CREATE INDEX idx_recovery_requests_delegate ON public.recovery_requests(delegate_user_id);
CREATE INDEX idx_recovery_requests_owner ON public.recovery_requests(owner_user_id);