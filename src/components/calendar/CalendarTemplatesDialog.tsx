import React from 'react';
import { TEMPLATE_GROUPS, EventTemplate } from './calendarTemplates';
import { CATEGORY_LABELS, CATEGORY_COLORS } from './calendarConstants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: EventTemplate) => void;
}

const CalendarTemplatesDialog: React.FC<CalendarTemplatesDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {TEMPLATE_GROUPS.map((group) => (
            <div key={group.label}>
              <h4 className="text-sm font-semibold text-foreground mb-2">{group.label}</h4>
              <div className="space-y-1.5">
                {group.templates.map((template) => (
                  <button
                    key={template.key}
                    onClick={() => { onSelect(template); onOpenChange(false); }}
                    className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{template.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', CATEGORY_COLORS[template.category])}>
                          {CATEGORY_LABELS[template.category]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {template.recurrence.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-shrink-0">Use</Button>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarTemplatesDialog;
