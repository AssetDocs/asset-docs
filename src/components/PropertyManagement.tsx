import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Home, MapPin, Edit3, Trash2, Loader2 } from "lucide-react";
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';
import RealEstateDataService from '@/services/RealEstateDataService';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { checkPropertyLimit } from '@/config/subscriptionFeatures';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/services/PropertyService';

interface PropertyFormData {
  name: string;
  address: string;
  type: string;
  squareFootage: string;
  yearBuilt: string;
  estimatedValue: string;
}

interface PropertyManagementProps {
  onPropertySelect: (property: Property | null) => void;
  selectedPropertyId: string | null;
}

const PropertyManagement: React.FC<PropertyManagementProps> = ({
  onPropertySelect,
  selectedPropertyId
}) => {
  const { properties, isLoading, addProperty, updateProperty, deleteProperty } = useProperties();
  const { subscriptionStatus, isInTrial } = useSubscription();
  const { toast } = useToast();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    type: '',
    squareFootage: '',
    yearBuilt: '',
    estimatedValue: ''
  });
  const [isLoadingPropertyData, setIsLoadingPropertyData] = useState(false);
  const realEstateService = RealEstateDataService.getInstance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      type: '',
      squareFootage: '',
      yearBuilt: '',
      estimatedValue: ''
    });
    setEditingProperty(null);
  };

  const handlePlaceSelected = async (place: google.maps.places.PlaceResult) => {
    if (!place.formatted_address) return;
    
    setIsLoadingPropertyData(true);
    try {
      const addressComponents = realEstateService.extractAddressComponents(place);
      const propertyDetails = await realEstateService.fetchPropertyDetails(
        place.formatted_address,
        addressComponents
      );
      
      // Auto-populate the form with fetched property details
      setFormData(prev => ({
        ...prev,
        address: place.formatted_address || prev.address,
        type: propertyDetails.propertyType || prev.type,
        yearBuilt: propertyDetails.yearBuilt?.toString() || prev.yearBuilt,
        squareFootage: propertyDetails.squareFootage?.toString() || prev.squareFootage,
        estimatedValue: propertyDetails.estimatedValue?.toString() || prev.estimatedValue,
      }));
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setIsLoadingPropertyData(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      type: property.type,
      squareFootage: property.square_footage?.toString() || '',
      yearBuilt: property.year_built?.toString() || '',
      estimatedValue: property.estimated_value?.toString() || ''
    });
  };

  const handleDelete = async (propertyId: string) => {
    const success = await deleteProperty(propertyId);
    
    // If the deleted property was selected, clear selection
    if (success && selectedPropertyId === propertyId) {
      onPropertySelect(null);
    }
  };

  const handleAddProperty = () => {
    // Check property limits before opening dialog
    const limitCheck = checkPropertyLimit(
      properties.length,
      subscriptionStatus?.subscription_tier as any,
      isInTrial
    );
    
    if (!limitCheck.canAdd) {
      toast({
        title: "Property Limit Reached",
        description: limitCheck.message,
        variant: "destructive",
      });
      return;
    }
    
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double-check property limits for new properties (not edits)
    if (!editingProperty) {
      const limitCheck = checkPropertyLimit(
        properties.length,
        subscriptionStatus?.subscription_tier as any,
        isInTrial
      );
      
      if (!limitCheck.canAdd) {
        return;
      }
    }
    
    const propertyData = {
      name: formData.name,
      address: formData.address,
      type: formData.type,
      square_footage: parseInt(formData.squareFootage) || null,
      year_built: parseInt(formData.yearBuilt) || null,
      estimated_value: parseFloat(formData.estimatedValue) || null,
    };

    if (editingProperty) {
      const updated = await updateProperty(editingProperty.id, propertyData);
      if (updated) {
        setEditingProperty(null);
      }
    } else {
      const newProperty = await addProperty(propertyData);
      if (newProperty) {
        onPropertySelect(newProperty);
        setIsAddDialogOpen(false);
      }
    }
    
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Properties ({properties.length})</h2>
          <p className="text-sm text-muted-foreground">
            {checkPropertyLimit(0, subscriptionStatus?.subscription_tier as any, isInTrial).limit} properties allowed on your plan
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleAddProperty}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Main Residence"
                  required
                />
              </div>
              
              <div>
                <GoogleMapsAutocomplete
                  value={formData.address}
                  onChange={(address) => setFormData({...formData, address})}
                  onPlaceSelected={handlePlaceSelected}
                  label="Address"
                  placeholder="Start typing an address..."
                  required
                />
                {isLoadingPropertyData && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching property details...
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="type">Property Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single Family Home">Single Family Home</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Vacation Home">Vacation Home</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                    placeholder="2000"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                  placeholder="0"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Add Property
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </Card>
      ) : properties.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <div className="flex flex-col items-center gap-4">
            <Home className="h-12 w-12 text-gray-300" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Added</h3>
              <p className="text-gray-600 mb-4">Start by adding your first property to get organized.</p>
              <Button 
                onClick={handleAddProperty}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        properties.map((property) => (
          <Card 
            key={property.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPropertyId === property.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onPropertySelect(property)}
          >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center">
                  <Home className="h-5 w-5 mr-2 text-primary" />
                  {property.name}
                </CardTitle>
                <div className="flex items-start mt-1 text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  {property.address}
                </div>
              </div>
              
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Property</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Property Name</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <GoogleMapsAutocomplete
                          value={formData.address}
                          onChange={(address) => setFormData({...formData, address})}
                          onPlaceSelected={handlePlaceSelected}
                          label="Address"
                          placeholder="Start typing an address..."
                          required
                        />
                        {isLoadingPropertyData && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating property details...
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="edit-type">Property Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single Family Home">Single Family Home</SelectItem>
                            <SelectItem value="Condo">Condo</SelectItem>
                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="Vacation Home">Vacation Home</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-squareFootage">Square Footage</Label>
                          <Input
                            id="edit-squareFootage"
                            type="number"
                            value={formData.squareFootage}
                            onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-yearBuilt">Year Built</Label>
                          <Input
                            id="edit-yearBuilt"
                            type="number"
                            value={formData.yearBuilt}
                            onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="edit-estimatedValue">Estimated Value ($)</Label>
                        <Input
                          id="edit-estimatedValue"
                          type="number"
                          value={formData.estimatedValue}
                          onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Property</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{property.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(property.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{property.type}</span>
              {property.estimated_value && (
                <Badge variant="secondary">{formatCurrency(property.estimated_value)}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
};

export default PropertyManagement;