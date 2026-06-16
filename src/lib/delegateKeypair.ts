/**
 * Delegate keypair model for the encrypted Legacy Locker.
 *
 * Each user has an RSA-OAEP-256 keypair:
 *  - public key (JWK) - stored in plaintext, readable through a scoped RPC
 *  - private key - wrapped (AES-GCM) by the user's own vault key
 *
 * Owners use a delegate's public key to wrap the vault key into a
 * `vault_delegate_grants` row. The delegate later unwraps it with their
 * private key (which they unlock via their own vault key).
 */
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { getVaultKey } from "@/lib/vaultKey";

const RSA_PARAMS: RsaHashedKeyGenParams = {
  name: "RSA-OAEP",
  modulusLength: 3072,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: "SHA-256",
};

const b64 = {
  enc: (b: ArrayBuffer | Uint8Array) => {
    const arr = b instanceof Uint8Array ? b : new Uint8Array(b);
    let s = "";
    for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
    return btoa(s);
  },
  dec: (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
};

type DelegatePublicKeyRow = {
  public_key_jwk: Json;
  key_version: number | null;
};

type DelegatePublicKeyRpc = (
  fn: "get_vault_delegate_public_key",
  args: { p_delegate_user_id: string },
) => {
  maybeSingle: () => Promise<{
    data: DelegatePublicKeyRow | null;
    error: { message: string } | null;
  }>;
};

async function exportPublicJwk(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey("jwk", key);
}

async function importPublicJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );
}

async function wrapPrivateKey(
  privateKey: CryptoKey,
  vaultKey: CryptoKey,
): Promise<{ wrapped: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const raw = await crypto.subtle.exportKey("pkcs8", privateKey);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    vaultKey,
    raw,
  );
  return { wrapped: b64.enc(ct), iv: b64.enc(iv) };
}

async function unwrapPrivateKey(
  wrapped: string,
  ivB64: string,
  vaultKey: CryptoKey,
): Promise<CryptoKey> {
  const iv = b64.dec(ivB64);
  const ct = b64.dec(wrapped);
  const raw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    vaultKey,
    ct,
  );
  return crypto.subtle.importKey(
    "pkcs8",
    raw,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"],
  );
}

export async function ensureDelegateKeypair(): Promise<JsonWebKey> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) throw new Error("Not signed in");

  const { data: existing } = await supabase
    .from("vault_delegate_keypairs")
    .select("public_key_jwk")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.public_key_jwk) {
    return existing.public_key_jwk as JsonWebKey;
  }

  const vaultKey = getVaultKey(user.id);
  if (!vaultKey) throw new Error("Vault is locked");

  const kp = await crypto.subtle.generateKey(RSA_PARAMS, true, [
    "encrypt",
    "decrypt",
  ]);
  const publicJwk = await exportPublicJwk(kp.publicKey);
  const { wrapped, iv } = await wrapPrivateKey(kp.privateKey, vaultKey);

  const { error } = await supabase.from("vault_delegate_keypairs").insert({
    user_id: user.id,
    public_key_jwk: publicJwk as unknown as Json,
    wrapped_private_key: wrapped,
    wrap_iv: iv,
    key_version: 1,
  });
  if (error) throw error;
  return publicJwk;
}

export async function wrapVaultKeyForDelegate(
  vaultKey: CryptoKey,
  delegatePublicJwk: JsonWebKey,
): Promise<string> {
  const pub = await importPublicJwk(delegatePublicJwk);
  const raw = await crypto.subtle.exportKey("raw", vaultKey);
  const ct = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, pub, raw);
  return b64.enc(ct);
}

export async function unwrapVaultKeyAsDelegate(
  wrappedVaultKey: string,
): Promise<CryptoKey> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) throw new Error("Not signed in");

  const vaultKey = getVaultKey(user.id);
  if (!vaultKey) throw new Error("Vault is locked");

  const { data: row, error } = await supabase
    .from("vault_delegate_keypairs")
    .select("wrapped_private_key, wrap_iv")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !row) throw new Error("Delegate keypair not found");

  const priv = await unwrapPrivateKey(
    row.wrapped_private_key,
    row.wrap_iv,
    vaultKey,
  );
  const ct = b64.dec(wrappedVaultKey);
  const raw = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, priv, ct);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function fetchDelegatePublicKey(
  delegateUserId: string,
): Promise<{ jwk: JsonWebKey; keyVersion: number } | null> {
  const rpc = supabase.rpc as unknown as DelegatePublicKeyRpc;
  const { data, error } = await rpc("get_vault_delegate_public_key", {
    p_delegate_user_id: delegateUserId,
  }).maybeSingle();
  if (error || !data) return null;
  return {
    jwk: data.public_key_jwk as JsonWebKey,
    keyVersion: data.key_version ?? 1,
  };
}
