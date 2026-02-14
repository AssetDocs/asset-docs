import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from './DashboardGridCard';
import { Camera, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AssetTypeSelector, { type AssetUploadType } from './AssetTypeSelector';
import ScanToPDF from './ScanToPDF';
import { useAuth } from '@/contexts/AuthContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AssetDocumentationGrid: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { uploadSingleFile } = useFileUpload({
    bucket: 'documents',
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  });

  const handleTypeSelect = (type: AssetUploadType) => {
    setSelectorOpen(false);
    if (type === 'scan_to_pdf') {
      setScannerOpen(true);
      return;
    }
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

  const handlePDFReady = async (pdfFile: File) => {
    if (!user) return;

    try {
      const uploadResult = await uploadSingleFile(pdfFile);
      if (!uploadResult) throw new Error('Upload failed');

      await supabase.from('user_documents').insert({
        user_id: user.id,
        file_name: pdfFile.name,
        file_path: uploadResult.path,
        file_url: uploadResult.url,
        file_size: pdfFile.size,
        file_type: 'application/pdf',
        document_type: 'other',
        category: 'general',
        document_name: pdfFile.name.replace(/\.pdf$/, ''),
      });

      toast({ title: "Scanned PDF saved", description: "Your document has been saved to Documents & Records." });
      navigate('/account/documents');
    } catch (error) {
      console.error('Scan PDF save error:', error);
      toast({ title: "Save failed", description: "Could not save the scanned PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl sm:text-3xl font-bold">Asset Documentation</CardTitle>
          <p className="text-muted-foreground mt-1">
            Claim-ready proof for your home and belongings.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={() => setSelectorOpen(true)} className="w-full bg-brand-blue hover:bg-brand-lightBlue">
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </CardContent>
      </Card>

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

      <ScanToPDF
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onPDFReady={handlePDFReady}
      />
    </div>
  );
};

export default AssetDocumentationGrid;
