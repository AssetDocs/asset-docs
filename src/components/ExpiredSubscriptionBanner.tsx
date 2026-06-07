// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onReactivate?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

const ExpiredSubscriptionBanner: React.FC<Props> = ({ onReactivate, onExport, onDelete }) => {
  const { isReadOnly, accountStatus, loading } = useAccountStatus();
  const navigate = useNavigate();

  if (loading || !isReadOnly) return null;

  const title =
    accountStatus === 'expired_read_only'
      ? 'Subscription Expired'
      : 'Account Deletion Requested';

  const message =
    accountStatus === 'expired_read_only'
      ? 'Your records remain securely stored and available in read-only mode. You can continue viewing your information, exporting your data, reactivating your subscription, or requesting permanent account deletion.'
      : 'Your account is scheduled for deletion. You retain read-only access until the scheduled date. You can still export your data or reverse this request from Account Settings.';

  return (
    <Alert className="mb-4 border-orange-400 bg-orange-50">
      <AlertTriangle className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-900 flex items-center gap-2">
        <Lock className="h-4 w-4" /> {title}
      </AlertTitle>
      <AlertDescription className="text-orange-900/90 space-y-3">
        <p>{message}</p>
        <div className="flex flex-wrap gap-2">
          {accountStatus === 'expired_read_only' && (
            <Button
              size="sm"
              className="bg-brand-orange text-white hover:bg-brand-orange/90"
              onClick={() => (onReactivate ? onReactivate() : navigate('/account?tab=manage'))}
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Reactivate Subscription
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => (onExport ? onExport() : navigate('/account?tab=export'))}
          >
            <Download className="h-4 w-4 mr-1" /> Export My Data
          </Button>
          {accountStatus === 'expired_read_only' && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={() => (onDelete ? onDelete() : navigate('/account?tab=manage'))}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete Account
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ExpiredSubscriptionBanner;
