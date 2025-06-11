
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  url: string;
  title: string;
  description?: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  url, 
  title, 
  description,
  size = 200 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode();
  }, [url, size]);

  const generateQRCode = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR code placeholder - in production, you'd use a proper QR library
    const qrSize = size;
    canvas.width = qrSize;
    canvas.height = qrSize;

    // Create a simple pattern for demonstration
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, qrSize, qrSize);
    
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < qrSize; i += 20) {
      for (let j = 0; j < qrSize; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 15, 15);
        }
      }
    }

    // Add corner markers
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 10, 30, 30);
    ctx.fillRect(qrSize - 40, 10, 30, 30);
    ctx.fillRect(10, qrSize - 40, 30, 30);
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();

    toast({
      title: "QR Code Downloaded",
      description: "QR code has been saved to your downloads.",
    });
  };

  const shareQRCode = async () => {
    try {
      if (navigator.share && canvasRef.current) {
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob!));
        });
        
        const file = new File([blob], `${title}_QR.png`, { type: 'image/png' });
        
        await navigator.share({
          title: title,
          text: description || `QR code for ${title}`,
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Property link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast({
        title: "Share failed",
        description: "Unable to share QR code. Link copied to clipboard instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="h-5 w-5 mr-2 text-brand-blue" />
          Quick Access QR Code
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef}
            className="border border-gray-200 rounded"
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Scan to instantly access: {title}
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={downloadQRCode}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              onClick={shareQRCode}
              variant="outline"
              size="sm"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
