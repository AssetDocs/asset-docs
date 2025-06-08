
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Key, AlertCircle } from 'lucide-react';
import PropertySelector from '@/components/PropertySelector';
import ItemTypeSelector from '@/components/ItemTypeSelector';

interface AIConfigurationCardProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  defaultUseAI: boolean;
  setDefaultUseAI: (value: boolean) => void;
  defaultPropertyId: string;
  setDefaultPropertyId: (value: string) => void;
  defaultItemType: string;
  setDefaultItemType: (value: string) => void;
  defaultCategory: string;
  setDefaultCategory: (value: string) => void;
  onApiKeyUpdate: () => void;
}

const AIConfigurationCard: React.FC<AIConfigurationCardProps> = ({
  apiKey,
  setApiKey,
  defaultUseAI,
  setDefaultUseAI,
  defaultPropertyId,
  setDefaultPropertyId,
  defaultItemType,
  setDefaultItemType,
  defaultCategory,
  setDefaultCategory,
  onApiKeyUpdate
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-5 w-5 mr-2 text-orange-500" />
          AI Configuration & Defaults
        </CardTitle>
        <CardDescription>
          Configure AI settings and default values for your uploads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter OpenAI API key for AI analysis"
            className="flex-1"
          />
          <Button onClick={onApiKeyUpdate}>
            Save Key
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="use-ai"
            checked={defaultUseAI}
            onCheckedChange={setDefaultUseAI}
          />
          <Label htmlFor="use-ai">Use AI for automatic item analysis</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Default Property</Label>
            <PropertySelector
              value={defaultPropertyId}
              onChange={setDefaultPropertyId}
              placeholder="Select default property"
            />
          </div>
          <div className="space-y-2">
            <Label>Default Item Type</Label>
            <ItemTypeSelector
              value={defaultItemType}
              onChange={setDefaultItemType}
              onCategoryChange={setDefaultCategory}
              placeholder="Select default item type"
            />
          </div>
        </div>

        {defaultCategory && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Auto-selected category:</span> {defaultCategory}
          </div>
        )}

        <div className="flex items-start space-x-2 text-xs text-gray-500">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Without an API key, the system will skip AI analysis. The category is automatically set based on your item type selection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIConfigurationCard;
