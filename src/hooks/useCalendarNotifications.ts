import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCalendarNotifications = () => {
  const { user } = useAuth();

  const { data: todayCount = 0 } = useQuery({
    queryKey: ['calendar-notifications', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('calendar_events')
        .select('*', { count: 'exact', head: true })
        .eq('start_date', today)
        .eq('status', 'upcoming')
        .eq('is_dismissed', false);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  return { todayCount };
};
