import React from 'react';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { 
  Upload, Edit, Trash2, Shield, Lock, UserPlus, Home, 
  FileText, Image, Video, Key, Settings, LogIn, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityLogEntry } from '@/hooks/useActivityLog';

interface ActivityLogListProps {
  logs: ActivityLogEntry[];
  isLoading: boolean;
}

const getActionIcon = (action_type: string, action_category: string) => {
  const iconClass = "h-4 w-4";
  
  switch (action_category) {
    case 'upload':
      return <Upload className={cn(iconClass, "text-green-600")} />;
    case 'vault':
      return <Lock className={cn(iconClass, "text-purple-600")} />;
    case 'security':
      return <Shield className={cn(iconClass, "text-blue-600")} />;
    case 'contributor':
      return <UserPlus className={cn(iconClass, "text-orange-600")} />;
    case 'property':
      return <Home className={cn(iconClass, "text-indigo-600")} />;
    case 'account':
      return <Settings className={cn(iconClass, "text-gray-600")} />;
    default:
      break;
  }

  switch (action_type) {
    case 'upload':
      return <Upload className={cn(iconClass, "text-green-600")} />;
    case 'edit':
      return <Edit className={cn(iconClass, "text-amber-600")} />;
    case 'delete':
      return <Trash2 className={cn(iconClass, "text-red-600")} />;
    case 'login':
      return <LogIn className={cn(iconClass, "text-blue-600")} />;
    case 'access_vault':
      return <Lock className={cn(iconClass, "text-purple-600")} />;
    case 'view':
      return <Eye className={cn(iconClass, "text-gray-500")} />;
    default:
      return <FileText className={cn(iconClass, "text-gray-500")} />;
  }
};

const getResourceIcon = (resource_type: string | null) => {
  const iconClass = "h-3.5 w-3.5 text-muted-foreground";
  
  switch (resource_type) {
    case 'photo':
      return <Image className={iconClass} />;
    case 'video':
      return <Video className={iconClass} />;
    case 'document':
      return <FileText className={iconClass} />;
    case 'property':
      return <Home className={iconClass} />;
    case 'vault':
      return <Lock className={iconClass} />;
    case 'password':
      return <Key className={iconClass} />;
    default:
      return null;
  }
};

const formatActionDescription = (log: ActivityLogEntry): string => {
  const actor = log.actor_name ? log.actor_name : 'You';
  const resource = log.resource_name || log.resource_type || 'item';
  
  switch (log.action_type) {
    case 'upload':
      return `${actor} uploaded ${resource}`;
    case 'edit':
      return `${actor} edited ${resource}`;
    case 'delete':
      return `${actor} deleted ${resource}`;
    case 'login':
      return `${actor} logged in`;
    case 'access_vault':
      return `${actor} accessed the Secure Vault`;
    case 'contributor_access':
      return `${actor} accessed the dashboard`;
    case 'property_update':
      return `${actor} updated ${resource}`;
    case 'mfa_enabled':
      return `${actor} enabled MFA`;
    case 'mfa_disabled':
      return `${actor} disabled MFA`;
    case 'backup_codes_generated':
      return `${actor} generated backup codes`;
    case 'view':
      return `${actor} viewed ${resource}`;
    default:
      return `${actor} performed ${log.action_type.replace(/_/g, ' ')}`;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, yyyy • h:mm a');
};

const groupLogsByDate = (logs: ActivityLogEntry[]) => {
  const groups: { [key: string]: ActivityLogEntry[] } = {};
  
  logs.forEach(log => {
    const date = new Date(log.created_at);
    let key: string;
    
    if (isToday(date)) {
      key = 'Today';
    } else if (isYesterday(date)) {
      key = 'Yesterday';
    } else {
      key = format(date, 'MMMM d, yyyy');
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(log);
  });
  
  return groups;
};

const ActivityLogList: React.FC<ActivityLogListProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No activity yet</h3>
        <p className="text-muted-foreground text-sm">
          Your activity will appear here as you use Asset Safe.
        </p>
      </div>
    );
  }

  const groupedLogs = groupLogsByDate(logs);

  return (
    <div className="space-y-6">
      {Object.entries(groupedLogs).map(([dateGroup, groupLogs]) => (
        <div key={dateGroup}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-1">
            {dateGroup}
          </h3>
          <div className="space-y-1">
            {groupLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {getActionIcon(log.action_type, log.action_category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">
                      {formatActionDescription(log)}
                    </p>
                    {log.resource_type && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                        {getResourceIcon(log.resource_type)}
                        {log.resource_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(log.created_at)}
                  </p>
                  {log.actor_name && (
                    <p className="text-xs text-orange-600 mt-0.5">
                      By contributor: {log.actor_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLogList;
