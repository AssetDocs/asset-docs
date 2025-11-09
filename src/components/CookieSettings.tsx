import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Cookie, RotateCcw, Save } from 'lucide-react';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';
import { useToast } from '@/hooks/use-toast';

const CookieSettings: React.FC = () => {
  const { consent, resetConsent, saveConsent } = useCookieConsent();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (consent) {
      setPreferences(consent.preferences);
    }
  }, [consent]);

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

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveConsent(preferences);
    setHasChanges(false);
    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been updated successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="h-5 w-5" />
          Cookie Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {consent && (
          <div className="text-sm text-muted-foreground mb-4">
            Last updated: {new Date(consent.consentDate).toLocaleDateString()}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Necessary Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Required for basic site functionality (always enabled)
              </p>
            </div>
            <Switch checked={preferences.necessary} disabled />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="analytics" className="text-sm font-medium">Analytics Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Site usage analysis and performance
              </p>
            </div>
            <Switch 
              id="analytics"
              checked={preferences.analytics} 
              onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="marketing" className="text-sm font-medium">Marketing Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Advertising and campaign tracking
              </p>
            </div>
            <Switch 
              id="marketing"
              checked={preferences.marketing} 
              onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="functional" className="text-sm font-medium">Functional Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Enhanced features and preferences
              </p>
            </div>
            <Switch 
              id="functional"
              checked={preferences.functional} 
              onCheckedChange={(checked) => handlePreferenceChange('functional', checked)}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
          <Button onClick={resetConsent} variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CookieSettings;