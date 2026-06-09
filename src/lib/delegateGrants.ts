/**
 * Auto-issue delegate vault grants for any approved/acknowledged recovery
 * requests on the owner's lockers that don't yet have an active grant.
 *
 * Called after the owner unlocks their vault. Safe to invoke any time the
 * vault key is in memory — it no-ops when there's nothing to do.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  fetchDelegatePublicKey,
  wrapVaultKeyForDelegate,
  ensureDelegateKeypair,
} from "@/lib/delegateKeypair";

export async function issuePendingDelegateGrants(
  ownerUserId: string,
  vaultKey: CryptoKey,
): Promise<{ issued: number; skipped: number; errors: number }> {
  let issued = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Make sure owner has their own keypair on file (so they can later act as
    // a delegate themselves and so the ensure path is idempotent).
    try {
      await ensureDelegateKeypair();
    } catch {
      /* non-fatal */
    }

    // Find recovery requests where the owner is the caller and the request is
    // in a state that should yield a grant.
    // @ts-ignore - generated types lag
    const { data: requests, error } = await supabase
      .from("recovery_requests")
      .select("id, legacy_locker_id, delegate_user_id, status")
      .eq("owner_user_id", ownerUserId)
      .in("status", ["acknowledged", "approved"]);
    if (error || !requests?.length) return { issued, skipped, errors };

    // Check which already have an active grant.
    const lockerIds = Array.from(
      new Set(requests.map((r: any) => r.legacy_locker_id)),
    );
    // @ts-ignore
    const { data: existingGrants } = await supabase
      .from("vault_delegate_grants")
      .select("legacy_locker_id, delegate_user_id, status")
      .in("legacy_locker_id", lockerIds as string[])
      .eq("status", "active");

    const hasGrant = new Set(
      (existingGrants ?? []).map(
        (g: any) => `${g.legacy_locker_id}:${g.delegate_user_id}`,
      ),
    );

    for (const req of requests as any[]) {
      const key = `${req.legacy_locker_id}:${req.delegate_user_id}`;
      if (hasGrant.has(key)) {
        skipped++;
        continue;
      }
      try {
        const pub = await fetchDelegatePublicKey(req.delegate_user_id);
        if (!pub) {
          // Delegate hasn't enrolled a keypair yet — skip silently.
          skipped++;
          continue;
        }
        const wrapped = await wrapVaultKeyForDelegate(vaultKey, pub.jwk);
        const { error: invokeErr } = await supabase.functions.invoke(
          "issue-delegate-vault-grant",
          {
            body: {
              legacyLockerId: req.legacy_locker_id,
              delegateUserId: req.delegate_user_id,
              wrappedVaultKey: wrapped,
              delegateKeyVersion: pub.keyVersion,
              recoveryRequestId: req.id,
            },
          },
        );
        if (invokeErr) {
          console.error("issuePendingDelegateGrants: invoke error", invokeErr);
          errors++;
        } else {
          issued++;
        }
      } catch (e) {
        console.error("issuePendingDelegateGrants: per-request error", e);
        errors++;
      }
    }
  } catch (e) {
    console.error("issuePendingDelegateGrants: outer error", e);
    errors++;
  }
  return { issued, skipped, errors };
}
