import React from 'react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_BORDER_COLORS } from './calendarConstants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Edit2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast, isToday } from 'date-fns';

interface CalendarEventCardProps {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  propertyName?: string;
}

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  onEdit,
  onComplete,
  onDelete,
  propertyName,
}) => {
  const isOverdue = event.status === 'upcoming' && isPast(parseISO(event.start_date)) && !isToday(parseISO(event.start_date));
  const isCompleted = event.status === 'completed';
  const borderColor = event.category ? CATEGORY_BORDER_COLORS[event.category] : 'border-l-gray-300';
  const categoryLabel = event.category ? CATEGORY_LABELS[event.category] : 'Uncategorized';
  const categoryColor = event.category ? CATEGORY_COLORS[event.category] : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div
      className={cn(
        'border-l-4 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow',
        borderColor,
        isCompleted && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className={cn('font-semibold text-sm text-foreground', isCompleted && 'line-through')}>
              {event.title}
            </h4>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                <AlertCircle className="h-3 w-3" /> Overdue
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Check className="h-3 w-3" /> Completed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', categoryColor)}>
              {categoryLabel}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(parseISO(event.start_date), 'MMM d, yyyy')}
              {event.end_date && ` – ${format(parseISO(event.end_date), 'MMM d, yyyy')}`}
            </span>
            {event.recurrence !== 'one_time' && (
              <span className="text-[10px] text-muted-foreground capitalize">
                ({event.recurrence.replace('_', ' ')})
              </span>
            )}
            {propertyName && (
              <span className="text-[10px] text-muted-foreground">• {propertyName}</span>
            )}
          </div>
          {event.notes && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{event.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isCompleted && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onComplete(event.id)} title="Mark complete">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(event)} title="Edit">
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(event.id)} title="Delete">
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventCard;
