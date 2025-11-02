import { supabase } from "@/integrations/supabase/client";

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

    const headers: Record<string, string> = {
      "content-type": "application/json"
    };

    // Add auth token if user is logged in
    if (session?.access_token) {
      headers["authorization"] = `Bearer ${session.access_token}`;
    }

    await supabase.functions.invoke('track', {
      body,
      headers
    });
  } catch (error) {
    console.error('Track error:', error);
  }
}