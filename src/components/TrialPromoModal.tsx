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
            {/* Header with lock icon */}
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
              <Lock className="h-5 w-5 text-orange" />
              <span>You've built your secure digital record — don't risk losing it.</span>
            </div>

            {/* Benefits list */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Upgrade today to keep:</p>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Verified property records</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Instant access for insurance and legal claims</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Peace of mind knowing you're covered</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited storage for all your documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Advanced AI valuation features</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-orange to-blue-600 hover:from-orange/90 hover:to-blue-600/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
            >
              Upgrade Now
            </Button>

            {/* Trial countdown */}
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Trial ends in <span className="text-orange font-bold">{daysRemaining} days</span>
              </p>
            </div>

            {/* Small print */}
            <p className="text-xs text-muted-foreground">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};