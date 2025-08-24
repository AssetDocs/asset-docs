
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, MapPin, FileText, Loader2 } from 'lucide-react';
import PropertySelector from '@/components/PropertySelector';
import ItemTypeSelector from '@/components/ItemTypeSelector';
import PropertyUpgradeSelector from '@/components/PropertyUpgradeSelector';

interface UploadedItem {
  id: string;
  file?: File;
  preview?: string;
  name: string;
  description: string;
  estimatedValue: number;
  category: string;
  itemType: string;
  propertyUpgrade?: string;
  propertyId: string;
  location: string;
  isManualEntry?: boolean;
}

interface ItemDetailsSectionProps {
  uploadedItems: UploadedItem[];
  onUpdateItemValue: (id: string, field: string, value: string | number | boolean) => void;
  onRemoveItem: (id: string) => void;
  onSaveItems: () => void;
  isSaving?: boolean;
}

const ItemDetailsSection: React.FC<ItemDetailsSectionProps> = ({
  uploadedItems,
  onUpdateItemValue,
  onRemoveItem,
  onSaveItems,
  isSaving = false
}) => {
  const handleItemTypeChange = (itemId: string, itemType: string, category: string) => {
    onUpdateItemValue(itemId, 'itemType', itemType);
    onUpdateItemValue(itemId, 'category', category);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-6 w-6 mr-2 text-brand-blue" />
          Item Details
        </CardTitle>
        <CardDescription>
          Review and adjust item information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadedItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Upload photos or add manual entries to start
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {uploadedItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 bg-white">
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    {item.preview ? (
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.name}
                        onChange={(e) => onUpdateItemValue(item.id, 'name', e.target.value)}
                        placeholder="Item name"
                        className="text-sm"
                      />
                      
                      <div className="space-y-2">
                        <PropertySelector
                          value={item.propertyId}
                          onChange={(value) => onUpdateItemValue(item.id, 'propertyId', value)}
                          placeholder="Select property"
                        />
                        
                        <div className="space-y-2">
                          <ItemTypeSelector
                            value={item.itemType}
                            onChange={(itemType) => onUpdateItemValue(item.id, 'itemType', itemType)}
                            onCategoryChange={(category) => onUpdateItemValue(item.id, 'category', category)}
                            placeholder="Select item type"
                          />
                          
                        </div>
                        
                        {item.itemType === 'Property Upgrades' && (
                          <PropertyUpgradeSelector
                            value={item.propertyUpgrade || ''}
                            onChange={(value) => onUpdateItemValue(item.id, 'propertyUpgrade', value)}
                            placeholder="Select upgrade type"
                          />
                        )}
                      </div>
                      
                       <div className="flex space-x-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={item.estimatedValue || ''}
                            onChange={(e) => onUpdateItemValue(item.id, 'estimatedValue', Number(e.target.value))}
                            placeholder="Valuation (not purchase price)"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2 flex-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <Input
                            value={item.location}
                            onChange={(e) => onUpdateItemValue(item.id, 'location', e.target.value)}
                            placeholder="Room/Location"
                            className="text-sm"
                          />
                        </div>
                      </div>
                      
                      <Textarea
                        value={item.description}
                        onChange={(e) => onUpdateItemValue(item.id, 'description', e.target.value)}
                        placeholder="Detailed description"
                        rows={3}
                        className="text-sm"
                      />
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Attachments</label>
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="text-sm"
                          placeholder="Attach receipts, warranties, etc."
                        />
                        <p className="text-xs text-gray-500">
                          Attach receipts, warranties, or other documents
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          {item.isManualEntry && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              Manual Entry
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => onRemoveItem(item.id)}
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {uploadedItems.length > 0 && (
          <Button 
            onClick={onSaveItems}
            disabled={isSaving}
            className="w-full mt-4 bg-brand-blue hover:bg-brand-lightBlue"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving to Storage...
              </>
            ) : (
              'Save All Items'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemDetailsSection;
