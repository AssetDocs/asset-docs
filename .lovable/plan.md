Plan: Redeploy the two touched edge functions after the latest push.

1. Inspect the current function code for `create-gift-checkout` and `send-payment-receipt-internal` to confirm the versions to be deployed include the intended changes and any dependencies are referenced correctly (e.g., `send-payment-receipt-internal` imports `_templates/payment-receipt.tsx`).
2. Verify both functions are listed in `supabase/config.toml` or the project configuration so deployment targets the connected Supabase project (`leotcbfpqiekgkgumecn`).
3. Deploy the functions using `supabase--deploy_edge_functions` with:
   - `create-gift-checkout`
   - `send-payment-receipt-internal`
4. Check deployment results for each function and report success/failure.
5. If a deployment fails, inspect the Edge Function logs for the failed function and retry once after resolving any lockfile or dependency issue.

No database migrations or frontend changes are included in this plan.