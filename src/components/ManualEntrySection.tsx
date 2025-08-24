import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, MapPin, FileText, Plus, Loader2 } from 'lucide-react';
import PropertySelector from '@/components/PropertySelector';
import ItemTypeSelector from '@/components/ItemTypeSelector';
import PropertyUpgradeSelector from '@/components/PropertyUpgradeSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ItemService } from '@/services/ItemService';

interface ManualItem {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  category: string;
  itemType: string;
  propertyUpgrade?: string;
  propertyId: string;
  location: string;
}

const ManualEntrySection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [manualItems, setManualItems] = useState<ManualItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addManualEntry = () => {
    const newItem: ManualItem = {
      id: Date.now().toString() + Math.random().toString(),
      name: '',
      description: '',
      estimatedValue: 0,
      category: '',
      itemType: 'Other',
      propertyId: '',
      location: ''
    };
    setManualItems([...manualItems, newItem]);
  };

  const updateItemValue = (id: string, field: string, value: string | number) => {
    setManualItems(items =>
      items.map(item =>
        item.id === id 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setManualItems(items => items.filter(item => item.id !== id));
  };

  const saveItems = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your items.",
        variant: "destructive",
      });
      return;
    }

    if (manualItems.length === 0) {
      toast({
        title: "No items to save",
        description: "Please add at least one manual entry.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      for (const item of manualItems) {
        await ItemService.createItem({
          user_id: user.id,
          name: item.name || 'Untitled Item',
          description: item.description,
          estimated_value: item.estimatedValue,
          category: item.category,
          item_type: item.itemType,
          property_upgrade: item.propertyUpgrade,
          property_id: item.propertyId,
          location: item.location,
          is_manual_entry: true
        });
      }

      toast({
        title: "Items saved successfully!",
        description: `${manualItems.length} manual entr${manualItems.length === 1 ? 'y' : 'ies'} saved to your inventory.`,
      });

      setManualItems([]);
    } catch (error) {
      console.error('Error saving manual entries:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your manual entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-brand-blue" />
            Manual Entry
          </CardTitle>
          <CardDescription>
            Add items to your inventory without photos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={addManualEntry}
              className="w-full bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Entry
            </Button>
            {manualItems.length > 0 && (
              <Button 
                onClick={saveItems}
                disabled={isSaving}
                variant="outline"
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save All Entries'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {manualItems.length > 0 && (
        <div className="md:col-span-2 lg:col-span-3">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {manualItems.map((item) => (
              <Card key={item.id} className="border bg-white">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItemValue(item.id, 'name', e.target.value)}
                        placeholder="Item name"
                        className="text-sm"
                      />
                      
                      <div className="space-y-2">
                        <PropertySelector
                          value={item.propertyId}
                          onChange={(value) => updateItemValue(item.id, 'propertyId', value)}
                          placeholder="Select property"
                        />
                        
                        <ItemTypeSelector
                          value={item.itemType}
                          onChange={(itemType) => updateItemValue(item.id, 'itemType', itemType)}
                          onCategoryChange={(category) => updateItemValue(item.id, 'category', category)}
                          placeholder="Select item type"
                        />
                        
                        {item.itemType === 'Property Upgrades' && (
                          <PropertyUpgradeSelector
                            value={item.propertyUpgrade || ''}
                            onChange={(value) => updateItemValue(item.id, 'propertyUpgrade', value)}
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
                            onChange={(e) => updateItemValue(item.id, 'estimatedValue', Number(e.target.value))}
                            placeholder="Valuation (not purchase price)"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2 flex-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <Input
                            value={item.location}
                            onChange={(e) => updateItemValue(item.id, 'location', e.target.value)}
                            placeholder="Room/Location"
                            className="text-sm"
                          />
                        </div>
                      </div>
                      
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItemValue(item.id, 'description', e.target.value)}
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
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Manual Entry
                        </span>
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualEntrySection;