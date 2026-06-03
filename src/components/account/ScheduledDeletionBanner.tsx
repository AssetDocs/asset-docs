// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { useToast } from '@/hooks/use-toast';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const ScheduledDeletionBanner: React.FC = () => {
  const { user } = useAuth();
  const { isDeletionRequested, refresh } = useAccountStatus();
  const { toast } = useToast();
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [reversing, setReversing] = useState(false);

  useEffect(() => {
    if (!user?.id || !isDeletionRequested) return;
    (async () => {
      const { data } = await supabase
        .from('account_closure_requests')
        .select('deletion_scheduled_date, current_period_end')
        .eq('owner_user_id', user.id)
        .in('status', ['pending', 'scheduled'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setScheduledDate(data.deletion_scheduled_date || null);
        setCurrentPeriodEnd(data.current_period_end || null);
      }
    })();
  }, [user?.id, isDeletionRequested]);

  if (!isDeletionRequested) return null;

  const handleReverse = async () => {
    setReversing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('reverse-account-closure', {
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      if (error) throw error;
      toast({ title: 'Deletion cancelled', description: 'Your account will remain active.' });
      await refresh();
    } catch (e: any) {
      toast({
        title: 'Could not cancel deletion',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
    setReversing(false);
  };

  return (
    <Alert variant="destructive" className="mb-6">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Account scheduled for deletion</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          {scheduledDate ? (
            <p>
              Your account will be permanently deleted on{' '}
              <strong>{formatDate(scheduledDate)}</strong>. You have read-only access until then.
              {currentPeriodEnd && ' This date matches the end of your current billing period.'}
            </p>
          ) : (
            <p>Your account is scheduled for permanent deletion. You have read-only access until then.</p>
          )}
          <Button size="sm" variant="outline" onClick={handleReverse} disabled={reversing}>
            {reversing ? 'Cancelling…' : 'Cancel deletion request'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ScheduledDeletionBanner;
