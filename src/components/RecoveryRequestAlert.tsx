import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface RecoveryRequest {
  id: string;
  delegate_user_id: string;
  relationship: string;
  reason: string;
  grace_period_ends_at: string;
  requested_at: string;
  status: string;
}

interface RecoveryRequestAlertProps {
  legacyLockerId: string;
  onRequestResolved: () => void;
}

export const RecoveryRequestAlert: React.FC<RecoveryRequestAlertProps> = ({
  legacyLockerId,
  onRequestResolved,
}) => {
  const [request, setRequest] = useState<RecoveryRequest | null>(null);
  const [delegateEmail, setDelegateEmail] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    fetchPendingRequest();
  }, [legacyLockerId]);

  const fetchPendingRequest = async () => {
    const { data, error } = await supabase
      .from("recovery_requests")
      .select("*")
      .eq("legacy_locker_id", legacyLockerId)
      .eq("status", "pending")
      .order("requested_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching recovery request:", error);
      return;
    }

    if (data) {
      setRequest(data);
      
      // Fetch delegate email
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", data.delegate_user_id)
        .single();

      if (profile) {
        setDelegateEmail(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
      }
    }
  };

  const handleResponse = async (action: 'approve' | 'reject') => {
    if (!request) return;

    setIsResponding(true);
    try {
      const { error } = await supabase.functions.invoke("respond-recovery-request", {
        body: {
          recoveryRequestId: request.id,
          action,
        },
      });

      if (error) throw error;

      toast.success(`Recovery request ${action}d successfully`);
      onRequestResolved();
    } catch (error) {
      console.error(`Error ${action}ing recovery request:`, error);
      toast.error(`Failed to ${action} recovery request`);
    } finally {
      setIsResponding(false);
    }
  };

  if (!request) return null;

  const timeRemaining = formatDistanceToNow(new Date(request.grace_period_ends_at), { addSuffix: true });

  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertCircle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900 font-semibold">
        Recovery Request Pending
      </AlertTitle>
      <AlertDescription className="text-amber-800">
        <div className="space-y-2 mt-2">
          <p>
            <strong>{delegateEmail}</strong> has requested access to your encrypted Legacy Locker.
          </p>
          
          {request.relationship && (
            <p><strong>Relationship:</strong> {request.relationship}</p>
          )}
          
          {request.reason && (
            <p><strong>Reason:</strong> {request.reason}</p>
          )}
          
          <p className="text-sm">
            <strong>Auto-approval {timeRemaining}</strong> if no action is taken.
          </p>
          
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleResponse('approve')}
              disabled={isResponding}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve Access
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleResponse('reject')}
              disabled={isResponding}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Deny Access
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
