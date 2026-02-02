import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AddDecisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { decision: string; rationale?: string }) => Promise<boolean>;
}

export const AddDecisionModal: React.FC<AddDecisionModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [decision, setDecision] = useState('');
  const [rationale, setRationale] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;
    
    setSubmitting(true);
    const success = await onSubmit({ decision, rationale: rationale || undefined });
    setSubmitting(false);
    
    if (success) {
      setDecision('');
      setRationale('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Decision</DialogTitle>
          <DialogDescription>Record a technical decision for the team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="decision">Decision *</Label>
              <Input
                id="decision"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder="What was decided?"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rationale">Rationale</Label>
              <Textarea
                id="rationale"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Why was this decision made?"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !decision.trim()}>
              {submitting ? 'Recording...' : 'Record Decision'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
