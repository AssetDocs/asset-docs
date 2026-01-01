import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Trash2, Shield, Loader2, Calendar, DollarSign, User, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InsuranceService, InsurancePolicy } from '@/services/InsuranceService';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

const InsuranceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadPolicy = async () => {
      if (!user?.id || !id) return;
      
      try {
        const policies = await InsuranceService.getUserPolicies(user.id);
        const found = policies.find(p => p.id === id);
        if (found) {
          setPolicy(found);
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

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await InsuranceService.deletePolicy(id);
      toast({
        title: 'Policy deleted',
        description: 'The insurance policy has been deleted.',
      });
      navigate('/account/documents');
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete policy.',
        variant: 'destructive',
      });
    }
    setShowDeleteDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return `$${amount.toLocaleString()}`;
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

  if (!policy) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/account/documents')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-yellow-500" />
                  {policy.insurance_company}
                </h1>
                <p className="text-sm text-gray-500 capitalize">{policy.policy_type} Policy</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/account/insurance/${id}/edit`)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          {/* Policy Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Policy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge className={getStatusColor(policy.status)} variant="secondary">
                    {policy.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Policy Number</span>
                  <span className="font-medium">{policy.policy_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize">{policy.policy_type}</span>
                </div>
              </CardContent>
            </Card>

            {/* Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Coverage Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage Amount</span>
                  <span className="font-medium">{formatCurrency(policy.coverage_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductible</span>
                  <span className="font-medium">{formatCurrency(policy.deductible)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium</span>
                  <span className="font-medium">{formatCurrency(policy.premium_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Policy Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium">{formatDate(policy.policy_start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-medium">{formatDate(policy.policy_end_date)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Agent Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Agent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{policy.agent_name || 'N/A'}</span>
                </div>
                {policy.agent_phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Phone
                    </span>
                    <a href={`tel:${policy.agent_phone}`} className="font-medium text-brand-blue hover:underline">
                      {policy.agent_phone}
                    </a>
                  </div>
                )}
                {policy.agent_email && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </span>
                    <a href={`mailto:${policy.agent_email}`} className="font-medium text-brand-blue hover:underline">
                      {policy.agent_email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes & Coverage Details */}
          {(policy.coverage_details || policy.notes) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {policy.coverage_details && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Coverage Details</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{policy.coverage_details}</p>
                  </div>
                )}
                {policy.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{policy.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Insurance Policy"
        description="Are you sure you want to delete this insurance policy? This action cannot be undone."
      />
      
      <Footer />
    </div>
  );
};

export default InsuranceDetail;
