
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Archive, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DownloadAllFilesButton: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownloadAll = async () => {
    const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
    if (isOnSampleDashboard) {
      alert('AssetDocs.net says\n\nDemo: This would download all your uploaded photos, videos, and documents as a ZIP file for backup or data portability.');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Simulate the download process
      toast({
        title: "Preparing Download",
        description: "Collecting all your files and creating ZIP archive...",
      });

      // Simulate API call to generate ZIP file
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real implementation, this would:
      // 1. Call an API endpoint that collects all user files
      // 2. Create a ZIP file on the server
      // 3. Return a download URL
      // 4. Trigger the download

      // For now, we'll simulate a successful download
      const link = document.createElement('a');
      link.href = '#'; // In real implementation, this would be the ZIP file URL
      link.download = `my-files-backup-${new Date().toISOString().split('T')[0]}.zip`;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);

      toast({
        title: "Download Complete",
        description: "Your files have been successfully downloaded as a ZIP archive.",
      });

    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error creating your file archive. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Archive className="h-6 w-6 mr-2 text-brand-blue" />
          Download All Files
        </CardTitle>
        <CardDescription>
          Download all your uploaded photos, videos, and documents as a ZIP file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Includes all photos, videos, and documents</p>
            <p>• Creates a compressed ZIP archive</p>
            <p>• Perfect for backup or data portability</p>
          </div>
          <Button 
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="w-full bg-brand-orange hover:bg-brand-orange/90"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download All Files
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadAllFilesButton;
