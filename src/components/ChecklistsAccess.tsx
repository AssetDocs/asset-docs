import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { CheckSquare, Lock } from 'lucide-react';

const ChecklistsAccess: React.FC = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier?: string;
  }>({ subscribed: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (error) throw error;
        setSubscriptionStatus(data);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading subscription status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionStatus.subscribed) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Asset Documentation Checklists</CardTitle>
          </div>
          <CardDescription>
            Premium feature - Comprehensive guides for documenting your valuable assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Access detailed checklists for documenting your home and business assets. 
            This feature is available to premium subscribers.
          </p>
          <Link to="/pricing">
            <Button variant="outline" className="w-full">
              Upgrade to Access Checklists
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <CardTitle>Asset Documentation Checklists</CardTitle>
        </div>
        <CardDescription>
          Comprehensive guides for documenting your valuable assets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Access detailed checklists for documenting your home and business assets, 
          organized by category with photography tips and documentation best practices.
        </p>
        <Link to="/checklists">
          <Button className="w-full">
            <CheckSquare className="h-4 w-4 mr-2" />
            Access Checklists
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ChecklistsAccess;