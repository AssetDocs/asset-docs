import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Eye, Lock, UserPlus, Clock } from 'lucide-react';
import { useActivityLog, ActivityLogEntry } from '@/hooks/useActivityLog';
import { formatDistanceToNow } from 'date-fns';
import ContributorsTab from '@/components/ContributorsTab';

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

const AccessActivitySection: React.FC = () => {
  const { logs, isLoading: logsLoading } = useActivityLog();
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

      {/* Role Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5" />
            Understanding Authorized User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg border-red-200 bg-red-50/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <h4 className="font-semibold text-foreground">Administrator</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Full access to all account features</li>
                <li>• Can view and manage the Legacy Locker</li>
                <li>• Can manage other authorized users</li>
                <li className="flex items-center gap-1 font-medium text-red-700">
                  <Lock className="h-3 w-3" />
                  Only role eligible as a Trusted Delegate for the Legacy Locker
                </li>
                <li>• Can upload, download, edit, and delete files</li>
                <li>• Can access the Password Catalog</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-foreground">Contributor</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Can view, upload, and manage files</li>
                <li>• Can add inventory items and documents</li>
                <li>• Cannot access the Legacy Locker</li>
                <li>• Cannot access the Password Catalog</li>
                <li>• Cannot manage other authorized users</li>
                <li>• Cannot change account or billing settings</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg border-green-200 bg-green-50/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-semibold text-foreground">Viewer</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Read-only access to the account</li>
                <li>• Can browse asset documentation</li>
                <li>• Cannot access the Legacy Locker</li>
                <li>• Cannot access the Password Catalog</li>
                <li>• Cannot upload, download, or delete files</li>
                <li>• Cannot change any settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributors Management (invite + list) */}
      <ContributorsTab />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
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
                  <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1">{formatActivityLabel(log)}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessActivitySection;
