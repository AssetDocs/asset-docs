import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { Paintbrush, Plus, Trash2, Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';

interface PaintCode {
  id: string;
  paint_brand: string;
  paint_name: string;
  paint_code: string;
  is_interior: boolean;
  room_location: string;
  property_id: string | null;
  swatch_image_url: string | null;
  swatch_image_path: string | null;
}

const PaintCodesSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { properties } = useProperties();
  const [paintCodes, setPaintCodes] = useState<PaintCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [swatchPreview, setSwatchPreview] = useState<string | null>(null);
  const [swatchFile, setSwatchFile] = useState<File | null>(null);
  
  const [newEntry, setNewEntry] = useState({
    paint_brand: '',
    paint_name: '',
    paint_code: '',
    is_interior: true,
    room_location: '',
    property_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchPaintCodes();
    }
  }, [user]);

  const fetchPaintCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('paint_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaintCodes(data || []);
    } catch (error) {
      console.error('Error fetching paint codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load paint codes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwatchSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSwatchFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSwatchPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSwatch = () => {
    setSwatchFile(null);
    setSwatchPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadSwatch = async (file: File): Promise<{ path: string; url: string } | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      return { path: fileName, url: publicUrl };
    } catch (error) {
      console.error('Error uploading swatch:', error);
      return null;
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.paint_brand || !newEntry.paint_name || !newEntry.paint_code) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in brand, name, and code fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      let swatchData: { path: string; url: string } | null = null;
      
      if (swatchFile) {
        setIsUploading(true);
        swatchData = await uploadSwatch(swatchFile);
        setIsUploading(false);
      }

      const { data, error } = await supabase
        .from('paint_codes')
        .insert({
          user_id: user?.id,
          paint_brand: newEntry.paint_brand,
          paint_name: newEntry.paint_name,
          paint_code: newEntry.paint_code,
          is_interior: newEntry.is_interior,
          room_location: newEntry.room_location,
          property_id: newEntry.property_id || null,
          swatch_image_path: swatchData?.path || null,
          swatch_image_url: swatchData?.url || null
        })
        .select()
        .single();

      if (error) throw error;

      setPaintCodes(prev => [data, ...prev]);
      setNewEntry({
        paint_brand: '',
        paint_name: '',
        paint_code: '',
        is_interior: true,
        room_location: '',
        property_id: ''
      });
      clearSwatch();

      toast({
        title: 'Success',
        description: 'Paint code saved successfully',
      });
    } catch (error) {
      console.error('Error saving paint code:', error);
      toast({
        title: 'Error',
        description: 'Failed to save paint code',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDeleteEntry = async (id: string, swatchPath: string | null) => {
    try {
      // Delete swatch image if exists
      if (swatchPath) {
        await supabase.storage.from('photos').remove([swatchPath]);
      }

      const { error } = await supabase
        .from('paint_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaintCodes(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Deleted',
        description: 'Paint code removed successfully',
      });
    } catch (error) {
      console.error('Error deleting paint code:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete paint code',
        variant: 'destructive',
      });
    }
  };

  const getPropertyName = (propertyId: string | null) => {
    if (!propertyId) return '-';
    const property = properties.find(p => p.id === propertyId);
    return property?.name || '-';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Paintbrush className="h-6 w-6 mr-2 text-brand-blue" />
            Paint Codes
          </CardTitle>
          <CardDescription>
            Store paint brand, name, and code information for each room in your property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Entry Form */}
          <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
            <h3 className="font-semibold text-gray-900">Add New Paint Code</h3>
            
            {/* Property Selection */}
            <div className="space-y-2">
              <Label htmlFor="property_select">Property</Label>
              <Select
                value={newEntry.property_id}
                onValueChange={(value) => setNewEntry(prev => ({ ...prev, property_id: value }))}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select a property (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="">No property selected</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paint_brand">Paint Brand *</Label>
                <Input
                  id="paint_brand"
                  placeholder="e.g., Benjamin Moore"
                  value={newEntry.paint_brand}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, paint_brand: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paint_name">Paint Name *</Label>
                <Input
                  id="paint_name"
                  placeholder="e.g., Simply White"
                  value={newEntry.paint_name}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, paint_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paint_code">Paint Code *</Label>
                <Input
                  id="paint_code"
                  placeholder="e.g., OC-117"
                  value={newEntry.paint_code}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, paint_code: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_location">Room/Location</Label>
                <Input
                  id="room_location"
                  placeholder="e.g., Living Room, Kitchen, Master Bedroom"
                  value={newEntry.room_location}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, room_location: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-6 pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_interior"
                    checked={newEntry.is_interior}
                    onCheckedChange={(checked) => setNewEntry(prev => ({ ...prev, is_interior: checked === true }))}
                  />
                  <Label htmlFor="is_interior" className="cursor-pointer">Interior Paint</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_exterior"
                    checked={!newEntry.is_interior}
                    onCheckedChange={(checked) => setNewEntry(prev => ({ ...prev, is_interior: checked !== true }))}
                  />
                  <Label htmlFor="is_exterior" className="cursor-pointer">Exterior Paint</Label>
                </div>
              </div>
            </div>

            {/* Color Swatch Upload */}
            <div className="space-y-2">
              <Label>Color Swatch Image (optional)</Label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSwatchSelect}
                />
                {swatchPreview ? (
                  <div className="relative">
                    <img 
                      src={swatchPreview} 
                      alt="Swatch preview" 
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      onClick={clearSwatch}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Swatch
                  </Button>
                )}
                {swatchPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                  >
                    Change
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">Upload a photo of the paint swatch or color sample (max 5MB)</p>
            </div>

            <Button
              onClick={handleAddEntry}
              disabled={isSaving || isUploading}
              className="bg-brand-blue hover:bg-brand-lightBlue"
            >
              {isSaving || isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Add Paint Code'}
            </Button>
          </div>

          {/* Existing Paint Codes List */}
          {paintCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Paintbrush className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No paint codes saved yet. Add your first paint code above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Saved Paint Codes ({paintCodes.length})</h3>
              <div className="grid gap-3">
                {paintCodes.map((paint) => (
                  <div
                    key={paint.id}
                    className="flex items-start justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4 flex-1">
                      {/* Color Swatch */}
                      <div className="flex-shrink-0">
                        {paint.swatch_image_url ? (
                          <img 
                            src={paint.swatch_image_url} 
                            alt={`${paint.paint_name} swatch`}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Paint Details */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Property</p>
                          <p className="font-medium text-sm">{getPropertyName(paint.property_id)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Brand</p>
                          <p className="font-medium">{paint.paint_brand}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Name</p>
                          <p className="font-medium">{paint.paint_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Code</p>
                          <p className="font-medium font-mono">{paint.paint_code}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Type</p>
                          <p className="font-medium">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              paint.is_interior 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {paint.is_interior ? 'Interior' : 'Exterior'}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Room</p>
                          <p className="font-medium">{paint.room_location || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(paint.id, paint.swatch_image_path)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaintCodesSection;
