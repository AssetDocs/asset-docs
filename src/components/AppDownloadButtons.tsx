import React from 'react';
import { Smartphone, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppDownloadButtons: React.FC = () => {
  const handleIOSDownload = () => {
    // In production, this would link to the App Store
    console.log('Redirecting to iOS App Store');
    // window.open('https://apps.apple.com/app/asset-docs', '_blank');
  };

  const handleAndroidDownload = () => {
    // In production, this would link to Google Play Store
    console.log('Redirecting to Google Play Store');
    // window.open('https://play.google.com/store/apps/details?id=com.assetdocs', '_blank');
  };

  return (
    <div id="app-downloads" className="flex flex-col sm:flex-row gap-3 mb-6">
      <Button 
        onClick={handleIOSDownload}
        variant="outline" 
        className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
      >
        <Apple className="h-5 w-5" />
        <div className="text-left">
          <div className="text-xs text-gray-500">Download on the</div>
          <div className="text-sm font-semibold">App Store</div>
        </div>
      </Button>
      
      <Button 
        onClick={handleAndroidDownload}
        variant="outline" 
        className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
      >
        <Smartphone className="h-5 w-5" />
        <div className="text-left">
          <div className="text-xs text-gray-500">Get it on</div>
          <div className="text-sm font-semibold">Google Play</div>
        </div>
      </Button>
    </div>
  );
};

export default AppDownloadButtons;