import { supabase } from '@/integrations/supabase/client';

export async function track(event: string, props: Record<string, any> = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const body = {
      event,
      props,
      path: location.pathname,
      referrer: document.referrer,
      utm: Object.fromEntries(new URLSearchParams(location.search).entries()),
      occurred_at: new Date().toISOString()
    };

    const headers: HeadersInit = {
      "content-type": "application/json"
    };

    // Add auth token if available
    if (session?.access_token) {
      headers["authorization"] = `Bearer ${session.access_token}`;
    }

    await fetch(`https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/track`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error('Tracking error:', error);
  }
}