import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecoveryRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  legacyLockerId: string;
  gracePeriodDays: number;
  onRequestSubmitted: () => void;
}

export const RecoveryRequestDialog: React.FC<RecoveryRequestDialogProps> = ({
  isOpen,
  onClose,
  legacyLockerId,
  gracePeriodDays,
  onRequestSubmitted,
}) => {
  const [relationship, setRelationship] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!relationship || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-recovery-request", {
        body: {
          legacyLockerId,
          relationship,
          reason,
        },
      });

      if (error) throw error;

      toast.success("Recovery request submitted successfully");
      onRequestSubmitted();
      onClose();
    } catch (error) {
      console.error("Error submitting recovery request:", error);
      toast.error("Failed to submit recovery request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle>Request Access to Encrypted Legacy Locker</DialogTitle>
          </div>
          <DialogDescription>
            This section is encrypted. To request access, confirm your relationship and provide a reason.
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            A notification will be sent to the account owner. If there is no response within {gracePeriodDays} days, access will be automatically granted.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select your relationship..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="executor">Executor</SelectItem>
                <SelectItem value="attorney">Attorney</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Request *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need access to the encrypted Legacy Locker..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
