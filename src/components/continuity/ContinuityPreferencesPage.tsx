// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { toast } from 'sonner';
import { Crown, ShieldCheck, Heart, Lock } from 'lucide-react';

const INCAPACITY_OPTIONS = [
  { key: 'allow_temporary_stewardship', label: 'Allow Temporary Stewardship' },
  { key: 'allow_view', label: 'Allow limited account viewing' },
  { key: 'allow_upload_download', label: 'Allow document upload/download' },
  { key: 'allow_billing_visibility', label: 'Allow billing visibility' },
  { key: 'allow_export', label: 'Allow export access' },
  { key: 'allow_vault_access', label: 'Allow Secure Vault access' },
  { key: 'require_manual_review', label: 'Require Asset Safe manual review before any access' },
];

const PERMANENT_INCAPACITY_OPTIONS = [
  { key: 'allow_temporary_stewardship', label: 'Allow Temporary Stewardship' },
  { key: 'allow_archive_custodian', label: 'Allow Archive Custodian Mode' },
  { key: 'allow_full_transfer', label: 'Allow Full Ownership Transfer' },
  { key: 'allow_data_export', label: 'Allow data export' },
  { key: 'allow_vault_access', label: 'Allow Secure Vault access' },
  { key: 'require_legal_documentation', label: 'Require legal documentation' },
  { key: 'require_secondary_approval', label: 'Require secondary Asset Safe approval' },
];

const DEATH_OPTIONS = [
  { key: 'allow_full_transfer', label: 'Allow Full Ownership Transfer' },
  { key: 'allow_archive_custodian', label: 'Allow Archive Custodian Mode' },
  { key: 'allow_export', label: 'Allow account export' },
  { key: 'preserve_family_archive', label: 'Preserve Family Archive' },
  { key: 'allow_vault_access', label: 'Allow Secure Vault access' },
  { key: 'require_death_certificate', label: 'Require death certificate' },
  { key: 'require_executor_docs', label: 'Require executor or legal authority documentation' },
];

const VAULT_SEGMENTS = [
  'Secure Vault', 'Password Catalog', 'Family Archive', 'Legacy Locker',
  'Property Records', 'Financial Documents', 'Personal Notes',
];

const SEGMENT_POLICY = [
  { value: 'transfer_allowed', label: 'Transfer allowed' },
  { value: 'export_only', label: 'Export allowed only' },
  { value: 'requires_additional_docs', label: 'Requires additional documentation' },
  { value: 'requires_secondary_verification', label: 'Requires secondary verification' },
  { value: 'never_transfer', label: 'Never transfer' },
  { value: 'preserve_read_only', label: 'Preserve read-only' },
];

const READINESS_LABELS: Record<string, string> = {
  legacy_admin_assigned: 'Legacy Admin assigned',
  mfa_enabled: 'MFA enabled',
  backup_email_verified: 'Backup email verified',
  continuity_prefs: 'Continuity preferences configured',
  vault_prefs: 'Secure Vault preferences configured',
  export_prefs: 'Export preferences configured',
  emergency_contact: 'Emergency contact added',
  reviewed_within_12_months: 'Preferences reviewed in the last 12 months',
};

const DEFAULT_PREFS = {
  incapacity: { require_manual_review: true },
  permanent_incapacity: { require_legal_documentation: true, require_secondary_approval: true },
  death: { require_death_certificate: true, require_executor_docs: true },
  vault_segments: {
    'Password Catalog': 'requires_secondary_verification',
    'Secure Vault': 'requires_secondary_verification',
  },
};

const ContinuityPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const { isOwner } = useAccount();
  const [prefs, setPrefs] = useState<any>(DEFAULT_PREFS);
  const [annual, setAnnual] = useState(false);
  const [reviewedAt, setReviewedAt] = useState<string | null>(null);
  const [version, setVersion] = useState(1);
  const [readiness, setReadiness] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('legacy_locker')
        .select('continuity_preferences, continuity_annual_reminder, continuity_preferences_reviewed_at, continuity_preferences_version')
        .eq('user_id', user.id).maybeSingle();
      if (data) {
        setPrefs({ ...DEFAULT_PREFS, ...(data.continuity_preferences || {}) });
        setAnnual(!!data.continuity_annual_reminder);
        setReviewedAt(data.continuity_preferences_reviewed_at || null);
        setVersion(data.continuity_preferences_version || 1);
      }
      const { data: r } = await supabase.rpc('compute_continuity_readiness', { _user_id: user.id });
      setReadiness(r || null);
    })();
  }, [user?.id]);

  if (!isOwner) {
    return (
      <Card><CardContent className="p-6 text-sm text-muted-foreground">
        Continuity Preferences are managed by the account owner.
      </CardContent></Card>
    );
  }

  const setSection = (section: string, key: string, value: any) =>
    setPrefs((p: any) => ({ ...p, [section]: { ...(p[section] || {}), [key]: value } }));

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase.from('legacy_locker').upsert({
      user_id: user.id,
      continuity_preferences: prefs,
      continuity_annual_reminder: annual,
      continuity_preferences_reviewed_at: new Date().toISOString(),
      continuity_preferences_version: version + 1,
    }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setVersion((v) => v + 1);
    setReviewedAt(new Date().toISOString());
    toast.success('Continuity preferences saved');
  };

  const renderCheckboxes = (section: string, options: any[]) => (
    <div className="space-y-2">
      {options.map((o) => (
        <label key={o.key} className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={!!prefs[section]?.[o.key]}
            onCheckedChange={(c) => setSection(section, o.key, !!c)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Continuity Preferences</CardTitle>
          <CardDescription>
            Define your wishes for what should happen to this account if you become incapacitated or unable to manage it.
            Asset Safe always manually reviews any continuity request — your preferences guide that review.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {reviewedAt ? <>Last reviewed {new Date(reviewedAt).toLocaleDateString()} • Version {version}</> : <>Not yet reviewed</>}
        </CardContent>
      </Card>

      {/* Readiness widget */}
      {readiness && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Legacy Continuity Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Progress value={readiness.percentage} className="flex-1" />
              <span className="text-sm font-medium">{readiness.score}/{readiness.max}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
              {Object.entries(readiness.checklist).map(([k, v]: any) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={v ? 'text-emerald-600' : 'text-muted-foreground'}>{v ? '✓' : '○'}</span>
                  <span className={v ? '' : 'text-muted-foreground'}>{READINESS_LABELS[k] || k}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incapacity */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4" /> If I become temporarily incapacitated</CardTitle></CardHeader>
        <CardContent>{renderCheckboxes('incapacity', INCAPACITY_OPTIONS)}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">If I become permanently incapacitated</CardTitle></CardHeader>
        <CardContent>{renderCheckboxes('permanent_incapacity', PERMANENT_INCAPACITY_OPTIONS)}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">If I pass away</CardTitle></CardHeader>
        <CardContent>{renderCheckboxes('death', DEATH_OPTIONS)}</CardContent>
      </Card>

      {/* Vault segments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Protected Vault Segments</CardTitle>
          <CardDescription>Choose how each sensitive area should be handled during a continuity event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {VAULT_SEGMENTS.map((seg) => (
            <div key={seg} className="flex items-center justify-between gap-3">
              <Label className="text-sm flex-1">{seg}</Label>
              <Select
                value={prefs.vault_segments?.[seg] || ''}
                onValueChange={(v) => setSection('vault_segments', seg, v)}
              >
                <SelectTrigger className="w-72"><SelectValue placeholder="Select policy…" /></SelectTrigger>
                <SelectContent>
                  {SEGMENT_POLICY.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Annual review */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Annual Review Reminder</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label>Remind me once per year to review my Legacy Continuity settings.</Label>
          <Switch checked={annual} onCheckedChange={setAnnual} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Preferences'}</Button>
      </div>
    </div>
  );
};

export default ContinuityPreferencesPage;
