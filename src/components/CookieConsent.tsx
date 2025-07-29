import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Cookie, Settings, X } from 'lucide-react';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';

const CookieConsent: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, saveConsent } = useCookieConsent();
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  if (!showBanner) return null;

  const handleCustomSave = () => {
    saveConsent(preferences);
    setShowCustomize(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto border-2 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showCustomize ? (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                By clicking "Accept All", you consent to our use of cookies for these purposes.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">What cookies do we use?</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>Necessary:</strong> Required for basic site functionality</li>
                  <li>• <strong>Analytics:</strong> Help us understand how you use our site</li>
                  <li>• <strong>Marketing:</strong> Used to show you relevant advertisements</li>
                  <li>• <strong>Functional:</strong> Remember your preferences and settings</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Necessary Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Required for basic site functionality and security
                    </p>
                  </div>
                  <Switch 
                    checked={true} 
                    disabled 
                    className="opacity-50"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Analytics Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Help us understand site usage and improve performance
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Marketing Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Used to show relevant ads and measure campaign effectiveness
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Functional Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Remember your preferences and provide enhanced features
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.functional}
                    onCheckedChange={(checked) => handlePreferenceChange('functional', checked)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4">
          {!showCustomize ? (
            <>
              <div className="flex gap-2 w-full">
                <Button onClick={acceptAll} className="flex-1">
                  Accept All
                </Button>
                <Button onClick={rejectAll} variant="outline" className="flex-1">
                  Reject All
                </Button>
              </div>
              <Button 
                onClick={() => setShowCustomize(true)}
                variant="ghost" 
                size="sm"
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize Preferences
              </Button>
            </>
          ) : (
            <div className="flex gap-2 w-full">
              <Button onClick={handleCustomSave} className="flex-1">
                Save Preferences
              </Button>
              <Button 
                onClick={() => setShowCustomize(false)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            You can change your preferences at any time in your account settings.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CookieConsent;