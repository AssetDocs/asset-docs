import React, { useState } from 'react';
import { CalendarEvent, CalendarEventCategory, CalendarEventRecurrence, CalendarEventVisibility, CalendarEventInsert } from '@/hooks/useCalendarEvents';
import { CATEGORY_GROUPS, CATEGORY_LABELS } from './calendarConstants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useProperties } from '@/hooks/useProperties';

interface CalendarEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  onSave: (data: CalendarEventInsert) => void;
  prefill?: Partial<CalendarEventInsert>;
}

const RECURRENCE_OPTIONS: { value: CalendarEventRecurrence; label: string }[] = [
  { value: 'one_time', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
];

const VISIBILITY_OPTIONS: { value: CalendarEventVisibility; label: string }[] = [
  { value: 'private', label: 'Private' },
  { value: 'shared', label: 'Shared' },
  { value: 'emergency_only', label: 'Emergency Only' },
];

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  open,
  onOpenChange,
  event,
  onSave,
  prefill,
}) => {
  const { properties } = useProperties();
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title || prefill?.title || '');
  const [category, setCategory] = useState<CalendarEventCategory | ''>(event?.category || prefill?.category || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    event?.start_date ? parseISO(event.start_date) : prefill?.start_date ? parseISO(prefill.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    event?.end_date ? parseISO(event.end_date) : undefined
  );
  const [recurrence, setRecurrence] = useState<CalendarEventRecurrence>(event?.recurrence || prefill?.recurrence || 'one_time');
  const [linkedPropertyId, setLinkedPropertyId] = useState(event?.linked_property_id || '');
  const [notes, setNotes] = useState(event?.notes || prefill?.notes || '');
  const [visibility, setVisibility] = useState<CalendarEventVisibility>(event?.visibility || 'private');
  const [notifyDayOf, setNotifyDayOf] = useState(event?.notify_day_of ?? prefill?.notify_day_of ?? true);
  const [notify1Week, setNotify1Week] = useState(event?.notify_1_week ?? prefill?.notify_1_week ?? false);
  const [notify30Days, setNotify30Days] = useState(event?.notify_30_days ?? prefill?.notify_30_days ?? false);

  // Reset form when event changes
  React.useEffect(() => {
    if (open) {
      setTitle(event?.title || prefill?.title || '');
      setCategory(event?.category || prefill?.category || '');
      setStartDate(event?.start_date ? parseISO(event.start_date) : prefill?.start_date ? parseISO(prefill.start_date) : undefined);
      setEndDate(event?.end_date ? parseISO(event.end_date) : undefined);
      setRecurrence(event?.recurrence || prefill?.recurrence || 'one_time');
      setLinkedPropertyId(event?.linked_property_id || '');
      setNotes(event?.notes || prefill?.notes || '');
      setVisibility(event?.visibility || 'private');
      setNotifyDayOf(event?.notify_day_of ?? prefill?.notify_day_of ?? true);
      setNotify1Week(event?.notify_1_week ?? prefill?.notify_1_week ?? false);
      setNotify30Days(event?.notify_30_days ?? prefill?.notify_30_days ?? false);
    }
  }, [open, event, prefill]);

  const handleSubmit = () => {
    if (!title.trim() || !startDate) return;
    onSave({
      title: title.trim(),
      category: category || null,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      recurrence,
      linked_property_id: linkedPropertyId || null,
      notes: notes.trim() || null,
      visibility,
      notify_day_of: notifyDayOf,
      notify_1_week: notify1Week,
      notify_30_days: notify30Days,
      template_key: prefill?.template_key || event?.template_key || null,
      is_suggested: prefill?.is_suggested || false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'New Calendar Event'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Title */}
          <div>
            <Label htmlFor="event-title">Title *</Label>
            <Input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CalendarEventCategory)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORY_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Optional'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <Label>Recurrence</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as CalendarEventRecurrence)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Linked Property */}
          {properties && properties.length > 0 && (
            <div>
              <Label>Linked Property</Label>
              <Select value={linkedPropertyId} onValueChange={setLinkedPropertyId}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {properties.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name || p.address || 'Unnamed Property'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="event-notes">Notes</Label>
            <Textarea id="event-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." rows={3} />
          </div>

          {/* Visibility */}
          <div>
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as CalendarEventVisibility)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          <div>
            <Label className="mb-2 block">Notifications</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="notify-day" checked={notifyDayOf} onCheckedChange={(c) => setNotifyDayOf(!!c)} />
                <label htmlFor="notify-day" className="text-sm">Day of event</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="notify-week" checked={notify1Week} onCheckedChange={(c) => setNotify1Week(!!c)} />
                <label htmlFor="notify-week" className="text-sm">1 week before</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="notify-30" checked={notify30Days} onCheckedChange={(c) => setNotify30Days(!!c)} />
                <label htmlFor="notify-30" className="text-sm">30 days before</label>
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!title.trim() || !startDate} className="w-full">
            {isEditing ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarEventModal;
