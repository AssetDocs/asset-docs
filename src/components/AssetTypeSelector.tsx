import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Camera,
  Video,
  ScanLine,
  Shield, 
  FileWarning, 
  FileCheck, 
  Receipt, 
  ClipboardCheck, 
  FileText, 
  Home,
  Files
} from 'lucide-react';

export type AssetUploadType = 
  | 'photo'
  | 'video'
  | 'scan_to_pdf'
  | 'insurance_policy' 
  | 'insurance_claim' 
  | 'warranty' 
  | 'receipt' 
  | 'inspection_report' 
  | 'appraisal' 
  | 'title_deed' 
  | 'other';

interface AssetTypeOption {
  type: AssetUploadType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const assetTypes: AssetTypeOption[] = [
  {
    type: 'photo',
    label: 'Photo',
    description: 'Upload photos of\nyour property & items',
    icon: Camera,
  },
  {
    type: 'video',
    label: 'Video',
    description: 'Upload videos of\nyour property & items',
    icon: Video,
  },
  {
    type: 'scan_to_pdf',
    label: 'Scan to PDF',
    description: 'Scan pages with your\ncamera into a PDF',
    icon: ScanLine,
  },
  {
    type: 'insurance_policy',
    label: 'Insurance Policy',
    description: 'Coverage documents\nand declarations',
    icon: Shield,
  },
  {
    type: 'insurance_claim',
    label: 'Insurance Claim',
    description: 'Claim documents\nand correspondence',
    icon: FileWarning,
  },
  {
    type: 'warranty',
    label: 'Warranty',
    description: 'Product warranties\nand guarantees',
    icon: FileCheck,
  },
  {
    type: 'receipt',
    label: 'Receipt',
    description: 'Purchase receipts\nand invoices',
    icon: Receipt,
  },
  {
    type: 'inspection_report',
    label: 'Inspection Report',
    description: 'Home and property\ninspections',
    icon: ClipboardCheck,
  },
  {
    type: 'appraisal',
    label: 'Appraisal',
    description: 'Property and item\nvaluations',
    icon: FileText,
  },
  {
    type: 'title_deed',
    label: 'Title / Deed',
    description: 'Property ownership\ndocuments',
    icon: Home,
  },
  {
    type: 'other',
    label: 'Other',
    description: 'Other important\ndocuments',
    icon: Files,
  },
];

interface AssetTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: AssetUploadType) => void;
}

const AssetTypeSelector: React.FC<AssetTypeSelectorProps> = ({
  open,
  onOpenChange,
  onSelect
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>What are you uploading?</DialogTitle>
          <DialogDescription>
            Select the type of file to get the right upload experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
          {assetTypes.map((assetType) => (
            <Button
              key={assetType.type}
              variant="outline"
              className="h-auto min-h-24 sm:min-h-28 py-3 px-3 flex flex-col items-center text-center hover:border-brand-blue hover:bg-brand-blue/5 transition-colors"
              onClick={() => onSelect(assetType.type)}
            >
              <div className="w-10 h-10 rounded-full bg-yellow text-yellow-foreground flex items-center justify-center mb-2">
                <assetType.icon className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm">{assetType.label}</span>
              <span className="mt-1 text-xs leading-snug text-muted-foreground whitespace-pre-line min-h-[2.25rem]">
                {assetType.description}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetTypeSelector;
export { assetTypes };
