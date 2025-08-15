import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InventoryChecklistPDFService } from '@/services/InventoryChecklistPDFService';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const HOW_HEARD_OPTIONS = [
  'Google Search',
  'Social Media',
  'Referral from Friend/Family',
  'Real Estate Agent',
  'Insurance Company',
  'Advertisement',
  'Word of Mouth',
  'Other'
];

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    state: '',
    howHeard: '',
    honeypot: '' // Hidden field to catch bots
  });
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.city || !formData.state || !formData.howHeard) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to download the inventory checklist.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-lead', {
        body: {
          name: formData.name,
          email: formData.email,
          city: formData.city,
          state: formData.state,
          how_heard: formData.howHeard,
          marketing_consent: marketingConsent,
          honeypot: formData.honeypot
        }
      });

      if (error) {
        console.error('Error response:', error);
        throw new Error(error.message || 'Failed to submit lead');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit lead');
      }

      // Generate and download the PDF
      await InventoryChecklistPDFService.generateInventoryChecklistPDF();

      // Mark that the user has submitted the lead form
      localStorage.setItem('hasSubmittedLead', 'true');

      toast({
        title: "Thank you!",
        description: "Your information has been saved and the inventory checklist is downloading! Find more valuable tools like this in your client dashboard when you start your free trial today. Limited time only!",
      });

      // Show success state with call-to-action
      setShowSuccessState(true);

    } catch (error: any) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error saving your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTrial = () => {
    window.location.href = '/auth';
  };

  const handleCloseModal = () => {
    // Reset form and success state
    setFormData({
      name: '',
      email: '',
      city: '',
      state: '',
      howHeard: '',
      honeypot: ''
    });
    setMarketingConsent(false);
    setShowSuccessState(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-md">
        {!showSuccessState ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold">
                Download your free inventory checklist
              </DialogTitle>
              <p className="text-center text-muted-foreground text-sm">
                by Asset Docs
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field - hidden from users but visible to bots */}
              <div className="hidden">
                <Label htmlFor="website">Website (leave blank)</Label>
                <Input
                  id="website"
                  type="text"
                  value={formData.honeypot}
                  onChange={(e) => handleInputChange('honeypot', e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Your city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="howHeard">How did you hear about us? *</Label>
                <Select onValueChange={(value) => handleInputChange('howHeard', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOW_HEARD_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="marketing-consent"
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="h-4 w-4 text-brand-orange border-gray-300 rounded mt-1"
                />
                <Label htmlFor="marketing-consent" className="text-sm text-muted-foreground">
                  I would like to receive marketing emails about new features, tips, and special offers
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit to receive your free inventory checklist'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold text-green-600">
                Success! Your download is starting...
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4 py-4">
              <p className="text-muted-foreground">
                Find more valuable tools like this in your client dashboard when you start your free trial today.
              </p>
              <p className="text-sm font-semibold text-primary">
                Limited time only!
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleStartTrial}
                  className="w-full text-orange-500"
                  size="lg"
                >
                  Start Your Free 30-Day Trial
                </Button>
                
                <Button 
                  onClick={handleCloseModal}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;