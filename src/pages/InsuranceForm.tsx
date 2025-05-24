
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
import { ArrowLeft, Save, Upload } from 'lucide-react';

const InsuranceForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    policyType: 'homeowners',
    insuranceCompany: '',
    policyNumber: '',
    agentName: '',
    agentPhone: '',
    agentEmail: '',
    policyStartDate: '',
    policyEndDate: '',
    premiumAmount: '',
    deductible: '',
    coverageAmount: '',
    coverageDetails: '',
    notes: ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Insurance data:', formData);
    console.log('Attachments:', attachments);
    // Here you would save to your backend/database
    navigate('/account/insurance');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments([...attachments, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/account')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Add Insurance Policy</h1>
            <p className="text-gray-600">Document your insurance coverage and important details</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Policy Information</CardTitle>
              <CardDescription>
                Provide comprehensive details about your insurance policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="policyType">Policy Type</Label>
                  <RadioGroup 
                    value={formData.policyType} 
                    onValueChange={(value) => setFormData({...formData, policyType: value})}
                    className="flex flex-wrap gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="homeowners" id="homeowners" />
                      <Label htmlFor="homeowners">Homeowners</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="renters" id="renters" />
                      <Label htmlFor="renters">Renters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="auto" id="auto" />
                      <Label htmlFor="auto">Auto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="umbrella" id="umbrella" />
                      <Label htmlFor="umbrella">Umbrella</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="insuranceCompany">Insurance Company</Label>
                    <Input
                      id="insuranceCompany"
                      name="insuranceCompany"
                      value={formData.insuranceCompany}
                      onChange={handleInputChange}
                      placeholder="e.g., State Farm, Allstate"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      name="policyNumber"
                      value={formData.policyNumber}
                      onChange={handleInputChange}
                      placeholder="Policy identification number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      name="agentName"
                      value={formData.agentName}
                      onChange={handleInputChange}
                      placeholder="Agent full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="agentPhone">Agent Phone</Label>
                    <Input
                      id="agentPhone"
                      name="agentPhone"
                      value={formData.agentPhone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="agentEmail">Agent Email</Label>
                    <Input
                      id="agentEmail"
                      name="agentEmail"
                      type="email"
                      value={formData.agentEmail}
                      onChange={handleInputChange}
                      placeholder="agent@insurance.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="policyStartDate">Policy Start Date</Label>
                    <Input
                      id="policyStartDate"
                      name="policyStartDate"
                      type="date"
                      value={formData.policyStartDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="policyEndDate">Policy End Date</Label>
                    <Input
                      id="policyEndDate"
                      name="policyEndDate"
                      type="date"
                      value={formData.policyEndDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="premiumAmount">Annual Premium</Label>
                    <Input
                      id="premiumAmount"
                      name="premiumAmount"
                      type="number"
                      value={formData.premiumAmount}
                      onChange={handleInputChange}
                      placeholder="1200"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deductible">Deductible</Label>
                    <Input
                      id="deductible"
                      name="deductible"
                      type="number"
                      value={formData.deductible}
                      onChange={handleInputChange}
                      placeholder="1000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="coverageAmount">Coverage Amount</Label>
                    <Input
                      id="coverageAmount"
                      name="coverageAmount"
                      type="number"
                      value={formData.coverageAmount}
                      onChange={handleInputChange}
                      placeholder="500000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="coverageDetails">Coverage Details</Label>
                  <Textarea
                    id="coverageDetails"
                    name="coverageDetails"
                    value={formData.coverageDetails}
                    onChange={handleInputChange}
                    placeholder="Details about what is covered under this policy..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information about this policy..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="attachments">Policy Documents</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload policy documents, declarations pages, and related files
                  </p>
                  
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium">Attached Files:</h4>
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-brand-blue hover:bg-brand-lightBlue">
                    <Save className="h-4 w-4 mr-2" />
                    Save Policy
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

export default InsuranceForm;
