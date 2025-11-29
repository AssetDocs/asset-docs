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
              High-Value information beyond a traditional will
            </CardDescription>
          </div>
          <Badge variant="secondary">Demo Mode</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Legacy Locker captures the things a legal will can't: your voice, your intentions, your stories, and the guidance your family will be grateful for.
          </p>
          <p className="font-semibold text-foreground">
            It's not a legal will—it's the heart behind it.
          </p>
          <p>
            Here you can securely store memories, notes, access details, and clear instructions for the people you trust most.
          </p>
        </div>

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
      </CardContent>
    </Card>
  );
};

export default DemoLegacyLocker;