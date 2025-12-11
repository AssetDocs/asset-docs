import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Paintbrush, Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface PaintCode {
  id: string;
  paint_brand: string;
  paint_name: string;
  paint_code: string;
  is_interior: boolean;
  room_location: string;
}

const PaintCodesSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paintCodes, setPaintCodes] = useState<PaintCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({
    paint_brand: '',
    paint_name: '',
    paint_code: '',
    is_interior: true,
    room_location: ''
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
      const { data, error } = await supabase
        .from('paint_codes')
        .insert({
          user_id: user?.id,
          paint_brand: newEntry.paint_brand,
          paint_name: newEntry.paint_name,
          paint_code: newEntry.paint_code,
          is_interior: newEntry.is_interior,
          room_location: newEntry.room_location
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
        room_location: ''
      });

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
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
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
            <Button
              onClick={handleAddEntry}
              disabled={isSaving}
              className="bg-brand-blue hover:bg-brand-lightBlue"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Paint Code
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
                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4">
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
                        <p className="text-xs text-gray-500 uppercase">Room/Location</p>
                        <p className="font-medium">{paint.room_location || '-'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(paint.id)}
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
