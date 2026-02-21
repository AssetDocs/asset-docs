import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Eye,
  Home,
  Camera,
  FileText,
  FileImage,
  Settings,
  Plus,
  HardDrive,
  BarChart3,
  DollarSign,
  FolderOpen,
  Lock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Key,
  Users,
  FileCheck,
  Heart,
  Wrench,
  FileDown,
  Download,
  AlertTriangle,
  LockKeyhole,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';

const SampleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [storageOpen, setStorageOpen] = useState(false);

  const showDemoAlert = (title: string, description: string) => {
    alert(`Asset Safe says\n\n${title}\n\n${description}`);
  };

  // Demo Welcome Banner
  const DemoWelcomeBanner = () => (
    <div className="bg-gradient-to-r from-brand-blue to-brand-lightBlue p-6 rounded-lg text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold">Welcome, Demo User!</h1>
        <span className="text-white/90 font-medium text-sm bg-white/20 px-3 py-1 rounded-md">
          Account #: DEMO-12345
        </span>
      </div>
    </div>
  );

  // Demo Account Stats
  const DemoAccountHeader = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showDemoAlert('Total Items', 'This shows the total number of items you have documented across all properties, including photos, videos, documents, and inventory items.')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-brand-blue">247</p>
            </div>
            <BarChart3 className="h-8 w-8 text-brand-blue" />
          </div>
        </CardContent>
      </Card>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showDemoAlert('Total Value', 'The estimated total value of all your documented assets. Helps you understand coverage needs and provides documentation for insurance claims.')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-emerald-600">$48,329</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showDemoAlert('Properties', 'The number of property profiles you have created. Each property can be documented separately with its own photos, videos, and inventory.')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Properties</p>
              <p className="text-2xl font-bold text-brand-blue">3</p>
            </div>
            <Home className="h-8 w-8 text-brand-blue" />
          </div>
        </CardContent>
      </Card>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showDemoAlert('Storage Used', 'Your current storage usage. Upgrade your plan for additional storage space.')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold text-orange-600">2.4 GB</p>
            </div>
            <FolderOpen className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Demo Storage Dashboard
  const DemoStorageDashboard = () => (
    <Collapsible open={storageOpen} onOpenChange={setStorageOpen} className="mb-6">
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-brand-blue" />
          <h3 className="font-semibold text-lg">Storage Usage</h3>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {storageOpen ? (
              <><span className="mr-2 text-sm">Hide Details</span><ChevronUp className="h-4 w-4" /></>
            ) : (
              <><span className="mr-2 text-sm">Show Details</span><ChevronDown className="h-4 w-4" /></>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cursor-pointer" onClick={() => showDemoAlert('Storage Quota', 'Monitor your storage usage and available space. Upgrade your subscription for more storage.')}>
            <CardHeader><CardTitle className="flex items-center"><FolderOpen className="h-5 w-5 mr-2 text-brand-blue" />Storage Quota</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Used</span><span className="font-semibold">2.4 GB of 5 GB</span></div>
                <Progress value={48} className="h-2" />
                <p className="text-xs text-muted-foreground">48% of storage used</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => showDemoAlert('Storage Breakdown', 'See how your storage is distributed across photos, videos, and documents.')}>
            <CardHeader><CardTitle className="flex items-center"><BarChart3 className="h-5 w-5 mr-2 text-brand-blue" />Storage Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Camera className="h-4 w-4 text-blue-500" /><span className="text-sm">Photos</span></div><span className="text-sm font-semibold">1.2 GB</span></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><FileImage className="h-4 w-4 text-purple-500" /><span className="text-sm">Videos</span></div><span className="text-sm font-semibold">0.8 GB</span></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-500" /><span className="text-sm">Documents</span></div><span className="text-sm font-semibold">0.4 GB</span></div>
            </CardContent>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  // Demo Security Progress
  const DemoSecurityProgress = () => (
    <Card className="cursor-pointer mb-6" onClick={() => showDemoAlert('Security Progress', 'Track your account security setup. Complete all steps—email verification, 2FA, property profile, and uploads—to reach Verified+ status and unlock the full protection score.')}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCheck className="h-5 w-5 mr-2 text-brand-blue" />
          Security Progress
        </CardTitle>
        <CardDescription>Track your account verification milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><span className="text-sm font-medium">Email Verified</span></div>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800">Complete</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><span className="text-sm font-medium">Property Profile Created</span></div>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800">Complete</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-yellow-600" /><span className="text-sm font-medium">Two-Factor Authentication</span></div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-muted-foreground" /><span className="text-sm font-medium">Upload Milestone (10 items)</span></div>
            <Badge variant="outline" className="bg-muted text-muted-foreground">Not Started</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Demo collapsible bar (static, click shows alert)
  const DemoCollapsibleBar = ({ icon, label, alertTitle, alertDescription }: {
    icon: React.ReactNode; label: string; alertTitle: string; alertDescription: string;
  }) => (
    <div className="md:col-span-2">
      <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => showDemoAlert(alertTitle, alertDescription)}
          className="w-full px-6 py-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <span className="text-sm font-semibold text-foreground">{label}</span>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground -rotate-90" />
        </button>
      </div>
    </div>
  );

  // Reusable demo grid card matching DashboardGridCard style
  const DemoGridCard = ({ icon, title, description, tags, actionLabel, color, badge, badgeIcon, alertTitle, alertDescription }: {
    icon: React.ReactNode; title: string; description: string; tags?: string[]; actionLabel: string;
    color: string; badge?: string; badgeIcon?: React.ReactNode; alertTitle: string; alertDescription: string;
  }) => {
    const colorStyles: Record<string, { border: string; iconBg: string; iconText: string; btnBorder: string; btnText: string; btnHover: string }> = {
      red: { border: 'border-l-red-500', iconBg: 'bg-red-50', iconText: 'text-red-600', btnBorder: 'border-red-200', btnText: 'text-red-700', btnHover: 'hover:bg-red-50' },
      yellow: { border: 'border-l-yellow-500', iconBg: 'bg-yellow-50', iconText: 'text-yellow-600', btnBorder: 'border-yellow-200', btnText: 'text-yellow-700', btnHover: 'hover:bg-yellow-50' },
      green: { border: 'border-l-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', btnBorder: 'border-emerald-200', btnText: 'text-emerald-700', btnHover: 'hover:bg-emerald-50' },
      blue: { border: 'border-l-blue-500', iconBg: 'bg-blue-50', iconText: 'text-blue-600', btnBorder: 'border-blue-200', btnText: 'text-blue-700', btnHover: 'hover:bg-blue-50' },
      orange: { border: 'border-l-orange-500', iconBg: 'bg-orange-50', iconText: 'text-orange-600', btnBorder: 'border-orange-200', btnText: 'text-orange-700', btnHover: 'hover:bg-orange-50' },
    };
    const c = colorStyles[color] || colorStyles.blue;

    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Card className={`border-l-4 ${c.border} hover:shadow-lg transition-all cursor-pointer bg-white`} onClick={() => showDemoAlert(alertTitle, alertDescription)}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <div className={c.iconText}>{icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-foreground">{title}</h3>
                    {badge && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase tracking-wide border border-amber-200">
                        {badgeIcon}{badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  {tags && tags.length > 0 && (
                    <p className="mt-2 text-xs font-medium text-muted-foreground">{tags.join(' · ')}</p>
                  )}
                </div>
              </div>
              <Button variant="outline" className={`w-full mt-4 font-medium ${c.btnBorder} ${c.btnText} ${c.btnHover}`}>
                {actionLabel}
              </Button>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          {alertDescription}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Compact orange utility card
  const DemoUtilityCard = ({ icon, title, description, actionLabel, alertTitle, alertDescription }: {
    icon: React.ReactNode; title: string; description: string; actionLabel: string; alertTitle: string; alertDescription: string;
  }) => (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Card className="border-l-4 border-l-orange-500 bg-white hover:shadow-lg transition-all cursor-pointer" onClick={() => showDemoAlert(alertTitle, alertDescription)}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="text-orange-600">{icon}</div>
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 h-8 text-xs font-medium">
              {actionLabel}
            </Button>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        {alertDescription}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Sample Dashboard Preview | Asset Safe"
        description="Preview the Asset Safe dashboard before signing up. See how property documentation, inventory tracking, and security features work in action."
        keywords="asset safe demo, sample dashboard, property documentation preview, home inventory demo, asset safe features preview"
        canonicalUrl="https://www.getassetsafe.com/sample-dashboard"
      />
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          {/* Demo Banner */}
          <Alert className="mb-6 border-brand-blue bg-brand-blue/5">
            <Eye className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>
                <strong>Sample Dashboard</strong> — Hover over or click any tile to learn what it does. Features are disabled for demonstration.
              </span>
              <Button onClick={() => navigate('/pricing')} size="sm" className="bg-brand-green hover:bg-brand-green/90">
                Start Your Free Trial
              </Button>
            </AlertDescription>
          </Alert>

          {/* Welcome Banner */}
          <div className="mb-6"><DemoWelcomeBanner /></div>

          {/* Account Stats */}
          <DemoAccountHeader />

          {/* Storage Dashboard */}
          <DemoStorageDashboard />

          {/* Security Progress */}
          <DemoSecurityProgress />

          {/* Main Dashboard Grid */}
          <TooltipProvider>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Row 1: Red */}
                <DemoGridCard
                  icon={<FolderOpen className="h-6 w-6" />}
                  title="Asset Documentation"
                  description="Claim-ready proof for your home and belongings."
                  tags={['Photos', 'Videos', 'Documents', 'Records']}
                  actionLabel="Open Documentation"
                  color="red"
                  alertTitle="Asset Documentation"
                  alertDescription="Upload and organize photos, videos, documents, and records for all your properties. This is your central hub for claim-ready proof—organized by room, category, or property. Includes Scan to PDF, receipts, warranties, and insurance documents."
                />
                <DemoGridCard
                  icon={<Heart className="h-6 w-6" />}
                  title="Family Archive"
                  description="Everyday life, organized and protected."
                  tags={['VIP Contacts', 'Voice Notes', 'Trusted Pros', 'Notes & Traditions', 'Family Recipes']}
                  actionLabel="Open Family Archive"
                  color="red"
                  alertTitle="Family Archive"
                  alertDescription="Store the personal details that matter most. Keep VIP contacts (attorneys, insurance agents, financial advisors), record voice notes, save trusted service professionals, preserve family traditions and notes, and catalog cherished family recipes—all in one secure place."
                />

                {/* Documentation Checklist collapsible bar */}
                <DemoCollapsibleBar
                  icon={<ClipboardList className="h-4 w-4 text-primary" />}
                  label="Documentation Checklist"
                  alertTitle="Documentation Checklist"
                  alertDescription="Track your documentation progress across all properties. This checklist helps ensure you've captured photos, videos, documents, and inventory for every room and category—so nothing is missed when you need it most."
                />

                {/* Row 2: Yellow */}
                <DemoGridCard
                  icon={<Shield className="h-6 w-6" />}
                  title="Legacy Locker"
                  description="Guidance and access when you can't be there."
                  tags={['Instructions', 'Access', 'Recovery']}
                  actionLabel="Manage Legacy"
                  color="yellow"
                  badge="Encrypted"
                  badgeIcon={<LockKeyhole className="h-3 w-3 text-emerald-600" />}
                  alertTitle="Legacy Locker"
                  alertDescription="A password-protected vault for your most sensitive legacy information. Store estate planning documents, wills, trust details, executor instructions, and delegate access for loved ones. Only you and your designated recovery delegates can access this section."
                />
                <DemoGridCard
                  icon={<Key className="h-6 w-6" />}
                  title="Password Catalog"
                  description="Your most private information, fully encrypted."
                  tags={['Websites', 'Passwords', 'Sensitive Data']}
                  actionLabel="Open Catalog"
                  color="yellow"
                  badge="Encrypted"
                  badgeIcon={<LockKeyhole className="h-3 w-3 text-emerald-600" />}
                  alertTitle="Password Catalog"
                  alertDescription="Securely store website credentials, sensitive account information, and private data behind an additional master password. All entries are encrypted and only accessible by authorized users."
                />

                {/* MFA Dropdown collapsible bar */}
                <DemoCollapsibleBar
                  icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                  label="Multi-Factor Authentication"
                  alertTitle="Multi-Factor Authentication"
                  alertDescription="Enable and manage two-factor authentication (TOTP) for your account. This adds an extra layer of security to your Legacy Locker and Password Catalog, requiring a code from your authenticator app each session."
                />

                {/* Row 3: Green */}
                <DemoGridCard
                  icon={<Wrench className="h-6 w-6" />}
                  title="Insights & Tools"
                  description="Track values, manage repairs, and organize property details."
                  tags={['Smart Calendar', 'Asset Values', 'Manual Entry', 'Upgrades & Repairs', 'Source Websites', 'Paint Codes']}
                  actionLabel="Open Tools"
                  color="green"
                  alertTitle="Insights & Tools"
                  alertDescription="A toolkit for managing your property details. Track total asset values across properties, manually add inventory items, log home upgrades and repairs, save purchase source websites for warranty reference, and store paint codes for every room."
                />

                {/* Row 4: Blue */}
                <DemoGridCard
                  icon={<Home className="h-6 w-6" />}
                  title="Property Profiles"
                  description="Keep track of your properties and manage important details."
                  tags={['All Homes', 'Vacation Houses', 'Rentals']}
                  actionLabel="View Profiles"
                  color="blue"
                  alertTitle="Property Profiles"
                  alertDescription="Create unlimited property profiles for your homes, vacation houses, rentals, and storage units. Each property stores its address, square footage, year built, estimated value, and links to all associated photos, videos, documents, and inventory."
                />

                {/* Asset Values collapsible bar */}
                <DemoCollapsibleBar
                  icon={<DollarSign className="h-4 w-4 text-primary" />}
                  label="Asset Values"
                  alertTitle="Asset Values"
                  alertDescription="View a high-level financial summary of all your documented assets. See total values across properties, itemized breakdowns by category, and track changes over time to ensure your coverage stays up to date."
                />

                <DemoGridCard
                  icon={<Settings className="h-6 w-6" />}
                  title="Account Settings"
                  description="Manage your account details, security, and preferences."
                  tags={['Plan', 'Billing', 'Alerts']}
                  actionLabel="Account Settings"
                  color="blue"
                  alertTitle="Account Settings"
                  alertDescription="Control your subscription plan, billing details, notification preferences, profile information, and security settings including two-factor authentication and backup codes."
                />
                <DemoGridCard
                  icon={<Users className="h-6 w-6" />}
                  title="Access & Activity"
                  description="Authorized users and recent actions."
                  tags={['Invite Users', 'Roles', 'Activity Log']}
                  actionLabel="Manage Access & Activity"
                  color="blue"
                  alertTitle="Access & Activity"
                  alertDescription="Invite contributors (family members, professionals) to your account with role-based permissions. Monitor all account activity with a detailed log of uploads, edits, logins, and access events."
                />

                {/* Emergency Instructions collapsible bar */}
                <DemoCollapsibleBar
                  icon={<AlertTriangle className="h-4 w-4 text-primary" />}
                  label="Emergency Instructions"
                  alertTitle="Emergency Instructions"
                  alertDescription="Prepare step-by-step instructions for your family in case of emergency. Define primary and secondary contacts, list first actions to take, document property access details, and store professional contacts—so your loved ones know exactly what to do."
                />
              </div>

              {/* Bottom Utility Row: Orange */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DemoUtilityCard
                  icon={<FileDown className="h-5 w-5" />}
                  title="Export Assets"
                  description="Generate a PDF summary of your assets."
                  actionLabel="Export Assets"
                  alertTitle="Export Assets"
                  alertDescription="Generate a comprehensive PDF report of all your documented assets including photos, descriptions, values, and property details. Perfect for sharing with insurance agents, attorneys, or family members."
                />
                <DemoUtilityCard
                  icon={<Download className="h-5 w-5" />}
                  title="Download All Files"
                  description="Download all files in a single ZIP."
                  actionLabel="Download All"
                  alertTitle="Download All Files"
                  alertDescription="Download every photo, video, and document you've uploaded in a single ZIP file. Great for creating local backups or transferring to another storage service."
                />
                <DemoUtilityCard
                  icon={<AlertTriangle className="h-5 w-5" />}
                  title="Post Damage Report"
                  description="Document damage and submit post-incident details."
                  actionLabel="Post Report"
                  alertTitle="Post Damage Report"
                  alertDescription="After an incident (fire, flood, theft, storm), use this tool to document damage for insurance claims. Upload photos and videos of affected areas, describe the damage, select impacted rooms, and track your claim progress."
                />
              </div>
            </div>
          </TooltipProvider>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SampleDashboard;
