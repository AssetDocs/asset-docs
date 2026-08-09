import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Check, Apple, Chrome, Shield, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

type MobilePlatform = 'ios-safari' | 'ios-other' | 'android' | 'desktop';

function detectPlatform(): MobilePlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    const isSafari = /^((?!CriOS|FxiOS|EdgiOS|OPiOS|GoogleApp).)*Safari/.test(ua);
    return isSafari ? 'ios-safari' : 'ios-other';
  }
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

const CONFIRMATION =
  "Asset Safe will appear on your home screen and open directly to your dashboard sign-in or account.";

const Install = () => {
  const [platform, setPlatform] = useState<MobilePlatform>('desktop');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Add to Home Screen | Asset Safe"
        description="Add Asset Safe to your device's home screen for quick, app-like access to your dashboard."
        keywords="add asset safe to home screen, home screen shortcut, quick dashboard access, asset safe mobile access"
        canonicalUrl="https://getassetsafe.com/install"
      />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Back to Dashboard Button */}
        <div className="max-w-2xl mx-auto mb-6">
          <Button
            asChild
            variant="outline"
            className="text-brand-orange border-brand-orange hover:bg-brand-orange/10"
          >
            <Link to="/account">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Smartphone className="w-16 h-16 mx-auto text-brand-orange" />
            <h1 className="text-3xl font-bold text-foreground">Add Asset Safe to Your Home Screen</h1>
            <p className="text-lg text-muted-foreground font-medium">
              Quick, app-like access to your Asset Safe dashboard
            </p>
            <div className="text-left bg-muted/50 rounded-lg p-6 space-y-4">
              <p className="text-muted-foreground">
                Asset Safe works directly from your browser and can be added to your device's home
                screen for quick access to your dashboard.
              </p>
              <p className="text-foreground font-medium">This gives you:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span>🚀</span> One-tap access to your dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span> Opens directly to your Asset Safe sign-in or account
                </li>
                <li className="flex items-center gap-2">
                  <span>🔐</span> Uses the same secure Asset Safe account and protections as the full website
                </li>
              </ul>
            </div>
          </div>

          {isStandalone ? (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6 text-center">
                <Check className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <p className="text-lg font-medium text-green-800 dark:text-green-200">
                  Asset Safe is already on your home screen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Android / Chrome */}
              {(platform === 'android' || platform === 'desktop') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Chrome className="w-6 h-6" />
                      Chrome (Android, Windows, Mac)
                    </CardTitle>
                    <CardDescription>
                      How to add Asset Safe to your home screen in Chrome
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                      <li>Open <strong>Chrome</strong> and go to <strong>getassetsafe.com/account</strong></li>
                      <li>Tap or click the <strong>menu icon (⋮)</strong> in the top-right corner</li>
                      <li>Choose <strong>Add to Home screen</strong> or the shortcut option shown by Chrome</li>
                      <li>Confirm the shortcut</li>
                    </ol>
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ {CONFIRMATION}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* iOS Safari */}
              {platform === 'ios-safari' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="w-6 h-6" />
                      Safari (iPhone & iPad)
                    </CardTitle>
                    <CardDescription>
                      How to add Asset Safe to your home screen on iOS
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                      <li>Open <strong>Safari</strong> and go to <strong>getassetsafe.com/account</strong></li>
                      <li>Tap the <strong>Share</strong> button (square with arrow)</li>
                      <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                      <li>Tap <strong>Add</strong></li>
                    </ol>
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ {CONFIRMATION}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* iOS non-Safari */}
              {platform === 'ios-other' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="w-6 h-6" />
                      iPhone & iPad
                    </CardTitle>
                    <CardDescription>
                      Safari gives the most reliable Add to Home Screen experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground font-medium">
                      For the easiest setup, open Asset Safe in Safari and go to your dashboard before
                      adding it to your home screen.
                    </p>
                    <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                      <li>In <strong>Safari</strong>, go to <strong>getassetsafe.com/account</strong></li>
                      <li>Tap the <strong>Share</strong> button</li>
                      <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                      <li>Tap <strong>Add</strong></li>
                    </ol>
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ {CONFIRMATION}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Reminder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Security Reminder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Even when added to your home screen:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">All security protections still apply</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">You may be prompted to log in again for sensitive areas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Secure Vault and encrypted content remain protected</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;
