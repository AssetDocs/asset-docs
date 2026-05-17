// @ts-nocheck
import React, { useState, useEffect } from 'react';
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
import { Crown, Info, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from '@/contexts/AccountContext';

interface Member {
  id: string;
  user_id: string;
  role: string;
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
  const [current, setCurrent] = useState<LegacyAdminRow | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const eligibleMembers = members.filter(m => m.role !== 'owner');

  const fetchCurrent = async () => {
    if (!accountId) return;
    const { data } = await supabase
      .from('legacy_admins')
      .select('id, legacy_admin_user_id, assigned_at, notes')
      .eq('account_id', accountId)
      .eq('status', 'active')
      .maybeSingle();
    setCurrent(data || null);
  };

  useEffect(() => { fetchCurrent(); }, [accountId]);

  const memberLabel = (userId: string) => {
    const m = members.find(x => x.user_id === userId);
    if (!m) return 'Authorized user';
    const name = `${m.first_name || ''} ${m.last_name || ''}`.trim();
    return name || m.email || 'Authorized user';
  };

  const handleAssign = async () => {
    if (!selectedUserId || !accountId) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Remove any existing active first (single active enforced by unique index)
      if (current) {
        await supabase
          .from('legacy_admins')
          .update({ status: 'removed' })
          .eq('id', current.id);
      }

      const { error } = await supabase.from('legacy_admins').insert({
        account_id: accountId,
        legacy_admin_user_id: selectedUserId,
        assigned_by_owner_id: user.id,
      });
      if (error) throw error;

      // Fire-and-forget email notification to the newly designated Legacy Admin
      supabase.functions
        .invoke('send-legacy-admin-notification', {
          body: { legacy_admin_user_id: selectedUserId, account_id: accountId },
        })
        .catch((e) => console.warn('legacy admin email failed', e));

      toast({ title: 'Legacy Admin assigned', description: `${memberLabel(selectedUserId)} is now your Legacy Admin.` });
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
    if (!current) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('legacy_admins')
        .update({ status: 'removed' })
        .eq('id', current.id);
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
          <Crown className="h-5 w-5 text-amber-600" />
          Legacy Admin
        </CardTitle>
        <CardDescription>
          A Legacy Admin is the person you choose to help manage your Asset Safe account if you become unable to do so.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This designation does not grant immediate billing, deletion, or owner-profile access. It records your chosen
            account successor for future continuity. Their normal Read Only or Full Access permissions are unchanged.
          </AlertDescription>
        </Alert>

        {current ? (
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Crown className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium">{memberLabel(current.legacy_admin_user_id)}</p>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 mt-1">Legacy Admin</Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setRemoveOpen(true)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No Legacy Admin selected yet.</p>
        )}

        {eligibleMembers.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={current ? 'Change Legacy Admin…' : 'Choose an authorized user…'} />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers
                  .filter(m => m.user_id !== current?.legacy_admin_user_id)
                  .map(m => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {memberLabel(m.user_id)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button disabled={!selectedUserId || loading} onClick={() => setConfirmOpen(true)}>
              {current ? 'Change' : 'Assign'} Legacy Admin
            </Button>
          </div>
        )}

        {eligibleMembers.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Invite an authorized user first — only existing authorized users can be designated as Legacy Admin.
          </p>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Legacy Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This does not give immediate billing or deletion access. It records your chosen account successor for
              future continuity. You can change or remove this designation at any time.
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
              This will clear the current Legacy Admin designation. Their normal authorized-user access (Read Only or
              Full Access) is unchanged.
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
