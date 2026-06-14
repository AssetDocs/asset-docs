
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PropertyService } from '@/services/PropertyService';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';

// Parse a possibly-formatted currency string like "$425,000" or "425000" → number | null.
const parseCurrency = (value: string): number | null => {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const parseIntOrNull = (value: string): number | null => {
  if (!value) return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
};

const PropertyForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canEdit: canWrite, showReadOnlyRestriction } = useAccount();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'residential',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      showReadOnlyRestriction();
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      // Compose a single address line; the schema stores a flat `address` string.
      const fullAddress = [
        formData.address,
        [formData.city, formData.state].filter(Boolean).join(', '),
        formData.zipCode,
      ].filter(Boolean).join(' ').trim();

      const created = await PropertyService.createProperty({
        name: formData.name.trim(),
        address: fullAddress,
        type: formData.propertyType,
        square_footage: parseIntOrNull(formData.squareFootage),
        year_built: parseIntOrNull(formData.yearBuilt),
        estimated_value: parseCurrency(formData.currentValue),
      } as any);

      if (!created) {
        toast({
          title: 'Could not save property',
          description: 'Please check your details and try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Property saved', description: `${created.name} was added.` });
      navigate('/account/properties');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Remove all non-numeric characters except for the decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Format with commas and dollar sign if there's a value
    let formattedValue = value;
    if (numericValue) {
      const parts = numericValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formattedValue = parts.length > 1 ? parts.join('.') : parts[0];
      if (!value.startsWith('$')) {
        formattedValue = '$' + formattedValue;
      } else {
        formattedValue = '$' + formattedValue.replace('$', '');
      }
    }
    
    setFormData({
      ...formData,
      [name]: formattedValue
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/account')}
              className="mb-4 bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Create Property Profile</h1>
            <p className="text-gray-600">Add detailed information about your property</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
              <CardDescription>
                Provide comprehensive details about your property for documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Property Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Residence, Vacation Home"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="propertyType">Property Type</Label>
                    <RadioGroup 
                      value={formData.propertyType} 
                      onValueChange={(value) => setFormData({...formData, propertyType: value})}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="residential" id="residential" />
                        <Label htmlFor="residential">Residential</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="commercial" id="commercial" />
                        <Label htmlFor="commercial">Commercial</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rental" id="rental" />
                        <Label htmlFor="rental">Rental</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="squareFootage">Square Footage</Label>
                    <Input
                      id="squareFootage"
                      name="squareFootage"
                      type="number"
                      value={formData.squareFootage}
                      onChange={handleInputChange}
                      placeholder="2500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      placeholder="3"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      placeholder="2.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="yearBuilt">Year Built</Label>
                    <Input
                      id="yearBuilt"
                      name="yearBuilt"
                      type="number"
                      value={formData.yearBuilt}
                      onChange={handleInputChange}
                      placeholder="2010"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      name="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      name="purchasePrice"
                      type="text"
                      value={formData.purchasePrice}
                      onChange={handleCurrencyChange}
                      placeholder="$350,000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentValue">Current Estimated Value</Label>
                    <Input
                      id="currentValue"
                      name="currentValue"
                      type="text"
                      value={formData.currentValue}
                      onChange={handleCurrencyChange}
                      placeholder="425000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Property Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Additional details about the property..."
                    rows={4}
                  />
                </div>

                {!canWrite && (
                  <p className="text-sm text-destructive">
                    Your role is read-only in this workspace — you cannot create properties here.
                  </p>
                )}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={!canWrite || saving}
                    className="bg-brand-blue hover:bg-brand-lightBlue"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving…' : 'Save Property'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/account')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PropertyForm;
