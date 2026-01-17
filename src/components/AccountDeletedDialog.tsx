import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface AccountDeletedDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountDeletedDialog: React.FC<AccountDeletedDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const handleRecreateAccount = () => {
    onClose();
    window.location.href = 'https://assetsafe.net';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-semibold text-center">
            Thank you for using Asset Safe!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center py-4">
          <p className="text-lg font-medium text-foreground">
            Your Asset Safe account has been closed.
          </p>
          
          <p className="text-muted-foreground">
            Thank you for the time you spent with Asset Safe. We truly appreciate you trusting us with your property documentation—even if it was just for a season.
          </p>
          
          <p className="text-muted-foreground">
            Your account has been fully deleted, and you no longer have access to the dashboard or stored assets.
          </p>
          
          <p className="text-muted-foreground">
            If your needs ever change—whether due to a move, renovation, insurance event, or simply wanting peace of mind—we'll be here. Asset Safe was built to support life's transitions, whenever they happen.
          </p>
          
          <p className="text-muted-foreground italic pt-2">
            Wishing you all the best,
            <br />
            <span className="font-medium">The Asset Safe Team</span>
          </p>
        </div>

        <div className="pt-4">
          <Button 
            variant="outline" 
            onClick={handleRecreateAccount}
            className="w-full"
          >
            Re-create an account anytime at assetsafe.net
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDeletedDialog;
