ALTER TABLE public.vip_contact_attachments
  DROP CONSTRAINT vip_contact_attachments_contact_id_fkey;

ALTER TABLE public.vip_contact_attachments
  ADD CONSTRAINT vip_contact_attachments_contact_id_fkey
  FOREIGN KEY (contact_id) REFERENCES public.vip_contacts(id) ON DELETE RESTRICT;