import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, Clock, Upload, User, Home, Mail, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';
import VerifiedBadge from '@/components/VerifiedBadge';

const AccountStatusCard: React.FC = () => {
  const { status, loading, progress } = useVerification();

  if (loading) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading account status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criteria = status?.criteria;

  // Verified+ status - highest tier
  if (status?.is_verified_plus) {
    return (
      <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VerifiedBadge isVerified={true} isVerifiedPlus={true} size="lg" />
              <div>
                <h3 className="font-semibold text-amber-800">Verified+ Account</h3>
                <p className="text-sm text-amber-600">
                  Secure Vault Activated • Maximum Protection Enabled
                </p>
              </div>
            </div>
            <ShieldCheck className="h-8 w-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verified status - show Verified+ upsell
  if (status?.is_verified) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VerifiedBadge isVerified={true} size="lg" />
              <div>
                <h3 className="font-semibold text-green-800">Verified Account</h3>
                <p className="text-sm text-green-600">
                  Profile complete and claim-ready
                </p>
              </div>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
          
          {/* Verified+ Teaser */}
          <div className="border-t border-green-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Want maximum protection?
                </p>
                <p className="text-xs text-muted-foreground">
                  Unlock Verified+ by enabling Two-Factor Authentication
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50">
                <Link to="/account/settings">
                  <Shield className="h-4 w-4 mr-1" />
                  Enable 2FA
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // In progress or new user - show progress
  const criteriaCount = criteria ? [
    criteria.email_verified,
    criteria.account_age_met,
    criteria.upload_count_met,
    criteria.profile_complete,
    criteria.has_property
  ].filter(Boolean).length : 0;

  const stepsRemaining = 5 - criteriaCount;
  const isNewUser = criteriaCount === 0 || (criteriaCount === 1 && criteria?.email_verified);

  return (
    <Card className="border-muted">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Account Status
            {isNewUser ? (
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                User
              </span>
            ) : (
              <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Verification In Progress
              </span>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isNewUser 
                ? "Complete your setup to unlock Verified status"
                : `You're ${stepsRemaining} step${stepsRemaining !== 1 ? 's' : ''} away from becoming Verified`
              }
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Criteria checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <CriteriaRow 
            met={criteria?.email_verified ?? false} 
            label="Email Confirmed" 
            icon={<Mail className="h-3.5 w-3.5" />}
          />
          <CriteriaRow 
            met={criteria?.account_age_met ?? false} 
            label={`Account Age: ${criteria?.account_age_met ? '14+' : '< 14'} days`}
            icon={<Clock className="h-3.5 w-3.5" />}
          />
          <CriteriaRow 
            met={criteria?.upload_count_met ?? false} 
            label={`Uploads: ${criteria?.upload_count ?? 0} / 10`}
            icon={<Upload className="h-3.5 w-3.5" />}
          />
          <CriteriaRow 
            met={criteria?.has_property ?? false} 
            label="Property Added" 
            icon={<Home className="h-3.5 w-3.5" />}
          />
          <CriteriaRow 
            met={criteria?.profile_complete ?? false} 
            label="Profile Complete" 
            icon={<User className="h-3.5 w-3.5" />}
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Verified accounts are more complete, organized, and insurance-ready.
          </p>
          <Button asChild size="sm" variant="link" className="text-brand-blue p-0 h-auto">
            <Link to="/account/settings">
              View Checklist →
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface CriteriaRowProps {
  met: boolean;
  label: string;
  icon: React.ReactNode;
}

const CriteriaRow: React.FC<CriteriaRowProps> = ({ met, label, icon }) => (
  <div className="flex items-center gap-2">
    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${met ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
      {met ? <Check className="h-3 w-3" /> : icon}
    </div>
    <span className={met ? 'text-foreground' : 'text-muted-foreground'}>
      {label}
    </span>
  </div>
);

export default AccountStatusCard;
