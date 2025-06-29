
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const SubscriptionTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePlan = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Plan Updated",
      description: "Your subscription plan has been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription plan and billing cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-blue-50 border-brand-blue">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-brand-blue">Standard Plan</h3>
                <p className="text-gray-600">$14.99/month • Billed monthly</p>
                <p className="text-sm text-gray-500">Next billing date: January 15, 2024</p>
              </div>
              <Button variant="outline">Change Plan</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Basic</h3>
              <p className="text-2xl font-bold text-brand-blue">$9.99<span className="text-sm font-normal">/month</span></p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                <li>• 5GB secure cloud storage</li>
                <li>• Photo and video uploads</li>
                <li>• Basic asset tagging</li>
                <li>• Mobile app access</li>
                <li>• Export basic reports</li>
                <li>• Email support</li>
                <li>• 30-day free trial</li>
              </ul>
              <Button variant="outline" className="w-full mt-4">Select Basic</Button>
            </div>
            
            <div className="p-4 border-2 border-brand-blue rounded-lg bg-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Standard</h3>
                <span className="text-xs bg-brand-blue text-white px-2 py-1 rounded">Current</span>
              </div>
              <p className="text-2xl font-bold text-brand-blue">$14.99<span className="text-sm font-normal">/month</span></p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                <li>• 25GB secure cloud storage</li>
                <li>• Photo and video uploads</li>
                <li>• Mobile app access</li>
                <li>• Export detailed reports</li>
                <li>• Priority email support</li>
                <li>• Share with 2 trusted contacts</li>
                <li>• 30-day free trial</li>
              </ul>
              <Button className="w-full mt-4 bg-brand-blue" disabled>Current Plan</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Premium</h3>
              <p className="text-2xl font-bold text-brand-blue">$29.99<span className="text-sm font-normal">/month</span></p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                <li>• 100GB secure cloud storage</li>
                <li>• Unlimited photo and video uploads</li>
                <li>• Professional asset tagging</li>
                <li>• AI-powered item identification & valuation</li>
                <li>• Floor plan scanning with live camera</li>
                <li>• Mobile app access with premium features</li>
                <li>• Export comprehensive reports</li>
                <li>• Priority email and phone support</li>
                <li>• Share with 5 trusted contacts</li>
                <li>• 30-day free trial</li>
              </ul>
              <Button onClick={handleChangePlan} className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90">
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionTab;
