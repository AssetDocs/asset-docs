// Thin client wrapper around the dispatch-continuity-event edge function.
// Notification failures must never block the originating user action — we log
// to console and let the admin Owner & Risk tab surface failed delivery.
import { supabase } from '@/integrations/supabase/client';

export type ContinuityEvent =
  | 'request_submitted'
  | 'under_review'
  | 'additional_docs_requested'
  | 'owner_disputed'
  | 'freeze_applied'
  | 'approved_next_step'
  | 'transfer_pending_execution'
  | 'transfer_completed'
  | 'denied';

export async function notifyContinuityEvent(
  requestId: string,
  event: ContinuityEvent,
  meta?: Record<string, unknown>,
) {
  try {
    const { data, error } = await supabase.functions.invoke('dispatch-continuity-event', {
      body: { requestId, event, meta },
    });
    if (error) console.warn('[continuity-notify]', event, error.message);
    return data;
  } catch (e) {
    console.warn('[continuity-notify] threw', event, e);
    return null;
  }
}

// Map an account_continuity_requests.status value to the appropriate
// continuity notification event. Returns null when no email should fire.
export function eventForStatus(newStatus: string): ContinuityEvent | null {
  switch (newStatus) {
    case 'under_review': return 'under_review';
    case 'needs_documentation':
    case 'additional_info_requested': return 'additional_docs_requested';
    case 'approved':
    case 'approved_temporary':
    case 'approved_transfer': return 'approved_next_step';
    case 'ownership_transfer_pending':
    case 'transfer_pending': return 'transfer_pending_execution';
    case 'denied': return 'denied';
    case 'completed': return null; // transfer_completed is fired from execution RPC site
    default: return null;
  }
}
