import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Cookie, RotateCcw } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const CookieSettings: React.FC = () => {
  const { consent, resetConsent } = useCookieConsent();

  if (!consent) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Cookie className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No cookie preferences set</p>
            <Button onClick={resetConsent} variant="outline">
              Set Cookie Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="h-5 w-5" />
          Cookie Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Consent given on {new Date(consent.consentDate).toLocaleDateString()}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Necessary Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Required for basic site functionality
              </p>
            </div>
            <Switch checked={consent.preferences.necessary} disabled />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Analytics Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Site usage analysis and performance
              </p>
            </div>
            <Switch checked={consent.preferences.analytics} disabled />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Marketing Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Advertising and campaign tracking
              </p>
            </div>
            <Switch checked={consent.preferences.marketing} disabled />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Functional Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Enhanced features and preferences
              </p>
            </div>
            <Switch checked={consent.preferences.functional} disabled />
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={resetConsent} variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Change Cookie Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CookieSettings;