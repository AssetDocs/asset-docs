import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const EmailVerificationNotice: React.FC = () => {
  const { user } = useAuth();

  // Don't show the notice if user is email verified
  if (!user || user.email_confirmed_at) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 mb-2">
              Check your inbox to verify your email address
            </h3>
            <p className="text-orange-700 text-sm">
              Once verified, you will be redirected to complete your subscription. 
              Please check your email and click the verification link to continue.
            </p>
            <p className="text-orange-600 text-xs mt-2">
              Don't see the email? Check your spam folder or contact support.
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-orange-500" />
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationNotice;