import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from './DashboardGridCard';
import { Camera, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssetTypeSelector, { type AssetUploadType } from './AssetTypeSelector';

const AssetDocumentationGrid: React.FC = () => {
  const navigate = useNavigate();
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleTypeSelect = (type: AssetUploadType) => {
    setSelectorOpen(false);
    switch (type) {
      case 'photo':
        navigate('/account/media/upload?tab=photos');
        break;
      case 'video':
        navigate('/account/media/upload?tab=videos');
        break;
      case 'insurance_policy':
        navigate('/account/insurance/new');
        break;
      default:
        navigate(`/account/documents/upload?type=${type}`);
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Asset Documentation</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Claim-ready proof for your home and belongings.
          </p>
        </div>
        <Button onClick={() => setSelectorOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <DashboardGridCard
          icon={<Camera className="h-6 w-6" />}
          title="Photos & Videos"
          description="Capture and organize photos and videos of your property and belongings."
          tags={['Photos', 'Videos', 'Rooms']}
          actionLabel="Open Photos & Videos"
          actionIcon={<Camera className="h-4 w-4" />}
          onClick={() => navigate('/account/media')}
          color="red"
        />

        <DashboardGridCard
          icon={<FileText className="h-6 w-6" />}
          title="Documents & Records"
          description="Store policies, receipts, warranties, titles, licenses, and other critical records."
          tags={['Policies', 'Receipts', 'Warranties', 'Records']}
          actionLabel="Open Documents & Records"
          actionIcon={<FileText className="h-4 w-4" />}
          onClick={() => navigate('/account/documents')}
          color="red"
        />
      </div>

      <AssetTypeSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={handleTypeSelect}
      />
    </div>
  );
};

export default AssetDocumentationGrid;
