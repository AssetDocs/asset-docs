
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, CreditCard, User, Package, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AccountSettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
  };

  const handleSaveBilling = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Billing Information Updated",
      description: "Your billing information has been successfully updated.",
    });
  };

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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/account">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-brand-blue">Account Settings</h1>
              <p className="text-gray-600">Manage your profile, billing, and subscription preferences</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter your first name" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter your last name" defaultValue="Doe" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" defaultValue="john.doe@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="Enter your phone number" defaultValue="+1 (555) 123-4567" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input id="company" placeholder="Enter your company name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself" rows={3} />
                  </div>
                  
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Manage your payment methods and billing address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Method</h3>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6 text-brand-blue" />
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Expires 12/2025</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Update Card</Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Billing Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address1">Address Line 1</Label>
                        <Input id="address1" placeholder="Enter street address" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                        <Input id="address2" placeholder="Apartment, suite, etc." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Enter city" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input id="state" placeholder="Enter state/province" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP/Postal Code</Label>
                        <Input id="zip" placeholder="Enter ZIP code" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveBilling} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Billing Info'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
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
                          <h3 className="text-lg font-semibold text-brand-blue">Professional Plan</h3>
                          <p className="text-gray-600">$29/month • Billed monthly</p>
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
                        <p className="text-2xl font-bold text-brand-blue">$9<span className="text-sm font-normal">/month</span></p>
                        <ul className="mt-3 space-y-1 text-sm text-gray-600">
                          <li>• Up to 5 properties</li>
                          <li>• 1GB storage</li>
                          <li>• Basic support</li>
                        </ul>
                        <Button variant="outline" className="w-full mt-4">Select Basic</Button>
                      </div>
                      
                      <div className="p-4 border-2 border-brand-blue rounded-lg bg-blue-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Professional</h3>
                          <span className="text-xs bg-brand-blue text-white px-2 py-1 rounded">Current</span>
                        </div>
                        <p className="text-2xl font-bold text-brand-blue">$29<span className="text-sm font-normal">/month</span></p>
                        <ul className="mt-3 space-y-1 text-sm text-gray-600">
                          <li>• Unlimited properties</li>
                          <li>• 50GB storage</li>
                          <li>• Priority support</li>
                          <li>• AI valuations</li>
                        </ul>
                        <Button className="w-full mt-4 bg-brand-blue" disabled>Current Plan</Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold">Enterprise</h3>
                        <p className="text-2xl font-bold text-brand-blue">$99<span className="text-sm font-normal">/month</span></p>
                        <ul className="mt-3 space-y-1 text-sm text-gray-600">
                          <li>• Everything in Pro</li>
                          <li>• 500GB storage</li>
                          <li>• White-label options</li>
                          <li>• Custom integrations</li>
                        </ul>
                        <Button onClick={handleChangePlan} className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90">
                          Upgrade to Enterprise
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about updates and activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates about your account via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Security Alerts</h3>
                        <p className="text-sm text-gray-600">Get notified about login attempts and security changes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Marketing Communications</h3>
                        <p className="text-sm text-gray-600">Receive newsletters and product updates</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Billing Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified about billing and payment issues</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Property Updates</h3>
                        <p className="text-sm text-gray-600">Notifications when property values change</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountSettings;
