// @ts-nocheck
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIdleLogout } from '@/hooks/useIdleLogout';

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Renders the inactivity warning for signed-in users. Mounted once inside the
 * authenticated app shell; renders nothing for signed-out/public visitors.
 */
const IdleWarningDialog: React.FC = () => {
  const { warningOpen, msRemaining, staySignedIn, signOutNow } = useIdleLogout();

  if (!warningOpen) return null;

  return (
    <Dialog open onOpenChange={() => { /* not dismissible */ }}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Need more time?</DialogTitle>
          <DialogDescription>
            For your security, you'll be signed out in{' '}
            <span className="font-semibold tabular-nums text-foreground">
              {formatCountdown(msRemaining)}
            </span>{' '}
            due to inactivity.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={signOutNow}>
            Sign out now
          </Button>
          <Button onClick={staySignedIn}>Stay signed in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IdleWarningDialog;
