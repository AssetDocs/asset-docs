import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Trash2, Mail, Shield, Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { checkContributorLimit } from '@/config/subscriptionFeatures';

interface Contributor {
  id: string;
  contributor_email: string;
  contributor_user_id: string | null;
  role: 'administrator' | 'contributor' | 'viewer';
  status: string;
  invited_at: string;
  accepted_at: string | null;
}

const ContributorsTab: React.FC = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'administrator' | 'contributor' | 'viewer'>('viewer');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { subscriptionStatus, isInTrial } = useSubscription();

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('contributors')
      .select('*')
      .eq('account_owner_id', user.id)
      .order('invited_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contributors",
        variant: "destructive",
      });
      return;
    }

    setContributors(data || []);
  };

  const inviteContributor = async () => {
    if (!email || !role) return;

    // Check contributor limits
    const limitCheck = checkContributorLimit(
      contributors.length,
      subscriptionStatus?.subscription_tier as any,
      isInTrial
    );
    
    if (!limitCheck.canAdd) {
      toast({
        title: "Contributor Limit Reached",
        description: limitCheck.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's profile information for the invitation email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const inviterName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.email;
    
    // Create redirect URL for password creation
    const redirectUrl = `${window.location.origin}/auth?mode=contributor&email=${encodeURIComponent(email)}`;

    // First, create the database record
    const { error: dbError } = await supabase
      .from('contributors')
      .insert({
        account_owner_id: user.id,
        contributor_email: email,
        role: role,
      });

    if (dbError) {
      if (dbError.code === '23505') {
        toast({
          title: "Error",
          description: "This email is already invited as a contributor",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to invite contributor",
          variant: "destructive",
        });
      }
      setLoading(false);
      return;
    }

    // Then, send the invitation email with redirect URL
    try {
      const { error: emailError } = await supabase.functions.invoke('send-contributor-invitation', {
        body: {
          contributor_email: email,
          contributor_role: role,
          inviter_name: inviterName || 'Asset Safe User',
          inviter_email: user.email,
          redirect_url: redirectUrl,
        },
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: "Warning",
          description: "Contributor added but invitation email failed to send",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Contributor invitation sent successfully. They will be prompted to create a password.",
        });
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
      toast({
        title: "Warning", 
        description: "Contributor added but invitation email failed to send",
        variant: "destructive",
      });
    }

    setEmail('');
    setRole('viewer');
    fetchContributors();
    setLoading(false);
  };

  const removeContributor = async (contributorId: string) => {
    const { error } = await supabase
      .from('contributors')
      .delete()
      .eq('id', contributorId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove contributor",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Contributor removed successfully",
      });
      fetchContributors();
    }
  };

  const resendInvitation = async (contributorId: string, email: string, role: 'administrator' | 'contributor' | 'viewer') => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get user's profile information for the invitation email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const inviterName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.email;

    try {
      const { error } = await supabase.functions.invoke('send-contributor-invitation', {
        body: {
          contributorEmail: email,
          role: role,
          inviterName: inviterName,
          inviterEmail: user.email,
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Resent",
        description: `Invitation email has been resent to ${email}`,
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContributorRole = async (contributorId: string, newRole: 'administrator' | 'contributor' | 'viewer') => {
    const { error } = await supabase
      .from('contributors')
      .update({ role: newRole })
      .eq('id', contributorId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update contributor role",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Contributor role updated successfully",
      });
      fetchContributors();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Shield className="h-4 w-4" />;
      case 'contributor':
        return <Users className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'contributor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Contributor
          </CardTitle>
          <CardDescription>
            Invite someone to access your account with specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show current usage and limits */}
          <div className="bg-muted/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-muted-foreground">
              Contributors: {contributors.length} of {checkContributorLimit(0, subscriptionStatus?.subscription_tier as any, isInTrial).limit}
              {!subscriptionStatus?.subscription_tier && (
                <span className="ml-2 text-destructive">• Upgrade to invite contributors</span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="contributor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Viewer - Read-only access for sharing
                    </div>
                  </SelectItem>
                  <SelectItem value="contributor">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contributor - Limited access
                    </div>
                  </SelectItem>
                  <SelectItem value="administrator">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrator - Full access
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={inviteContributor} 
                disabled={!email || loading}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Contributors</CardTitle>
          <CardDescription>
            Manage access levels and remove contributors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contributors.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No contributors invited yet
            </div>
          ) : (
            <div className="space-y-4">
              {contributors.map((contributor) => (
                <div key={contributor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contributor.contributor_email}</span>
                      <Badge variant="outline" className={getRoleColor(contributor.role)}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(contributor.role)}
                          {contributor.role}
                        </div>
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(contributor.status)}>
                        {contributor.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Invited: {new Date(contributor.invited_at).toLocaleDateString()}
                      {contributor.accepted_at && (
                        <> • Accepted: {new Date(contributor.accepted_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {contributor.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendInvitation(contributor.id, contributor.contributor_email, contributor.role)}
                        disabled={loading}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Resend
                      </Button>
                    )}
                    <Select
                      value={contributor.role}
                      onValueChange={(value) => updateContributorRole(contributor.id, value as any)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Contributor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {contributor.contributor_email} as a contributor? 
                            They will no longer have access to your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => removeContributor(contributor.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold">Administrator</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Full access to all account features, including managing other contributors
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Contributor</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Can view, upload, and manage files but cannot manage contributors or account settings
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Viewer</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Read-only access for sharing account overviews. Cannot upload, download, or delete files
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributorsTab;