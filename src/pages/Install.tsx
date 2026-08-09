import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Check, Shield, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import HomeScreenInstructions from "@/components/HomeScreenInstructions";

const Install = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
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
              Get quick, app-like access to your Asset Safe dashboard right from your home screen.
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
              <Card>
                <CardHeader>
                  <CardTitle>How to add it</CardTitle>
                  <CardDescription>
                    Open <strong>getassetsafe.com/account</strong> first, then follow the steps for
                    your device and browser.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HomeScreenInstructions variant="page" includeDesktop />
                </CardContent>
              </Card>

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
