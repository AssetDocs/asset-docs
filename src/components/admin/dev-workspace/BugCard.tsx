import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, CheckCircle, Search, XCircle } from 'lucide-react';
import type { DevBug, DevBugStatus, DevBugSeverity } from '@/hooks/useDevWorkspace';
import { format } from 'date-fns';

interface BugCardProps {
  bug: DevBug;
  onUpdateStatus: (id: string, status: DevBugStatus) => void;
  onDelete: (id: string) => void;
}

const severityColors: Record<DevBugSeverity, string> = {
  minor: 'bg-gray-500',
  major: 'bg-amber-500',
  critical: 'bg-red-500',
  blocker: 'bg-red-700',
};

const statusBadgeVariants: Record<DevBugStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'destructive',
  investigating: 'default',
  fixed: 'secondary',
  closed: 'outline',
  wont_fix: 'outline',
};

export const BugCard: React.FC<BugCardProps> = ({ bug, onUpdateStatus, onDelete }) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={severityColors[bug.severity]}>{bug.severity}</Badge>
            <Badge variant={statusBadgeVariants[bug.status]}>{bug.status.replace('_', ' ')}</Badge>
          </div>
          <p className="font-medium">{bug.title}</p>
          {bug.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bug.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Reported {format(new Date(bug.created_at), 'MMM d, yyyy')}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onUpdateStatus(bug.id, 'investigating')}>
              <Search className="h-4 w-4 mr-2" />
              Mark Investigating
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(bug.id, 'fixed')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Fixed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(bug.id, 'closed')}>
              <XCircle className="h-4 w-4 mr-2" />
              Close
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(bug.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
