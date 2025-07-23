import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileDown, Loader2 } from 'lucide-react';
import { ExportService } from '@/services/ExportService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ExportAssetsButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const ExportAssetsButton: React.FC<ExportAssetsButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export your assets.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      await ExportService.exportCompleteAssetSummary(user.id);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your assets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      {isExporting ? 'Exporting...' : 'Export Assets'}
    </Button>
  );
};