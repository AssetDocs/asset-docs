import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, FileText, Users, Home, DollarSign, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DemoLegacyLocker = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legacy Locker
            </CardTitle>
            <CardDescription>
              High-Value Information Beyond a Traditional Will
            </CardDescription>
          </div>
          <Badge variant="secondary">Demo Mode</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Important:</strong> The Legacy Locker is not a legal will. It's a secure vault for photos, videos, notes, account access, and other details that help clarify your wishes.
            <br /><br />
            It doesn't replace an official will, but it adds valuable context and support for your estate plans.
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertDescription>
            This is a demonstration of the Legacy Locker feature. In the full version, you can:
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Store your will and testament information securely</li>
              <li>Choose to encrypt data with a master password</li>
              <li>Control whether contributors can access this information</li>
              <li>Document executor, guardian, and beneficiary information</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              Personal Information
            </div>
            <p className="text-sm text-muted-foreground">
              Legal name, address, and identification details
            </p>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-primary" />
              Executor & Guardians
            </div>
            <p className="text-sm text-muted-foreground">
              Designate who will manage your estate and care for dependents
            </p>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="h-4 w-4 text-primary" />
              Asset Distribution
            </div>
            <p className="text-sm text-muted-foreground">
              Specify who receives your assets and digital accounts
            </p>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Home className="h-4 w-4 text-primary" />
              Real Estate
            </div>
            <p className="text-sm text-muted-foreground">
              Instructions for properties and real estate holdings
            </p>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Heart className="h-4 w-4 text-primary" />
              Final Wishes
            </div>
            <p className="text-sm text-muted-foreground">
              Funeral preferences, letters to loved ones, and legacy messages
            </p>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-primary" />
              Encryption Option
            </div>
            <p className="text-sm text-muted-foreground">
              Secure sensitive information with master password encryption
            </p>
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This is an informal document for guidance and should not replace a legally prepared Last Will and Testament. Please consult with a legal professional for official estate planning.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DemoLegacyLocker;