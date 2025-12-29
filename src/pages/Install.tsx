import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Download, Check, Apple, Chrome, Monitor } from "lucide-react";
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
            <h1 className="text-3xl font-bold text-foreground">Install Asset Safe</h1>
            <p className="text-muted-foreground">
              Add Asset Safe to your home screen for quick access and an app-like experience.
            </p>
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

              {/* iOS Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-6 h-6" />
                    Install on iPhone / iPad (Safari)
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to add Asset Safe to your home screen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Open <strong>Safari</strong> and navigate to Asset Safe</li>
                    <li>Tap the <strong>Share</strong> icon (square with an upward arrow)</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Confirm the name, then tap <strong>"Add"</strong></li>
                    <li>Asset Safe will now appear on your home screen like an app</li>
                  </ol>
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>⚠️ Note:</strong> This option only appears in Safari on iOS — not Chrome or Edge.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Microsoft Edge Desktop Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-6 h-6" />
                    Install on Microsoft Edge (Desktop – Windows or macOS)
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to install Asset Safe as a desktop app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Open <strong>Microsoft Edge</strong> and go to Asset Safe</li>
                    <li>Click the <strong>three-dot menu</strong> in the top-right corner</li>
                    <li>Select <strong>Apps → Install this site as an app</strong></li>
                    <li>Click <strong>Install</strong> to confirm</li>
                    <li>Asset Safe will now launch in its own window and appear in your Start Menu / Dock</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Android Edge Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-6 h-6" />
                    Install on Android (Microsoft Edge)
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to add Asset Safe to your home screen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Open <strong>Microsoft Edge</strong> on your Android device</li>
                    <li>Navigate to Asset Safe</li>
                    <li>Tap the <strong>three-dot menu</strong></li>
                    <li>Tap <strong>"Add to phone"</strong> or <strong>"Install app"</strong></li>
                    <li>Confirm by tapping <strong>Add</strong></li>
                    <li>Asset Safe will now appear on your home screen</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Android Chrome Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Chrome className="w-6 h-6" />
                    Install on Android (Chrome)
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to add Asset Safe to your home screen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Tap the <strong>menu icon</strong> (three dots) in Chrome</li>
                    <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                    <li>Tap <strong>"Add"</strong> to confirm</li>
                    <li>Asset Safe will now appear on your home screen</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Why Install?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Quick access from your home screen</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Full-screen app experience without browser bars</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Faster loading with cached resources</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Works offline for viewing cached content</span>
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
