import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Download, Trash2, DollarSign, Calendar, Store } from 'lucide-react';
import { ItemService, Receipt } from '@/services/ItemService';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ItemReceiptsSectionProps {
  itemId: string;
  refreshTrigger?: number;
}

const ItemReceiptsSection: React.FC<ItemReceiptsSectionProps> = ({
  itemId,
  refreshTrigger = 0
}) => {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReceipts = async () => {
    try {
      const receiptData = await ItemService.getItemReceipts(itemId);
      setReceipts(receiptData);
    } catch (error) {
      console.error('Error loading receipts:', error);
      toast({
        title: "Error",
        description: "Failed to load receipts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [itemId, refreshTrigger]);

  const handleViewReceipt = (receipt: Receipt) => {
    window.open(receipt.receipt_url, '_blank');
  };

  const handleDownloadReceipt = (receipt: Receipt) => {
    const link = document.createElement('a');
    link.href = receipt.receipt_url;
    link.download = receipt.receipt_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      const success = await ItemService.deleteReceipt(receiptId);
      if (success) {
        setReceipts(receipts.filter(r => r.id !== receiptId));
        toast({
          title: "Receipt deleted",
          description: "Receipt has been removed successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading receipts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Attached Receipts ({receipts.length})
        </CardTitle>
        <CardDescription>
          Purchase receipts and documentation for this item
        </CardDescription>
      </CardHeader>
      <CardContent>
        {receipts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No receipts attached to this item yet.</p>
            <p className="text-sm">Upload a receipt to keep track of purchase details.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">{receipt.receipt_name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(receipt.created_at), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
                      {receipt.purchase_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Purchased: {format(new Date(receipt.purchase_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {receipt.purchase_amount && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>Amount: ${receipt.purchase_amount}</span>
                        </div>
                      )}
                      {receipt.merchant_name && (
                        <div className="flex items-center space-x-1">
                          <Store className="h-3 w-3" />
                          <span>Store: {receipt.merchant_name}</span>
                        </div>
                      )}
                    </div>

                    {receipt.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        "{receipt.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReceipt(receipt)}
                      className="h-8"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(receipt)}
                      className="h-8"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReceipt(receipt.id)}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemReceiptsSection;