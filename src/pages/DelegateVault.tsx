// @ts-nocheck
/**
 * DelegateVault — read-only view for a Recovery Delegate of an owner's
 * encrypted Legacy Locker, after a vault grant has been issued.
 *
 * Flow:
 *  1. Delegate signs in and visits /delegate-vault?lockerId=<uuid>.
 *  2. We verify an active vault_delegate_grants row exists for (locker, delegate).
 *  3. Delegate unlocks their OWN vault with their passphrase. This caches
 *     their vault key in memory so we can unwrap their RSA private key.
 *  4. unwrapVaultKeyAsDelegate() returns the OWNER's vault key, which we
 *     cache under the owner's userId.
 *  5. We fetch the owner's legacy_locker row and decrypt any ASV2-wrapped
 *     text fields with the owner's vault key. Plaintext fields show as-is.
 *
 * Read-only by design — no writes from the delegate side in this view.
 */
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Lock,
  Loader2,
  AlertTriangle,
  Eye,
  Unlock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  unlockVaultWithPassphrase,
  setVaultKey,
  getVaultKey,
  decryptField,
  isAsv2,
} from "@/lib/vaultKey";
import { unwrapVaultKeyAsDelegate } from "@/lib/delegateKeypair";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OWNER_TEXT_FIELDS = [
  "full_legal_name",
  "address",
  "executor_name",
  "executor_relationship",
  "executor_contact",
  "backup_executor_name",
  "backup_executor_contact",
  "guardian_name",
  "guardian_relationship",
  "guardian_contact",
  "backup_guardian_name",
  "backup_guardian_contact",
  "spouse_name",
  "spouse_contact",
  "attorney_name",
  "attorney_firm",
  "attorney_contact",
  "business_partner_name",
  "business_partner_company",
  "business_partner_contact",
  "investment_firm_name",
  "investment_advisor_name",
  "investment_firm_contact",
  "financial_advisor_name",
  "financial_advisor_firm",
  "financial_advisor_contact",
  "residuary_estate",
  "digital_assets",
  "real_estate_instructions",
  "debts_expenses",
  "funeral_wishes",
  "burial_or_cremation",
  "ceremony_preferences",
  "letters_to_loved_ones",
  "pet_care_instructions",
  "business_succession_plan",
  "ethical_will",
];

const HUMAN: Record<string, string> = {
  full_legal_name: "Full Legal Name",
  address: "Address",
  executor_name: "Executor",
  executor_relationship: "Executor Relationship",
  executor_contact: "Executor Contact",
  backup_executor_name: "Backup Executor",
  backup_executor_contact: "Backup Executor Contact",
  guardian_name: "Guardian",
  guardian_relationship: "Guardian Relationship",
  guardian_contact: "Guardian Contact",
  backup_guardian_name: "Backup Guardian",
  backup_guardian_contact: "Backup Guardian Contact",
  spouse_name: "Spouse",
  spouse_contact: "Spouse Contact",
  attorney_name: "Attorney",
  attorney_firm: "Attorney Firm",
  attorney_contact: "Attorney Contact",
  residuary_estate: "Residuary Estate",
  digital_assets: "Digital Assets",
  real_estate_instructions: "Real Estate Instructions",
  debts_expenses: "Debts & Expenses",
  funeral_wishes: "Funeral Wishes",
  burial_or_cremation: "Burial or Cremation",
  ceremony_preferences: "Ceremony Preferences",
  letters_to_loved_ones: "Letters to Loved Ones",
  pet_care_instructions: "Pet Care Instructions",
  business_succession_plan: "Business Succession Plan",
  ethical_will: "Ethical Will",
};

const DelegateVault: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const lockerId = searchParams.get("lockerId");

  const [grant, setGrant] = useState<any | null>(null);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string>("the account owner");
  const [loadingGrant, setLoadingGrant] = useState(true);
  const [grantError, setGrantError] = useState<string | null>(null);

  const [passphrase, setPassphrase] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [decrypted, setDecrypted] = useState<Record<string, string> | null>(
    null,
  );

  useEffect(() => {
    if (!user?.id || !lockerId) {
      setLoadingGrant(false);
      return;
    }
    (async () => {
      try {
        const { data: g, error } = await supabase
          .from("vault_delegate_grants")
          .select("*")
          .eq("legacy_locker_id", lockerId)
          .eq("delegate_user_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        if (error) throw error;
        if (!g) {
          setGrantError(
            "No active vault grant for this Legacy Locker. The owner has not issued you a delegate key, or your access was revoked.",
          );
          return;
        }
        setGrant(g);
        setOwnerUserId(g.owner_user_id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", g.owner_user_id)
          .maybeSingle();
        if (profile) {
          const nm = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
          if (nm) setOwnerName(nm);
        }
      } catch (e: any) {
        setGrantError(e?.message ?? "Failed to load grant.");
      } finally {
        setLoadingGrant(false);
      }
    })();
  }, [user?.id, lockerId]);

  const handleUnlock = async () => {
    if (!user?.id || !grant || !ownerUserId || !lockerId) return;
    setIsUnlocking(true);
    setUnlockError(null);
    try {
      // 1. Look up the delegate's own wrapped vault key from their own locker row.
      const { data: ownLocker, error: ownErr } = await supabase
        .from("legacy_locker")
        .select("encryption_key_encrypted_for_user")
        .eq("user_id", user.id)
        .maybeSingle();
      if (ownErr) throw ownErr;
      const ownWrapped = ownLocker?.encryption_key_encrypted_for_user;
      if (!ownWrapped) {
        throw new Error(
          "You need to set up your own Secure Vault passphrase before accessing a delegated vault.",
        );
      }
      const myVaultKey = await unlockVaultWithPassphrase(ownWrapped, passphrase);
      setVaultKey(user.id, myVaultKey);

      // 2. Use my private key (wrapped by my vault key) to unwrap owner's vault key.
      const ownerVaultKey = await unwrapVaultKeyAsDelegate(grant.wrapped_vault_key);
      setVaultKey(ownerUserId, ownerVaultKey);

      // 3. Fetch owner's locker row and decrypt ASV2 text fields.
      const { data: ownerLocker, error: lockerErr } = await supabase
        .from("legacy_locker")
        .select("*")
        .eq("id", lockerId)
        .maybeSingle();
      if (lockerErr) throw lockerErr;
      if (!ownerLocker) throw new Error("Owner's Legacy Locker not found.");

      const out: Record<string, string> = {};
      for (const f of OWNER_TEXT_FIELDS) {
        const v = (ownerLocker as any)[f];
        if (typeof v !== "string" || !v) continue;
        if (isAsv2(v)) {
          try {
            out[f] = await decryptField(v, ownerVaultKey);
          } catch (e) {
            console.error("decryptField failed for", f, e);
            out[f] = "[decrypt failed]";
          }
        } else {
          out[f] = v;
        }
      }
      setDecrypted(out);
      toast({
        title: "Vault Unlocked",
        description: `Read-only access to ${ownerName}'s Legacy Locker.`,
      });
    } catch (e: any) {
      console.error("Delegate unlock failed:", e);
      setUnlockError(
        e?.message ?? "Could not unlock the vault with that passphrase.",
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  // Render
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please <Link to="/login" className="underline">sign in</Link> to view this delegated vault.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lockerId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Missing lockerId in URL.</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Delegated Legacy Locker</CardTitle>
            </div>
            <CardDescription>
              Read-only access granted by {ownerName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingGrant && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying grant…
              </div>
            )}
            {grantError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{grantError}</AlertDescription>
              </Alert>
            )}
            {!loadingGrant && grant && !decrypted && (
              <div className="space-y-4">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Enter <strong>your own</strong> Secure Vault passphrase to
                    unwrap your private key. The owner's vault key is
                    decrypted locally — it never leaves your browser.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Your Vault Passphrase</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && passphrase && !isUnlocking) {
                        handleUnlock();
                      }
                    }}
                    placeholder="Your master passphrase"
                  />
                </div>
                {unlockError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{unlockError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleUnlock}
                  disabled={!passphrase || isUnlocking}
                  className="w-full sm:w-auto"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Unlocking…
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock & View
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {decrypted && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>Legacy Locker Contents (Read-Only)</CardTitle>
              </div>
              <CardDescription>
                Decrypted from {ownerName}'s vault. Do not share these
                contents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="divide-y">
                {Object.entries(decrypted).map(([k, v]) => (
                  <div key={k} className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-medium text-sm text-muted-foreground">
                      {HUMAN[k] ?? k.replace(/_/g, " ")}
                    </dt>
                    <dd className="sm:col-span-2 whitespace-pre-wrap break-words">
                      {v || <span className="text-muted-foreground italic">empty</span>}
                    </dd>
                  </div>
                ))}
                {Object.keys(decrypted).length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No populated fields in this locker.
                  </p>
                )}
              </dl>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DelegateVault;
