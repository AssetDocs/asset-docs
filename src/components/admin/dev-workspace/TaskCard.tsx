import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, ArrowRight } from 'lucide-react';
import type { DevTask, DevTaskStatus, DevTaskPriority } from '@/hooks/useDevWorkspace';
import { format } from 'date-fns';

interface TaskCardProps {
  task: DevTask;
  onUpdateStatus: (id: string, status: DevTaskStatus) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<DevTaskPriority, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  critical: 'bg-red-500',
};

const statusColors: Record<DevTaskStatus, string> = {
  todo: '',
  in_progress: 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20',
  done: 'border-green-200 bg-green-50/50 dark:bg-green-950/20',
  archived: 'opacity-50',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateStatus, onDelete }) => {
  const nextStatus: Record<DevTaskStatus, DevTaskStatus> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: 'archived',
    archived: 'todo',
  };

  return (
    <Card className={`p-3 ${statusColors[task.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={`${priorityColors[task.priority]} text-xs`}>
              {task.priority}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(task.created_at), 'MMM d')}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onUpdateStatus(task.id, nextStatus[task.status])}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Move to {nextStatus[task.status].replace('_', ' ')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
