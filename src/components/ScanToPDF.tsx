import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Plus, Trash2, FileText, Loader2, X, ScanLine } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface ScanToPDFProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPDFReady: (file: File) => void;
}

interface ScannedPage {
  id: string;
  dataUrl: string;
  file: File;
}

const ScanToPDF: React.FC<ScanToPDFProps> = ({ open, onOpenChange, onPDFReady }) => {
  const { toast } = useToast();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [pdfName, setPdfName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPages(prev => [...prev, {
          id: crypto.randomUUID(),
          dataUrl,
          file,
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so user can capture again
    e.target.value = '';
  };

  const removePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const generatePDF = async () => {
    if (pages.length === 0) return;

    setIsGenerating(true);

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const img = await loadImage(pages[i].dataUrl);
        const imgRatio = img.width / img.height;
        const contentRatio = contentWidth / contentHeight;

        let drawWidth: number;
        let drawHeight: number;

        if (imgRatio > contentRatio) {
          // Image is wider than content area
          drawWidth = contentWidth;
          drawHeight = contentWidth / imgRatio;
        } else {
          // Image is taller
          drawHeight = contentHeight;
          drawWidth = contentHeight * imgRatio;
        }

        const x = margin + (contentWidth - drawWidth) / 2;
        const y = margin + (contentHeight - drawHeight) / 2;

        pdf.addImage(pages[i].dataUrl, 'JPEG', x, y, drawWidth, drawHeight);
      }

      const fileName = (pdfName.trim() || 'scanned-document') + '.pdf';
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      onPDFReady(pdfFile);
      handleClose();

      toast({
        title: 'PDF created',
        description: `${pages.length} page(s) converted to PDF successfully.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF generation failed',
        description: 'Could not create PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleClose = () => {
    setPages([]);
    setPdfName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Scan to PDF
          </DialogTitle>
          <DialogDescription>
            Capture multiple pages using your camera or gallery, then combine them into a single PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* PDF Name */}
          <div>
            <Label htmlFor="pdf-name" className="text-sm font-medium">
              Document Name
            </Label>
            <Input
              id="pdf-name"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
              placeholder="e.g. Insurance Declaration"
              className="mt-1"
            />
          </div>

          {/* Capture Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleCapture}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => cameraRef.current?.click()}
              className="h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
              disabled={isGenerating}
            >
              <Camera className="h-5 w-5 text-brand-blue" />
              <span className="text-xs font-medium">Camera</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
              disabled={isGenerating}
            >
              <Plus className="h-5 w-5 text-brand-blue" />
              <span className="text-xs font-medium">Gallery</span>
            </Button>
          </div>

          {/* Scanned Pages Preview */}
          {pages.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Scanned Pages ({pages.length})
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {pages.map((page, index) => (
                  <div key={page.id} className="relative group">
                    <div className="aspect-[3/4] rounded-lg border overflow-hidden bg-muted">
                      <img
                        src={page.dataUrl}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-1 left-1 bg-background/80 text-xs font-medium px-1.5 py-0.5 rounded">
                      {index + 1}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removePage(page.id)}
                      disabled={isGenerating}
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
              <ScanLine className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pages scanned yet</p>
              <p className="text-xs mt-1">Use the buttons above to capture pages</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={generatePDF}
            disabled={pages.length === 0 || isGenerating}
            className="bg-brand-blue hover:bg-brand-lightBlue"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Create PDF ({pages.length} page{pages.length !== 1 ? 's' : ''})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScanToPDF;
