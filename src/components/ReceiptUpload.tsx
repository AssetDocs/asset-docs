import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, CalendarIcon, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ItemService } from '@/services/ItemService';
import { useToast } from '@/hooks/use-toast';

interface ReceiptUploadProps {
  itemId: string;
  userId: string;
  onReceiptUploaded: () => void;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  itemId,
  userId,
  onReceiptUploaded
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState<Date>();
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a receipt file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await ItemService.uploadReceiptForItem(itemId, userId, selectedFile, {
        purchase_date: purchaseDate?.toISOString().split('T')[0],
        purchase_amount: purchaseAmount ? Number(purchaseAmount) : undefined,
        merchant_name: merchantName,
        notes: notes
      });

      toast({
        title: "Receipt uploaded",
        description: "Receipt has been successfully attached to the item.",
      });

      // Reset form
      setSelectedFile(null);
      setPurchaseDate(undefined);
      setPurchaseAmount('');
      setMerchantName('');
      setNotes('');
      
      onReceiptUploaded();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Upload Receipt
        </CardTitle>
        <CardDescription>
          Attach a purchase receipt to this item for documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            dragActive ? "border-primary bg-primary/10" : "border-muted",
            selectedFile ? "border-green-500 bg-green-50" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('receipt-upload')?.click()}
        >
          <input
            id="receipt-upload"
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          {selectedFile ? (
            <div>
              <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, PNG, JPG, or Word documents
              </p>
            </div>
          )}
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase-date">Purchase Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="purchase-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !purchaseDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {purchaseDate ? format(purchaseDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={purchaseDate}
                  onSelect={setPurchaseDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase-amount">Purchase Amount ($)</Label>
            <Input
              id="purchase-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="merchant-name">Merchant/Store Name</Label>
          <Input
            id="merchant-name"
            placeholder="e.g., Best Buy, Amazon, etc."
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about the purchase..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading Receipt...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Receipt
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReceiptUpload;