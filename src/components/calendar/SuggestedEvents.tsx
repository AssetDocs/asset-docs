import React from 'react';
import { SuggestedEvent } from '@/hooks/useSuggestedEvents';
import { CATEGORY_LABELS, CATEGORY_COLORS } from './calendarConstants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Edit2, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface SuggestedEventsProps {
  suggestions: SuggestedEvent[];
  onAccept: (suggestion: SuggestedEvent) => void;
  onEdit: (suggestion: SuggestedEvent) => void;
  onDismiss: (key: string) => void;
}

const SuggestedEvents: React.FC<SuggestedEventsProps> = ({
  suggestions,
  onAccept,
  onEdit,
  onDismiss,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-amber-800">Suggested Events</h3>
        <span className="text-[10px] text-amber-600">Based on your existing data</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-lg border border-amber-100">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{s.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {s.category && (
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', CATEGORY_COLORS[s.category])}>
                    {CATEGORY_LABELS[s.category]}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">{format(parseISO(s.start_date), 'MMM d, yyyy')}</span>
                <span className="text-[10px] text-muted-foreground">• {s.source}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAccept(s)} title="Accept">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(s)} title="Edit & Add">
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDismiss(s.key)} title="Dismiss">
                <X className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedEvents;
