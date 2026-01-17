import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, Info, Save, Loader2 } from "lucide-react";

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
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const RecoveryDelegateSelector: React.FC<RecoveryDelegateSelectorProps> = ({
  contributors,
  selectedDelegateId,
  gracePeriodDays,
  onDelegateChange,
  onGracePeriodChange,
  onSave,
  isSaving = false,
  hasChanges = false,
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
          Choose someone who can request access to your encrypted Secure Vault if you become unable to.
        </AlertDescription>
      </Alert>

      {adminContributors.length === 0 && (
        <Alert className="bg-muted border-border">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You must first add an authorized user with <strong>Administrator</strong> access in Account Settings → Authorized Users before you can select a Recovery Delegate. Only administrators will appear in this list.
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
            Once saved, the grace period countdown will begin. After the time expires, your delegate will receive an email granting access to your Secure Vault.
          </p>
        </div>
      )}

      {/* Save Button */}
      {onSave && (
        <div className="pt-4 border-t">
          <Button
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Recovery Delegate
              </>
            )}
          </Button>
          {hasChanges && (
            <p className="text-sm text-amber-600 mt-2">
              You have unsaved changes to your recovery delegate settings.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
