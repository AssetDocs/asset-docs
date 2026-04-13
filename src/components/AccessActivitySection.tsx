import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Eye, Lock, UserPlus, Clock, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useActivityLog, ActivityLogEntry } from '@/hooks/useActivityLog';
import { formatDistanceToNow } from 'date-fns';
import AuthorizedUsersTab from '@/components/AuthorizedUsersTab';

const formatActivityLabel = (log: ActivityLogEntry): string => {
  const resource = log.resource_name || log.resource_type || 'item';
  switch (log.action_type) {
    case 'upload': return `Uploaded ${resource}`;
    case 'edit': return `Edited ${resource}`;
    case 'delete': return `Deleted ${resource}`;
    case 'access_vault': return 'Accessed Secure Vault';
    case 'contributor_access': return 'Authorized user accessed dashboard';
    case 'contributor_invite': return `Invited ${resource}`;
    case 'contributor_remove': return `Removed ${resource}`;
    case 'property_update': return `Updated ${resource}`;
    case 'mfa_enabled': return 'Enabled MFA';
    case 'mfa_disabled': return 'Disabled MFA';
    case 'backup_codes_generated': return 'Generated backup codes';
    default: return log.action_type.replace(/_/g, ' ');
  }
};

const AccessActivitySection: React.FC = () => {
  const { logs, isLoading: logsLoading } = useActivityLog();
  const [rolesOpen, setRolesOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const recentLogs = logs.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Access & Activity</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage authorized users and monitor recent account activity.
        </p>
      </div>

      {/* Role Explanations — collapsible, default closed */}
      <Card>
        <Collapsible open={rolesOpen} onOpenChange={setRolesOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Understanding Authorized User Roles
                </span>
                {rolesOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Access */}
                <div className="p-4 border rounded-lg border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground">Full Access</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Can view, add, and manage shared account information</li>
                    <li>• Can upload, download, edit, and delete files</li>
                    <li>• Can add inventory items and documents</li>
                    <li>• Cannot manage billing or account ownership</li>
                    <li>• Cannot manage other authorized users</li>
                  </ul>
                </div>

                {/* Read Only */}
                <div className="p-4 border rounded-lg border-green-200 bg-green-50/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-foreground">Read Only</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Can view shared account information</li>
                    <li>• Can browse asset documentation</li>
                    <li>• Cannot upload, download, or delete files</li>
                    <li>• Cannot make any changes to the account</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Authorized Users Management (invite + list) */}
      <AuthorizedUsersTab />

      {/* Recent Activity — collapsible, default closed */}
      <Card>
        <Collapsible open={activityOpen} onOpenChange={setActivityOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </span>
                {activityOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse h-6 bg-muted rounded" />
                  ))}
                </div>
              ) : recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">
                  No recent activity to display.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                      <span className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
                      <span className="text-sm text-foreground flex-1">{formatActivityLabel(log)}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default AccessActivitySection;
