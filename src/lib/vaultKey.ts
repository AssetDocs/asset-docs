/**
 * vaultKey.ts — Secure Vault owner-side key primitives (ASV2 envelope).
 *
 * Model:
 *   - Owner has a vault key (AES-GCM-256, random).
 *   - Vault key is wrapped with the owner's passphrase (PBKDF2 → AES-GCM)
 *     and stored at legacy_locker.encryption_key_encrypted_for_user as an
 *     ASV2 envelope. Plaintext vault key never leaves the device.
 *   - Per-field/per-blob ciphertext is stored as an ASV2 envelope wrapped by
 *     the vault key itself (no KDF). Optional AAD is bound at encrypt time.
 *
 * Envelope wire format:
 *   ASCII prefix `"ASV2."` followed by base64url(JSON) where JSON =
 *     {
 *       v:   2,
 *       alg: "AES-GCM-256",
 *       kdf: null | { name:"PBKDF2", hash:"SHA-256", iters: <int>, salt: b64u },
 *       iv:  base64url(12 bytes),
 *       aad: string | undefined,
 *       ct:  base64url(ciphertext || GCM tag)
 *     }
 *
 *   The envelope is the SINGLE SOURCE OF TRUTH for iv/salt/kdf at decrypt
 *   time. Any informational columns (encryption_iv, encryption_alg, ...) are
 *   never consulted by decrypt.
 *
 * Legacy (v:1) blobs produced by src/utils/encryption.ts use no prefix —
 * they are raw base64(salt || iv || ct) and must be decrypted with the old
 * deriveKey(passphrase, salt) path. This module does NOT decrypt v:1; the
 * caller falls back to the legacy helper for those blobs.
 */

const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ENVELOPE_PREFIX = 'ASV2.';

// ─────────────────────────────────────────────────────────────────────────────
// base64url helpers
// ─────────────────────────────────────────────────────────────────────────────
function bytesToB64u(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64uToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Envelope (ASV2)
// ─────────────────────────────────────────────────────────────────────────────
export interface Asv2Envelope {
  v: 2;
  alg: 'AES-GCM-256';
  kdf: null | {
    name: 'PBKDF2';
    hash: 'SHA-256';
    iters: number;
    salt: string; // b64u
  };
  iv: string; // b64u
  aad?: string;
  ct: string; // b64u
}

export function isAsv2(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(ENVELOPE_PREFIX);
}

function encodeEnvelope(env: Asv2Envelope): string {
  return ENVELOPE_PREFIX + bytesToB64u(new TextEncoder().encode(JSON.stringify(env)));
}

function decodeEnvelope(blob: string): Asv2Envelope {
  if (!isAsv2(blob)) throw new Error('not an ASV2 envelope');
  const json = new TextDecoder().decode(b64uToBytes(blob.slice(ENVELOPE_PREFIX.length)));
  const env = JSON.parse(json) as Asv2Envelope;
  if (env.v !== 2 || env.alg !== 'AES-GCM-256' || !env.iv || !env.ct) {
    throw new Error('malformed ASV2 envelope');
  }
  return env;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vault key primitives
// ─────────────────────────────────────────────────────────────────────────────
export async function generateVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

async function derivePassphraseKey(passphrase: string, salt: Uint8Array, iters: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: iters, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
  );
}

/** Wrap a vault key with the owner's passphrase. Returns ASV2 envelope. */
export async function wrapVaultKeyWithPassphrase(vaultKey: CryptoKey, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const kek = await derivePassphraseKey(passphrase, salt, PBKDF2_ITERATIONS);
  const raw = await crypto.subtle.exportKey('raw', vaultKey);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, kek, raw);
  return encodeEnvelope({
    v: 2,
    alg: 'AES-GCM-256',
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iters: PBKDF2_ITERATIONS, salt: bytesToB64u(salt) },
    iv: bytesToB64u(iv),
    ct: bytesToB64u(new Uint8Array(ct)),
  });
}

/**
 * Unwrap the vault key with the owner's passphrase. Throws on wrong passphrase
 * or malformed envelope. Successful unwrap IS the unlock proof.
 */
export async function unlockVaultWithPassphrase(wrappedKey: string, passphrase: string): Promise<CryptoKey> {
  const env = decodeEnvelope(wrappedKey);
  if (!env.kdf || env.kdf.name !== 'PBKDF2') {
    throw new Error('wrapped vault key missing KDF');
  }
  const salt = b64uToBytes(env.kdf.salt);
  const iv = b64uToBytes(env.iv);
  const kek = await derivePassphraseKey(passphrase, salt, env.kdf.iters);
  let rawBuf: ArrayBuffer;
  try {
    rawBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      kek,
      b64uToBytes(env.ct) as BufferSource,
    );
  } catch {
    throw new Error('Incorrect vault passphrase');
  }
  return crypto.subtle.importKey('raw', rawBuf, { name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}

/** Encrypt a UTF-8 plaintext field with the vault key. Returns ASV2 envelope. */
export async function encryptField(plaintext: string, vaultKey: CryptoKey, aad?: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const algo: AesGcmParams = { name: 'AES-GCM', iv: iv as BufferSource };
  if (aad) algo.additionalData = new TextEncoder().encode(aad);
  const ct = await crypto.subtle.encrypt(algo, vaultKey, new TextEncoder().encode(plaintext));
  return encodeEnvelope({
    v: 2,
    alg: 'AES-GCM-256',
    kdf: null,
    iv: bytesToB64u(iv),
    aad,
    ct: bytesToB64u(new Uint8Array(ct)),
  });
}

/** Decrypt an ASV2-wrapped field with the vault key. */
export async function decryptField(envelope: string, vaultKey: CryptoKey): Promise<string> {
  const env = decodeEnvelope(envelope);
  if (env.kdf !== null) throw new Error('field envelope must not carry a KDF');
  const iv = b64uToBytes(env.iv);
  const algo: AesGcmParams = { name: 'AES-GCM', iv: iv as BufferSource };
  if (env.aad) algo.additionalData = new TextEncoder().encode(env.aad);
  const buf = await crypto.subtle.decrypt(algo, vaultKey, b64uToBytes(env.ct) as BufferSource);
  return new TextDecoder().decode(buf);
}

/** Encrypt a binary blob (e.g. voice-note audio) with the vault key. */
export async function encryptBytes(bytes: Uint8Array, vaultKey: CryptoKey, aad?: string): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const algo: AesGcmParams = { name: 'AES-GCM', iv: iv as BufferSource };
  if (aad) algo.additionalData = new TextEncoder().encode(aad);
  const ct = await crypto.subtle.encrypt(algo, vaultKey, bytes as BufferSource);
  const env: Asv2Envelope = {
    v: 2,
    alg: 'AES-GCM-256',
    kdf: null,
    iv: bytesToB64u(iv),
    aad,
    ct: bytesToB64u(new Uint8Array(ct)),
  };
  return new TextEncoder().encode(encodeEnvelope(env));
}

export async function decryptBytes(envelopeBytes: Uint8Array, vaultKey: CryptoKey): Promise<Uint8Array> {
  const envelope = new TextDecoder().decode(envelopeBytes);
  const env = decodeEnvelope(envelope);
  if (env.kdf !== null) throw new Error('blob envelope must not carry a KDF');
  const iv = b64uToBytes(env.iv);
  const algo: AesGcmParams = { name: 'AES-GCM', iv: iv as BufferSource };
  if (env.aad) algo.additionalData = new TextEncoder().encode(env.aad);
  const buf = await crypto.subtle.decrypt(algo, vaultKey, b64uToBytes(env.ct) as BufferSource);
  return new Uint8Array(buf);
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory session cache
// ─────────────────────────────────────────────────────────────────────────────
// Plaintext vault keys are held only in JS memory, scoped by owner userId.
// Cleared on sign-out, on tab hide (visibilitychange), and via explicit calls.
// They are NEVER persisted to localStorage/sessionStorage/IndexedDB.

const cache = new Map<string, CryptoKey>();

export function setVaultKey(userId: string, key: CryptoKey): void {
  cache.set(userId, key);
}

export function getVaultKey(userId: string): CryptoKey | null {
  return cache.get(userId) ?? null;
}

export function clearVaultKey(userId: string): void {
  cache.delete(userId);
}

export function clearAllVaultKeys(): void {
  cache.clear();
}

// Auto-clear when the tab is hidden for ≥ N minutes, and on full pagehide.
const HIDE_TIMEOUT_MS = 10 * 60 * 1000;
let hideTimer: number | null = null;

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => clearAllVaultKeys(), HIDE_TIMEOUT_MS);
    } else if (hideTimer !== null) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }
  });
  window.addEventListener('pagehide', () => clearAllVaultKeys());
}

// ─────────────────────────────────────────────────────────────────────────────
// Unlock-or-upgrade orchestrator
// ─────────────────────────────────────────────────────────────────────────────
// Single entry-point used by SecureVault and PasswordCatalog. Implements the
// migration from the legacy localStorage SHA-256 verifier to the DB-backed
// wrapped vault key.
//
// Behavior:
//   1. If `wrappedKey` is present → unwrap with passphrase. On success, cache
//      the key, clear any legacy localStorage hash, and return mode='unlocked'.
//   2. Else if a legacy hash exists in localStorage under the provided key and
//      the passphrase matches it → generate a new vault key, wrap it with the
//      passphrase, and return mode='upgrade' (caller must persist the wrapped
//      key to DB and then call `setVaultKey`).
//   3. Else if setup=true → generate a new vault key, wrap with passphrase,
//      return mode='setup' (caller persists & caches).
//   4. Otherwise throw.
//
// Successful unwrap (and successful legacy-hash match before upgrade) IS the
// unlock proof. No standalone passphrase hash is ever written to disk.

export type UnlockOutcome =
  | { mode: 'unlocked'; vaultKey: CryptoKey }
  | { mode: 'upgrade'; vaultKey: CryptoKey; wrappedKey: string }
  | { mode: 'setup'; vaultKey: CryptoKey; wrappedKey: string };

export interface UnlockOrUpgradeOpts {
  passphrase: string;
  wrappedKey: string | null;
  setup?: boolean;
  legacyLocalStorageKey?: string;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function unlockOrUpgradeVault(opts: UnlockOrUpgradeOpts): Promise<UnlockOutcome> {
  const { passphrase, wrappedKey, setup, legacyLocalStorageKey } = opts;

  if (wrappedKey) {
    const vk = await unlockVaultWithPassphrase(wrappedKey, passphrase);
    if (legacyLocalStorageKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(legacyLocalStorageKey);
      } catch {
        /* ignore */
      }
    }
    return { mode: 'unlocked', vaultKey: vk };
  }

  // No wrapped key on the server yet. Try the legacy localStorage hash path.
  if (legacyLocalStorageKey && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(legacyLocalStorageKey);
    if (stored) {
      const match = (await sha256Hex(passphrase)) === stored;
      if (!match) throw new Error('Incorrect vault passphrase');
      const vk = await generateVaultKey();
      const wrapped = await wrapVaultKeyWithPassphrase(vk, passphrase);
      // Caller persists the wrapped key, then clears localStorage on success.
      return { mode: 'upgrade', vaultKey: vk, wrappedKey: wrapped };
    }
  }

  if (setup) {
    const vk = await generateVaultKey();
    const wrapped = await wrapVaultKeyWithPassphrase(vk, passphrase);
    return { mode: 'setup', vaultKey: vk, wrappedKey: wrapped };
  }

  throw new Error('No wrapped vault key available — cannot unlock');
}
