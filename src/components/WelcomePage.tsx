import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomePageProps {
  onEnterSite: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onEnterSite }) => {
  const handleContactUs = () => {
    window.location.href = '/contact';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/620994c0-7532-4240-a792-d1ed8973956d.png" 
              alt="AssetDocs Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-4">
            Complete Asset Documentation Solution
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            Comprehensive protection and documentation services for homeowners, renters, business owners, landlords, and more.
          </p>
          
          <div className="bg-accent/10 rounded-lg p-6 mb-8">
            <p className="text-muted-foreground">
              This website is still under construction. However, feel free to browse around and learn more about the services we offer. Please reach out with any questions you may have.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onEnterSite}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Enter Site
            </Button>
            <Button 
              onClick={handleContactUs}
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Contact Us
            </Button>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 AssetDocs. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePage;