import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Home, Edit3, Trash2, Loader2, Eye, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from '@/components/DashboardGridCard';
import EmailVerificationNotice from '@/components/EmailVerificationNotice';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import GoogleMapsAutocomplete from '@/components/GoogleMapsAutocomplete';
import RealEstateDataService from '@/services/RealEstateDataService';
import { useProperties } from '@/hooks/useProperties';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/services/PropertyService';

interface PropertyFormData {
  name: string;
  address: string;
  type: string;
  squareFootage: string;
  yearBuilt: string;
  estimatedValue: string;
}

const emptyForm: PropertyFormData = {
  name: '',
  address: '',
  type: '',
  squareFootage: '',
  yearBuilt: '',
  estimatedValue: '',
};

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { properties, isLoading, addProperty, updateProperty, deleteProperty } = useProperties();
  const { propertyLimit } = useSubscription();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>(emptyForm);
  const [isLoadingPropertyData, setIsLoadingPropertyData] = useState(false);
  const realEstateService = RealEstateDataService.getInstance();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProperty(null);
  };

  const handlePlaceSelected = async (place: google.maps.places.PlaceResult) => {
    if (!place.formatted_address) return;
    setIsLoadingPropertyData(true);
    try {
      const addressComponents = realEstateService.extractAddressComponents(place);
      const propertyDetails = await realEstateService.fetchPropertyDetails(place.formatted_address, addressComponents);
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
      estimatedValue: property.estimated_value?.toString() || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const propertyData = {
      name: formData.name,
      address: formData.address,
      type: formData.type,
      square_footage: parseInt(formData.squareFootage) || null,
      year_built: parseInt(formData.yearBuilt) || null,
      estimated_value: parseFloat(formData.estimatedValue) || null,
    };

    if (editingProperty) {
      await updateProperty(editingProperty.id, propertyData);
    } else {
      await addProperty(propertyData);
    }
    setIsAddOpen(false);
    setEditingProperty(null);
    resetForm();
  };

  const handleDelete = async (propertyId: string) => {
    await deleteProperty(propertyId);
  };

  const buildTags = (property: Property) => {
    const tags: string[] = [];
    if (property.type) tags.push(property.type);
    if (property.estimated_value) tags.push(formatCurrency(property.estimated_value));
    if (property.year_built) tags.push(`Built ${property.year_built}`);
    return tags;
  };

  const propertyForm = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Property Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Main Residence" required />
      </div>
      <div>
        <GoogleMapsAutocomplete value={formData.address} onChange={(address) => setFormData({ ...formData, address })} onPlaceSelected={handlePlaceSelected} label="Address" placeholder="Start typing an address..." required />
        {isLoadingPropertyData && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching property details...
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="type">Property Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger>
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
          <Input id="squareFootage" type="number" value={formData.squareFootage} onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })} placeholder="0" />
        </div>
        <div>
          <Label htmlFor="yearBuilt">Year Built</Label>
          <Input id="yearBuilt" type="number" value={formData.yearBuilt} onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })} placeholder="2000" />
        </div>
      </div>
      <div>
        <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
        <Input id="estimatedValue" type="number" value={formData.estimatedValue} onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })} placeholder="0" />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">{editingProperty ? 'Save Changes' : 'Add Property'}</Button>
        <Button type="button" variant="outline" onClick={() => { editingProperty ? setEditingProperty(null) : setIsAddOpen(false); resetForm(); }}>Cancel</Button>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <EmailVerificationNotice />
          <DashboardBreadcrumb hidePageName />

          <div className="space-y-4">
            {/* Header — matches Asset Documentation pattern */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Property Profiles</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  View and manage all your property documentation
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {propertyLimit >= 999999 ? 'Unlimited' : propertyLimit} properties allowed on your plan
                </p>
              </div>
              <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                Add Property
              </Button>
            </div>

            {/* Property grid */}
            {isLoading ? (
              <Card className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </Card>
            ) : properties.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-4">
                  <Home className="h-12 w-12 text-gray-300" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Properties Added</h3>
                    <p className="text-muted-foreground mb-4">Start by adding your first property to get organized.</p>
                    <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Property
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {properties.map((property) => (
                  <div key={property.id} className="relative group">
                    <DashboardGridCard
                      icon={<Home className="h-6 w-6" />}
                      title={property.name}
                      description={property.address}
                      tags={buildTags(property)}
                      actionLabel="View Property"
                      actionIcon={<Eye className="h-4 w-4" />}
                      onClick={() => navigate(`/account/properties/${property.id}/assets`)}
                      color="blue"
                    />
                    {/* Edit / Delete overlay buttons */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-white"
                        onClick={(e) => { e.stopPropagation(); handleEdit(property); }}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-7 w-7 bg-white" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
                            <AlertDialogAction onClick={() => handleDelete(property.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Property Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add New Property</DialogTitle></DialogHeader>
              {propertyForm}
            </DialogContent>
          </Dialog>

          {/* Edit Property Dialog */}
          <Dialog open={!!editingProperty} onOpenChange={(open) => { if (!open) { setEditingProperty(null); resetForm(); } }}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Edit Property</DialogTitle></DialogHeader>
              {propertyForm}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Properties;
