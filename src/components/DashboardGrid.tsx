import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardGridCard } from './DashboardGridCard';
import { ExportAssetsButton } from './ExportAssetsButton';
import { ExportService } from '@/services/ExportService';
import DocumentationChecklist from '@/components/DocumentationChecklist';
import MFADropdown from '@/components/MFADropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import AssetValuesSection from '@/components/AssetValuesSection';
import {
  Settings,
  Home,
  FolderOpen,
  Key,
  Shield,
  Users,
  Wrench,
  Heart,
  FileDown,
  Download,
  AlertTriangle,
  Loader2,
  DollarSign,
  ChevronDown,
  Bell,
} from 'lucide-react';

interface DashboardGridProps {
  onTabChange: (tab: string) => void;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ onTabChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAssetValuesOpen, setIsAssetValuesOpen] = useState(() => {
    return localStorage.getItem('assetValuesDropdownOpen') === 'true';
  });
  const { unreadCount } = useUnreadNotifications();

  const handleToggleAssetValues = () => {
    const newState = !isAssetValuesOpen;
    setIsAssetValuesOpen(newState);
    localStorage.setItem('assetValuesDropdownOpen', String(newState));
  };

  const handleDownloadAll = async () => {
    const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
    if (isOnSampleDashboard) {
      alert('Asset Safe says\n\nDemo: This would download all your uploaded photos, videos, and documents as a ZIP file.');
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
        {/* Row 1: Red */}
        <DashboardGridCard
          icon={<FolderOpen className="h-6 w-6" />}
          title="Asset Documentation"
          description="Claim-ready proof for your home and belongings."
          tags={['Photos', 'Videos', 'Documents', 'Records']}
          actionLabel="Open Documentation"
          actionIcon={<FolderOpen className="h-4 w-4" />}
          onClick={() => onTabChange('asset-documentation')}
          color="red"
        />

        <DashboardGridCard
          icon={<Heart className="h-6 w-6" />}
          title="Family Archive"
          description="Everyday life, organized and protected."
          tags={['VIP Contacts', 'Voice Notes', 'Trusted Pros', 'Notes & Traditions', 'Family Recipes']}
          actionLabel="Open Family Archive"
          actionIcon={<FolderOpen className="h-4 w-4" />}
          onClick={() => onTabChange('life-hub')}
          color="red"
        />

        {/* Documentation Checklist - collapsed by default */}
        <div className="md:col-span-2">
          <DocumentationChecklist />
        </div>

        {/* Row 2: Yellow */}
        <DashboardGridCard
          icon={<Shield className="h-6 w-6" />}
          title="Legacy Locker"
          description="Guidance and access when you can't be there."
          tags={['Instructions', 'Access', 'Recovery']}
          actionLabel="Manage Legacy"
          actionIcon={<Shield className="h-4 w-4" />}
          onClick={() => onTabChange('legacy-locker')}
          color="yellow"
          badge="Authorized Users Only"
          badgeIcon={<span className="text-[10px]">🔒</span>}
        />

        <DashboardGridCard
          icon={<Key className="h-6 w-6" />}
          title="Password Catalog"
          description="Your most private information, fully encrypted."
          tags={['Websites', 'Passwords', 'Sensitive Data']}
          actionLabel="Open Catalog"
          actionIcon={<Key className="h-4 w-4" />}
          onClick={() => onTabChange('password-catalog')}
          color="yellow"
          badge="Authorized Users Only"
          badgeIcon={<span className="text-[10px]">🔒</span>}
        />

        {/* MFA Dropdown - security control near restricted sections */}
        <div className="md:col-span-2">
          <MFADropdown />
        </div>

        {/* Row 3: Green */}
        <DashboardGridCard
          icon={<Wrench className="h-6 w-6" />}
          title="Insights & Tools"
          description="Track values, manage repairs, and organize property details."
          tags={['Asset Values', 'Manual Entry', 'Upgrades & Repairs', 'Source Websites', 'Paint Codes']}
          actionLabel="Open Tools"
          actionIcon={<Wrench className="h-4 w-4" />}
          onClick={() => onTabChange('insights-tools')}
          color="green"
        />

        {/* Row 4: Blue */}
        <DashboardGridCard
          icon={<Home className="h-6 w-6" />}
          title="Property Profiles"
          description="Keep track of your properties and manage important details."
          tags={['All Homes', 'Vacation Houses', 'Rentals']}
          actionLabel="View Profiles"
          actionIcon={<Home className="h-4 w-4" />}
          onClick={() => navigate('/account/properties')}
          color="blue"
        />

        {/* Asset Values Collapsible Bar */}
        <div className="md:col-span-2">
          <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={handleToggleAssetValues}
              className="w-full px-6 py-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Asset Values</span>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isAssetValuesOpen ? '' : '-rotate-90'}`} />
            </button>
            {isAssetValuesOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-border">
                <AssetValuesSection />
              </div>
            )}
          </div>
        </div>

        <DashboardGridCard
          icon={
            <div className="relative">
              <Settings className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          }
          title="Account Settings"
          description="Manage your account details, security, and preferences."
          tags={['Plan', 'Billing', 'Alerts']}
          actionLabel="Account Settings"
          actionIcon={<Settings className="h-4 w-4" />}
          onClick={() => navigate('/account/settings')}
          color="blue"
        />

        <DashboardGridCard
          icon={<Users className="h-6 w-6" />}
          title="Access & Activity"
          description="Authorized users and recent actions."
          tags={['Invite Users', 'Roles', 'Activity Log']}
          actionLabel="Manage Access & Activity"
          actionIcon={<Users className="h-4 w-4" />}
          onClick={() => onTabChange('access-activity')}
          color="blue"
        />
      </div>

      {/* Bottom Utility Row - 3 columns (orange) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Assets */}
        <Card className="border-l-4 border-l-orange-500 bg-white hover:shadow-lg transition-all">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileDown className="h-5 w-5 text-orange-600" />
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
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 h-8 text-xs font-medium"
            />
          </CardContent>
        </Card>

        {/* Download All Files */}
        <Card className="border-l-4 border-l-orange-500 bg-white hover:shadow-lg transition-all">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="h-5 w-5 text-orange-600" />
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
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 h-8 text-xs font-medium"
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
