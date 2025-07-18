
import React, { useState } from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, MapPin } from 'lucide-react';

interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  squareFootage: number;
  yearBuilt: number;
  estimatedValue: number;
  lastUpdated: string;
}

interface PropertyHeaderProps {
  property: Property;
  onPropertyUpdate: (updatedProperty: Property) => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ property, onPropertyUpdate }) => {
  const [editData, setEditData] = useState({
    name: property.name,
    type: property.type,
    squareFootage: property.squareFootage,
    yearBuilt: property.yearBuilt,
    estimatedValue: property.estimatedValue,
  });
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    const updatedProperty = {
      ...property,
      ...editData,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onPropertyUpdate(updatedProperty);
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl text-brand-blue">{property.name}</CardTitle>
          <CardDescription className="flex items-center mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            {property.address}
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Property Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">Property Type</Label>
                <Input
                  id="type"
                  value={editData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="squareFootage">Square Footage</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  value={editData.squareFootage}
                  onChange={(e) => handleInputChange('squareFootage', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  value={editData.yearBuilt}
                  onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={editData.estimatedValue}
                  onChange={(e) => handleInputChange('estimatedValue', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CardHeader>
  );
};

export default PropertyHeader;
