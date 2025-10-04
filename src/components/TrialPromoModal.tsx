import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Lock, CheckCircle } from 'lucide-react';

export const TrialPromoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isInTrial, subscriptionStatus } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isInTrial) return;

    // Check if we should show the modal (every 7 days)
    const lastShown = localStorage.getItem(`trialPromo_${user.id}`);
    const now = Date.now();
    const weekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (!lastShown || (now - parseInt(lastShown)) >= weekInMs) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(`trialPromo_${user.id}`, now.toString());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, isInTrial]);

  const calculateTrialDaysRemaining = () => {
    if (!user?.created_at) return 30;
    
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysPassed);
    
    return daysRemaining;
  };

  const handleUpgrade = () => {
    setIsOpen(false);
    navigate('/account?tab=subscription');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isInTrial) return null;

  const daysRemaining = calculateTrialDaysRemaining();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-auto bg-background border border-border/20 shadow-2xl">
        <div className="relative p-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-6">
            {/* Email verification message */}
            <div className="space-y-4">
              <p className="text-lg font-semibold text-foreground">
                Check your inbox to verify your account.
              </p>
              <p className="text-sm text-muted-foreground">
                You will then be redirected to complete your subscription.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};