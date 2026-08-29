import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  sampleAssetDocumentation,
  sampleAssetValues,
  sampleDemoBanner,
  sampleDocumentationChecklist,
  sampleEmergencyInstructions,
  sampleKnowledgeHub,
  sampleMfa,
  sampleQuickAdd,
  sampleSecureVault,
  sampleUtilityCards,
  sampleWelcome,
} from '@/data/sampleDashboardContent';
import {
  Eye,
  Home,
  Settings,
  FolderOpen,
  DollarSign,
  Check,
  ChevronDown,
  Shield,
  Users,
  Heart,
  FileDown,
  Download,
  AlertTriangle,
  LockKeyhole,
  ShieldCheck,
  ClipboardList,
  Plus,
} from 'lucide-react';

/**
 * Public, non-functional demo of the live dashboard.
 * Every interaction only explains what the real dashboard does.
 */
const SampleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [securityOpen, setSecurityOpen] = useState(false);

  const showDemoAlert = (_title: string, description: string) => {
    alert(description);
  };

  const DemoWelcomeBanner = () => (
    <div className="bg-gradient-to-r from-brand-blue to-brand-lightBlue p-6 rounded-lg text-white">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium">{sampleWelcome.greeting}</p>
          <h1 className="text-2xl font-bold mt-0.5">{sampleWelcome.heading}</h1>
          <p className="text-white/70 text-sm mt-2">{sampleWelcome.supporting}</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="text-white/90 font-medium text-sm bg-white/20 px-3 py-1 rounded-md">
            {sampleWelcome.accountLabel}
          </span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => showDemoAlert('Account Settings', 'Account Settings is where users manage profile information, notification preferences, and account security options.')}
              className="flex flex-col items-center justify-center gap-1 bg-white/15 hover:bg-white/25 transition-colors rounded-lg w-[72px] h-[56px] text-white/90 hover:text-white"
              title="Account Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="text-[10px] font-medium leading-tight">Settings</span>
            </button>
            <button
              onClick={() => showDemoAlert('Properties', 'Properties is where users keep the homes, rentals, and other places their documentation belongs to.')}
              className="flex flex-col items-center justify-center gap-1 bg-white/15 hover:bg-white/25 transition-colors rounded-lg w-[72px] h-[56px] text-white/90 hover:text-white"
              title="Properties"
            >
              <Home className="h-4 w-4" />
              <span className="text-[10px] font-medium leading-tight">Properties</span>
            </button>
            <button
              onClick={() => showDemoAlert('Authorized Users', 'Authorized Users lets an account owner share access with people they trust, using Full Access or Read Only roles.')}
              className="flex flex-col items-center justify-center gap-1 bg-white/15 hover:bg-white/25 transition-colors rounded-lg w-[72px] h-[56px] text-white/90 hover:text-white"
              title="Authorized Users"
            >
              <Users className="h-4 w-4" />
              <span className="text-[10px] font-medium leading-tight">Users</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DemoSecurityProgressBar = () => {
    const demoTasks = [
      { label: 'Complete Your Profile', completed: true, phase: 1 },
      { label: 'Create Your First Property', completed: true, phase: 1 },
      { label: 'Upload Your First Photos or Videos', completed: true, phase: 1 },
      { label: 'Add an Authorized User', completed: true, phase: 2 },
      { label: 'Enable Multi-Factor Authentication', completed: true, phase: 2 },
      { label: 'Upload Important Documents & Records', completed: false, phase: 2 },
      { label: 'Enable Secure Vault Protection', completed: false, phase: 3 },
      { label: 'Add Legacy Locker & Digital Access Details', completed: false, phase: 3 },
      { label: 'Assign a Legacy Admin', completed: false, phase: 3 },
    ];
    const completedCount = demoTasks.filter(t => t.completed).length;
    const progressPercent = Math.round((completedCount / demoTasks.length) * 100);

    const getPhaseLabel = (phase: number) => {
      if (phase === 1) return 'Getting Started';
      if (phase === 2) return 'Next Steps';
      return 'Advanced';
    };

    return (
      <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setSecurityOpen(!securityOpen)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">Security Progress</span>
            <div className="inline-flex items-center gap-1 rounded-full border bg-green-50 border-green-200 px-2 py-0.5">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-700 font-medium">Verified</span>
            </div>
            <Progress value={progressPercent} className="h-1.5 flex-1 min-w-0" />
          </div>
          <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${securityOpen ? '' : '-rotate-90'}`} />
        </button>

        {securityOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-border">
            <p className="text-[11px] text-muted-foreground mb-2">Overall account protection status</p>
            <p className="text-xs text-muted-foreground mb-3">
              Complete any 5 of the following steps to reach Verified status:
            </p>
            <div className="space-y-2">
              {demoTasks.map((task, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded mt-0.5 flex-shrink-0",
                    task.completed
                      ? "bg-primary text-primary-foreground"
                      : "border border-muted-foreground/40 text-muted-foreground"
                  )}>
                    {task.completed ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-[10px] font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "text-sm",
                      task.completed ? "line-through text-muted-foreground" : "text-foreground"
                    )}>
                      {task.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-2">
                      {getPhaseLabel(task.phase)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border">
              {completedCount} of {demoTasks.length} completed · Complete any 5 milestones to reach Verified status
            </p>
          </div>
        )}
      </div>
    );
  };

  /** Demo mirror of the live full-width Quick Add bar. */
  const DemoQuickAdd = () => (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div className="md:col-span-2 py-1">
          <div className="border-t border-border mb-4" />
          <Button
            type="button"
            onClick={() => showDemoAlert('Quick Add', sampleQuickAdd.explainer)}
            className="w-full rounded-xl bg-background border-2 border-brand-blue hover:bg-brand-blue/5 text-brand-blue py-2.5 px-4 flex flex-col items-center gap-0.5"
          >
            <span className="flex items-center gap-1.5 text-base font-bold">
              <Plus className="h-4 w-4" />
              {sampleQuickAdd.label}
            </span>
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-1.5">
            {sampleQuickAdd.supporting}
          </p>
          <div className="border-t border-border mt-4" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        {sampleQuickAdd.explainer}
      </TooltipContent>
    </Tooltip>
  );

  const DemoCollapsibleBar = ({ icon, label, explainer, fullWidth = true }: {
    icon: React.ReactNode; label: string; explainer: string; fullWidth?: boolean;
  }) => (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div className={fullWidth ? 'md:col-span-2' : undefined}>
          <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => showDemoAlert(label, explainer)}
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
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        {explainer}
      </TooltipContent>
    </Tooltip>
  );

  const DemoGridCard = ({ icon, title, description, tags, actionLabel, color, explainer }: {
    icon: React.ReactNode; title: string; description: string; tags?: string[];
    actionLabel: string; color: 'red' | 'yellow'; explainer: string;
  }) => {
    const colorStyles = {
      red: { border: 'border-l-red-500', iconBg: 'bg-red-50', iconText: 'text-red-600', btnBorder: 'border-red-200', btnText: 'text-red-700', btnHover: 'hover:bg-red-50' },
      yellow: { border: 'border-l-yellow-500', iconBg: 'bg-yellow-50', iconText: 'text-yellow-600', btnBorder: 'border-yellow-200', btnText: 'text-yellow-700', btnHover: 'hover:bg-yellow-50' },
    } as const;
    const c = colorStyles[color];

    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Card className={`border-l-4 ${c.border} hover:shadow-lg transition-all cursor-pointer bg-white`} onClick={() => showDemoAlert(title, explainer)}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <div className={c.iconText}>{icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground">{title}</h3>
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
          {explainer}
        </TooltipContent>
      </Tooltip>
    );
  };

  const DemoUtilityCard = ({ icon, title, description, actionLabel, explainer }: {
    icon: React.ReactNode; title: string; description: string; actionLabel: string; explainer: string;
  }) => (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Card className="border-l-4 border-l-orange-500 bg-white hover:shadow-lg transition-all cursor-pointer" onClick={() => showDemoAlert(title, explainer)}>
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
        {explainer}
      </TooltipContent>
    </Tooltip>
  );

  const utilityIcons: Record<string, React.ReactNode> = {
    'export-account-archive': <FileDown className="h-5 w-5" />,
    'download-all-files': <Download className="h-5 w-5" />,
    'post-damage-report': <AlertTriangle className="h-5 w-5" />,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Sample Dashboard | Asset Safe"
        description="Preview how Asset Safe organizes asset documentation, everyday household information, and a single encrypted Secure Vault."
        canonicalUrl="https://getassetsafe.com/sample-dashboard"
      />
      <Navbar />

      <div className="flex-grow py-8 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          {/* Demo Banner */}
          <Alert className="mb-6 border-brand-blue bg-brand-blue/5">
            <Eye className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>
                <strong>Sample Dashboard</strong> — Hover over or click sections to learn what each part of the dashboard does. Interactive features are shown for demonstration only.
              </span>
              <Button onClick={() => navigate('/pricing')} size="sm" className="bg-brand-green hover:bg-brand-green/90">
                Get Started
              </Button>
            </AlertDescription>
          </Alert>

          <div className="mb-6"><DemoWelcomeBanner /></div>

          <div className="mb-6"><DemoSecurityProgressBar /></div>

          <TooltipProvider>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Quick Add shortcut / visual divider */}
                <DemoQuickAdd />

                {/* Row 1: Red */}
                <DemoGridCard
                  icon={<FolderOpen className="h-6 w-6" />}
                  title={sampleAssetDocumentation.title}
                  description={sampleAssetDocumentation.description}
                  tags={sampleAssetDocumentation.tags}
                  actionLabel={sampleAssetDocumentation.actionLabel}
                  color="red"
                  explainer={sampleAssetDocumentation.explainer}
                />
                <DemoGridCard
                  icon={<Heart className="h-6 w-6" />}
                  title={sampleKnowledgeHub.title}
                  description={sampleKnowledgeHub.description}
                  tags={sampleKnowledgeHub.tags}
                  actionLabel={sampleKnowledgeHub.actionLabel}
                  color="red"
                  explainer={sampleKnowledgeHub.explainer}
                />

                {/* Secure Vault — grouped wrapper with a single inner destination */}
                <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => showDemoAlert(sampleSecureVault.title, sampleSecureVault.explainer)}
                        className="w-full text-left px-5 py-4 flex items-center gap-3 border-b border-amber-200/60 hover:bg-amber-100/40 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-amber-900">🔒 {sampleSecureVault.title}</p>
                          <p className="text-xs text-amber-700 mt-0.5">{sampleSecureVault.supporting}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase tracking-wide border border-amber-200 flex-shrink-0">
                          <LockKeyhole className="h-3 w-3 text-emerald-600" />
                          {sampleSecureVault.badge}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-sm">
                      {sampleSecureVault.explainer}
                    </TooltipContent>
                  </Tooltip>
                  <div className="p-4">
                    <DemoGridCard
                          icon={<Shield className="h-6 w-6" />}
                          title={sampleSecureVault.inner.title}
                          description={sampleSecureVault.inner.description}
                          actionLabel={sampleSecureVault.inner.actionLabel}
                          color="yellow"
                          explainer={sampleSecureVault.explainer}
                    />
                  </div>
                </div>

                {/* Documentation Checklist */}
                <DemoCollapsibleBar
                  icon={<ClipboardList className="h-4 w-4 text-primary" />}
                  label={sampleDocumentationChecklist.label}
                  explainer={sampleDocumentationChecklist.explainer}
                />

                {/* MFA */}
                <DemoCollapsibleBar
                  icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                  label={sampleMfa.label}
                  explainer={sampleMfa.explainer}
                />

                {/* Asset Values */}
                <DemoCollapsibleBar
                  icon={<DollarSign className="h-4 w-4 text-primary" />}
                  label={sampleAssetValues.label}
                  explainer={sampleAssetValues.explainer}
                />

                {/* Emergency Instructions */}
                <DemoCollapsibleBar
                  icon={<AlertTriangle className="h-4 w-4 text-primary" />}
                  label={sampleEmergencyInstructions.label}
                  explainer={sampleEmergencyInstructions.explainer}
                />
              </div>

              {/* Bottom Utility Row: Orange */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleUtilityCards.map((card) => (
                  <DemoUtilityCard
                    key={card.key}
                    icon={utilityIcons[card.key]}
                    title={card.title}
                    description={card.description}
                    actionLabel={card.actionLabel}
                    explainer={card.explainer}
                  />
                ))}
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
