import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Info } from "lucide-react";

interface Contributor {
  id: string;
  contributor_email: string;
  contributor_user_id: string | null;
  role: string;
}

interface RecoveryDelegateSelectorProps {
  contributors: Contributor[];
  selectedDelegateId: string | null;
  gracePeriodDays: number;
  onDelegateChange: (delegateId: string | null) => void;
  onGracePeriodChange: (days: number) => void;
}

export const RecoveryDelegateSelector: React.FC<RecoveryDelegateSelectorProps> = ({
  contributors,
  selectedDelegateId,
  gracePeriodDays,
  onDelegateChange,
  onGracePeriodChange,
}) => {
  const adminContributors = contributors.filter(c => c.role === 'administrator' && c.contributor_user_id);

  return (
    <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recovery Delegate (Optional)</h3>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Choose someone who can request access to your encrypted Legacy Locker if you become unable to.
          They will not see your encrypted data unless a recovery request is approved.
        </AlertDescription>
      </Alert>

      {adminContributors.length === 0 && (
        <Alert className="bg-muted border-border">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You must first add a contributor with <strong>Administrator</strong> access in Account Settings → Manage Contributors before you can select a Recovery Delegate. Only administrators will appear in this list (not viewers or contributors).
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="delegate">Select Recovery Delegate</Label>
        <Select 
          value={selectedDelegateId || "none"} 
          onValueChange={(value) => onDelegateChange(value === "none" ? null : value)}
        >
          <SelectTrigger id="delegate">
            <SelectValue placeholder="Select a delegate..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No delegate</SelectItem>
            {adminContributors.map((contributor) => (
              <SelectItem key={contributor.id} value={contributor.contributor_user_id!}>
                {contributor.contributor_email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDelegateId && (
        <div className="space-y-2">
          <Label htmlFor="grace-period">Grace Period</Label>
          <Select 
            value={gracePeriodDays.toString()} 
            onValueChange={(value) => onGracePeriodChange(parseInt(value))}
          >
            <SelectTrigger id="grace-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            If a recovery request is made, you will be notified and have this grace period to respond before access is granted.
          </p>
        </div>
      )}
    </div>
  );
};
