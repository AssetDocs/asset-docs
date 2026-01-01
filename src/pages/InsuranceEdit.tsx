import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InsuranceService, InsurancePolicy } from '@/services/InsuranceService';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

const InsuranceEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    notes: '',
    status: 'active'
  });

  useEffect(() => {
    const loadPolicy = async () => {
      if (!user?.id || !id) return;
      
      try {
        const policies = await InsuranceService.getUserPolicies(user.id);
        const policy = policies.find(p => p.id === id);
        if (policy) {
          setFormData({
            policyType: policy.policy_type || 'homeowners',
            insuranceCompany: policy.insurance_company || '',
            policyNumber: policy.policy_number || '',
            agentName: policy.agent_name || '',
            agentPhone: policy.agent_phone || '',
            agentEmail: policy.agent_email || '',
            policyStartDate: policy.policy_start_date || '',
            policyEndDate: policy.policy_end_date || '',
            premiumAmount: policy.premium_amount?.toString() || '',
            deductible: policy.deductible?.toString() || '',
            coverageAmount: policy.coverage_amount?.toString() || '',
            coverageDetails: policy.coverage_details || '',
            notes: policy.notes || '',
            status: policy.status || 'active'
          });
        } else {
          toast({
            title: 'Policy not found',
            description: 'The requested policy could not be found.',
            variant: 'destructive',
          });
          navigate('/account/documents');
        }
      } catch (error) {
        console.error('Error loading policy:', error);
        toast({
          title: 'Error',
          description: 'Failed to load policy details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPolicy();
  }, [user, id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !id) return;

    if (!formData.insuranceCompany || !formData.policyNumber) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in the insurance company and policy number.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await InsuranceService.updatePolicy(id, {
        policy_type: formData.policyType,
        insurance_company: formData.insuranceCompany,
        policy_number: formData.policyNumber,
        agent_name: formData.agentName || undefined,
        agent_phone: formData.agentPhone || undefined,
        agent_email: formData.agentEmail || undefined,
        policy_start_date: formData.policyStartDate || undefined,
        policy_end_date: formData.policyEndDate || undefined,
        premium_amount: formData.premiumAmount ? parseFloat(formData.premiumAmount) : undefined,
        deductible: formData.deductible ? parseFloat(formData.deductible) : undefined,
        coverage_amount: formData.coverageAmount ? parseFloat(formData.coverageAmount) : undefined,
        coverage_details: formData.coverageDetails || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      });

      toast({
        title: 'Policy updated!',
        description: 'Your insurance policy has been updated successfully.',
      });

      navigate(`/account/insurance/${id}`);
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        title: 'Failed to update policy',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/account/insurance/${id}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Insurance Policy</h1>
              <p className="text-sm text-gray-500">Update your policy details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Policy Type</CardTitle>
                <CardDescription>Select the type of insurance policy</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.policyType}
                  onValueChange={(value) => setFormData({ ...formData, policyType: value })}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {['homeowners', 'renters', 'auto', 'life', 'health', 'umbrella', 'flood', 'other'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="capitalize cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Policy Details</CardTitle>
                <CardDescription>Enter the main policy information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                    <Input
                      id="insuranceCompany"
                      name="insuranceCompany"
                      value={formData.insuranceCompany}
                      onChange={handleInputChange}
                      placeholder="e.g., State Farm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number *</Label>
                    <Input
                      id="policyNumber"
                      name="policyNumber"
                      value={formData.policyNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., POL-123456"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="policyStartDate">Start Date</Label>
                    <Input
                      id="policyStartDate"
                      name="policyStartDate"
                      type="date"
                      value={formData.policyStartDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyEndDate">End Date</Label>
                    <Input
                      id="policyEndDate"
                      name="policyEndDate"
                      type="date"
                      value={formData.policyEndDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Coverage Information</CardTitle>
                <CardDescription>Enter coverage amounts and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverageAmount">Coverage Amount ($)</Label>
                    <Input
                      id="coverageAmount"
                      name="coverageAmount"
                      type="number"
                      value={formData.coverageAmount}
                      onChange={handleInputChange}
                      placeholder="e.g., 500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductible">Deductible ($)</Label>
                    <Input
                      id="deductible"
                      name="deductible"
                      type="number"
                      value={formData.deductible}
                      onChange={handleInputChange}
                      placeholder="e.g., 1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premiumAmount">Premium ($)</Label>
                    <Input
                      id="premiumAmount"
                      name="premiumAmount"
                      type="number"
                      value={formData.premiumAmount}
                      onChange={handleInputChange}
                      placeholder="e.g., 1200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverageDetails">Coverage Details</Label>
                  <Textarea
                    id="coverageDetails"
                    name="coverageDetails"
                    value={formData.coverageDetails}
                    onChange={handleInputChange}
                    placeholder="Describe what's covered..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
                <CardDescription>Contact details for your insurance agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      name="agentName"
                      value={formData.agentName}
                      onChange={handleInputChange}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentPhone">Agent Phone</Label>
                    <Input
                      id="agentPhone"
                      name="agentPhone"
                      type="tel"
                      value={formData.agentPhone}
                      onChange={handleInputChange}
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentEmail">Agent Email</Label>
                    <Input
                      id="agentEmail"
                      name="agentEmail"
                      type="email"
                      value={formData.agentEmail}
                      onChange={handleInputChange}
                      placeholder="e.g., agent@insurance.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about this policy..."
                  rows={3}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate(`/account/insurance/${id}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InsuranceEdit;
