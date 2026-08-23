// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Crown, FileText, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';
import { encryptPassword } from '@/utils/encryption';

interface Props {
  /** Optional Secure Vault passphrase from parent SecureVault context — when set, notes are encrypted. */
  vaultPassphrase?: string | null;
}

const AccountContinuityInstructions: React.FC<Props> = ({ vaultPassphrase }) => {
  const { user } = useAuth();
  const { accountId, isOwner } = useAccount();
  const { toast } = useToast();
  const [preference, setPreference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [legacyAdminNames, setLegacyAdminNames] = useState<string[]>([]);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (!user || !accountId) return;
    (async () => {
      const { data: locker } = await supabase
        .from('legacy_locker')
        .select('continuity_preference, continuity_notes, continuity_notes_encrypted')
        .eq('user_id', user.id)
        .maybeSingle();
      if (locker) {
        setPreference(locker.continuity_preference || '');
        // Prefer encrypted if vault unlocked; otherwise show plaintext label only
        setNotes(locker.continuity_notes || '');
      }

      const { data: la } = await supabase
        .from('legacy_admins')
        .select('legacy_admin_user_id')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .order('assigned_at', { ascending: true })
        .limit(1);
      if (la?.length) {
        const ids = la.map((row: any) => row.legacy_admin_user_id);
        const { data: profs } = await supabase
          .from('profiles_safe' as any)
          .select('user_id, first_name, last_name')
          .in('user_id', ids);
        const profileMap = new Map((profs || []).map((p: any) => [p.user_id, p]));
        setLegacyAdminNames(la.map((row: any) => {
          const prof = profileMap.get(row.legacy_admin_user_id);
          return `${prof?.first_name || ''} ${prof?.last_name || ''}`.trim() || 'Authorized user';
        }));
      } else {
        setLegacyAdminNames([]);
      }

      const { count } = await supabase
        .from('account_continuity_requests')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId);
      setRequestCount(count || 0);
    })();
  }, [user?.id, accountId]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const payload: any = {
        user_id: user.id,
        continuity_preference: preference || null,
      };
      if (vaultPassphrase && notes) {
        payload.continuity_notes_encrypted = await encryptPassword(notes, vaultPassphrase);
        payload.continuity_notes = null;
      } else {
        payload.continuity_notes = notes || null;
        payload.continuity_notes_encrypted = null;
      }

      const { error } = await supabase
        .from('legacy_locker')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Continuity instructions saved' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) return null;

  return (
    <Card>
      <CardHeader className="p-0">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="legacy-instructions-content"
          className="w-full text-left p-6 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors rounded-t-lg"
        >
          <span className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legacy Instructions
            </CardTitle>
            <CardDescription>
              Leave guidance for the people you trust if you are ever unable to manage your account yourself.
              These instructions are stored for reference and do not automatically trigger account access,
              transfer, or other actions.
            </CardDescription>
          </span>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`}
            aria-hidden="true"
          />
        </button>
      </CardHeader>
      {isOpen && (
      <CardContent id="legacy-instructions-content" className="space-y-4">
        <div className="rounded-md border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-600" />
            <span className="text-sm">Selected Legacy Admin:</span>
          </div>
          {legacyAdminNames.length ? (
            <div className="flex flex-wrap justify-end gap-1">
              {legacyAdminNames.map((name) => (
                <Badge key={name} className="bg-amber-100 text-amber-800 border-amber-200">{name}</Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">None assigned</span>
          )}
        </div>

        <div>
          <Label>Account preference</Label>
          <Select value={preference} onValueChange={setPreference}>
            <SelectTrigger>
              <SelectValue placeholder="Select what should happen…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintain">Maintain — keep the account active</SelectItem>
              <SelectItem value="export">Export — make my data available to my Legacy Admin / family</SelectItem>
              <SelectItem value="close">Close — wind down and close the account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            Notes for family or support
            {vaultPassphrase && <Lock className="h-3.5 w-3.5 text-green-600" />}
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Any special instructions, contacts, or context…"
          />
          {vaultPassphrase ? (
            <p className="text-xs text-green-700 mt-1">Notes will be encrypted with your Secure Vault passphrase.</p>
          ) : (
            <Alert className="mt-2">
              <AlertDescription className="text-xs">
                Unlock your Secure Vault to store sensitive notes encrypted. Without encryption, keep notes
                non-sensitive (e.g., "Maintain for 90 days, then export").
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {requestCount > 0
              ? `${requestCount} continuity request${requestCount === 1 ? '' : 's'} on file`
              : 'No continuity requests submitted'}
          </p>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : 'Save Instructions'}
          </Button>
        </div>
      </CardContent>
      )}
    </Card>
  );
};

export default AccountContinuityInstructions;
