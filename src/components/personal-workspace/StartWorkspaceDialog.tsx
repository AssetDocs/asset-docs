import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface StartWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const DEFAULT_TITLE = 'Start Your Own Workspace';
const DEFAULT_DESCRIPTION =
  'This section helps you organize and protect your own important records, photos, properties, and emergency information. Your shared account access remains available anytime.';

const StartWorkspaceDialog: React.FC<StartWorkspaceDialogProps> = ({
  open,
  onOpenChange,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}) => {
  const navigate = useNavigate();

  const handleStart = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not Now
          </Button>
          <Button onClick={handleStart}>Start Your Workspace</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartWorkspaceDialog;
