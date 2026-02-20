import React, { useState, useMemo } from 'react';
import { useCalendarEvents, CalendarEvent, CalendarEventCategory, CalendarEventStatus, CalendarEventInsert } from '@/hooks/useCalendarEvents';
import { useSuggestedEvents, SuggestedEvent } from '@/hooks/useSuggestedEvents';
import { useProperties } from '@/hooks/useProperties';
import CalendarMonthView from './calendar/CalendarMonthView';
import CalendarListView from './calendar/CalendarListView';
import CalendarEventModal from './calendar/CalendarEventModal';
import CalendarFilters from './calendar/CalendarFilters';
import CalendarTemplatesDialog from './calendar/CalendarTemplatesDialog';
import SuggestedEvents from './calendar/SuggestedEvents';
import { EventTemplate } from './calendar/calendarTemplates';
import { Button } from '@/components/ui/button';
import { Plus, CalendarDays, List, LayoutGrid, FileText } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import CalendarEventCard from './calendar/CalendarEventCard';

const SmartCalendar: React.FC = () => {
  const [view, setView] = useState<'month' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [prefill, setPrefill] = useState<Partial<CalendarEventInsert> | undefined>();
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<CalendarEventCategory | null>(null);
  const [filterStatus, setFilterStatus] = useState<CalendarEventStatus | null>(null);
  const [filterPropertyId, setFilterPropertyId] = useState<string | null>(null);

  const { events, isLoading, createEvent, updateEvent, deleteEvent, completeEvent } = useCalendarEvents({
    category: filterCategory,
    status: filterStatus,
    linkedPropertyId: filterPropertyId,
  });

  const { suggestions } = useSuggestedEvents();
  const { properties } = useProperties();

  const propertyMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (properties) {
      for (const p of properties as any[]) {
        map[p.id] = p.name || p.address || 'Unnamed';
      }
    }
    return map;
  }, [properties]);

  const propertyList = useMemo(() =>
    (properties || []).map((p: any) => ({ id: p.id, name: p.name || p.address || 'Unnamed' })),
    [properties]
  );

  // Events filtered for current month view
  const monthEvents = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return events.filter((e) => {
      const d = new Date(e.start_date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [events, currentDate]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return events.filter((e) => isSameDay(new Date(e.start_date + 'T00:00:00'), selectedDay));
  }, [events, selectedDay]);

  const handleCreateNew = () => {
    setEditingEvent(null);
    setPrefill(undefined);
    setModalOpen(true);
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setPrefill(undefined);
    setModalOpen(true);
  };

  const handleSave = (data: CalendarEventInsert) => {
    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...data } as any);
    } else {
      createEvent.mutate(data);
    }
  };

  const handleTemplateSelect = (template: EventTemplate) => {
    setEditingEvent(null);
    setPrefill({
      title: template.title,
      category: template.category,
      recurrence: template.recurrence,
      notify_day_of: template.notify_day_of,
      notify_1_week: template.notify_1_week,
      notify_30_days: template.notify_30_days,
      template_key: template.key,
    });
    setModalOpen(true);
  };

  const handleAcceptSuggestion = (s: SuggestedEvent) => {
    createEvent.mutate({
      title: s.title,
      category: s.category,
      start_date: s.start_date,
      notes: s.notes,
      is_suggested: true,
      template_key: s.key,
    });
  };

  const handleEditSuggestion = (s: SuggestedEvent) => {
    setEditingEvent(null);
    setPrefill({
      title: s.title,
      category: s.category,
      start_date: s.start_date,
      notes: s.notes,
      is_suggested: true,
      template_key: s.key,
    });
    setModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(prev => prev && isSameDay(prev, date) ? null : date);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Smart Calendar</h2>
          <p className="text-muted-foreground text-sm mt-1">Reminders, records, and timelines — all in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTemplatesOpen(true)}>
            <FileText className="h-3.5 w-3.5 mr-1.5" /> Templates
          </Button>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Event
          </Button>
        </div>
      </div>

      {/* Suggested Events */}
      <SuggestedEvents
        suggestions={suggestions}
        onAccept={handleAcceptSuggestion}
        onEdit={handleEditSuggestion}
        onDismiss={() => {}} // dismiss handled via mutation if needed
      />

      {/* Filters + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <CalendarFilters
          category={filterCategory}
          status={filterStatus}
          propertyId={filterPropertyId}
          properties={propertyList}
          onCategoryChange={setFilterCategory}
          onStatusChange={setFilterStatus}
          onPropertyChange={setFilterPropertyId}
        />
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <Button
            variant={view === 'month' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs px-3"
            onClick={() => setView('month')}
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Month
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs px-3"
            onClick={() => setView('list')}
          >
            <List className="h-3.5 w-3.5 mr-1" /> List
          </Button>
        </div>
      </div>

      {/* Calendar Views */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : view === 'month' ? (
        <div className="space-y-4">
          <CalendarMonthView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            events={monthEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEdit}
          />
          {/* Selected day detail */}
          {selectedDay && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">
                  {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </h4>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                  setPrefill({ start_date: format(selectedDay, 'yyyy-MM-dd') });
                  setEditingEvent(null);
                  setModalOpen(true);
                }}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events on this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => (
                    <CalendarEventCard
                      key={ev.id}
                      event={ev}
                      onEdit={handleEdit}
                      onComplete={(id) => completeEvent.mutate(id)}
                      onDelete={(id) => deleteEvent.mutate(id)}
                      propertyName={ev.linked_property_id ? propertyMap[ev.linked_property_id] : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <CalendarListView
          events={events}
          onEdit={handleEdit}
          onComplete={(id) => completeEvent.mutate(id)}
          onDelete={(id) => deleteEvent.mutate(id)}
          propertyMap={propertyMap}
        />
      )}

      {/* Modals */}
      <CalendarEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={editingEvent}
        onSave={handleSave}
        prefill={prefill}
      />
      <CalendarTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};

export default SmartCalendar;
