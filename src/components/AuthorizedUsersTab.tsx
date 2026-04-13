// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Trash2, Mail, Shield, Eye, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAccount } from '@/contexts/AccountContext';
import { logActivity } from '@/hooks/useActivityLog';
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';

interface Member {
  id: string;
  user_id: string;
  role: 'owner' | 'full_access' | 'read_only';
  status: string;
  accepted_at: string | null;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const AuthorizedUsersTab: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'full_access' | 'read_only'>('read_only');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { hasFeature } = useSubscription();
  const { accountId, isOwner } = useAccount();

  const hasPremiumAccess = hasFeature('trusted_contacts');

  useEffect(() => {
    if (accountId) {
      fetchMembers();
      fetchPendingInvites();
    }
  }, [accountId]);

  const fetchMembers = async () => {
    if (!accountId) return;

    const { data, error } = await supabase
      .from('account_memberships')
      .select('id, user_id, role, status, accepted_at')
      .eq('account_id', accountId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching members:', error);
      return;
    }

    // Fetch profile info for each member
    const membersWithProfiles = await Promise.all(
      (data || []).map(async (m) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', m.user_id)
          .single();

        // Get email from auth (we'll use profiles or a fallback)
        const { data: authData } = await supabase.auth.admin?.getUserById?.(m.user_id) || { data: null };

        return {
          ...m,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          email: authData?.user?.email || '',
        };
      })
    );

    setMembers(membersWithProfiles);
  };

  const fetchPendingInvites = async () => {
    if (!accountId) return;

    const { data, error } = await supabase
      .from('invites')
      .select('id, email, role, status, created_at, expires_at')
      .eq('account_id', accountId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching invites:', error);
      return;
    }

    setPendingInvites(data || []);
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({ title: 'Email required', description: 'Please enter an email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: { email: email.trim(), role },
        headers: { Authorization: `Bearer ${session.session.access_token}` },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${email.trim()}.`,
      });

      await logActivity({
        action_type: 'contributor_invite',
        resource_type: 'authorized_user',
        resource_name: email.trim(),
      });

      setEmail('');
      setRole('read_only');
      fetchPendingInvites();
    } catch (err: any) {
      toast({
        title: 'Error sending invitation',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (membershipId: string, memberName: string) => {
    try {
      const { error } = await supabase
        .from('account_memberships')
        .update({ status: 'revoked' })
        .eq('id', membershipId);

      if (error) throw error;

      toast({ title: 'Access revoked', description: `${memberName}'s access has been removed.` });

      await logActivity({
        action_type: 'contributor_remove',
        resource_type: 'authorized_user',
        resource_name: memberName,
      });

      fetchMembers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleChangeRole = async (membershipId: string, newRole: 'full_access' | 'read_only') => {
    try {
      const { error } = await supabase
        .from('account_memberships')
        .update({ role: newRole })
        .eq('id', membershipId);

      if (error) throw error;

      toast({ title: 'Role updated', description: `Role changed to ${newRole === 'full_access' ? 'Full Access' : 'Read Only'}.` });
      fetchMembers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'expired' })
        .eq('id', inviteId);

      if (error) throw error;

      toast({ title: 'Invitation cancelled' });
      fetchPendingInvites();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Owner</Badge>;
      case 'full_access':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Full Access</Badge>;
      case 'read_only':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Read Only</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getMemberName = (member: Member) => {
    if (member.first_name || member.last_name) {
      return `${member.first_name || ''} ${member.last_name || ''}`.trim();
    }
    return member.email || 'Unknown';
  };

  if (!hasPremiumAccess) {
    return (
      <PremiumFeatureGate
        featureName="Authorized Users"
        description="Invite trusted individuals to view or manage your account with the Premium plan."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite Form — Owner only */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Authorized User
            </CardTitle>
            <CardDescription>
              Send an invitation to a trusted individual to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Access Level</Label>
                <Select value={role} onValueChange={(val) => setRole(val as 'full_access' | 'read_only')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_access">Full Access</SelectItem>
                    <SelectItem value="read_only">Read Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleInvite} disabled={loading} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Authorized Users
          </CardTitle>
          <CardDescription>
            People who have access to this account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">
              No authorized users yet. Invite someone above to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.role === 'owner' ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : member.role === 'full_access' ? (
                        <Users className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{getMemberName(member)}</p>
                      {member.email && (
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(member.role)}
                    {isOwner && member.role !== 'owner' && (
                      <div className="flex items-center gap-1">
                        <Select
                          value={member.role}
                          onValueChange={(val) => handleChangeRole(member.id, val as 'full_access' | 'read_only')}
                        >
                          <SelectTrigger className="h-7 text-xs w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_access">Full Access</SelectItem>
                            <SelectItem value="read_only">Read Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {getMemberName(member)}'s access to your account? They will no longer be able to view or manage your account data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevoke(member.id, getMemberName(member))}>
                                Remove Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited {new Date(invite.created_at).toLocaleDateString()} · Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(invite.role)}
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive"
                        onClick={() => handleCancelInvite(invite.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthorizedUsersTab;
