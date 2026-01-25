import React from 'react';
import { Check, X, Clock, Upload, User, Home, Mail } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerification, VerificationCriteria } from '@/hooks/useVerification';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CriteriaItemProps {
  label: string;
  met: boolean;
  icon: React.ReactNode;
  detail?: string;
}

const CriteriaItem: React.FC<CriteriaItemProps> = ({ label, met, icon, detail }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-full ${met ? 'bg-green-100' : 'bg-muted'}`}>
        {icon}
      </div>
      <div>
        <span className={`text-sm ${met ? 'text-foreground' : 'text-muted-foreground'}`}>
          {label}
        </span>
        {detail && (
          <p className="text-xs text-muted-foreground">{detail}</p>
        )}
      </div>
    </div>
    {met ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground" />
    )}
  </div>
);

interface VerificationProgressProps {
  showRefresh?: boolean;
  compact?: boolean;
}

const VerificationProgress: React.FC<VerificationProgressProps> = ({ 
  showRefresh = true,
  compact = false 
}) => {
  const { status, loading, progress, refreshVerification } = useVerification();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshVerification();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If already verified+, show premium success state
  if (status?.is_verified_plus) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <Check className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">Verified+ Account</h3>
              <p className="text-sm text-amber-600">
                Your account is verified with 2FA protection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If already verified (but not verified+), show success state with 2FA upgrade option
  if (status?.is_verified) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Verified Account</h3>
              <p className="text-sm text-green-600">
                Your account has been verified
              </p>
            </div>
          </div>
          {!status.criteria.has_2fa && (
            <div className="border-t border-green-200 pt-4">
              <p className="text-sm text-green-700">
                <strong>Upgrade to Verified+:</strong> Enable Two-Factor Authentication in your Account Settings to earn the gold Verified+ badge.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const criteria = status?.criteria;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Verification Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Verified Account Progress</CardTitle>
          {showRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Checking...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
            <span className="text-muted-foreground">
              {criteria ? [
                criteria.email_verified,
                criteria.account_age_met,
                criteria.upload_count_met,
                criteria.profile_complete,
                criteria.has_property
              ].filter(Boolean).length : 0}/5 criteria met
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="divide-y">
          <CriteriaItem
            label="Email verified"
            met={criteria?.email_verified ?? false}
            icon={<Mail className={`h-4 w-4 ${criteria?.email_verified ? 'text-green-600' : 'text-muted-foreground'}`} />}
          />
          <CriteriaItem
            label="Account age"
            met={criteria?.account_age_met ?? false}
            icon={<Clock className={`h-4 w-4 ${criteria?.account_age_met ? 'text-green-600' : 'text-muted-foreground'}`} />}
            detail="Active for at least 2 weeks"
          />
          <CriteriaItem
            label="Uploads"
            met={criteria?.upload_count_met ?? false}
            icon={<Upload className={`h-4 w-4 ${criteria?.upload_count_met ? 'text-green-600' : 'text-muted-foreground'}`} />}
            detail={`${criteria?.upload_count ?? 0}/10 files uploaded`}
          />
          <CriteriaItem
            label="Profile complete"
            met={criteria?.profile_complete ?? false}
            icon={<User className={`h-4 w-4 ${criteria?.profile_complete ? 'text-green-600' : 'text-muted-foreground'}`} />}
            detail="First and last name saved"
          />
          <CriteriaItem
            label="Property saved"
            met={criteria?.has_property ?? false}
            icon={<Home className={`h-4 w-4 ${criteria?.has_property ? 'text-green-600' : 'text-muted-foreground'}`} />}
            detail="At least 1 property profile"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationProgress;
