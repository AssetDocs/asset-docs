// Shared MFA helpers: HMAC-pepper backup-code hashing + step-up session helpers.
// Used by mfa-step-up, manage-backup-codes, mfa-unenroll, and any sensitive
// edge function that needs to require a fresh step-up.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const STEP_UP_TTL_SECONDS = 5 * 60; // 5 minutes
export const STEP_UP_FRESH_SECONDS = 60;   // "fresh" = within last 60s

const BACKUP_CODE_PEPPER = Deno.env.get('BACKUP_CODE_PEPPER') ?? '';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** HMAC-SHA256(pepper, code) — replaces plain SHA-256 backup-code hashing. */
export async function hmacBackupCode(code: string): Promise<string> {
  if (!BACKUP_CODE_PEPPER) {
    throw new Error('BACKUP_CODE_PEPPER not configured');
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(BACKUP_CODE_PEPPER),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(code));
  return bytesToHex(new Uint8Array(sig));
}

/** Legacy plain SHA-256 (kept for verifying codes hashed before pepper rollout). */
export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return bytesToHex(new Uint8Array(buf));
}

export function normalizeBackupCode(code: string): string {
  const cleaned = code.replace(/[-\s]/g, '').toUpperCase();
  if (cleaned.length !== 8) return cleaned;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
}

/** Verify caller JWT, return user or null. */
export async function getCallerUser(
  authHeader: string | null,
): Promise<{ user: { id: string; email?: string } | null; token: string | null }> {
  if (!authHeader?.startsWith('Bearer ')) return { user: null, token: null };
  const token = authHeader.slice(7);
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const client = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return { user: null, token };
  return { user: { id: data.user.id, email: data.user.email ?? undefined }, token };
}

/** User-scoped client with caller's bearer token. */
export function userScopedClient(authHeader: string): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  return createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Write a step-up session row. Returns stepped_up_until. */
export async function recordStepUp(
  svc: SupabaseClient,
  userId: string,
  method: 'totp' | 'backup_code',
  ip?: string,
  userAgent?: string,
): Promise<string> {
  const now = new Date();
  const until = new Date(now.getTime() + STEP_UP_TTL_SECONDS * 1000);
  const { error } = await svc.from('mfa_step_up_sessions').insert({
    user_id: userId,
    stepped_up_until: until.toISOString(),
    last_step_up_at: now.toISOString(),
    method,
    ip: ip ?? null,
    user_agent: userAgent ?? null,
  });
  if (error) throw error;
  return until.toISOString();
}

/** Returns true if user has an active step-up session (not expired). */
export async function hasActiveStepUp(
  svc: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await svc
    .from('mfa_step_up_sessions')
    .select('id')
    .eq('user_id', userId)
    .gt('stepped_up_until', new Date().toISOString())
    .order('last_step_up_at', { ascending: false })
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

/** Returns true if user has a step-up within the last `freshSeconds` seconds. */
export async function hasFreshStepUp(
  svc: SupabaseClient,
  userId: string,
  freshSeconds = STEP_UP_FRESH_SECONDS,
): Promise<boolean> {
  const cutoff = new Date(Date.now() - freshSeconds * 1000).toISOString();
  const { data, error } = await svc
    .from('mfa_step_up_sessions')
    .select('id')
    .eq('user_id', userId)
    .gte('last_step_up_at', cutoff)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

export async function logMfaAttempt(
  svc: SupabaseClient,
  params: {
    userId?: string | null;
    ip?: string | null;
    kind: string;
    outcome: 'success' | 'failure' | 'denied';
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await svc.from('mfa_attempt_log').insert({
      user_id: params.userId ?? null,
      ip: params.ip ?? null,
      kind: params.kind,
      outcome: params.outcome,
      metadata: params.metadata ?? {},
    });
  } catch (_e) {
    // best-effort; never block the caller
  }
}

export function getClientIp(req: Request): string | null {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null
  );
}
