// Retention/Deletion Policy Matrix smoke test.
//
// Calls the anonymize_user_data RPC against a seeded throwaway user and
// asserts that retain / anonymize / purge rules from the matrix fire.
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (provided by the
// edge-function test runner). We deliberately bypass the JWT/MFA-gated
// edge handler and exercise the RPC directly, which is the matrix surface.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { assert, assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_ROLE =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE") ??
  "";

if (!SERVICE_ROLE) {
  console.warn("[smoke] SUPABASE_SERVICE_ROLE_KEY not set — skipping retention smoke test");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.test({
  name: "anonymize_user_data: retention matrix smoke",
  ignore: !SERVICE_ROLE,
  sanitizeResources: false,
  sanitizeOps: false,
  fn: async (t) => {
    // ----- 1. Create throwaway auth user -----
    const stamp = Date.now();
    const userEmail = `retention-smoke+${stamp}@example.test`;
    const otherEmail = `retention-smoke-other+${stamp}@example.test`;

    const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
      email: userEmail,
      email_confirm: true,
      password: crypto.randomUUID() + "Aa1!",
    });
    if (createErr) throw createErr;
    const userId = createdUser.user!.id;

    // Helper: cleanup at end
    const cleanup: Array<() => Promise<unknown>> = [];

    try {
      // ----- 2. Seed one row per matrix table -----
      await t.step("seed", async () => {
        const seeds = await Promise.all([
          admin.from("payment_events").insert({
            user_id: userId,
            event_type: "smoke.payment_succeeded",
            stripe_event_id: `evt_smoke_${stamp}`,
            amount: 1234,
            currency: "usd",
          }).select("id").single(),

          admin.from("subscribers").insert({
            user_id: userId,
            email: userEmail,
            stripe_customer_id: `cus_smoke_${stamp}`,
            subscribed: true,
          }).select("id").single(),

          admin.from("user_activity_logs").insert({
            user_id: userId,
            activity_type: "smoke.login",
          }).select("id").single(),

          admin.from("checkout_fulfillments").insert({
            stripe_session_id: `cs_smoke_${stamp}`,
            user_id: userId,
            email: userEmail,
            status: "completed",
          }).select("id").single(),

          admin.from("subscription_cancellations").insert({
            owner_user_id: userId,
            reason: "smoke",
          }).select("id").single(),

          admin.from("account_deletion_requests").insert({
            account_owner_id: userId,
            requester_user_id: userId,
            grace_period_days: 14,
            grace_period_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
            status: "pending",
            requested_at: new Date().toISOString(),
          }).select("id").single(),

          admin.from("account_closure_requests").insert({
            owner_user_id: userId,
            request_date: new Date().toISOString(),
            status: "pending",
          }).select("id").single(),

          admin.from("entitlements").insert({
            user_id: userId,
            plan: "smoke",
          }).select("id").single(),

          // Gift A: user is purchaser
          admin.from("gift_subscriptions").insert({
            purchaser_user_id: userId,
            purchaser_email: userEmail,
            recipient_email: otherEmail,
            plan_lookup_key: "smoke_gift",
            status: "purchased",
          }).select("id").single(),

          // Gift B: user is recipient
          admin.from("gift_subscriptions").insert({
            purchaser_email: otherEmail,
            recipient_user_id: userId,
            recipient_email: userEmail,
            plan_lookup_key: "smoke_gift",
            status: "purchased",
          }).select("id").single(),

          // Retain table - must be untouched
          admin.from("audit_logs").insert({
            user_id: userId,
            action: "smoke.audit",
          }).select("id").single(),
        ]);

        for (const r of seeds) {
          if (r.error) {
            console.error("[seed]", r.error);
            throw r.error;
          }
        }

        // Store ids for assertions + cleanup
        const [pay, sub, act, ful, can, del, clo, ent, giftA, giftB, aud] = seeds.map((s) => s.data!.id);
        (globalThis as any).__seed = { pay, sub, act, ful, can, del, clo, ent, giftA, giftB, aud };

        cleanup.push(
          async () => await admin.from("payment_events").delete().eq("id", pay),
          async () => await admin.from("subscribers").delete().eq("id", sub),
          async () => await admin.from("user_activity_logs").delete().eq("id", act),
          async () => await admin.from("checkout_fulfillments").delete().eq("id", ful),
          async () => await admin.from("subscription_cancellations").delete().eq("id", can),
          async () => await admin.from("account_deletion_requests").delete().eq("id", del),
          async () => await admin.from("account_closure_requests").delete().eq("id", clo),
          async () => await admin.from("gift_subscriptions").delete().eq("id", giftA),
          async () => await admin.from("gift_subscriptions").delete().eq("id", giftB),
          async () => await admin.from("audit_logs").delete().eq("id", aud),
          // entitlements row will already be purged by RPC
        );
      });

      // ----- 3. Run anonymize RPC -----
      let tombstoneId = "";
      await t.step("run anonymize_user_data", async () => {
        const { data, error } = await admin.rpc("anonymize_user_data", {
          p_user_id: userId,
          p_email: userEmail,
          p_deleted_by: "smoke-test",
        });
        if (error) throw error;
        tombstoneId = data as unknown as string;
        assertExists(tombstoneId, "RPC must return tombstone id");
        cleanup.push(async () => await admin.from("deleted_accounts").delete().eq("id", tombstoneId));
      });

      // ----- 4. Assertions -----
      await t.step("tombstone has email_hash", async () => {
        const { data } = await admin
          .from("deleted_accounts")
          .select("email_hash, original_user_id")
          .eq("id", tombstoneId)
          .single();
        assertExists(data?.email_hash, "email_hash must be populated");
        assertEquals(data?.original_user_id, userId);
      });

      const seed = (globalThis as any).__seed;

      const anonymizeChecks: Array<[string, string, string[]]> = [
        ["payment_events", seed.pay, ["user_id"]],
        ["subscribers", seed.sub, ["user_id", "email"]],
        ["user_activity_logs", seed.act, ["user_id"]],
        ["checkout_fulfillments", seed.ful, ["user_id", "email"]],
        ["subscription_cancellations", seed.can, ["owner_user_id"]],
        ["account_deletion_requests", seed.del, ["account_owner_id", "requester_user_id"]],
        ["account_closure_requests", seed.clo, ["owner_user_id"]],
      ];

      for (const [table, id, nullCols] of anonymizeChecks) {
        await t.step(`anonymize: ${table}`, async () => {
          const { data, error } = await admin
            .from(table)
            .select(`id, deleted_account_id, ${nullCols.join(",")}`)
            .eq("id", id)
            .single();
          if (error) throw error;
          assertExists(data, `${table} row must still exist`);
          assertEquals((data as any).deleted_account_id, tombstoneId, `${table}.deleted_account_id`);
          for (const c of nullCols) {
            assertEquals((data as any)[c], null, `${table}.${c} must be NULL`);
          }
        });
      }

      await t.step("gift_subscriptions split (purchaser side)", async () => {
        const { data } = await admin
          .from("gift_subscriptions")
          .select("purchaser_user_id, purchaser_email, recipient_email, purchaser_deleted_account_id")
          .eq("id", seed.giftA)
          .single();
        assertEquals(data?.purchaser_user_id, null);
        assertEquals(data?.purchaser_email, null);
        assertEquals(data?.recipient_email, otherEmail, "recipient side must be intact");
        assertEquals(data?.purchaser_deleted_account_id, tombstoneId);
      });

      await t.step("gift_subscriptions split (recipient side)", async () => {
        const { data } = await admin
          .from("gift_subscriptions")
          .select("recipient_user_id, recipient_email, purchaser_email, recipient_deleted_account_id")
          .eq("id", seed.giftB)
          .single();
        assertEquals(data?.recipient_user_id, null);
        assertEquals(data?.recipient_email, null);
        assertEquals(data?.purchaser_email, otherEmail, "purchaser side must be intact");
        assertEquals(data?.recipient_deleted_account_id, tombstoneId);
      });

      await t.step("entitlements purged", async () => {
        const { data } = await admin
          .from("entitlements")
          .select("id")
          .eq("id", seed.ent);
        assertEquals(data?.length ?? 0, 0, "entitlements row must be deleted");
      });

      await t.step("audit_logs retained as-is", async () => {
        const { data } = await admin
          .from("audit_logs")
          .select("user_id, action")
          .eq("id", seed.aud)
          .single();
        assertEquals(data?.user_id, userId, "audit_logs.user_id must be retained");
        assertEquals(data?.action, "smoke.audit");
      });
    } finally {
      // Cleanup seeded rows + tombstone + auth user
      for (const fn of cleanup) {
        try { await fn(); } catch (_) { /* swallow */ }
      }
      await admin.auth.admin.deleteUser(userId).catch(() => {});
    }
  },
});
