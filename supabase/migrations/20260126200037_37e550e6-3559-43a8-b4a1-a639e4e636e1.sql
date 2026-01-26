-- Add missing UPDATE policy for property_files
CREATE POLICY "Users can update their own property files" 
ON public.property_files 
FOR UPDATE 
USING ((auth.uid() = user_id) OR has_contributor_access(auth.uid(), 'contributor'::contributor_role))
WITH CHECK ((auth.uid() = user_id) OR has_contributor_access(auth.uid(), 'contributor'::contributor_role));