import React from 'react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { CATEGORY_DOT_COLORS } from './calendarConstants';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarMonthViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  onDateChange,
  events,
  onDayClick,
  onEventClick,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const prevMonth = () => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Build day grid
  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.start_date + 'T00:00:00'), date));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
        <h3 className="text-lg font-semibold text-foreground">{format(currentDate, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {days.map((d, i) => {
          const dayEvents = getEventsForDay(d);
          const inMonth = isSameMonth(d, currentDate);
          const today = isToday(d);

          return (
            <div
              key={i}
              className={cn(
                'min-h-[80px] md:min-h-[100px] bg-white p-1.5 cursor-pointer hover:bg-muted/30 transition-colors',
                !inMonth && 'bg-muted/10'
              )}
              onClick={() => onDayClick(d)}
            >
              <span
                className={cn(
                  'text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full',
                  today && 'bg-primary text-primary-foreground',
                  !inMonth && 'text-muted-foreground/40'
                )}
              >
                {format(d, 'd')}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    className={cn(
                      'w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate',
                      ev.status === 'completed' ? 'bg-muted text-muted-foreground line-through' : 'bg-muted/50 text-foreground'
                    )}
                  >
                    <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0', ev.category ? CATEGORY_DOT_COLORS[ev.category] : 'bg-gray-400')} />
                    {ev.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthView;
