import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Zap, 
  Mail, 
  Key, 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Server,
  CreditCard,
  Users,
  FileText,
  Lock,
  Cloud
} from 'lucide-react';

// Edge Functions categorized by purpose
const edgeFunctions = [
  // Authentication & User Management
  { name: 'send-auth-email', category: 'Auth', purpose: 'Custom auth emails (magic links, verification)', status: 'active', verifyJwt: false },
  { name: 'send-welcome-email', category: 'Auth', purpose: 'Welcome email on signup', status: 'active', verifyJwt: false },
  { name: 'send-verification-email', category: 'Auth', purpose: 'Email verification reminders', status: 'active', verifyJwt: false },
  { name: 'check-verification', category: 'Auth', purpose: 'Check user verification status', status: 'active', verifyJwt: false },
  { name: 'verify-admin-password', category: 'Auth', purpose: 'Admin dashboard access control', status: 'active', verifyJwt: false },
  { name: 'verify-construction-password', category: 'Auth', purpose: 'Construction mode password gate', status: 'active', verifyJwt: false },
  { name: 'delete-account', category: 'Auth', purpose: 'Full account deletion with cleanup', status: 'active', verifyJwt: true },

  // Subscription & Billing
  { name: 'check-subscription', category: 'Billing', purpose: 'Validate user subscription status', status: 'active', verifyJwt: true },
  { name: 'create-checkout', category: 'Billing', purpose: 'Create Stripe checkout session', status: 'active', verifyJwt: true },
  { name: 'customer-portal', category: 'Billing', purpose: 'Stripe customer portal redirect', status: 'active', verifyJwt: true },
  { name: 'stripe-webhook', category: 'Billing', purpose: 'Process Stripe webhook events', status: 'active', verifyJwt: false },
  { name: 'sync-subscription', category: 'Billing', purpose: 'Sync subscription post-checkout', status: 'active', verifyJwt: false },
  { name: 'cancel-subscription', category: 'Billing', purpose: 'Handle subscription cancellation', status: 'active', verifyJwt: true },
  { name: 'payment-history', category: 'Billing', purpose: 'Fetch user payment history', status: 'active', verifyJwt: true },
  { name: 'validate-lifetime-code', category: 'Billing', purpose: 'Validate ASL2025 lifetime codes', status: 'active', verifyJwt: false },

  // Gift Subscriptions
  { name: 'create-gift-checkout', category: 'Gifts', purpose: 'Create gift subscription checkout', status: 'active', verifyJwt: false },
  { name: 'send-gift-email', category: 'Gifts', purpose: 'Send gift notification email', status: 'active', verifyJwt: false },
  { name: 'check-gift-reminders', category: 'Gifts', purpose: 'Cron: Gift redemption reminders', status: 'active', verifyJwt: false },
  { name: 'track-gift-login', category: 'Gifts', purpose: 'Track first login after gift claim', status: 'active', verifyJwt: true },

  // Payment Notifications
  { name: 'send-payment-receipt', category: 'Payments', purpose: 'Send payment receipt to user', status: 'active', verifyJwt: false },
  { name: 'send-payment-receipt-internal', category: 'Payments', purpose: 'Internal payment receipt copy', status: 'active', verifyJwt: false },
  { name: 'send-payment-reminder', category: 'Payments', purpose: 'Failed payment reminder', status: 'active', verifyJwt: false },
  { name: 'check-payment-failures', category: 'Payments', purpose: 'Cron: Check for failed payments', status: 'active', verifyJwt: false },

  // Legacy Locker Recovery
  { name: 'check-grace-period-expiry', category: 'Recovery', purpose: 'Legacy Locker grace period check', status: 'active', verifyJwt: false },

  // Contributors & Delegates
  { name: 'send-contributor-invitation', category: 'Contributors', purpose: 'Invite contributors to account', status: 'active', verifyJwt: true },
  { name: 'accept-contributor-invitation', category: 'Contributors', purpose: 'Accept contributor invite', status: 'active', verifyJwt: true },
  { name: 'send-delegate-access-email', category: 'Contributors', purpose: 'Notify delegate of access', status: 'active', verifyJwt: false },
  { name: 'acknowledge-delegate-access', category: 'Contributors', purpose: 'Delegate acknowledgment', status: 'active', verifyJwt: true },
  { name: 'notify-visitor-access', category: 'Contributors', purpose: 'Notify on visitor access grant', status: 'active', verifyJwt: true },

  // Recovery & Deletion Requests
  { name: 'submit-recovery-request', category: 'Recovery', purpose: 'Submit account recovery request', status: 'active', verifyJwt: true },
  { name: 'respond-recovery-request', category: 'Recovery', purpose: 'Owner responds to recovery', status: 'active', verifyJwt: true },
  { name: 'send-recovery-request-email', category: 'Recovery', purpose: 'Email recovery request notification', status: 'active', verifyJwt: false },
  { name: 'send-recovery-approved-email', category: 'Recovery', purpose: 'Recovery approved notification', status: 'active', verifyJwt: false },
  { name: 'send-recovery-rejected-email', category: 'Recovery', purpose: 'Recovery rejected notification', status: 'active', verifyJwt: false },
  { name: 'submit-deletion-request', category: 'Recovery', purpose: 'Request account deletion', status: 'active', verifyJwt: true },
  { name: 'respond-deletion-request', category: 'Recovery', purpose: 'Respond to deletion request', status: 'active', verifyJwt: true },
  { name: 'send-deletion-confirmation', category: 'Recovery', purpose: 'Deletion confirmed email', status: 'active', verifyJwt: false },

  // Storage Management
  { name: 'add-storage', category: 'Storage', purpose: 'Purchase additional storage (5GB)', status: 'active', verifyJwt: true },
  { name: 'add-storage-25gb', category: 'Storage', purpose: 'Purchase 25GB storage bundle', status: 'active', verifyJwt: true },
  { name: 'send-storage-warning', category: 'Storage', purpose: 'Storage limit warning email', status: 'active', verifyJwt: false },

  // Property & Data Lookups
  { name: 'mls-property-lookup', category: 'Data', purpose: 'MLS property data lookup', status: 'active', verifyJwt: true },
  { name: 'property-tax-lookup', category: 'Data', purpose: 'Property tax record lookup', status: 'active', verifyJwt: true },
  { name: 'send-property-update', category: 'Data', purpose: 'Property update notifications', status: 'active', verifyJwt: true },

  // Communications
  { name: 'send-contact-email', category: 'Comms', purpose: 'Contact form submission', status: 'active', verifyJwt: false },
  { name: 'send-feedback-email', category: 'Comms', purpose: 'User feedback submission', status: 'active', verifyJwt: false },
  { name: 'send-reminder-email', category: 'Comms', purpose: 'General reminder emails', status: 'active', verifyJwt: false },
  { name: 'send-security-alert', category: 'Comms', purpose: 'Security alert notifications', status: 'active', verifyJwt: false },
  { name: 'send-cancellation-notice', category: 'Comms', purpose: 'Subscription cancellation notice', status: 'active', verifyJwt: false },
  { name: 'send-subscription-welcome-email', category: 'Comms', purpose: 'Welcome email after subscription', status: 'active', verifyJwt: false },
  { name: 'send-test-email', category: 'Comms', purpose: 'Test email functionality', status: 'active', verifyJwt: false },

  // Admin Functions
  { name: 'admin-get-user-emails', category: 'Admin', purpose: 'Fetch user emails for admin', status: 'active', verifyJwt: true },
  { name: 'admin-stripe-subscriptions', category: 'Admin', purpose: 'Fetch all Stripe subscriptions', status: 'active', verifyJwt: true },
  { name: 'admin-link-stripe-customer', category: 'Admin', purpose: 'Manual Stripe customer linking', status: 'active', verifyJwt: true },

  // Analytics & Tracking
  { name: 'track', category: 'Analytics', purpose: 'Event tracking and analytics', status: 'active', verifyJwt: false },
  { name: 'lead-capture', category: 'Analytics', purpose: 'Lead capture form handling', status: 'active', verifyJwt: false },
  { name: 'submit-lead', category: 'Analytics', purpose: 'Submit lead to CRM', status: 'active', verifyJwt: false },

  // Integrations
  { name: 'sync-activecampaign', category: 'Integrations', purpose: 'Sync with ActiveCampaign CRM', status: 'active', verifyJwt: true },
  { name: 'rate-limit-check', category: 'Security', purpose: 'API rate limiting check', status: 'active', verifyJwt: false },
  { name: 'security-headers', category: 'Security', purpose: 'Security headers middleware', status: 'active', verifyJwt: false },
];

// API Keys and Secrets (names only, no values)
const configuredSecrets = [
  { name: 'SUPABASE_URL', category: 'Core', purpose: 'Supabase project URL', status: 'configured' },
  { name: 'SUPABASE_ANON_KEY', category: 'Core', purpose: 'Supabase anonymous key', status: 'configured' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', category: 'Core', purpose: 'Supabase service role key', status: 'configured' },
  { name: 'SUPABASE_DB_URL', category: 'Core', purpose: 'Direct database connection', status: 'configured' },
  { name: 'STRIPE_SECRET_KEY', category: 'Payments', purpose: 'Stripe API secret key', status: 'configured' },
  { name: 'STRIPE_PUBLISHABLE_KEY', category: 'Payments', purpose: 'Stripe publishable key', status: 'configured' },
  { name: 'STRIPE_WEBHOOK_SECRET', category: 'Payments', purpose: 'Stripe webhook signing secret', status: 'configured' },
  { name: 'RESEND_API_KEY', category: 'Email', purpose: 'Resend email API key', status: 'configured' },
  { name: 'SEND_EMAIL_HOOK_SECRET', category: 'Email', purpose: 'Auth email hook secret', status: 'configured' },
  { name: 'ACTIVECAMPAIGN_API_KEY', category: 'CRM', purpose: 'ActiveCampaign API key', status: 'configured' },
  { name: 'ACTIVECAMPAIGN_API_URL', category: 'CRM', purpose: 'ActiveCampaign API endpoint', status: 'configured' },
  { name: 'TWILIO_ACCOUNT_SID', category: 'SMS', purpose: 'Twilio account SID', status: 'configured' },
  { name: 'TWILIO_AUTH_TOKEN', category: 'SMS', purpose: 'Twilio auth token', status: 'configured' },
  { name: 'TWILIO_VERIFY_SERVICE_SID', category: 'SMS', purpose: 'Twilio Verify service', status: 'configured' },
  { name: 'OPENAI_API_KEY', category: 'AI', purpose: 'OpenAI API access', status: 'configured' },
  { name: 'LOVABLE_API_KEY', category: 'AI', purpose: 'Lovable AI Gateway', status: 'configured' },
  { name: 'CUBICASA_API_KEY', category: 'Floor Plans', purpose: 'CubiCasa floor plan API', status: 'configured' },
  { name: 'ADMIN_PASSWORD', category: 'Security', purpose: 'Admin dashboard access', status: 'configured' },
];

// Storage Buckets
const storageBuckets = [
  { name: 'documents', isPublic: false, purpose: 'User uploaded documents (insurance, legal, etc.)' },
  { name: 'photos', isPublic: false, purpose: 'Property and item photos' },
  { name: 'videos', isPublic: false, purpose: 'Property walkthrough videos' },
  { name: 'floor-plans', isPublic: false, purpose: 'Floor plan files and scans' },
  { name: 'contact-attachments', isPublic: false, purpose: 'Contact form attachments' },
];

// Email Types Deployed
const emailTypes = [
  { type: 'Magic Link', function: 'send-auth-email', status: 'active', template: 'Custom React Email' },
  { type: 'Email Verification', function: 'send-auth-email', status: 'active', template: 'Custom React Email' },
  { type: 'Password Reset', function: 'send-auth-email', status: 'active', template: 'Custom React Email' },
  { type: 'Welcome Email', function: 'send-welcome-email', status: 'active', template: 'Resend' },
  { type: 'Subscription Welcome', function: 'send-subscription-welcome-email', status: 'active', template: 'Resend' },
  { type: 'Payment Receipt', function: 'send-payment-receipt', status: 'active', template: 'React Email' },
  
  { type: 'Gift Notification', function: 'send-gift-email', status: 'active', template: 'Resend' },
  { type: 'Contributor Invite', function: 'send-contributor-invitation', status: 'active', template: 'Resend' },
  { type: 'Delegate Access', function: 'send-delegate-access-email', status: 'active', template: 'Resend' },
  { type: 'Security Alert', function: 'send-security-alert', status: 'active', template: 'Resend' },
  { type: 'Contact Form', function: 'send-contact-email', status: 'active', template: 'Resend' },
  { type: 'Feedback', function: 'send-feedback-email', status: 'active', template: 'Resend' },
  { type: 'Storage Warning', function: 'send-storage-warning', status: 'active', template: 'Resend' },
  { type: 'Cancellation Notice', function: 'send-cancellation-notice', status: 'active', template: 'Resend' },
  { type: 'Recovery Request', function: 'send-recovery-request-email', status: 'active', template: 'Resend' },
  { type: 'Recovery Approved', function: 'send-recovery-approved-email', status: 'active', template: 'Resend' },
  { type: 'Recovery Rejected', function: 'send-recovery-rejected-email', status: 'active', template: 'Resend' },
  { type: 'Deletion Confirmation', function: 'send-deletion-confirmation', status: 'active', template: 'Resend' },
];

// Identified Gaps or Areas Needing Attention
const infrastructureGaps = [
  { area: 'Monitoring', issue: 'No external uptime monitoring configured', severity: 'medium', suggestion: 'Consider adding Uptime Robot or similar' },
  { area: 'Backups', issue: 'Database backups rely on Supabase defaults', severity: 'low', suggestion: 'Supabase handles daily backups automatically' },
  { area: 'Error Tracking', issue: 'No centralized error tracking (Sentry, etc.)', severity: 'medium', suggestion: 'Consider adding Sentry for production error tracking' },
  { area: 'Rate Limiting', issue: 'Rate limiting only on some endpoints', severity: 'low', suggestion: 'Expand rate limiting to all public endpoints' },
  { area: 'CDN', issue: 'Using Supabase CDN for storage', severity: 'none', suggestion: 'Current setup is sufficient' },
  { area: 'Analytics', issue: 'Custom analytics via events table', severity: 'none', suggestion: 'Consider adding Mixpanel/Amplitude for deeper insights' },
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Auth': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'Billing': 'bg-green-500/10 text-green-700 border-green-200',
    'Gifts': 'bg-purple-500/10 text-purple-700 border-purple-200',
    'Payments': 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    'Trials': 'bg-amber-500/10 text-amber-700 border-amber-200',
    'Contributors': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    'Recovery': 'bg-rose-500/10 text-rose-700 border-rose-200',
    'Storage': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
    'Data': 'bg-teal-500/10 text-teal-700 border-teal-200',
    'Comms': 'bg-pink-500/10 text-pink-700 border-pink-200',
    'Admin': 'bg-red-500/10 text-red-700 border-red-200',
    'Analytics': 'bg-orange-500/10 text-orange-700 border-orange-200',
    'Integrations': 'bg-violet-500/10 text-violet-700 border-violet-200',
    'Security': 'bg-slate-500/10 text-slate-700 border-slate-200',
    'Core': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'Email': 'bg-pink-500/10 text-pink-700 border-pink-200',
    'CRM': 'bg-purple-500/10 text-purple-700 border-purple-200',
    'SMS': 'bg-green-500/10 text-green-700 border-green-200',
    'AI': 'bg-amber-500/10 text-amber-700 border-amber-200',
    'Floor Plans': 'bg-teal-500/10 text-teal-700 border-teal-200',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

const SystemInfrastructure = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    functions: true,
    secrets: false,
    storage: false,
    emails: false,
    gaps: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const functionsByCategory = edgeFunctions.reduce((acc, fn) => {
    if (!acc[fn.category]) acc[fn.category] = [];
    acc[fn.category].push(fn);
    return acc;
  }, {} as Record<string, typeof edgeFunctions>);

  const projectId = 'leotcbfpqiekgkgumecn';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{edgeFunctions.length}</p>
                <p className="text-xs text-muted-foreground">Edge Functions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{configuredSecrets.length}</p>
                <p className="text-xs text-muted-foreground">API Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{emailTypes.length}</p>
                <p className="text-xs text-muted-foreground">Email Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{storageBuckets.length}</p>
                <p className="text-xs text-muted-foreground">Storage Buckets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{infrastructureGaps.filter(g => g.severity !== 'none').length}</p>
                <p className="text-xs text-muted-foreground">Gaps Found</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edge Functions */}
      <Collapsible open={openSections.functions} onOpenChange={() => toggleSection('functions')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Edge Functions ({edgeFunctions.length})</CardTitle>
                    <CardDescription>Serverless functions deployed on Supabase</CardDescription>
                  </div>
                </div>
                {openSections.functions ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {Object.entries(functionsByCategory).map(([category, fns]) => (
                  <div key={category} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getCategoryColor(category)}>{category}</Badge>
                      <span className="text-sm text-muted-foreground">({fns.length} functions)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Function</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead className="w-[80px]">JWT</TableHead>
                            <TableHead className="w-[80px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fns.map((fn) => (
                            <TableRow key={fn.name}>
                              <TableCell className="font-mono text-xs">{fn.name}</TableCell>
                              <TableCell className="text-sm">{fn.purpose}</TableCell>
                              <TableCell>
                                {fn.verifyJwt ? (
                                  <Lock className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Cloud className="h-4 w-4 text-muted-foreground" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Active
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/functions`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Supabase
                  </a>
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* API Keys & Secrets */}
      <Collapsible open={openSections.secrets} onOpenChange={() => toggleSection('secrets')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">API Keys & Secrets ({configuredSecrets.length})</CardTitle>
                    <CardDescription>Configured environment variables (names only)</CardDescription>
                  </div>
                </div>
                {openSections.secrets ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Secret Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configuredSecrets.map((secret) => (
                    <TableRow key={secret.name}>
                      <TableCell className="font-mono text-xs">{secret.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(secret.category)}>
                          {secret.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{secret.purpose}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-700">Set</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/settings/functions`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Secrets
                  </a>
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Storage Buckets */}
      <Collapsible open={openSections.storage} onOpenChange={() => toggleSection('storage')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Storage Buckets ({storageBuckets.length})</CardTitle>
                    <CardDescription>Supabase storage configuration</CardDescription>
                  </div>
                </div>
                {openSections.storage ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bucket</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="w-[100px]">Visibility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storageBuckets.map((bucket) => (
                    <TableRow key={bucket.name}>
                      <TableCell className="font-mono text-sm">{bucket.name}</TableCell>
                      <TableCell className="text-sm">{bucket.purpose}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={bucket.isPublic ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}>
                          {bucket.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/storage/buckets`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Storage
                  </a>
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Email Deployments */}
      <Collapsible open={openSections.emails} onOpenChange={() => toggleSection('emails')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Email Types ({emailTypes.length})</CardTitle>
                    <CardDescription>Active email templates via Resend</CardDescription>
                  </div>
                </div>
                {openSections.emails ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Type</TableHead>
                    <TableHead>Edge Function</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailTypes.map((email) => (
                    <TableRow key={email.type}>
                      <TableCell className="font-medium">{email.type}</TableCell>
                      <TableCell className="font-mono text-xs">{email.function}</TableCell>
                      <TableCell className="text-sm">{email.template}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-4 text-sm text-muted-foreground">
                All emails are sent via <strong>Resend</strong> from <code>contact@assetsafe.net</code> or <code>support@assetsafe.net</code>
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Infrastructure Gaps */}
      <Collapsible open={openSections.gaps} onOpenChange={() => toggleSection('gaps')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-lg">Infrastructure Gaps & Notes</CardTitle>
                    <CardDescription>Areas for potential improvement</CardDescription>
                  </div>
                </div>
                {openSections.gaps ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Suggestion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {infrastructureGaps.map((gap, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{gap.area}</TableCell>
                      <TableCell className="text-sm">{gap.issue}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          gap.severity === 'high' ? 'bg-red-50 text-red-700' :
                          gap.severity === 'medium' ? 'bg-amber-50 text-amber-700' :
                          gap.severity === 'low' ? 'bg-blue-50 text-blue-700' :
                          'bg-green-50 text-green-700'
                        }>
                          {gap.severity === 'none' ? 'OK' : gap.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{gap.suggestion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href={`https://supabase.com/dashboard/project/${projectId}`} target="_blank" rel="noopener noreferrer">
                <Server className="h-4 w-4 mr-2" />
                Supabase Dashboard
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                <CreditCard className="h-4 w-4 mr-2" />
                Stripe Dashboard
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer">
                <Mail className="h-4 w-4 mr-2" />
                Resend Emails
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://assetsafe.api-us1.com" target="_blank" rel="noopener noreferrer">
                <Users className="h-4 w-4 mr-2" />
                ActiveCampaign
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemInfrastructure;
