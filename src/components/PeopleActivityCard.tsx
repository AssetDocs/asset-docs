import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, ArrowRight, Crown, Lock, Star, Shield, Eye, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useActivityLog, ActivityLogEntry } from '@/hooks/useActivityLog';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Contributor {
  id: string;
  role: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
}

interface PeopleActivityCardProps {
  onNavigate: (tab: string) => void;
}

const UPGRADE_PATH = '/account/settings?tab=subscription';

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'administrator': return <Shield className="h-3 w-3" />;
    case 'contributor': return <Users className="h-3 w-3" />;
    case 'viewer': return <Eye className="h-3 w-3" />;
    default: return <Eye className="h-3 w-3" />;
  }
};

const formatActivityLabel = (log: ActivityLogEntry): string => {
  const resource = log.resource_name || log.resource_type || 'item';
  switch (log.action_type) {
    case 'upload': return `Uploaded ${resource}`;
    case 'edit': return `Edited ${resource}`;
    case 'delete': return `Deleted ${resource}`;
    case 'access_vault': return 'Accessed Secure Vault';
    case 'contributor_access': return 'Contributor accessed dashboard';
    case 'contributor_invite': return `Invited ${resource}`;
    case 'contributor_remove': return `Removed ${resource}`;
    case 'property_update': return `Updated ${resource}`;
    case 'mfa_enabled': return 'Enabled MFA';
    case 'mfa_disabled': return 'Disabled MFA';
    case 'backup_codes_generated': return 'Generated backup codes';
    default: return log.action_type.replace(/_/g, ' ');
  }
};

const PeopleActivityCard: React.FC<PeopleActivityCardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { hasFeature } = useSubscription();
  const { logs, isLoading: logsLoading } = useActivityLog();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const hasPremiumAccess = hasFeature('trusted_contacts');

  useEffect(() => {
    const fetchContributors = async () => {
      if (!user) {
        setLoadingContributors(false);
        return;
      }
      const { data } = await supabase
        .from('contributors')
        .select('id, role, status, first_name, last_name')
        .eq('account_owner_id', user.id)
        .order('invited_at', { ascending: false });

      setContributors(data || []);
      setLoadingContributors(false);
    };
    fetchContributors();
  }, [user]);

  const recentLogs = logs.slice(0, 5);
  const lastActivity = logs.length > 0 ? logs[0].created_at : null;
  const acceptedCount = contributors.filter(c => c.status === 'accepted').length;
  const pendingCount = contributors.filter(c => c.status === 'pending').length;

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all bg-white">
      <CardContent className="pt-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {/* Header - always visible */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground">People & Activity</h3>
              <p className="text-sm text-muted-foreground">Authorized users and recent actions</p>
            </div>
          </div>

          {/* Toggle Button */}
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full mt-4 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
            >
              <span className="mr-2">{isOpen ? 'Hide Details' : 'View Users & Activity'}</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          {/* Collapsible Content */}
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Authorized Users Section */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Authorized Users
              </h4>

              {!hasPremiumAccess ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-full flex-shrink-0">
                      <Crown className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3 text-amber-600" />
                        Authorized Users
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Premium</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Invite family members and trusted contacts to access your account.
                      </p>
                      <Link to={UPGRADE_PATH}>
                        <Button size="sm" className="mt-2 h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {loadingContributors ? (
                    <div className="animate-pulse h-8 bg-muted rounded" />
                  ) : contributors.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No authorized users yet</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <UserPlus className="h-3 w-3 mr-1" />
                          {contributors.length} user{contributors.length !== 1 ? 's' : ''}
                        </Badge>
                        {acceptedCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {acceptedCount} active
                          </Badge>
                        )}
                        {pendingCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            {pendingCount} pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {contributors.slice(0, 3).map(c => (
                          <span key={c.id} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                            {getRoleIcon(c.role)}
                            {c.first_name || 'User'} · {c.role}
                          </span>
                        ))}
                        {contributors.length > 3 && (
                          <span className="text-[11px] text-muted-foreground px-2 py-0.5">
                            +{contributors.length - 3} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Recent Activity Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Recent Activity
                </h4>
                {lastActivity && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
                  </span>
                )}
              </div>

              {logsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-5 bg-muted rounded" />
                  ))}
                </div>
              ) : recentLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No recent activity</p>
              ) : (
                <div className="space-y-1.5">
                  {recentLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      <span className="text-foreground truncate flex-1">{formatActivityLabel(log)}</span>
                      <span className="text-muted-foreground text-[10px] flex-shrink-0 whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manage Link */}
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
              onClick={() => onNavigate('/account/settings?tab=profile')}
            >
              <span className="mr-2">Manage in Account & Access</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default PeopleActivityCard;
