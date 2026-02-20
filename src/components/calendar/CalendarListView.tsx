import React from 'react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import CalendarEventCard from './CalendarEventCard';
import { isToday, isPast, isFuture, parseISO, isThisWeek, isThisMonth } from 'date-fns';

interface CalendarListViewProps {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  propertyMap: Record<string, string>;
}

const CalendarListView: React.FC<CalendarListViewProps> = ({
  events,
  onEdit,
  onComplete,
  onDelete,
  propertyMap,
}) => {
  const overdue = events.filter(e => e.status === 'upcoming' && isPast(parseISO(e.start_date)) && !isToday(parseISO(e.start_date)));
  const todayEvents = events.filter(e => e.status !== 'completed' && isToday(parseISO(e.start_date)));
  const thisWeek = events.filter(e => e.status !== 'completed' && !isToday(parseISO(e.start_date)) && isThisWeek(parseISO(e.start_date)) && isFuture(parseISO(e.start_date)));
  const thisMonth = events.filter(e => e.status !== 'completed' && !isThisWeek(parseISO(e.start_date)) && isThisMonth(parseISO(e.start_date)) && isFuture(parseISO(e.start_date)));
  const upcoming = events.filter(e => e.status !== 'completed' && !isThisMonth(parseISO(e.start_date)) && isFuture(parseISO(e.start_date)));
  const completed = events.filter(e => e.status === 'completed');

  const sections = [
    { label: 'Overdue', events: overdue, className: 'text-red-600' },
    { label: 'Today', events: todayEvents, className: 'text-primary' },
    { label: 'This Week', events: thisWeek, className: 'text-foreground' },
    { label: 'This Month', events: thisMonth, className: 'text-foreground' },
    { label: 'Upcoming', events: upcoming, className: 'text-foreground' },
    { label: 'Completed', events: completed, className: 'text-muted-foreground' },
  ];

  const nonEmpty = sections.filter(s => s.events.length > 0);

  if (nonEmpty.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No events found. Create your first event to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {nonEmpty.map((section) => (
        <div key={section.label}>
          <h3 className={`text-sm font-semibold mb-3 ${section.className}`}>
            {section.label} ({section.events.length})
          </h3>
          <div className="space-y-2">
            {section.events.map((event) => (
              <CalendarEventCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onComplete={onComplete}
                onDelete={onDelete}
                propertyName={event.linked_property_id ? propertyMap[event.linked_property_id] : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarListView;
