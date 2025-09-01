import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Camera, Video, FileText, Upload, Download, Share2, Users, Shield, 
  Database, Cloud, Smartphone, Globe, BarChart, Settings, CreditCard,
  Lock, Key, Mail, Bell, Archive, FileImage, Mic, AlertTriangle,
  CheckCircle, UserCheck, Building, Home, Briefcase, Calculator,
  ClipboardList, Timer, Heart, TrendingUp, Handshake, Truck, Scale
} from 'lucide-react';

const FeaturesList: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Asset Docs - Complete Feature Overview</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive asset documentation platform for homeowners, renters, businesses, and landlords. 
            Built with React, TypeScript, Tailwind CSS, and Supabase backend.
          </p>
        </div>

        <Tabs defaultValue="core-features" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="core-features">Core Features</TabsTrigger>
            <TabsTrigger value="user-types">User Types</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          {/* Core Features Tab */}
          <TabsContent value="core-features" className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Core Platform Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Media Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">Media</Badge>
                  </div>
                  <CardTitle>Photo & Video Upload</CardTitle>
                  <CardDescription>Comprehensive media documentation system</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Drag-and-drop photo upload</li>
                    <li>• Video recording and upload</li>
                    <li>• Gallery organization with folders</li>
                    <li>• Mobile-responsive capture</li>
                    <li>• Bulk upload capabilities</li>
                  </ul>
                </CardContent>
              </Card>


              {/* Document Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">Documents</Badge>
                  </div>
                  <CardTitle>Document Storage</CardTitle>
                  <CardDescription>Secure document and file management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• PDF, image, and file upload</li>
                    <li>• Receipt and warranty storage</li>
                    <li>• Document categorization</li>
                    <li>• Search and filtering</li>
                    <li>• Cloud synchronization</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Property Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">Properties</Badge>
                  </div>
                  <CardTitle>Multi-Property Support</CardTitle>
                  <CardDescription>Manage multiple properties and locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Property creation and management</li>
                    <li>• Address autocomplete (Google Maps)</li>
                    <li>• Property-specific asset organization</li>
                    <li>• Floor plan integration</li>
                    <li>• Property sharing with others</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Export & Sharing */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-6 w-6 text-primary" />
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">Standard+</Badge>
                  </div>
                  <CardTitle>Export & Download</CardTitle>
                  <CardDescription>Flexible data export and sharing options</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• CSV/PDF asset exports</li>
                    <li>• Bulk file downloads</li>
                    <li>• Insurance report generation</li>
                    <li>• QR code sharing</li>
                    <li>• Collaborative access</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Advanced Features */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-6 w-6 text-primary" />
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">Premium</Badge>
                  </div>
                  <CardTitle>Advanced Features</CardTitle>
                  <CardDescription>Voice notes and damage documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Voice note recordings</li>
                    <li>• Post-damage documentation</li>
                    <li>• Professional services access</li>
                    <li>• Advanced reporting</li>
                    <li>• Priority support</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Types Tab */}
          <TabsContent value="user-types" className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Target User Groups & Use Cases</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">Homeowners</Badge>
                  </div>
                  <CardTitle>Homeowners</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Property & improvement documentation</li>
                    <li>• Insurance claim preparation</li>
                    <li>• Estate planning and inheritance</li>
                    <li>• Resale value documentation</li>
                    <li>• Moving protection</li>
                    <li>• Divorce asset division</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">Renters</Badge>
                  </div>
                  <CardTitle>Renters</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Move-in/move-out documentation</li>
                    <li>• Security deposit protection</li>
                    <li>• Personal property inventory</li>
                    <li>• Tenant rights documentation</li>
                    <li>• Renter's insurance support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">Business</Badge>
                  </div>
                  <CardTitle>Business Owners</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Commercial property documentation</li>
                    <li>• Equipment & inventory tracking</li>
                    <li>• Asset valuation for financing</li>
                    <li>• Compliance documentation</li>
                    <li>• Disaster recovery planning</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">Landlords</Badge>
                  </div>
                  <CardTitle>Landlords</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Multi-property management</li>
                    <li>• Tenant turnover documentation</li>
                    <li>• Maintenance and improvement tracking</li>
                    <li>• Rental property protection</li>
                    <li>• Investment property valuation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Subscription Tiers & Feature Access</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Basic Tier</Badge>
                  <CardTitle>Basic Features</CardTitle>
                  <CardDescription>10GB Storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Photo upload & gallery</li>
                    <li>• Basic AI valuation</li>
                    <li>• Document upload</li>
                    <li>• Single property</li>
                    <li>• Download all files</li>
                    <li>• Documentation checklists</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 w-fit mb-2">Standard Tier</Badge>
                  <CardTitle>Standard Features</CardTitle>
                  <CardDescription>50GB Storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• All Basic features +</li>
                    <li>• Video upload & recording</li>
                    <li>• Multiple properties</li>
                    <li>• Voice notes</li>
                    <li>• Export assets (CSV/PDF)</li>
                    <li>• Property sharing</li>
                    <li>• Post-damage documentation</li>
                    <li>• Priority support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 w-fit mb-2">Premium Tier</Badge>
                  <CardTitle>Premium Features</CardTitle>
                  <CardDescription>500GB Storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• All Standard features +</li>
                    <li>• Advanced AI features</li>
                    <li>• Professional services</li>
                    <li>• Advanced reporting</li>
                    <li>• Custom checklists</li>
                    <li>• Unlimited collaborators</li>
                    <li>• Premium support</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Technical Architecture</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frontend Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>React 18</strong> - UI framework</li>
                    <li>• <strong>TypeScript</strong> - Type safety</li>
                    <li>• <strong>Vite</strong> - Build tool</li>
                    <li>• <strong>Tailwind CSS</strong> - Styling</li>
                    <li>• <strong>Shadcn/UI</strong> - Component library</li>
                    <li>• <strong>React Router</strong> - Navigation</li>
                    <li>• <strong>React Hook Form</strong> - Form handling</li>
                    <li>• <strong>Lucide React</strong> - Icons</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backend & Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Supabase</strong> - Backend-as-a-Service</li>
                    <li>• <strong>PostgreSQL</strong> - Database</li>
                    <li>• <strong>Row Level Security</strong> - Data protection</li>
                    <li>• <strong>Edge Functions</strong> - Serverless logic</li>
                    <li>• <strong>Storage Buckets</strong> - File management</li>
                    <li>• <strong>Real-time subscriptions</strong></li>
                    <li>• <strong>Authentication</strong> - User management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>AuthContext</strong> - Authentication state</li>
                    <li>• <strong>SubscriptionContext</strong> - Feature access</li>
                    <li>• <strong>FeatureGuard</strong> - Component protection</li>
                    <li>• <strong>PhotoUpload</strong> - Media handling</li>
                    <li>• <strong>PropertyManagement</strong> - Property CRUD</li>
                    <li>• <strong>AIAnalysis</strong> - Asset recognition</li>
                    <li>• <strong>ExportService</strong> - Data export</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>External Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Google Maps API</strong> - Address autocomplete</li>
                    <li>• <strong>OpenAI API</strong> - AI features</li>
                    <li>• <strong>Stripe</strong> - Payment processing</li>
                    <li>• <strong>Email Services</strong> - Notifications</li>
                    <li>• <strong>Storage CDN</strong> - Media delivery</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">User Workflow & Navigation</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>New User Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">1. Landing Page</Badge>
                    <Badge variant="outline">2. Sign Up</Badge>
                    <Badge variant="outline">3. Email Verification</Badge>
                    <Badge variant="outline">4. Welcome Page</Badge>
                    <Badge variant="outline">5. Property Creation</Badge>
                    <Badge variant="outline">6. Asset Upload</Badge>
                    <Badge variant="outline">7. Dashboard Access</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Main Navigation Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Public Routes:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• / (Home/Landing)</li>
                        <li>• /features</li>
                        <li>• /pricing</li>
                        <li>• /about</li>
                        <li>• /contact</li>
                        <li>• /auth (Login/Signup)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Protected Routes:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• /welcome (Onboarding)</li>
                        <li>• /account (Dashboard)</li>
                        <li>• /account/properties</li>
                        <li>• /account/photos</li>
                        <li>• /account/videos</li>
                        <li>• /photo-upload</li>
                        <li>• /inventory</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Core User Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Asset Management:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Upload photos/videos</li>
                        <li>• Manual asset entry</li>
                        <li>• Receipt upload</li>
                        <li>• Value estimation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Organization:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Create properties</li>
                        <li>• Organize by rooms</li>
                        <li>• Categorize items</li>
                        <li>• Create folders</li>
                        <li>• Tag and search</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Export & Share:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Generate reports</li>
                        <li>• Export to CSV/PDF</li>
                        <li>• Download files</li>
                        <li>• Share property access</li>
                        <li>• QR code generation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Need More Technical Details?</h3>
              <p className="text-muted-foreground mb-4">
                This overview covers the main features and architecture. For implementation details, 
                database schema, or specific component documentation, please let me know what you need.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm">Component Documentation</Button>
                <Button variant="outline" size="sm">Database Schema</Button>
                <Button variant="outline" size="sm">API Endpoints</Button>
                <Button variant="outline" size="sm">Deployment Guide</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeaturesList;