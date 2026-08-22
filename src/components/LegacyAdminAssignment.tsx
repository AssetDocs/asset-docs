// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HeartHandshake, Info, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from '@/contexts/AccountContext';

interface Member {
  id: string;
  user_id: string;
  role: string;
  status?: string;
  accepted_at?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string;
}

interface Props {
  members: Member[];
}

interface LegacyAdminRow {
  id: string;
  legacy_admin_user_id: string;
  assigned_at: string;
  notes: string | null;
}

const LegacyAdminAssignment: React.FC<Props> = ({ members }) => {
  const { accountId, isOwner } = useAccount();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<LegacyAdminRow | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only an active Full Access authorized user may be designated.
  const eligibleMembers = members.filter(
    (m) => m.role === 'full_access' && (m.status ?? 'active') === 'active',
  );

  const fetchCurrent = async () => {
    if (!accountId) return;
    const { data } = await supabase
      .from('legacy_admins')
      .select('id, legacy_admin_user_id, assigned_at, notes')
      .eq('account_id', accountId)
      .eq('status', 'active')
      .maybeSingle();
    setAdmin(data || null);
  };

  useEffect(() => { fetchCurrent(); }, [accountId]);

  const memberLabel = (userId: string) => {
    const m = members.find((x) => x.user_id === userId);
    if (!m) return 'Authorized user';
    const name = `${m.first_name || ''} ${m.last_name || ''}`.trim();
    return name || m.email || 'Authorized user';
  };

  const availableMembers = eligibleMembers.filter((m) => m.user_id !== admin?.legacy_admin_user_id);

  const handleAssign = async () => {
    if (!selectedUserId || !accountId) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('assign_legacy_admin', {
        _account_id: accountId,
        _user_id: selectedUserId,
      });
      if (error) throw error;

      supabase.functions
        .invoke('send-legacy-admin-notification', {
          body: { legacy_admin_user_id: selectedUserId, account_id: accountId },
        })
        .catch((e) => console.warn('legacy admin email failed', e));

      toast({
        title: 'Legacy Admin assigned',
        description: `${memberLabel(selectedUserId)} is now your Legacy Admin.`,
      });
      setConfirmOpen(false);
      setSelectedUserId('');
      fetchCurrent();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('clear_legacy_admin', { _account_id: accountId });
      if (error) throw error;
      toast({ title: 'Legacy Admin removed' });
      setRemoveOpen(false);
      fetchCurrent();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" />
          Legacy Admin
        </CardTitle>
        <CardDescription>
          Designate one trusted person who may submit continuity requests, and who participates in
          Secure Vault recovery, if you become unavailable or unable to manage your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This is a designation, not an immediate role change. It does not grant ownership,
            billing, deletion, or owner-profile access, and it never transfers account ownership.
            Only an active Full Access authorized user can be your Legacy Admin, and their normal
            Full Access permissions are unchanged. If their access is downgraded or revoked, this
            designation is cleared automatically.
          </AlertDescription>
        </Alert>

        {admin ? (
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <HeartHandshake className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{memberLabel(admin.legacy_admin_user_id)}</p>
                <Badge className="bg-primary/10 text-primary border-primary/20 mt-1">
                  Legacy Admin
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setRemoveOpen(true)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No Legacy Admin selected yet.</p>
        )}

        {availableMembers.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a Full Access authorized user..." />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {memberLabel(m.user_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={!selectedUserId || loading} onClick={() => setConfirmOpen(true)}>
              {admin ? 'Replace Legacy Admin' : 'Assign Legacy Admin'}
            </Button>
          </div>
        )}

        {eligibleMembers.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Invite a Full Access authorized user first. Only an active Full Access authorized user can
            be designated as your Legacy Admin.
          </p>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{admin ? 'Replace Legacy Admin?' : 'Assign Legacy Admin?'}</AlertDialogTitle>
            <AlertDialogDescription>
              This is a designation, not an immediate role change. You can have one Legacy Admin at a
              time{admin ? ', so your current Legacy Admin will be replaced and any Secure Vault recovery access issued to them will be revoked' : ''}.
              You can change or remove this designation at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssign} disabled={loading}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Legacy Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the Legacy Admin designation for{' '}
              {admin ? memberLabel(admin.legacy_admin_user_id) : 'this user'} and revokes any Secure
              Vault recovery access or open recovery requests tied to them. Their normal
              authorized-user access is unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={loading} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default LegacyAdminAssignment;
