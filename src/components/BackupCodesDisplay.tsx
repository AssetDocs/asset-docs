import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackupCodesDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  codes: string[];
}

const BackupCodesDisplay: React.FC<BackupCodesDisplayProps> = ({
  isOpen,
  onClose,
  codes,
}) => {
  const { toast } = useToast();
  const [acknowledged, setAcknowledged] = useState(false);

  const copyAllCodes = () => {
    const codesText = codes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Codes Copied",
      description: "All backup codes have been copied to your clipboard.",
    });
  };

  const downloadCodes = () => {
    const codesText = `Asset Safe Backup Recovery Codes
Generated: ${new Date().toLocaleString()}

These codes can be used to access your account if you lose access to your authenticator app.
Each code can only be used once. Keep them in a safe place.

${codes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

IMPORTANT: Store these codes securely. They will not be shown again.`;

    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assetsafe-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Codes Downloaded",
      description: "Backup codes saved to assetsafe-backup-codes.txt",
    });
  };

  const printCodes = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Asset Safe Backup Codes</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; }
              h1 { font-size: 24px; margin-bottom: 8px; }
              .date { color: #666; margin-bottom: 24px; }
              .warning { background: #fef3cd; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
              .codes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
              .code { font-family: monospace; font-size: 18px; padding: 12px; background: #f5f5f5; border-radius: 4px; }
            </style>
          </head>
          <body>
            <h1>Asset Safe Backup Recovery Codes</h1>
            <p class="date">Generated: ${new Date().toLocaleString()}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> Keep these codes secure. Each code can only be used once.
            </div>
            <div class="codes">
              ${codes.map((code, i) => `<div class="code">${i + 1}. ${code}</div>`).join('')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleClose = () => {
    if (!acknowledged) {
      toast({
        title: "Please Acknowledge",
        description: "You must confirm you've saved your backup codes before closing.",
        variant: "destructive",
      });
      return;
    }
    setAcknowledged(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Backup Recovery Codes Generated
          </DialogTitle>
          <DialogDescription>
            Save these codes in a secure location. They can be used to access your account if you lose your authenticator.
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <strong>Important:</strong> These codes will only be shown once. Make sure to save them now!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
          {codes.map((code, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-2 bg-background rounded"
            >
              <span className="text-muted-foreground w-5">{index + 1}.</span>
              <span className="font-medium">{code}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyAllCodes}>
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCodes}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={printCodes}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-muted-foreground">
              I have saved my backup codes in a secure location. I understand these codes will not be shown again.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} disabled={!acknowledged} className="w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BackupCodesDisplay;
