import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CalendarEventInsert } from './useCalendarEvents';

export interface SuggestedEvent {
  key: string;
  title: string;
  category: CalendarEventInsert['category'];
  start_date: string;
  notes: string;
  source: string;
}

export const useSuggestedEvents = () => {
  const { user } = useAuth();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['calendar-suggested-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const suggested: SuggestedEvent[] = [];

      // Check insurance policies for renewal dates
      const { data: policies } = await supabase
        .from('insurance_policies')
        .select('id, policy_type, insurance_company, policy_end_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .not('policy_end_date', 'is', null);

      if (policies) {
        for (const p of policies) {
          if (p.policy_end_date) {
            suggested.push({
              key: `insurance-renewal-${p.id}`,
              title: `${p.insurance_company} ${p.policy_type} Renewal`,
              category: 'warranties_coverage',
              start_date: p.policy_end_date,
              notes: `Insurance policy renewal for ${p.insurance_company}.`,
              source: 'Insurance Policies',
            });
          }
        }
      }

      // Check existing calendar events to avoid duplicating suggestions
      const { data: existingEvents } = await supabase
        .from('calendar_events')
        .select('template_key')
        .eq('user_id', user.id)
        .eq('is_suggested', true);

      const existingKeys = new Set((existingEvents || []).map((e: any) => e.template_key));
      return suggested.filter(s => !existingKeys.has(s.key));
    },
    enabled: !!user,
  });

  return { suggestions, isLoading };
};
