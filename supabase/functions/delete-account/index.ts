import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { requireStepUp, getClientIp } from '../_shared/mfa.ts'
import { isAuthorizedInternalCall } from '../_shared/internalSecret.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
}

type SupabaseAdminClient = ReturnType<typeof createClient>;

type StorageRef = {
  bucket: string;
  path: string;
  source: string;
  accountId?: string | null;
};

const STORAGE_REF_SOURCES = [
  { table: 'property_files', bucketColumn: 'bucket_name', pathColumn: 'file_path' },
  { table: 'legacy_locker_files', bucketColumn: 'bucket_name', pathColumn: 'file_path' },
  { table: 'legacy_locker_voice_notes', bucketColumn: 'storage_bucket', pathColumn: 'audio_path' },
  { table: 'voice_note_attachments', bucketColumn: 'storage_bucket', pathColumn: 'file_path' },
  { table: 'receipts', bucket: 'documents', pathColumn: 'receipt_path' },
  { table: 'user_documents', bucket: 'documents', pathColumn: 'file_path' },
  { table: 'memory_safe_items', bucket: 'memory-safe', pathColumn: 'file_path' },
  { table: 'family_recipes', bucketColumn: 'bucket_name', fallbackBucket: 'documents', pathColumn: 'file_path' },
  { table: 'notes_traditions', bucketColumn: 'bucket_name', fallbackBucket: 'documents', pathColumn: 'file_path' },
  { table: 'vip_contact_attachments', bucket: 'contact-attachments', pathColumn: 'file_path' },
  { table: 'paint_codes', bucket: 'photos', pathColumn: 'swatch_image_path' },
  { table: 'calendar_event_attachments', bucket: 'documents', pathColumn: 'file_path' },
  { table: 'user_notes', bucketColumn: 'bucket_name', fallbackBucket: 'documents', pathColumn: 'file_path' },
] as const;

const STORAGE_REMOVE_BATCH_SIZE = 100;

type TombstoneContext = {
  deletedAccountId: string;
  targetAccountId: string;
};

type StorageDeletionJob = {
  id: string;
  bucket: string;
  object_path: string;
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function addStorageRef(refs: Map<string, StorageRef>, ref: StorageRef) {
  if (!ref.bucket || !ref.path) return;
  refs.set(`${ref.bucket}:${ref.path}`, ref);
}

async function collectRowBackedStorageRefs(supabaseAdmin: SupabaseAdminClient, userId: string) {
  const refs = new Map<string, StorageRef>();

  for (const source of STORAGE_REF_SOURCES) {
    const columns: string[] = ['id', source.pathColumn];
    if ('bucketColumn' in source) columns.push(source.bucketColumn);

    const { data, error } = await supabaseAdmin
      .from(source.table)
      .select(columns.join(','))
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to collect storage refs from ${source.table}: ${error.message}`);
    }

    for (const row of data ?? []) {
      const bucket = 'bucket' in source
        ? source.bucket
        : (row[source.bucketColumn] ?? ('fallbackBucket' in source ? source.fallbackBucket : null));
      const path = row[source.pathColumn];
      if (bucket && path) {
        addStorageRef(refs, { bucket, path, source: source.table });
      }
    }
  }

  return refs;
}

async function collectPrefixStorageRefs(
  supabaseAdmin: SupabaseAdminClient,
  prefixes: string[],
  refs: Map<string, StorageRef>,
) {
  for (const prefix of prefixes) {
    const { data, error } = await supabaseAdmin
      .schema('storage')
      .from('objects')
      .select('bucket_id,name')
      .like('name', `${prefix}%`);

    if (error) {
      throw new Error(`Failed to list storage objects for ${prefix}: ${error.message}`);
    }

    for (const object of data ?? []) {
      if (object.bucket_id && object.name) {
        addStorageRef(refs, {
          bucket: object.bucket_id,
          path: object.name,
          source: `prefix:${prefix}`,
        });
      }
    }
  }
}

function isNotFoundStorageError(err: { message?: string; statusCode?: string | number } | null) {
  if (!err) return false;
  const message = (err.message ?? '').toLowerCase();
  const statusCode = String(err.statusCode ?? '');
  return statusCode === '404'
    || message.includes('not found')
    || message.includes('object does not exist')
    || message.includes('not_found');
}

async function queueStorageDeletionJobs(
  supabaseAdmin: SupabaseAdminClient,
  refs: Iterable<StorageRef>,
  context: TombstoneContext,
) {
  const rows = Array.from(refs).map((ref) => {
    const [sourceTable] = ref.source.split(':');
    return {
      bucket: ref.bucket,
      object_path: ref.path,
      source: ref.source,
      source_table: sourceTable || null,
      owner_user_id: context.targetAccountId,
      account_id: ref.accountId ?? null,
      deleted_account_id: context.deletedAccountId,
      status: 'pending',
      next_attempt_at: new Date().toISOString(),
      last_error: null,
      processing_started_at: null,
      completed_at: null,
    };
  });

  if (rows.length === 0) return new Map<string, StorageDeletionJob>();

  const { data, error } = await supabaseAdmin
    .from('storage_deletion_jobs')
    .upsert(rows, { onConflict: 'bucket,object_path,deleted_account_id' })
    .select('id,bucket,object_path');

  if (error) {
    throw new Error(`Failed to queue storage deletion jobs: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((job: StorageDeletionJob) => [`${job.bucket}:${job.object_path}`, job]),
  );
}

async function markStorageJob(
  supabaseAdmin: SupabaseAdminClient,
  job: StorageDeletionJob | undefined,
  status: 'processing' | 'succeeded' | 'failed',
  errorMessage?: string,
) {
  if (!job) return;

  const now = new Date();
  const patch: Record<string, unknown> = {
    status,
    last_attempt_at: now.toISOString(),
    processing_started_at: status === 'processing' ? now.toISOString() : null,
  };

  if (status === 'succeeded') {
    patch.completed_at = now.toISOString();
    patch.last_error = null;
  } else if (status === 'failed') {
    patch.last_error = (errorMessage ?? 'storage_delete_failed').slice(0, 1000);
    patch.next_attempt_at = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  }

  if (status !== 'processing') {
    const { data: current } = await supabaseAdmin
      .from('storage_deletion_jobs')
      .select('attempt_count')
      .eq('id', job.id)
      .maybeSingle();
    patch.attempt_count = ((current?.attempt_count as number | null) ?? 0) + 1;
  }

  await supabaseAdmin
    .from('storage_deletion_jobs')
    .update(patch)
    .eq('id', job.id);
}

async function removeStorageRefs(
  supabaseAdmin: SupabaseAdminClient,
  refs: Iterable<StorageRef>,
  jobs: Map<string, StorageDeletionJob>,
) {
  const byBucket = new Map<string, StorageRef[]>();
  for (const ref of refs) {
    const bucketRefs = byBucket.get(ref.bucket) ?? [];
    bucketRefs.push(ref);
    byBucket.set(ref.bucket, bucketRefs);
  }

  let removed = 0;
  let failed = 0;
  for (const [bucket, bucketRefs] of byBucket) {
    for (let i = 0; i < bucketRefs.length; i += STORAGE_REMOVE_BATCH_SIZE) {
      const batchRefs = bucketRefs.slice(i, i + STORAGE_REMOVE_BATCH_SIZE);
      const batch = batchRefs.map((ref) => ref.path);
      for (const ref of batchRefs) {
        await markStorageJob(supabaseAdmin, jobs.get(`${ref.bucket}:${ref.path}`), 'processing');
      }
      const { error } = await supabaseAdmin.storage.from(bucket).remove(batch);
      if (error && !isNotFoundStorageError(error)) {
        failed += batch.length;
        for (const ref of batchRefs) {
          await markStorageJob(
            supabaseAdmin,
            jobs.get(`${ref.bucket}:${ref.path}`),
            'failed',
            error.message,
          );
        }
      } else {
        removed += batch.length;
        for (const ref of batchRefs) {
          await markStorageJob(supabaseAdmin, jobs.get(`${ref.bucket}:${ref.path}`), 'succeeded');
        }
      }
    }
  }

  return { removed, failed };
}

async function cleanupAccountStorage(supabaseAdmin: SupabaseAdminClient, context: TombstoneContext) {
  const refs = await collectRowBackedStorageRefs(supabaseAdmin, context.targetAccountId);

  const { data: accounts, error: accountErr } = await supabaseAdmin
    .from('accounts')
    .select('id')
    .eq('owner_user_id', context.targetAccountId);

  if (accountErr) {
    throw new Error(`Failed to list accounts for storage cleanup: ${accountErr.message}`);
  }

  const prefixes = [
    `${context.targetAccountId}/`,
    ...(accounts ?? []).map((account: { id: string }) => `accounts/${account.id}/`),
  ];

  await collectPrefixStorageRefs(supabaseAdmin, prefixes, refs);
  const jobs = await queueStorageDeletionJobs(supabaseAdmin, refs.values(), context);
  const result = await removeStorageRefs(supabaseAdmin, refs.values(), jobs);
  return { queued: jobs.size, ...result };
}

async function getActiveContinuityFreeze(
  supabaseAdmin: SupabaseAdminClient,
  ownerUserId: string,
) {
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('accounts')
    .select('id,account_freeze_status,account_freeze_type')
    .eq('owner_user_id', ownerUserId);

  if (accountsError) {
    throw new Error(`Failed to check account freeze state: ${accountsError.message}`);
  }

  const accountIds = (accounts ?? []).map((account: { id: string }) => account.id);
  const accountLevelFreeze = (accounts ?? []).find(
    (account: { account_freeze_status?: string | null }) => account.account_freeze_status === 'active',
  );

  if (accountLevelFreeze) {
    return {
      source: 'accounts',
      account_id: accountLevelFreeze.id,
      freeze_type: accountLevelFreeze.account_freeze_type ?? null,
      reason: null,
    };
  }

  if (accountIds.length === 0) return null;

  const { data: freeze, error: freezeError } = await supabaseAdmin
    .from('continuity_account_freezes')
    .select('id,account_id,freeze_type,reason,status')
    .in('account_id', accountIds)
    .eq('status', 'active')
    .order('applied_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (freezeError) {
    throw new Error(`Failed to check continuity account freeze: ${freezeError.message}`);
  }

  return freeze
    ? {
        source: 'continuity_account_freezes',
        account_id: freeze.account_id,
        freeze_type: freeze.freeze_type ?? null,
        reason: freeze.reason ?? null,
      }
    : null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[DELETE-ACCOUNT] Function started');

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client for getting current user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const body = await req.json().catch(() => ({}));
    const internalSecret = req.headers.get('x-internal-secret');
    const isInternalDeletion = isAuthorizedInternalCall(req);


    let user: { id: string } | null = null;
    let targetAccountId = '';
    let isAdminDeletion = false;
    let isScheduledClosureDeletion = false;
    let scheduledClosureRequestId: string | null = null;

    if (isInternalDeletion) {
      if (!body.target_account_id || !uuidRegex.test(body.target_account_id)) {
        return new Response(
          JSON.stringify({ error: 'Invalid target_account_id format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetAccountId = body.target_account_id;
      isScheduledClosureDeletion = true;

      const { data: dueClosure, error: dueClosureError } = await supabaseAdmin
        .from('account_closure_requests')
        .select('id,deletion_scheduled_date,status,legal_hold,legal_hold_reason')
        .eq('owner_user_id', targetAccountId)
        .eq('status', 'scheduled')
        .lte('deletion_scheduled_date', new Date().toISOString())
        .order('deletion_scheduled_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (dueClosureError || !dueClosure) {
        console.log('[DELETE-ACCOUNT] No due scheduled closure found for internal deletion', {
          targetAccountId,
          dueClosureError,
        });
        return new Response(
          JSON.stringify({ error: 'No due scheduled closure request found' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (dueClosure.legal_hold === true) {
        console.log('[DELETE-ACCOUNT] Scheduled closure blocked by legal hold', {
          targetAccountId,
          closureRequestId: dueClosure.id,
        });
        return new Response(
          JSON.stringify({
            error: 'Scheduled closure is under legal hold',
            reason: dueClosure.legal_hold_reason ?? null,
          }),
          { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      scheduledClosureRequestId = dueClosure.id;
    } else {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        console.log('[DELETE-ACCOUNT] No authorization header');
        return new Response(
          JSON.stringify({ error: 'No authorization header' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      )

      if (userError || !authUser) {
        console.log('[DELETE-ACCOUNT] Invalid token or no user:', userError);
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      user = authUser;
      targetAccountId = user.id;

      if (body.target_account_id && body.target_account_id !== user.id) {
        if (!uuidRegex.test(body.target_account_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid target_account_id format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        targetAccountId = body.target_account_id;
        isAdminDeletion = true;
      }
    }

    // Account deletion is destructive — for self-deletion, require a FRESH
    // MFA step-up (last 60s) if the user has MFA enrolled. Admin/contributor
    // deletions skip this gate (governed by contributor-role check above).
    if (!isAdminDeletion && !isScheduledClosureDeletion && user) {
      const gate = await requireStepUp(supabaseAdmin, user.id, {
        fresh: true,
        kind: 'delete_account',
        ip: getClientIp(req),
        corsHeaders,
      });
      if (!gate.ok) {
        console.log('[DELETE-ACCOUNT] Blocked by step-up gate');
        return gate.response;
      }
    }


    console.log('[DELETE-ACCOUNT] Verifying user permissions for:', user?.id ?? 'internal-sweeper', 'Target:', targetAccountId);

    const { data: heldClosure, error: heldClosureError } = await supabaseAdmin
      .from('account_closure_requests')
      .select('id,legal_hold_reason')
      .eq('owner_user_id', targetAccountId)
      .eq('status', 'scheduled')
      .eq('legal_hold', true)
      .order('deletion_scheduled_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (heldClosureError) {
      console.log('[DELETE-ACCOUNT] Legal hold check failed:', heldClosureError);
      return new Response(
        JSON.stringify({ error: 'Unable to verify legal hold status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (heldClosure) {
      console.log('[DELETE-ACCOUNT] Account deletion blocked by legal hold', {
        targetAccountId,
        closureRequestId: heldClosure.id,
      });
      return new Response(
        JSON.stringify({
          error: 'Account deletion is blocked by legal hold',
          reason: heldClosure.legal_hold_reason ?? null,
        }),
        { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const activeFreeze = await getActiveContinuityFreeze(supabaseAdmin, targetAccountId);
    if (activeFreeze) {
      console.log('[DELETE-ACCOUNT] Account deletion blocked by active continuity freeze', {
        targetAccountId,
        activeFreeze,
      });
      return new Response(
        JSON.stringify({
          error: 'Account deletion is blocked by an active continuity freeze',
          freeze_type: activeFreeze.freeze_type,
          reason: activeFreeze.reason,
        }),
        { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check contributor status
    const { data: contributorData, error: contributorError } = user
      ? await supabaseAdmin
        .from('contributors')
        .select('account_owner_id, role, status')
        .eq('contributor_user_id', user.id)
      : { data: null, error: null };

    if (contributorError) {
      console.log('[DELETE-ACCOUNT] Error checking contributor status:', contributorError);
    }

    // If this is an admin deletion (deleting someone else's account)
    if (isScheduledClosureDeletion) {
      console.log('[DELETE-ACCOUNT] Scheduled closure deletion authorized, proceeding with account:', targetAccountId);
    } else if (isAdminDeletion && user) {
      // Find the contributor relationship for this specific account
      const relevantContributor = contributorData?.find(
        c => c.account_owner_id === targetAccountId
      );

      if (!relevantContributor) {
        console.log('[DELETE-ACCOUNT] User is not a contributor to target account');
        return new Response(
          JSON.stringify({ error: 'You do not have access to this account' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (relevantContributor.role !== 'administrator' || relevantContributor.status !== 'accepted') {
        console.log('[DELETE-ACCOUNT] User is not an administrator:', relevantContributor);
        return new Response(
          JSON.stringify({ error: 'Only administrator contributors can delete accounts' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check for approved deletion request or expired grace period
      const { data: deletionRequest, error: requestError } = await supabaseAdmin
        .from('account_deletion_requests')
        .select('*')
        .eq('account_owner_id', targetAccountId)
        .eq('requester_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (requestError || !deletionRequest) {
        console.log('[DELETE-ACCOUNT] No deletion request found');
        return new Response(
          JSON.stringify({ error: 'You must first submit a deletion request before deleting this account' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const gracePeriodEnded = new Date(deletionRequest.grace_period_ends_at) <= new Date();
      const isApproved = deletionRequest.status === 'approved';
      const isPending = deletionRequest.status === 'pending';

      if (deletionRequest.status === 'rejected') {
        console.log('[DELETE-ACCOUNT] Deletion request was rejected');
        return new Response(
          JSON.stringify({ error: 'The account owner has rejected the deletion request' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!isApproved && !(isPending && gracePeriodEnded)) {
        const daysRemaining = Math.ceil(
          (new Date(deletionRequest.grace_period_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        console.log('[DELETE-ACCOUNT] Grace period not yet ended, days remaining:', daysRemaining);
        return new Response(
          JSON.stringify({ 
            error: `Cannot delete yet. The account owner has ${daysRemaining} day(s) to respond to the deletion request.` 
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('[DELETE-ACCOUNT] Admin deletion authorized, proceeding with account:', targetAccountId);
    } else if (user) {
      // User is deleting their own account
      // Check if they're only a contributor (not the owner)
      const ownsAccount = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!ownsAccount.data) {
        console.log('[DELETE-ACCOUNT] User does not own an account');
        return new Response(
          JSON.stringify({ error: 'You cannot delete an account you do not own' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check if user is a viewer/contributor (non-admin) trying to delete
      // They should only be able to delete their own account if they are the owner
      const isContributorToOthers = contributorData?.some(
        c => c.account_owner_id !== user.id && c.status === 'accepted'
      );

      // This is fine - they can still delete their own account even if they're a contributor elsewhere
      console.log('[DELETE-ACCOUNT] User owns account, proceeding with self-deletion');
    } else {
      return new Response(
        JSON.stringify({ error: 'Unable to authorize account deletion' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[DELETE-ACCOUNT] Authorization verified, proceeding with deletion of:', targetAccountId);

    // Get the target user's Stripe customer ID to cancel subscriptions
    const { data: subscriber } = await supabaseAdmin
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', targetAccountId)
      .single();

    // Cancel all active Stripe subscriptions
    if (subscriber?.stripe_customer_id) {
      try {
        console.log('[DELETE-ACCOUNT] Canceling Stripe subscriptions for customer:', subscriber.stripe_customer_id);
        
        const subscriptions = await stripe.subscriptions.list({
          customer: subscriber.stripe_customer_id,
          status: 'active',
        });

        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
          console.log('[DELETE-ACCOUNT] Canceled subscription:', subscription.id);
        }
      } catch (stripeError) {
        console.log('[DELETE-ACCOUNT] Error canceling Stripe subscriptions:', stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // ====================================================================
    // RETENTION MATRIX EXECUTION
    // 1. Fetch email (needed for tombstone + email-based anonymization)
    // 2. Call anonymize_user_data RPC (handles all retain/anonymize tables)
    // 3. Queue and attempt storage deletion jobs while content rows exist
    // 4. Purge user-content tables below
    // 5. Delete auth user (later in the function)
    // ====================================================================

    const { data: targetUserData } = await supabaseAdmin.auth.admin.getUserById(targetAccountId);
    const targetUserEmail = targetUserData?.user?.email ?? null;

    // --- Step A: anonymize via RPC ---------------------------------------
    let tombstoneId: string | null = null;
    {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('anonymize_user_data', {
        p_user_id: targetAccountId,
        p_email: targetUserEmail,
        p_deleted_by: isScheduledClosureDeletion ? 'scheduled_closure' : isAdminDeletion ? 'admin' : 'self',
      });
      if (rpcError) {
        const errorId = crypto.randomUUID();
        console.log('[DELETE-ACCOUNT] anonymize_user_data RPC failed:', { errorId, rpcError });
        return new Response(
          JSON.stringify({ error: 'Account deletion failed (anonymize step).', errorId }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      tombstoneId = (rpcData as unknown as string) ?? null;
      console.log('[DELETE-ACCOUNT] Anonymized via RPC. Tombstone:', tombstoneId);
    }

    if (!tombstoneId) {
      const errorId = crypto.randomUUID();
      console.log('[DELETE-ACCOUNT] anonymize_user_data RPC returned no tombstone id:', { errorId });
      return new Response(
        JSON.stringify({ error: 'Account deletion failed (tombstone missing).', errorId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const storageCleanup = await cleanupAccountStorage(supabaseAdmin, {
        deletedAccountId: tombstoneId,
        targetAccountId,
      });
      console.log('[DELETE-ACCOUNT] Storage cleanup queued and attempted', storageCleanup);
    } catch (storageCleanupError) {
      const errorId = crypto.randomUUID();
      console.error('[DELETE-ACCOUNT] Storage cleanup failed, aborting account deletion:', {
        errorId,
        error: storageCleanupError instanceof Error ? storageCleanupError.message : String(storageCleanupError),
      });
      return new Response(
        JSON.stringify({
          error: 'Account deletion could not complete because file deletion jobs could not be queued. Please try again.',
          errorId,
          retryable: true,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // --- Step B: purge user-content tables (matrix "purge" only) ---------
    // NOTE: payment_events, subscribers, audit_logs, gift_subscriptions,
    // entitlements, account_deletion_requests, account_closure_requests,
    // user_activity_logs, checkout_*, subscription_cancellations are NOT
    // listed here — they are handled by anonymize_user_data (or retained).
    const tablesWithUserId = [
      'voice_note_attachments',
      'receipts',
      'legacy_locker_voice_notes',
      'legacy_locker_files',
      'legacy_locker_folders',
      'legacy_locker',
      'property_files',
      'items',
      'properties',
      'damage_reports',
      'insurance_policies',
      'notification_preferences',
      'calendar_event_attachments',
      'calendar_events',
      'events',
      'user_roles',
      'paint_codes',
      'financial_accounts',
      'source_websites',
      'document_folders',
      'video_folders',
      'photo_folders',
      'trust_information',
      'password_catalog',
      'storage_usage',
      'user_notes',
      'contacts',
      'profiles',
      'account_verification',
      'vip_contact_attachments',
      'vip_contacts',
    ];

    // recovery_requests uses owner/delegate columns
    try {
      await supabaseAdmin.from('recovery_requests').delete().eq('owner_user_id', targetAccountId);
      await supabaseAdmin.from('recovery_requests').delete().eq('delegate_user_id', targetAccountId);
    } catch (error) {
      console.log('[DELETE-ACCOUNT] Error deleting recovery requests:', error);
    }

    for (const table of tablesWithUserId) {
      try {
        const { error: deleteError } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', targetAccountId);
        if (deleteError) {
          console.log(`[DELETE-ACCOUNT] Error deleting from ${table}:`, deleteError);
        }
      } catch (error) {
        console.log(`[DELETE-ACCOUNT] Error processing table ${table}:`, error);
      }
    }

    // contributors uses different column names
    try {
      await supabaseAdmin.from('contributors').delete().eq('contributor_user_id', targetAccountId);
      await supabaseAdmin.from('contributors').delete().eq('account_owner_id', targetAccountId);
    } catch (error) {
      console.log('[DELETE-ACCOUNT] Error deleting contributors:', error);
    }

    // Tombstone already inserted by anonymize_user_data RPC above.
    // Delete the user account using admin client
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(targetAccountId);

    if (deleteUserError) {
      const errorId = crypto.randomUUID();
      console.log('[DELETE-ACCOUNT] Error deleting user:', { errorId, error: deleteUserError });
      await supabaseAdmin
        .from('deleted_accounts')
        .update({ deletion_status: 'failed' })
        .eq('id', tombstoneId);
      return new Response(
        JSON.stringify({ 
          error: 'Account deletion failed. Please try again.',
          errorId 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('[DELETE-ACCOUNT] Successfully deleted user:', targetAccountId);

    await supabaseAdmin
      .from('deleted_accounts')
      .update({ deletion_status: 'completed' })
      .eq('id', tombstoneId);

    if (scheduledClosureRequestId) {
      await supabaseAdmin
        .from('account_closure_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          deleted_account_id: tombstoneId,
        })
        .eq('id', scheduledClosureRequestId);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error('[DELETE-ACCOUNT] ERROR in delete-account:', { errorId, error });
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred. Please try again.',
        errorId 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
});
