
import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Zap, Image, Smartphone } from 'lucide-react';

interface UploadSectionProps {
  selectedFiles: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessItems: () => void;
  isAnalyzing: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  selectedFiles,
  onFileSelect,
  onProcessItems,
  isAnalyzing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-6 w-6 mr-2 text-brand-blue" />
          Photo Upload
        </CardTitle>
        <CardDescription>
          Capture photos with your camera or select from your gallery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden file inputs */}
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onFileSelect}
          className="hidden"
        />
        
        <Input
          ref={cameraInputRef}
          type="file"
          multiple
          accept="image/*"
          capture="environment"
          onChange={onFileSelect}
          className="hidden"
        />

        {/* Upload Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleCameraClick}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
          >
            <Camera className="h-6 w-6 text-brand-blue" />
            <div className="text-center">
              <div className="font-medium text-sm">Take Photo</div>
              <div className="text-xs text-gray-500">Use camera</div>
            </div>
          </Button>

          <Button
            onClick={handleGalleryClick}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
          >
            <Image className="h-6 w-6 text-brand-blue" />
            <div className="text-center">
              <div className="font-medium text-sm">Choose Photos</div>
              <div className="text-xs text-gray-500">From gallery</div>
            </div>
          </Button>
        </div>

        {/* Alternative file input for desktop users */}
        <div className="border-t pt-4">
          <Label htmlFor="file-upload-alternative" className="text-sm text-gray-600">
            Or drag and drop files here
          </Label>
          <Input
            id="file-upload-alternative"
            type="file"
            multiple
            accept="image/*"
            onChange={onFileSelect}
            className="mt-2"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
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

      </CardContent>
    </Card>
  );
};

export default UploadSection;
