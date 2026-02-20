import React from 'react';
import { CalendarEventCategory, CalendarEventStatus } from '@/hooks/useCalendarEvents';
import { CATEGORY_GROUPS, CATEGORY_LABELS } from './calendarConstants';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CalendarFiltersProps {
  category: CalendarEventCategory | null;
  status: CalendarEventStatus | null;
  propertyId: string | null;
  properties: { id: string; name: string }[];
  onCategoryChange: (cat: CalendarEventCategory | null) => void;
  onStatusChange: (status: CalendarEventStatus | null) => void;
  onPropertyChange: (id: string | null) => void;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  category,
  status,
  propertyId,
  properties,
  onCategoryChange,
  onStatusChange,
  onPropertyChange,
}) => {
  const hasFilters = category || status || propertyId;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? null : v as CalendarEventCategory)}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
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

      <Select value={status || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? null : v as CalendarEventStatus)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      {properties.length > 0 && (
        <Select value={propertyId || 'all'} onValueChange={(v) => onPropertyChange(v === 'all' ? null : v)}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={() => {
            onCategoryChange(null);
            onStatusChange(null);
            onPropertyChange(null);
          }}
        >
          <X className="h-3 w-3 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
};

export default CalendarFilters;
