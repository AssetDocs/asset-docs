import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Archive, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ExportService } from '@/services/ExportService';

const DownloadAllFilesButton: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDownloadAll = async () => {
    const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
    if (isOnSampleDashboard) {
      alert('AssetSafe.net says\n\nDemo: This would download all your uploaded photos, videos, and documents as a ZIP file for backup or data portability.');
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download your files.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      toast({
        title: "Preparing Download",
        description: "Collecting all your files and creating ZIP archive...",
      });

      // Get real user assets from database
      const assets = await ExportService.getUserAssets(user.id);
      
      const totalFiles = assets.photos.length + assets.videos.length + assets.documents.length + assets.floorPlans.length;
      
      if (totalFiles === 0) {
        toast({
          title: "No Files Found",
          description: "You haven't uploaded any files yet.",
          variant: "destructive",
        });
        return;
      }

      // Download all files as ZIP
      await ExportService.downloadAssetsZip(assets);

    } catch (error) {
      console.error('Download error:', error);
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
          <div className="text-sm text-muted-foreground space-y-1">
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
