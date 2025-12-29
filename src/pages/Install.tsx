import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Download, Check, Apple, Chrome, Monitor, Wifi, WifiOff, Shield, Compass } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Smartphone className="w-16 h-16 mx-auto text-brand-orange" />
            <h1 className="text-3xl font-bold text-foreground">📲 Add Asset Safe to Your Home Screen</h1>
            <p className="text-lg text-muted-foreground font-medium">
              (App-Like Access)
            </p>
            <div className="text-left bg-muted/50 rounded-lg p-6 space-y-4">
              <p className="text-muted-foreground">
                Asset Safe is not a traditional app from the App Store or Google Play. Instead, it uses modern browser technology that lets you save Asset Safe to your device's home screen and use it like an app.
              </p>
              <p className="text-foreground font-medium">This gives you:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span>🚀</span> One-tap access to your dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span>📶</span> Continued access even with limited or no internet (helpful during emergencies or disasters)
                </li>
                <li className="flex items-center gap-2">
                  <span>🔐</span> The same secure experience as the full website
                </li>
              </ul>
            </div>
          </div>

          {isInstalled ? (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6 text-center">
                <Check className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <p className="text-lg font-medium text-green-800 dark:text-green-200">
                  Asset Safe is already installed on your device!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Android/Chrome Install */}
              {deferredPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Chrome className="w-6 h-6" />
                      Install Now
                    </CardTitle>
                    <CardDescription>
                      Click the button below to install Asset Safe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleInstallClick} 
                      className="w-full bg-brand-orange hover:bg-brand-orange/90"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Install Asset Safe
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Chrome Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Chrome className="w-6 h-6" />
                    🌐 Chrome (Android, Windows, Mac)
                  </CardTitle>
                  <CardDescription>
                    How to add Asset Safe in Chrome
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Open <strong>Chrome</strong></li>
                    <li>Go to <strong>https://assetsafe.net</strong></li>
                    <li>Tap or click the <strong>menu icon (⋮)</strong> in the top-right corner</li>
                    <li>Select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></li>
                    <li>Confirm when prompted</li>
                  </ol>
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ Asset Safe will now appear on your home screen or desktop and open in its own app-style window.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Microsoft Edge Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-6 h-6" />
                    🌐 Microsoft Edge (Windows, Mac, Android)
                  </CardTitle>
                  <CardDescription>
                    How to add Asset Safe in Edge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Open <strong>Microsoft Edge</strong></li>
                    <li>Visit <strong>https://assetsafe.net</strong></li>
                    <li>Click the <strong>menu icon (⋯)</strong> in the top-right corner</li>
                    <li>Choose <strong>Apps</strong></li>
                    <li>Select <strong>"Install this site as an app"</strong></li>
                    <li>Confirm installation</li>
                  </ol>
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ Asset Safe will now behave like a standalone app and can be pinned to your desktop or taskbar.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* iOS Safari Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-6 h-6" />
                    🍎 Safari (iPhone & iPad)
                  </CardTitle>
                  <CardDescription>
                    Apple devices require Safari for this feature
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-medium">How to add Asset Safe on iOS:</p>
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Open <strong>Safari</strong></li>
                    <li>Go to <strong>https://assetsafe.net</strong></li>
                    <li>Tap the <strong>Share icon</strong> (square with arrow)</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Rename it if desired, then tap <strong>Add</strong></li>
                  </ol>
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ Asset Safe will appear on your home screen just like an app.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Offline Access Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WifiOff className="w-6 h-6" />
                    ⚠️ Important Notes About Offline Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Wifi className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Asset Safe uses secure caching to allow limited access during internet outages</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Previously loaded data (such as photos, reports, and key records) may still be viewable</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <WifiOff className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Some features (uploads, syncing, new reports) require an internet connection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">This is especially helpful during natural disasters, insurance events, or power outages</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Security Reminder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    🔒 Security Reminder
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

              {/* Best Practice Tip */}
              <Card className="border-brand-orange/50 bg-brand-orange/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-6 h-6 text-brand-orange" />
                    🧭 Best Practice Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We recommend adding Asset Safe to your home screen as soon as your account is created, so your documentation is always just one tap away — especially when you need it most.
                  </p>
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
