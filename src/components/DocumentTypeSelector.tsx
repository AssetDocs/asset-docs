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
  Shield, 
  FileWarning, 
  FileCheck, 
  Receipt, 
  ClipboardCheck, 
  FileText, 
  Home,
  Files
} from 'lucide-react';

export type DocumentType = 
  | 'insurance_policy' 
  | 'insurance_claim' 
  | 'warranty' 
  | 'receipt' 
  | 'inspection_report' 
  | 'appraisal' 
  | 'title_deed' 
  | 'other';

interface DocumentTypeOption {
  type: DocumentType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const documentTypes: DocumentTypeOption[] = [
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

interface DocumentTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: DocumentType) => void;
}

const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  open,
  onOpenChange,
  onSelect
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>What type of document is this?</DialogTitle>
          <DialogDescription>
            Select the document type to help organize your records
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 py-4">
          {documentTypes.map((docType) => (
            <Button
              key={docType.type}
              variant="outline"
              className="h-auto min-h-32 py-4 px-3 flex flex-col items-center text-center hover:border-brand-blue hover:bg-brand-blue/5 transition-colors"
              onClick={() => onSelect(docType.type)}
            >
              <div className="w-10 h-10 rounded-full bg-yellow text-yellow-foreground flex items-center justify-center mb-2">
                <docType.icon className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm">{docType.label}</span>
              <span className="mt-1 text-xs leading-snug text-muted-foreground whitespace-pre-line min-h-[2.25rem]">
                {docType.description}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTypeSelector;
export { documentTypes };
