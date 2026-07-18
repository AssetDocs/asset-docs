import React from 'react';
import { Home, ShieldCheck, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type WelcomeAction = 'property' | 'authorized-user' | 'mfa';

interface FirstDashboardWelcomeModalProps {
  open: boolean;
  firstName: string;
  canManageDashboard: boolean;
  onDismiss: () => void;
  onChoose: (action: WelcomeAction) => void;
}

const welcomeActions: Array<{
  id: WelcomeAction;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'property',
    label: 'Create Your First Property',
    description: 'Start by adding the home, rental, or place you want to document.',
    icon: Home,
  },
  {
    id: 'authorized-user',
    label: 'Add an Authorized User',
    description: 'Invite someone trusted to help view or manage your account.',
    icon: Users,
  },
  {
    id: 'mfa',
    label: 'Set Up MFA',
    description: 'Add an extra layer of protection to your Asset Safe account.',
    icon: ShieldCheck,
  },
];

const FirstDashboardWelcomeModal: React.FC<FirstDashboardWelcomeModalProps> = ({
  open,
  firstName,
  canManageDashboard,
  onDismiss,
  onChoose,
}) => {
  const visibleActions = canManageDashboard
    ? welcomeActions
    : welcomeActions.filter((action) => action.id === 'mfa');

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onDismiss();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">
            Welcome to Asset Safe, {firstName}.
          </DialogTitle>
          <DialogDescription className="text-base leading-7">
            You don't have to organize everything at once. Start with one simple
            step today, and build your account over time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-6">
            Your dashboard is designed to grow with you - property by property,
            document by document, and person by person.
          </p>

          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              Choose where you'd like to begin:
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onChoose(action.id)}
                    className="text-left rounded-lg border bg-card p-4 transition-colors hover:border-brand-blue hover:bg-brand-blue/5 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                  >
                    <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-blue/10 text-brand-blue">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="block text-sm font-semibold text-foreground">
                      {action.label}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                      {action.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDismiss}>
            Explore Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FirstDashboardWelcomeModal;
