import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@/contexts/AccountContext';
import { Button } from '@/components/ui/button';
import { DashboardGridCard } from '@/components/DashboardGridCard';
import StartWorkspaceDialog from './StartWorkspaceDialog';
import {
  FolderOpen,
  Heart,
  Home,
  Shield,
  Key,
  Users,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

const PREVIEW_CARDS = [
  {
    icon: <FolderOpen className="h-6 w-6" />,
    title: 'Asset Documentation',
    description: 'Claim-ready proof for your home and belongings.',
    tags: ['Photos', 'Videos', 'Documents', 'Records'],
    actionLabel: 'Open Documentation',
    actionIcon: <FolderOpen className="h-4 w-4" />,
    color: 'red' as const,
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Family Archive',
    description: 'Everyday life, organized and protected.',
    tags: ['VIP Contacts', 'Voice Notes', 'Trusted Pros', 'Notes'],
    actionLabel: 'Open Family Archive',
    actionIcon: <FolderOpen className="h-4 w-4" />,
    color: 'red' as const,
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure Vault',
    description: 'A single encrypted space for digital access and legacy planning.',
    tags: ['Legacy Locker', 'Digital Access', 'Recovery'],
    actionLabel: 'Open Secure Vault',
    actionIcon: <Shield className="h-4 w-4" />,
    color: 'yellow' as const,
  },
  {
    icon: <Key className="h-6 w-6" />,
    title: 'Emergency Instructions',
    description: 'Clear guidance for the people who matter most.',
    tags: ['Instructions', 'Contacts', 'Access'],
    actionLabel: 'Open Instructions',
    actionIcon: <Key className="h-4 w-4" />,
    color: 'yellow' as const,
  },
  {
    icon: <Home className="h-6 w-6" />,
    title: 'Property Profiles',
    description: 'Keep track of your properties and manage important details.',
    tags: ['All Homes', 'Vacation Houses', 'Rentals'],
    actionLabel: 'View Profiles',
    actionIcon: <Home className="h-4 w-4" />,
    color: 'blue' as const,
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Access & Activity',
    description: 'Authorized users and recent actions.',
    tags: ['Invite Users', 'Roles', 'Activity Log'],
    actionLabel: 'Manage Access & Activity',
    actionIcon: <Users className="h-4 w-4" />,
    color: 'blue' as const,
  },
];

const PersonalWorkspacePreview: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, switchAccount } = useAccount();
  const [dialogOpen, setDialogOpen] = useState(false);

  const firstShared = accounts.find((a) => a.role !== 'owner');

  const handleReturnToShared = () => {
    if (firstShared) {
      switchAccount(firstShared.accountId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invitation banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Create Your Own Workspace
            </h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
              You can continue using the accounts shared with you anytime. When
              you're ready, create your own protected workspace to organize
              your records, properties, photos, emergency instructions, and
              family information.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => navigate('/pricing')}>
                Start Your Workspace
              </Button>
              {firstShared && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReturnToShared}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Shared Account
                </Button>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Your shared access will not change.
            </p>
          </div>
        </div>
      </div>

      {/* Preview cards (softened) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-90">
        {PREVIEW_CARDS.map((card) => (
          <DashboardGridCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            description={card.description}
            tags={card.tags}
            actionLabel={card.actionLabel}
            actionIcon={card.actionIcon}
            color={card.color}
            onClick={() => setDialogOpen(true)}
          />
        ))}
      </div>

      <StartWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default PersonalWorkspacePreview;
