import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckIcon, Star, Zap, Users, HardDrive, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useContributor } from '@/contexts/ContributorContext';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  plan_status?: string;
  property_limit?: number;
  storage_quota_gb?: number;
}

interface Contributor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  contributor_email: string;
  status: string;
}

const AdminContributorPlanInfo: React.FC = () => {
  const { isAdministrator, accountOwnerId, ownerName } = useContributor();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdministrator || !accountOwnerId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch subscription info (inherited from owner)
        const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription');
        if (!subError && subData) {
          setSubscriptionInfo(subData);
        }

        // Fetch all contributors for this account
        const { data: contribData, error: contribError } = await supabase
          .from('contributors')
          .select('id, first_name, last_name, role, contributor_email, status')
          .eq('account_owner_id', accountOwnerId)
          .eq('status', 'accepted');

        if (!contribError && contribData) {
          setContributors(contribData);
        }
      } catch (error) {
        console.error('Error fetching admin contributor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdministrator, accountOwnerId]);

  if (!isAdministrator || loading) {
    return null;
  }

  if (!subscriptionInfo?.subscribed) {
    return null;
  }

  const rawTier = subscriptionInfo.subscription_tier?.toLowerCase() || 'standard';
  const isPremium = rawTier.includes('premium');
  const planName = isPremium ? 'Premium (Professional Plan)' : 'Standard (Homeowner Plan)';
  const planIcon = isPremium ? <Star className="h-5 w-5 text-purple-600" /> : <Zap className="h-5 w-5 text-orange-600" />;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contributor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Account Overview (Admin Access)
        </CardTitle>
        <CardDescription>
          Subscription and contributor information for {ownerName}'s account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscription Plan Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {planIcon}
              <h4 className="font-semibold text-green-900">Current Plan</h4>
            </div>
            <Badge className="bg-green-600 text-white">
              {subscriptionInfo.plan_status === 'canceling' ? 'Canceling' : 'Active'}
            </Badge>
          </div>
          <p className="text-xl font-bold text-green-900 mb-3">{planName}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-green-600" />
              <div>
                <Label className="text-xs text-muted-foreground">Storage</Label>
                <p className="text-sm font-medium">{subscriptionInfo.storage_quota_gb || 25} GB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <div>
                <Label className="text-xs text-muted-foreground">Properties</Label>
                <p className="text-sm font-medium">
                  {subscriptionInfo.property_limit === 999 ? 'Unlimited' : subscriptionInfo.property_limit || 3}
                </p>
              </div>
            </div>
            {subscriptionInfo.subscription_end && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <div>
                  <Label className="text-xs text-muted-foreground">Next Billing</Label>
                  <p className="text-sm font-medium">
                    {new Date(subscriptionInfo.subscription_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {subscriptionInfo.plan_status === 'canceling' && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
              ⚠️ This subscription is scheduled to cancel at the end of the billing period.
            </div>
          )}
        </div>

        {/* Authorized Users List */}
        {contributors.length > 0 && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Authorized Users ({contributors.length})
            </h4>
            <div className="space-y-2">
              {contributors.map((contributor) => (
                <div key={contributor.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {contributor.first_name || contributor.last_name 
                        ? `${contributor.first_name || ''} ${contributor.last_name || ''}`.trim()
                        : contributor.contributor_email}
                    </p>
                    <p className="text-xs text-muted-foreground">{contributor.contributor_email}</p>
                  </div>
                  <Badge variant="outline" className={getRoleBadgeColor(contributor.role)}>
                    {contributor.role.charAt(0).toUpperCase() + contributor.role.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminContributorPlanInfo;
