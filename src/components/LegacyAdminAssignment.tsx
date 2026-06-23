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
  designation_role: 'primary' | 'secondary';
  designation_priority: number;
  notes: string | null;
}

const LegacyAdminAssignment: React.FC<Props> = ({ members }) => {
  const { accountId, isOwner } = useAccount();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<LegacyAdminRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'primary' | 'secondary'>('secondary');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<LegacyAdminRow | null>(null);
  const [loading, setLoading] = useState(false);

  const eligibleMembers = members.filter(m => m.role !== 'owner');
  const primary = admins.find(a => a.designation_role === 'primary');

  const fetchCurrent = async () => {
    if (!accountId) return;
    const { data } = await supabase
      .from('legacy_admins')
      .select('id, legacy_admin_user_id, assigned_at, designation_role, designation_priority, notes')
      .eq('account_id', accountId)
      .eq('status', 'active')
      .order('designation_priority', { ascending: true })
      .order('assigned_at', { ascending: true });
    const active = data || [];
    setAdmins(active);
    setSelectedRole(active.some((a) => a.designation_role === 'primary') ? 'secondary' : 'primary');
  };

  useEffect(() => { fetchCurrent(); }, [accountId]);

  const memberLabel = (userId: string) => {
    const m = members.find(x => x.user_id === userId);
    if (!m) return 'Authorized user';
    const name = `${m.first_name || ''} ${m.last_name || ''}`.trim();
    return name || m.email || 'Authorized user';
  };

  const availableMembers = eligibleMembers.filter(m => !admins.some(a => a.legacy_admin_user_id === m.user_id));

  const handleAssign = async () => {
    if (!selectedUserId || !accountId) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (selectedRole === 'primary' && primary) {
        await supabase
          .from('legacy_admins')
          .update({ designation_role: 'secondary', designation_priority: 2 })
          .eq('id', primary.id);
      }

      const nextSecondaryPriority = Math.max(1, ...admins.map((a) => a.designation_priority || 1)) + 1;
      const { error } = await supabase.from('legacy_admins').insert({
        account_id: accountId,
        legacy_admin_user_id: selectedUserId,
        assigned_by_owner_id: user.id,
        designation_role: selectedRole,
        designation_priority: selectedRole === 'primary' ? 1 : nextSecondaryPriority,
      });
      if (error) throw error;

      supabase.functions
        .invoke('send-legacy-admin-notification', {
          body: { legacy_admin_user_id: selectedUserId, account_id: accountId },
        })
        .catch((e) => console.warn('legacy admin email failed', e));

      toast({
        title: selectedRole === 'primary' ? 'Primary Legacy Admin assigned' : 'Secondary Legacy Admin added',
        description: `${memberLabel(selectedUserId)} is now a ${selectedRole} Legacy Admin.`,
      });
      setConfirmOpen(false);
      setSelectedUserId('');
      setSelectedRole(primary ? 'secondary' : 'primary');
      fetchCurrent();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('legacy_admins')
        .update({ status: 'removed' })
        .eq('id', removeTarget.id);
      if (error) throw error;
      toast({ title: 'Legacy Admin removed' });
      setRemoveTarget(null);
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
          Legacy Admins
        </CardTitle>
        <CardDescription>
          Designate trusted people who may submit continuity requests if you become unavailable or unable to manage your account.
          You can keep one primary Legacy Admin and add secondary Legacy Admins as backups.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This is a designation, not an immediate role change. It does not grant ownership,
            billing, deletion, or owner-profile access. Their normal Read Only or Full Access
            permissions are unchanged.
          </AlertDescription>
        </Alert>

        {admins.length > 0 ? (
          <div className="space-y-2">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <HeartHandshake className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{memberLabel(admin.legacy_admin_user_id)}</p>
                    <Badge className={admin.designation_role === 'primary' ? 'bg-primary/10 text-primary border-primary/20 mt-1' : 'bg-muted text-muted-foreground border-border mt-1'}>
                      {admin.designation_role === 'primary' ? 'Primary Legacy Admin' : 'Secondary Legacy Admin'}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(admin)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No Legacy Admin selected yet.</p>
        )}

        {availableMembers.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose an authorized user..." />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map(m => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {memberLabel(m.user_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={!selectedUserId || loading} onClick={() => setConfirmOpen(true)}>
              Add Legacy Admin
            </Button>
          </div>
        )}

        {eligibleMembers.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Invite an authorized user first. Only existing authorized users can be designated as a Legacy Admin.
          </p>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Legacy Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This is a designation, not an immediate role change. If you choose Primary, any current primary Legacy Admin will become secondary.
              You can change or remove designations at any time.
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

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Legacy Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the Legacy Admin designation for {removeTarget ? memberLabel(removeTarget.legacy_admin_user_id) : 'this user'}.
              Their normal authorized-user access is unchanged.
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
