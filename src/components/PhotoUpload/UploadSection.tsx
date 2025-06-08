
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Zap, Plus } from 'lucide-react';

interface UploadSectionProps {
  selectedFiles: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessItems: () => void;
  onAddManualEntry: () => void;
  isAnalyzing: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  selectedFiles,
  onFileSelect,
  onProcessItems,
  onAddManualEntry,
  isAnalyzing
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-6 w-6 mr-2 text-brand-blue" />
          Photo Upload
        </CardTitle>
        <CardDescription>
          Select photos of items you want to document and value
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="photos">Select Photos</Label>
          <Input
            id="photos"
            type="file"
            multiple
            accept="image/*"
            onChange={onFileSelect}
            className="mt-2"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {selectedFiles.length} file(s) selected
            </p>
            <div className="grid grid-cols-2 gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <p className="text-xs truncate mt-1">{file.name}</p>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={onProcessItems}
              disabled={isAnalyzing}
              className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Process Items
                </>
              )}
            </Button>
          </div>
        )}

        <div className="border-t pt-4">
          <Button 
            onClick={onAddManualEntry}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Manual Entry
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Add items without photos or videos
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;
