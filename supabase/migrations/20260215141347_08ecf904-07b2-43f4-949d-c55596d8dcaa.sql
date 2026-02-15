-- Add INSERT policy for admins on legal_agreement_signatures
CREATE POLICY "Admins can insert legal signatures"
ON public.legal_agreement_signatures
FOR INSERT
WITH CHECK (has_app_role(auth.uid(), 'admin'::app_role));

-- Add UPDATE policy for admins on legal_agreement_signatures
CREATE POLICY "Admins can update legal signatures"
ON public.legal_agreement_signatures
FOR UPDATE
USING (has_app_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_app_role(auth.uid(), 'admin'::app_role));