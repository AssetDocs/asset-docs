import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminUsers from './AdminUsers';
import AdminQuickStats from './AdminQuickStats';
import EnhancedCRM from './EnhancedCRM';
import StripeReconciliation from './StripeReconciliation';
import SecurityChecklist from './SecurityChecklist';
import AdminLegalAgreements from '@/pages/AdminLegalAgreements';
import DevTeamManagement from './DevTeamManagement';
import MarketSizing from './MarketSizing';
import AdminDocuments from './AdminDocuments';
import { 
  Users, 
  CreditCard, 
  Shield, 
  Settings, 
  FileText, 
  BarChart,
  Handshake,
  UserPlus,
  TrendingUp,
  FolderOpen
} from 'lucide-react';

const AdminOwnerWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 md:grid-cols-10 gap-2 h-auto p-1">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="dev-team" className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Dev Team
        </TabsTrigger>
        <TabsTrigger value="billing" className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Billing
        </TabsTrigger>
        <TabsTrigger value="crm" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          CRM
        </TabsTrigger>
        <TabsTrigger value="market" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          TAM/SAM/SOM
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="legal" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Legal
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <AdminQuickStats />
        
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
            <CardHeader>
              <Users className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>View users, subscriptions, and gift orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Users</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('dev-team')}>
            <CardHeader>
              <UserPlus className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Dev Team</CardTitle>
              <CardDescription>Invite and manage development team members</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Team</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('crm')}>
            <CardHeader>
              <BarChart className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>CRM Dashboard</CardTitle>
              <CardDescription>Leads, contacts, and customer analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View CRM</Button>
            </CardContent>
          </Card>
        </div>

        {/* Business Opportunities Section */}
        <Card className="mt-6">
          <CardHeader>
            <Handshake className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Business Opportunities & Partnerships</CardTitle>
            <CardDescription>Strategic partnership proposals and business development materials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/compass-partnership')}
              >
                <span className="font-semibold">Compass Realty Partnership</span>
                <span className="text-sm text-muted-foreground">Real estate partnership proposal</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/home-improvement-partnership')}
              >
                <span className="font-semibold">Home Improvement Partnership</span>
                <span className="text-sm text-muted-foreground">Lowe's retail strategy</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/partnership')}
              >
                <span className="font-semibold">RE/MAX Partnership</span>
                <span className="text-sm text-muted-foreground">Real estate partnership proposal</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/aha-partnership')}
              >
                <span className="font-semibold">American Homeowners Association</span>
                <span className="text-sm text-muted-foreground">AHA Member Protection Vault</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/ara-partnership')}
              >
                <span className="font-semibold">American Real Estate Association</span>
                <span className="text-sm text-muted-foreground">ARA Member Protection Benefit</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/b2b-opportunities')}
              >
                <span className="font-semibold">B2B Opportunities</span>
                <span className="text-sm text-muted-foreground">Strategic partnership categories</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/dev-partner-strategy')}
              >
                <span className="font-semibold">Dev Partner Strategy</span>
                <span className="text-sm text-muted-foreground">Backend stability & ownership brief</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/habitat-partnership')}
              >
                <span className="font-semibold">Habitat for Humanity</span>
                <span className="text-sm text-muted-foreground">Homeownership Protection & Resilience</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/enterprise')}
              >
                <span className="font-semibold">Enterprise White-Label</span>
                <span className="text-sm text-muted-foreground">Organizations & group deployments</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start text-left"
                onClick={() => navigate('/admin/photographer-interest')}
              >
                <span className="font-semibold">Photographer Network</span>
                <span className="text-sm text-muted-foreground">Trusted photographer interest form</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <AdminUsers />
      </TabsContent>

      <TabsContent value="dev-team">
        <DevTeamManagement />
      </TabsContent>

      <TabsContent value="billing">
        <StripeReconciliation />
      </TabsContent>

      <TabsContent value="crm">
        <EnhancedCRM />
      </TabsContent>

      <TabsContent value="market">
        <MarketSizing />
      </TabsContent>

      <TabsContent value="security">
        <SecurityChecklist />
      </TabsContent>

      <TabsContent value="legal">
        <AdminLegalAgreements />
      </TabsContent>

      <TabsContent value="documents">
        <AdminDocuments />
      </TabsContent>

      <TabsContent value="settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/account/settings')}>
                Open Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Handshake className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Partnership Materials</CardTitle>
              <CardDescription>Access partnership presentations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/admin/compass-partnership')}>
                Compass Realty Proposal
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/admin/home-improvement-partnership')}>
                Home Improvement Partnership
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AdminOwnerWorkspace;
