import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type CalendarEventCategory =
  | 'home_property' | 'maintenance_care' | 'utilities_household'
  | 'appliances_systems' | 'warranties_coverage' | 'property_lifecycle'
  | 'compliance_filings' | 'equipment_assets' | 'subscriptions_auto_drafts'
  | 'hr_admin' | 'tenant_lifecycle' | 'inspections_turnover'
  | 'rent_financial' | 'legal_compliance' | 'legal_document_reviews'
  | 'authorized_user_reviews' | 'legacy_emergency_planning';

export type CalendarEventRecurrence = 'one_time' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
export type CalendarEventStatus = 'upcoming' | 'overdue' | 'completed';
export type CalendarEventVisibility = 'private' | 'shared' | 'emergency_only';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  category: CalendarEventCategory | null;
  start_date: string;
  end_date: string | null;
  recurrence: CalendarEventRecurrence;
  recurrence_end_date: string | null;
  linked_property_id: string | null;
  linked_asset_id: string | null;
  notes: string | null;
  status: CalendarEventStatus;
  is_suggested: boolean;
  is_dismissed: boolean;
  template_key: string | null;
  visibility: CalendarEventVisibility;
  notify_day_of: boolean;
  notify_1_week: boolean;
  notify_30_days: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventInsert {
  title: string;
  category?: CalendarEventCategory | null;
  start_date: string;
  end_date?: string | null;
  recurrence?: CalendarEventRecurrence;
  recurrence_end_date?: string | null;
  linked_property_id?: string | null;
  linked_asset_id?: string | null;
  notes?: string | null;
  status?: CalendarEventStatus;
  is_suggested?: boolean;
  is_dismissed?: boolean;
  template_key?: string | null;
  visibility?: CalendarEventVisibility;
  notify_day_of?: boolean;
  notify_1_week?: boolean;
  notify_30_days?: boolean;
  completed_at?: string | null;
}

export interface CalendarFilters {
  category?: CalendarEventCategory | null;
  status?: CalendarEventStatus | null;
  linkedPropertyId?: string | null;
  month?: number;
  year?: number;
}

export const useCalendarEvents = (filters?: CalendarFilters) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['calendar-events', user?.id, filters],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('is_dismissed', false)
        .order('start_date', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.linkedPropertyId) {
        query = query.eq('linked_property_id', filters.linkedPropertyId);
      }
      if (filters?.month !== undefined && filters?.year !== undefined) {
        const startOfMonth = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
        const endDate = new Date(filters.year, filters.month + 1, 0);
        const endOfMonth = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        query = query.gte('start_date', startOfMonth).lte('start_date', endOfMonth);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as CalendarEvent[];
    },
    enabled: !!user,
  });

  const createEvent = useMutation({
    mutationFn: async (event: CalendarEventInsert) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({ ...event, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-notifications'] });
      toast({ title: 'Event Created', description: 'Your calendar event has been added.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-notifications'] });
      toast({ title: 'Event Updated', description: 'Your calendar event has been updated.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-notifications'] });
      toast({ title: 'Event Deleted', description: 'Your calendar event has been removed.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const completeEvent = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({ status: 'completed', completed_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-notifications'] });
      toast({ title: 'Event Completed', description: 'Event marked as completed.' });
    },
  });

  const dismissEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .update({ is_dismissed: true } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });

  return {
    events,
    isLoading,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    dismissEvent,
  };
};
