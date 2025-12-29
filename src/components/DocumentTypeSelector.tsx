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
  color: string;
}

const documentTypes: DocumentTypeOption[] = [
  {
    type: 'insurance_policy',
    label: 'Insurance Policy',
    description: 'Coverage documents and declarations',
    icon: Shield,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    type: 'insurance_claim',
    label: 'Insurance Claim',
    description: 'Claim documents and correspondence',
    icon: FileWarning,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    type: 'warranty',
    label: 'Warranty',
    description: 'Product warranties and guarantees',
    icon: FileCheck,
    color: 'bg-green-100 text-green-600'
  },
  {
    type: 'receipt',
    label: 'Receipt',
    description: 'Purchase receipts and invoices',
    icon: Receipt,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    type: 'inspection_report',
    label: 'Inspection Report',
    description: 'Home and property inspections',
    icon: ClipboardCheck,
    color: 'bg-teal-100 text-teal-600'
  },
  {
    type: 'appraisal',
    label: 'Appraisal',
    description: 'Property and item valuations',
    icon: FileText,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    type: 'title_deed',
    label: 'Title / Deed',
    description: 'Property ownership documents',
    icon: Home,
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    type: 'other',
    label: 'Other',
    description: 'Other important documents',
    icon: Files,
    color: 'bg-gray-100 text-gray-600'
  }
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
              className="h-auto py-4 px-3 flex flex-col items-center text-center hover:border-brand-blue hover:bg-brand-blue/5 transition-colors"
              onClick={() => onSelect(docType.type)}
            >
              <div className={`w-10 h-10 rounded-full ${docType.color} flex items-center justify-center mb-2`}>
                <docType.icon className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm">{docType.label}</span>
              <span className="text-xs text-muted-foreground mt-1">{docType.description}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTypeSelector;
export { documentTypes };
