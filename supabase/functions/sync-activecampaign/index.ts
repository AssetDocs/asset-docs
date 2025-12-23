import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACTIVECAMPAIGN_API_URL = Deno.env.get("ACTIVECAMPAIGN_API_URL");
const ACTIVECAMPAIGN_API_KEY = Deno.env.get("ACTIVECAMPAIGN_API_KEY");

interface SyncRequest {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  marketingEnabled: boolean;
}

async function findContactByEmail(email: string): Promise<number | null> {
  const response = await fetch(
    `${ACTIVECAMPAIGN_API_URL}/api/3/contacts?email=${encodeURIComponent(email)}`,
    {
      headers: {
        "Api-Token": ACTIVECAMPAIGN_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to search for contact:", await response.text());
    return null;
  }

  const data = await response.json();
  if (data.contacts && data.contacts.length > 0) {
    return parseInt(data.contacts[0].id);
  }
  return null;
}

async function createOrUpdateContact(email: string, firstName?: string, lastName?: string): Promise<number | null> {
  const contactData = {
    contact: {
      email,
      firstName: firstName || "",
      lastName: lastName || "",
    },
  };

  // Try to find existing contact first
  const existingId = await findContactByEmail(email);
  
  if (existingId) {
    // Update existing contact
    const response = await fetch(
      `${ACTIVECAMPAIGN_API_URL}/api/3/contacts/${existingId}`,
      {
        method: "PUT",
        headers: {
          "Api-Token": ACTIVECAMPAIGN_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      }
    );

    if (!response.ok) {
      console.error("Failed to update contact:", await response.text());
      return null;
    }

    return existingId;
  } else {
    // Create new contact
    const response = await fetch(
      `${ACTIVECAMPAIGN_API_URL}/api/3/contacts`,
      {
        method: "POST",
        headers: {
          "Api-Token": ACTIVECAMPAIGN_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create contact:", errorText);
      return null;
    }

    const data = await response.json();
    return parseInt(data.contact.id);
  }
}

async function updateContactStatus(contactId: number, subscribed: boolean): Promise<boolean> {
  // Get the first list (or you can specify a list ID)
  const listsResponse = await fetch(
    `${ACTIVECAMPAIGN_API_URL}/api/3/lists`,
    {
      headers: {
        "Api-Token": ACTIVECAMPAIGN_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  if (!listsResponse.ok) {
    console.error("Failed to get lists:", await listsResponse.text());
    return false;
  }

  const listsData = await listsResponse.json();
  if (!listsData.lists || listsData.lists.length === 0) {
    console.log("No lists found in ActiveCampaign, creating contact without list subscription");
    return true; // Contact created, just no list to add to
  }

  const listId = listsData.lists[0].id;

  if (subscribed) {
    // Subscribe to list
    const subscribeData = {
      contactList: {
        list: listId,
        contact: contactId,
        status: 1, // 1 = subscribed
      },
    };

    const response = await fetch(
      `${ACTIVECAMPAIGN_API_URL}/api/3/contactLists`,
      {
        method: "POST",
        headers: {
          "Api-Token": ACTIVECAMPAIGN_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscribeData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Ignore "already subscribed" errors
      if (!errorText.includes("already")) {
        console.error("Failed to subscribe to list:", errorText);
        return false;
      }
    }
  } else {
    // Unsubscribe from list
    const unsubscribeData = {
      contactList: {
        list: listId,
        contact: contactId,
        status: 2, // 2 = unsubscribed
      },
    };

    const response = await fetch(
      `${ACTIVECAMPAIGN_API_URL}/api/3/contactLists`,
      {
        method: "POST",
        headers: {
          "Api-Token": ACTIVECAMPAIGN_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(unsubscribeData),
      }
    );

    if (!response.ok) {
      console.error("Failed to unsubscribe from list:", await response.text());
      return false;
    }
  }

  return true;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ACTIVECAMPAIGN_API_URL || !ACTIVECAMPAIGN_API_KEY) {
      console.error("ActiveCampaign credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "ActiveCampaign not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { marketingEnabled, firstName, lastName }: Partial<SyncRequest> = await req.json();

    console.log(`Syncing ActiveCampaign for user ${user.id}, marketing: ${marketingEnabled}`);

    // Create or update contact in ActiveCampaign
    const contactId = await createOrUpdateContact(user.email!, firstName, lastName);
    
    if (!contactId) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to sync contact" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update subscription status
    const statusUpdated = await updateContactStatus(contactId, marketingEnabled ?? false);
    
    if (!statusUpdated) {
      console.log("Warning: Contact created but list subscription may have failed");
    }

    console.log(`Successfully synced user ${user.email} to ActiveCampaign (contactId: ${contactId}, subscribed: ${marketingEnabled})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contactId,
        subscribed: marketingEnabled 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error syncing to ActiveCampaign:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
