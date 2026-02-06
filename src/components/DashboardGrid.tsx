import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardGridCard } from './DashboardGridCard';
import { ExportAssetsButton } from './ExportAssetsButton';
import { ExportService } from '@/services/ExportService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Home,
  FolderOpen,
  Key,
  Shield,
  Wrench,
  Heart,
  CheckSquare,
  ClipboardList,
  FileDown,
  Download,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface DashboardGridProps {
  onTabChange: (tab: string) => void;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ onTabChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = async () => {
    const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
    if (isOnSampleDashboard) {
      alert('AssetSafe.net says\n\nDemo: This would download all your uploaded photos, videos, and documents as a ZIP file.');
      return;
    }

    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to download your files.', variant: 'destructive' });
      return;
    }

    setIsDownloading(true);
    try {
      toast({ title: 'Preparing Download', description: 'Collecting all your files and creating ZIP archive...' });
      const assets = await ExportService.getUserAssets(user.id);
      const totalFiles = assets.photos.length + assets.videos.length + assets.documents.length + assets.floorPlans.length;
      if (totalFiles === 0) {
        toast({ title: 'No Files Found', description: "You haven't uploaded any files yet.", variant: 'destructive' });
        return;
      }
      await ExportService.downloadAssetsZip(assets);
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: 'Download Failed', description: 'There was an error creating your file archive.', variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Grid - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Life Hub */}
        <DashboardGridCard
          icon={<Heart className="h-6 w-6" />}
          title="Life Hub"
          description="Everyday life, organized and protected."
          tags={['VIP Contacts', 'Voice Notes', 'Trusted Pros', 'Notes & Traditions', 'Family Recipes']}
          actionLabel="Open Life Hub"
          actionIcon={<FolderOpen className="h-4 w-4" />}
          onClick={() => onTabChange('life-hub')}
          color="rose"
        />

        {/* Asset Documentation */}
        <DashboardGridCard
          icon={<FolderOpen className="h-6 w-6" />}
          title="Asset Documentation"
          description="Claim-ready documentation for your property and belongings."
          tags={['Photos', 'Videos', 'Documents', 'Records']}
          actionLabel="Add Documentation"
          actionIcon={<FolderOpen className="h-4 w-4" />}
          onClick={() => navigate('/account/media')}
          color="amber"
        />

        {/* Password Catalog */}
        <DashboardGridCard
          icon={<Key className="h-6 w-6" />}
          title="Password Catalog"
          description="Your most private information, fully encrypted."
          tags={['Websites', 'Passwords', 'Sensitive Data']}
          actionLabel="Open Vault"
          actionIcon={<Key className="h-4 w-4" />}
          onClick={() => onTabChange('secure-vault')}
          color="yellow"
        />

        {/* Legacy Locker */}
        <DashboardGridCard
          icon={<Shield className="h-6 w-6" />}
          title="Legacy Locker"
          description="Guidance and access when you can't be there."
          tags={['Instructions', 'Access', 'Recovery']}
          actionLabel="Manage Legacy"
          actionIcon={<Shield className="h-4 w-4" />}
          onClick={() => onTabChange('secure-vault')}
          color="purple"
        />

        {/* Property Profiles */}
        <DashboardGridCard
          icon={<Home className="h-6 w-6" />}
          title="Property Profiles"
          description="Keep track of your properties and manage important details."
          tags={['All Homes', 'Vacation Houses', 'Rentals']}
          actionLabel="View Profiles"
          actionIcon={<Home className="h-4 w-4" />}
          onClick={() => navigate('/account/properties')}
          color="green"
        />

        {/* Documentation Checklist */}
        <DashboardGridCard
          icon={<ClipboardList className="h-6 w-6" />}
          title="Documentation Checklist"
          description="Ensure you have complete records for insurance and estate needs."
          tags={['Homeowners', 'Business', 'Management', 'Industrial']}
          actionLabel="View Checklist"
          actionIcon={<ClipboardList className="h-4 w-4" />}
          onClick={() => onTabChange('documentation-checklist')}
          color="blue"
        />

        {/* Protection Score */}
        <DashboardGridCard
          icon={<CheckSquare className="h-6 w-6" />}
          title="Protection Score"
          description="See what's complete — and what's missing."
          tags={['Checklist', 'Coverage Gaps']}
          actionLabel="Improve Score"
          actionIcon={<CheckSquare className="h-4 w-4" />}
          onClick={() => onTabChange('protection-score')}
          color="green"
        />

        {/* Account & Access */}
        <DashboardGridCard
          icon={<Settings className="h-6 w-6" />}
          title="Account & Access"
          description="Manage your account and permissions."
          tags={['Plan', 'Billing', 'Users', 'Alerts']}
          actionLabel="Account Settings"
          actionIcon={<Settings className="h-4 w-4" />}
          onClick={() => navigate('/account/settings')}
          color="blue"
        />

        {/* Insights & Tools */}
        <DashboardGridCard
          icon={<Wrench className="h-6 w-6" />}
          title="Insights & Tools"
          description="Track values, manage repairs, and organize property details."
          tags={['Asset Values', 'Manual Entry', 'Upgrades & Repairs', 'Source Websites', 'Paint Codes']}
          actionLabel="Open Tools"
          actionIcon={<Wrench className="h-4 w-4" />}
          onClick={() => onTabChange('insights-tools')}
          color="teal"
        />
      </div>

      {/* Bottom Utility Row - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Assets */}
        <Card className="border-l-4 border-l-blue-500 bg-white hover:shadow-lg transition-all">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileDown className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Export Assets</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate a PDF summary of your assets.
                </p>
              </div>
            </div>
            <ExportAssetsButton
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs font-medium"
            />
          </CardContent>
        </Card>

        {/* Download All Files */}
        <Card className="border-l-4 border-l-teal-500 bg-white hover:shadow-lg transition-all">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Download All Files</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download all files in a single ZIP.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 h-8 text-xs font-medium"
              onClick={handleDownloadAll}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Download All
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Post Damage Report */}
        <DashboardGridCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Post Damage Report"
          description="Document damage and submit post-incident details."
          actionLabel="Post Report"
          actionIcon={<AlertTriangle className="h-3.5 w-3.5" />}
          onClick={() => onTabChange('damage')}
          color="orange"
          variant="compact"
        />
      </div>
    </div>
  );
};

export default DashboardGrid;
