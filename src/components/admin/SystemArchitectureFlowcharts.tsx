import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight,
  GitBranch,
  UserPlus,
  Gift,
  Upload,
  Users,
  Lock,
  CreditCard,
  Database
} from 'lucide-react';

// Mermaid-style flowchart component using CSS
const FlowChart: React.FC<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode }> = ({ 
  title, description, icon, children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-l-4 border-l-primary">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-xs">{description}</CardDescription>
                </div>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// Flow node component
const FlowNode: React.FC<{ 
  type: 'start' | 'process' | 'decision' | 'database' | 'email' | 'api' | 'end';
  label: string;
  sublabel?: string;
}> = ({ type, label, sublabel }) => {
  const baseClasses = "px-4 py-2 text-sm font-medium text-center min-w-[140px]";
  const typeStyles = {
    start: "bg-green-100 text-green-800 rounded-full border-2 border-green-500",
    end: "bg-red-100 text-red-800 rounded-full border-2 border-red-500",
    process: "bg-blue-100 text-blue-800 rounded-lg border-2 border-blue-400",
    decision: "bg-amber-100 text-amber-800 rotate-45 border-2 border-amber-500",
    database: "bg-purple-100 text-purple-800 rounded-lg border-2 border-purple-400",
    email: "bg-pink-100 text-pink-800 rounded-lg border-2 border-pink-400",
    api: "bg-indigo-100 text-indigo-800 rounded-lg border-2 border-indigo-400",
  };

  if (type === 'decision') {
    return (
      <div className="flex flex-col items-center">
        <div className={`${baseClasses} ${typeStyles[type]} w-24 h-24 flex items-center justify-center`}>
          <span className="-rotate-45 text-xs">{label}</span>
        </div>
        {sublabel && <span className="text-xs text-muted-foreground mt-2">{sublabel}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`${baseClasses} ${typeStyles[type]}`}>
        {label}
      </div>
      {sublabel && <span className="text-xs text-muted-foreground mt-1">{sublabel}</span>}
    </div>
  );
};

// Arrow component
const Arrow: React.FC<{ direction?: 'down' | 'right' | 'left'; label?: string }> = ({ direction = 'down', label }) => {
  if (direction === 'right') {
    return (
      <div className="flex items-center gap-1 mx-2">
        <div className="w-8 h-0.5 bg-muted-foreground"></div>
        <div className="w-0 h-0 border-l-[6px] border-l-muted-foreground border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
        {label && <span className="text-xs text-muted-foreground ml-1">{label}</span>}
      </div>
    );
  }
  if (direction === 'left') {
    return (
      <div className="flex items-center gap-1 mx-2">
        <div className="w-0 h-0 border-r-[6px] border-r-muted-foreground border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
        <div className="w-8 h-0.5 bg-muted-foreground"></div>
        {label && <span className="text-xs text-muted-foreground mr-1">{label}</span>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center my-2">
      <div className="w-0.5 h-6 bg-muted-foreground"></div>
      <div className="w-0 h-0 border-t-[6px] border-t-muted-foreground border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent"></div>
      {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
    </div>
  );
};

const SystemArchitectureFlowcharts: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* High-Level Overview */}
      <FlowChart
        title="System Architecture Overview"
        description="High-level view of AssetSafe.net architecture"
        icon={<GitBranch className="h-5 w-5 text-primary" />}
      >
        <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Top Layer - User Interface */}
            <div className="text-center mb-4">
              <Badge className="bg-primary text-primary-foreground text-lg px-6 py-2">AssetSafe.net</Badge>
              <p className="text-xs text-muted-foreground mt-1">React + Vite + TypeScript + Tailwind CSS</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                <span className="font-semibold text-blue-800 text-sm">Public Pages</span>
                <p className="text-xs text-blue-600 mt-1">Landing, Pricing, About, Blog, Resources</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                <span className="font-semibold text-green-800 text-sm">Auth Pages</span>
                <p className="text-xs text-green-600 mt-1">Login, Signup, Verify Email, Password Reset</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                <span className="font-semibold text-purple-800 text-sm">Dashboard</span>
                <p className="text-xs text-purple-600 mt-1">Account, Properties, Media, Documents</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                <span className="font-semibold text-red-800 text-sm">Admin Portal</span>
                <p className="text-xs text-red-600 mt-1">CRM, Users, Billing, Infrastructure</p>
              </div>
            </div>

            <Arrow />

            {/* Middle Layer - Backend Services */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <span className="font-semibold text-indigo-800 block mb-2">Supabase Backend</span>
                <ul className="text-xs text-indigo-600 space-y-1">
                  <li>• PostgreSQL Database</li>
                  <li>• Auth (Email/Password)</li>
                  <li>• Row Level Security (RLS)</li>
                  <li>• 50+ Edge Functions</li>
                  <li>• Realtime Subscriptions</li>
                </ul>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <span className="font-semibold text-emerald-800 block mb-2">Payment Processing</span>
                <ul className="text-xs text-emerald-600 space-y-1">
                  <li>• Stripe Checkout</li>
                  <li>• Webhook Processing</li>
                  <li>• Customer Portal</li>
                  <li>• Gift Subscriptions</li>
                  <li>• Storage Add-ons</li>
                </ul>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <span className="font-semibold text-pink-800 block mb-2">Communications</span>
                <ul className="text-xs text-pink-600 space-y-1">
                  <li>• Resend (Transactional Email)</li>
                  <li>• Custom React Email Templates</li>
                  <li>• ActiveCampaign CRM Sync</li>
                  <li>• Twilio (SMS Verify)</li>
                  <li>• Security Alerts</li>
                </ul>
              </div>
            </div>

            <Arrow />

            {/* Bottom Layer - Data Storage */}
            <div className="grid grid-cols-4 gap-3">
              {['photos', 'videos', 'documents', 'contact-attachments'].map((bucket) => (
                <div key={bucket} className="bg-slate-100 p-2 rounded border border-slate-300 text-center">
                  <Database className="h-4 w-4 mx-auto text-slate-600" />
                  <span className="text-xs font-mono text-slate-700">{bucket}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">Private Storage Buckets (Signed URLs)</p>
          </div>
        </div>
      </FlowChart>

      {/* Account Creation Flow */}
      <FlowChart
        title="Account Creation Flow"
        description="New user signup process from landing to dashboard"
        icon={<UserPlus className="h-5 w-5 text-green-600" />}
      >
        <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
          <div className="flex flex-col items-center min-w-[600px]">
            <FlowNode type="start" label="User Visits Site" />
            <Arrow />
            <FlowNode type="process" label="Clicks 'Get Started'" sublabel="assetsafe.net/signup" />
            <Arrow />
            <FlowNode type="process" label="Signup Form" sublabel="Email, Password, Name + Optional Gift Code" />
            <Arrow />
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <FlowNode type="api" label="supabase.auth.signUp()" />
                <Arrow />
                <FlowNode type="database" label="auth.users" sublabel="User created" />
              </div>
              <Arrow direction="right" />
              <div className="flex flex-col items-center">
                <FlowNode type="api" label="handle_new_user()" sublabel="DB Trigger" />
                <Arrow />
                <FlowNode type="database" label="profiles" sublabel="Account# generated (AS######)" />
              </div>
            </div>
            
            <Arrow />
            <FlowNode type="email" label="send-welcome-email" sublabel="Via Resend" />
            <Arrow />
            <FlowNode type="process" label="Email Verification" sublabel="User clicks link in email" />
            <Arrow />
            <FlowNode type="api" label="AuthCallback" sublabel="/auth/callback" />
            <Arrow />
            
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-300 text-center my-2">
              <span className="text-sm font-semibold text-amber-800">Decision: Gift Code Entered?</span>
            </div>
            
            <div className="flex items-center gap-8 mt-2">
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="mb-2">No Gift Code</Badge>
                <FlowNode type="process" label="Redirect to Pricing" sublabel="/pricing" />
                <Arrow />
                <FlowNode type="process" label="Select Plan" sublabel="Standard ($12.99/mo) or Premium ($18.99/mo)" />
                <Arrow />
                <FlowNode type="api" label="create-checkout" />
                <Arrow />
                <FlowNode type="process" label="Stripe Checkout" />
                <Arrow />
                <FlowNode type="api" label="stripe-webhook" sublabel="checkout.session.completed" />
                <Arrow />
                <FlowNode type="database" label="entitlements" sublabel="status: 'active'" />
                <Arrow />
                <FlowNode type="api" label="send-subscription-welcome-email" />
                <Arrow />
                <FlowNode type="end" label="Dashboard Access" sublabel="/account" />
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="mb-2">Gift/Lifetime Code</Badge>
                <FlowNode type="api" label="validate-lifetime-code" sublabel="ASL2025 or gift code" />
                <Arrow />
                <FlowNode type="database" label="entitlements" sublabel="plan: 'premium', status: 'active'" />
                <Arrow />
                <FlowNode type="end" label="Direct to Dashboard" sublabel="/account" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="font-semibold text-blue-800 text-sm">Key Functions Called:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {['supabase.auth.signUp', 'handle_new_user (trigger)', 'send-welcome-email', 'create-checkout', 'stripe-webhook', 'sync-subscription', 'check-subscription', 'validate-lifetime-code'].map(fn => (
              <Badge key={fn} variant="outline" className="text-xs font-mono">{fn}</Badge>
            ))}
          </div>
        </div>
      </FlowChart>

      {/* Gift Subscription Flow */}
      <FlowChart
        title="Gift Subscription Flow"
        description="Purchasing and redeeming gift subscriptions"
        icon={<Gift className="h-5 w-5 text-purple-600" />}
      >
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Purchase Side */}
            <div className="flex flex-col items-center">
              <Badge className="bg-purple-100 text-purple-800 mb-4">Gift Purchase</Badge>
              <FlowNode type="start" label="Purchaser visits /gift" />
              <Arrow />
              <FlowNode type="process" label="Gift Form" sublabel="Recipient email, message, delivery date" />
              <Arrow />
              <FlowNode type="api" label="create-gift-checkout" />
              <Arrow />
              <FlowNode type="process" label="Stripe Checkout" sublabel="One-time payment" />
              <Arrow />
              <FlowNode type="api" label="stripe-webhook" sublabel="checkout.session.completed" />
              <Arrow />
              <FlowNode type="database" label="gift_subscriptions" sublabel="gift_code generated, status: 'paid'" />
              <Arrow />
              <FlowNode type="email" label="send-gift-email" sublabel="To recipient on delivery_date" />
              <Arrow />
              <FlowNode type="end" label="Gift Delivered" />
            </div>
            
            {/* Redemption Side */}
            <div className="flex flex-col items-center">
              <Badge className="bg-green-100 text-green-800 mb-4">Gift Redemption</Badge>
              <FlowNode type="start" label="Recipient clicks email link" />
              <Arrow />
              <FlowNode type="process" label="/gift/claim?code=XXX" />
              <Arrow />
              <FlowNode type="api" label="get_claimable_gift()" sublabel="DB Function" />
              <Arrow />
              
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-300 text-center my-2">
                <span className="text-sm font-semibold text-amber-800">Has Account?</span>
              </div>
              
              <div className="flex items-start gap-4 mt-2">
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className="mb-2 text-xs">No</Badge>
                  <FlowNode type="process" label="Create Account" sublabel="/signup" />
                </div>
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className="mb-2 text-xs">Yes</Badge>
                  <FlowNode type="process" label="Login" sublabel="/login" />
                </div>
              </div>
              
              <Arrow />
              <FlowNode type="api" label="claim_gift_subscription()" sublabel="DB Function" />
              <Arrow />
              <FlowNode type="database" label="entitlements" sublabel="Plan activated for 1 year" />
              <Arrow />
              <FlowNode type="api" label="track-gift-login" sublabel="First login tracking" />
              <Arrow />
              <FlowNode type="end" label="Dashboard Access" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <span className="font-semibold text-purple-800 text-sm">Database Tables:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {['gift_subscriptions', 'gift_claim_attempts', 'entitlements', 'profiles'].map(tbl => (
              <Badge key={tbl} variant="outline" className="text-xs font-mono bg-white">{tbl}</Badge>
            ))}
          </div>
        </div>
      </FlowChart>

      {/* Photo/Video Upload Flow */}
      <FlowChart
        title="Photo/Video Upload Flow"
        description="Media upload, storage, and retrieval process"
        icon={<Upload className="h-5 w-5 text-blue-600" />}
      >
        <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
          <div className="flex flex-col items-center min-w-[700px]">
            <FlowNode type="start" label="User selects files" sublabel="PhotoUpload.tsx / VideoUpload.tsx" />
            <Arrow />
            <FlowNode type="api" label="fileValidator.ts" sublabel="Type, size, malware check" />
            <Arrow />
            
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-300 text-center my-2">
              <span className="text-sm font-semibold text-amber-800">Check Storage Quota</span>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="mb-2 text-red-600">Over Limit</Badge>
                <FlowNode type="process" label="Show Storage Warning" />
                <Arrow />
                <FlowNode type="api" label="add-storage / add-storage-25gb" />
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="mb-2 text-green-600">OK</Badge>
                <FlowNode type="process" label="Continue Upload" />
              </div>
            </div>
            
            <Arrow />
            <FlowNode type="api" label="PropertyService.addPropertyFile()" />
            <Arrow />
            
            <div className="grid grid-cols-2 gap-8 my-4">
              <div className="flex flex-col items-center">
                <FlowNode type="database" label="Storage: photos / videos" sublabel="Supabase Storage" />
                <Arrow />
                <div className="text-xs text-center text-muted-foreground">
                  Path: {'{user_id}/{property_id}/{timestamp}_{filename}'}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <FlowNode type="database" label="property_files table" sublabel="Metadata record" />
                <Arrow />
                <div className="text-xs text-center text-muted-foreground">
                  file_type, file_size, source, property_id
                </div>
              </div>
            </div>
            
            <Arrow />
            <FlowNode type="api" label="update_user_storage_usage()" sublabel="DB Trigger" />
            <Arrow />
            <FlowNode type="database" label="storage_usage table" sublabel="Per-bucket totals updated" />
            <Arrow />
            
            <div className="border-t-2 border-dashed border-muted-foreground pt-4 mt-4 w-full">
              <p className="text-center text-sm font-semibold mb-4">Retrieval Flow</p>
              <div className="flex items-center justify-center gap-4">
                <FlowNode type="process" label="Gallery Request" />
                <Arrow direction="right" />
                <FlowNode type="api" label="useSignedUrl hook" />
                <Arrow direction="right" />
                <FlowNode type="api" label="supabase.storage.createSignedUrl()" sublabel="60min expiry" />
                <Arrow direction="right" />
                <FlowNode type="end" label="Secure Display" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="font-semibold text-blue-800 text-sm">Source Tags:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {['general (default)', 'damage_report', 'upgrade_repair'].map(src => (
                <Badge key={src} variant="outline" className="text-xs font-mono bg-white">{src}</Badge>
              ))}
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="font-semibold text-green-800 text-sm">Storage Buckets:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {['photos (private)', 'videos (private)', 'documents (private)'].map(b => (
                <Badge key={b} variant="outline" className="text-xs font-mono bg-white">{b}</Badge>
              ))}
            </div>
          </div>
        </div>
      </FlowChart>

      {/* Contributor/Trusted Contact Flow */}
      <FlowChart
        title="Trusted Contact (Contributor) Flow"
        description="Inviting, accepting, and managing account contributors"
        icon={<Users className="h-5 w-5 text-cyan-600" />}
      >
        <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Invitation Process */}
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center flex-1">
                <Badge className="bg-blue-100 text-blue-800 mb-4">Account Owner Actions</Badge>
                <FlowNode type="start" label="Owner opens Contributors Tab" sublabel="/account/settings" />
                <Arrow />
                <FlowNode type="process" label="Add Contributor Form" sublabel="Email, Name, Role" />
                <Arrow />
                <FlowNode type="api" label="send-contributor-invitation" sublabel="Edge Function" />
                <Arrow />
                <FlowNode type="database" label="contributors table" sublabel="status: 'pending'" />
                <Arrow />
                <FlowNode type="email" label="Invitation Email" sublabel="Via Resend" />
              </div>
              
              <div className="flex items-center self-center">
                <div className="w-16 h-0.5 bg-muted-foreground"></div>
                <div className="px-2 text-xs text-muted-foreground">Email Sent</div>
                <div className="w-0 h-0 border-l-[6px] border-l-muted-foreground border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
              </div>
              
              <div className="flex flex-col items-center flex-1">
                <Badge className="bg-green-100 text-green-800 mb-4">Contributor Actions</Badge>
                <FlowNode type="start" label="Clicks Email Link" sublabel="/auth?mode=contributor" />
                <Arrow />
                
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-300 text-center my-2">
                  <span className="text-sm font-semibold text-amber-800">Has Account?</span>
                </div>
                
                <div className="flex items-start gap-4 mt-2">
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="mb-2 text-xs">No</Badge>
                    <FlowNode type="process" label="Create Account" sublabel="Password setup" />
                    <Arrow />
                    <FlowNode type="email" label="Verify Email" />
                  </div>
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="mb-2 text-xs">Yes</Badge>
                    <FlowNode type="process" label="Login" />
                  </div>
                </div>
                
                <Arrow />
                <FlowNode type="api" label="accept-contributor-invitation" sublabel="Auto-called on login" />
                <Arrow />
                <FlowNode type="database" label="contributors table" sublabel="status: 'accepted', contributor_user_id set" />
              </div>
            </div>
            
            {/* Access Inheritance */}
            <div className="mt-8 border-t-2 border-dashed border-muted-foreground pt-4">
              <p className="text-center text-sm font-semibold mb-4">Access Inheritance & Permissions</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-300">
                  <Badge variant="outline" className="bg-slate-200 mb-2">Viewer</Badge>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>• View properties</li>
                    <li>• View photos/videos</li>
                    <li>• View documents</li>
                    <li>• No edit/upload</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-300">
                  <Badge variant="outline" className="bg-blue-200 mb-2">Contributor</Badge>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• All Viewer permissions</li>
                    <li>• Upload photos/videos</li>
                    <li>• Add documents</li>
                    <li>• Add inventory items</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-300">
                  <Badge variant="outline" className="bg-purple-200 mb-2">Administrator</Badge>
                  <ul className="text-xs text-purple-600 space-y-1">
                    <li>• All Contributor permissions</li>
                    <li>• Manage properties</li>
                    <li>• Delete files</li>
                    <li>• Request recovery/deletion</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="font-semibold text-green-800 text-sm">Subscription Inheritance:</span>
                <p className="text-xs text-green-700 mt-1">
                  Contributors automatically inherit the account owner's subscription tier, storage quota, and feature access.
                  Checked via <code className="bg-white px-1 rounded">check-subscription</code> edge function.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
          <span className="font-semibold text-cyan-800 text-sm">Key Database Objects:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {['contributors', 'has_contributor_access()', 'contributor_role enum', 'ContributorContext.tsx'].map(item => (
              <Badge key={item} variant="outline" className="text-xs font-mono bg-white">{item}</Badge>
            ))}
          </div>
        </div>
      </FlowChart>

      {/* Legacy Locker Flow */}
      <FlowChart
        title="Legacy Locker & Recovery Flow"
        description="Secure document vault with delegate recovery system"
        icon={<Lock className="h-5 w-5 text-amber-600" />}
      >
        <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Setup Flow */}
              <div className="flex flex-col items-center">
                <Badge className="bg-amber-100 text-amber-800 mb-4">Legacy Locker Setup</Badge>
                <FlowNode type="start" label="User accesses Legacy Locker" sublabel="Premium feature" />
                <Arrow />
                <FlowNode type="process" label="Master Password Setup" sublabel="Client-side encryption key" />
                <Arrow />
                <FlowNode type="api" label="encryption.ts" sublabel="AES-GCM encryption" />
                <Arrow />
                <FlowNode type="database" label="legacy_locker table" sublabel="Encrypted data stored" />
                <Arrow />
                <FlowNode type="process" label="Add Sensitive Info" sublabel="Accounts, wills, contacts" />
                <Arrow />
                <FlowNode type="process" label="Assign Recovery Delegate" sublabel="Trusted person" />
                <Arrow />
                <FlowNode type="database" label="delegate_user_id" sublabel="References another user" />
                <Arrow />
                <FlowNode type="email" label="send-delegate-access-email" />
                <Arrow />
                <FlowNode type="end" label="Setup Complete" />
              </div>
              
              {/* Recovery Flow */}
              <div className="flex flex-col items-center">
                <Badge className="bg-rose-100 text-rose-800 mb-4">Recovery Request Flow</Badge>
                <FlowNode type="start" label="Delegate initiates recovery" />
                <Arrow />
                <FlowNode type="api" label="submit-recovery-request" />
                <Arrow />
                <FlowNode type="database" label="legacy_locker" sublabel="recovery_status: 'pending'" />
                <Arrow />
                <FlowNode type="email" label="send-recovery-request-email" sublabel="To account owner" />
                <Arrow />
                
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-300 text-center my-2 w-full">
                  <span className="text-sm font-semibold text-amber-800">Grace Period: 14 days</span>
                  <p className="text-xs text-amber-600">Owner can approve or reject</p>
                </div>
                
                <div className="flex items-start gap-4 mt-2">
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="mb-2 text-green-600">Approved</Badge>
                    <FlowNode type="api" label="respond-recovery-request" />
                    <Arrow />
                    <FlowNode type="email" label="send-recovery-approved-email" />
                    <Arrow />
                    <FlowNode type="process" label="Delegate gains access" />
                  </div>
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="mb-2 text-red-600">Rejected</Badge>
                    <FlowNode type="api" label="respond-recovery-request" />
                    <Arrow />
                    <FlowNode type="email" label="send-recovery-rejected-email" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-slate-100 rounded-lg border border-slate-300">
              <span className="font-semibold text-slate-800 text-sm">Encryption Architecture:</span>
              <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
                <div>
                  <strong className="text-slate-700">Client-Side:</strong>
                  <p className="text-slate-600">Master password never sent to server. Encryption/decryption happens in browser.</p>
                </div>
                <div>
                  <strong className="text-slate-700">Storage:</strong>
                  <p className="text-slate-600">Only encrypted blobs stored in database. Encryption key encrypted for user & delegate.</p>
                </div>
                <div>
                  <strong className="text-slate-700">Recovery:</strong>
                  <p className="text-slate-600">Delegate's key share + grace period approval = access to decrypted data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FlowChart>

      {/* Subscription & Billing Flow */}
      <FlowChart
        title="Subscription & Billing Flow"
        description="Stripe integration, webhooks, and entitlement management"
        icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
      >
        <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Initial Subscription */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <span className="font-semibold text-blue-800 text-sm block mb-2">Standard Plan</span>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• $129/year</li>
                  <li>• All core features</li>
                  <li>• 5GB storage (base)</li>
                  <li>• Unlimited properties</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <span className="font-semibold text-purple-800 text-sm block mb-2">Premium Plan</span>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• $189/year</li>
                  <li>• All Standard features</li>
                  <li>• Legacy Locker access</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <span className="font-semibold text-amber-800 text-sm block mb-2">Lifetime (ASL2025)</span>
                <ul className="text-xs text-amber-600 space-y-1">
                  <li>• One-time code</li>
                  <li>• Premium forever</li>
                  <li>• No Stripe involved</li>
                  <li>• Direct entitlement</li>
                </ul>
              </div>
            </div>
            
            {/* Webhook Flow */}
            <div className="flex flex-col items-center">
              <FlowNode type="start" label="User completes Stripe Checkout" />
              <Arrow />
              <FlowNode type="api" label="Stripe sends webhook" sublabel="checkout.session.completed" />
              <Arrow />
              <FlowNode type="api" label="stripe-webhook" sublabel="Edge Function" />
              <Arrow />
              
              <div className="grid grid-cols-2 gap-8 my-4">
                <div className="flex flex-col items-center">
                  <FlowNode type="database" label="payment_events" sublabel="Idempotency check" />
                  <Arrow />
                  <span className="text-xs text-muted-foreground">stripe_event_id unique</span>
                </div>
                <div className="flex flex-col items-center">
                  <FlowNode type="database" label="entitlements" sublabel="Source of truth" />
                  <Arrow />
                  <span className="text-xs text-muted-foreground">plan, status, current_period_end</span>
                </div>
              </div>
              
              <Arrow />
              <FlowNode type="api" label="sync-subscription" sublabel="Reconciliation" />
              <Arrow />
              <FlowNode type="email" label="send-payment-receipt" />
            </div>
            
            {/* Webhook Events */}
            <div className="mt-6 border-t-2 border-dashed border-muted-foreground pt-4">
              <p className="text-center text-sm font-semibold mb-4">Handled Webhook Events</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { event: 'checkout.session.completed', action: 'Activate subscription' },
                  { event: 'invoice.paid', action: 'Record payment, extend period' },
                  { event: 'invoice.payment_failed', action: 'Send reminder, grace period' },
                  { event: 'customer.subscription.updated', action: 'Sync plan changes' },
                  { event: 'customer.subscription.deleted', action: 'Deactivate, send notice' },
                  { event: 'charge.succeeded', action: 'Log payment event' },
                  { event: 'charge.refunded', action: 'Update payment status' },
                  { event: 'payment_intent.succeeded', action: 'Storage add-on processing' },
                ].map(({ event, action }) => (
                  <div key={event} className="bg-slate-50 p-2 rounded border border-slate-200">
                    <code className="text-xs font-mono text-slate-700">{event}</code>
                    <p className="text-xs text-slate-500 mt-1">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <span className="font-semibold text-emerald-800 text-sm">Entitlements Architecture:</span>
          <p className="text-xs text-emerald-700 mt-1">
            The <code className="bg-white px-1 rounded">entitlements</code> table is the <strong>single source of truth</strong> for access control.
            All RLS policies and feature gates read from entitlements, not Stripe directly. This prevents race conditions and ensures immediate access after payment.
          </p>
        </div>
      </FlowChart>

      {/* Database Schema Overview */}
      <FlowChart
        title="Core Database Schema"
        description="Key tables and their relationships"
        icon={<Database className="h-5 w-5 text-indigo-600" />}
      >
        <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-4 gap-4">
              {/* Auth & Users */}
              <div className="space-y-3">
                <Badge className="bg-blue-100 text-blue-800">Auth & Users</Badge>
                {['auth.users (Supabase)', 'profiles', 'entitlements', 'account_verification', 'user_roles'].map(tbl => (
                  <div key={tbl} className="bg-blue-50 p-2 rounded border border-blue-200">
                    <code className="text-xs font-mono text-blue-800">{tbl}</code>
                  </div>
                ))}
              </div>
              
              {/* Properties & Assets */}
              <div className="space-y-3">
                <Badge className="bg-green-100 text-green-800">Properties & Assets</Badge>
                {['properties', 'property_files', 'items', 'paint_codes', 'damage_reports', 'upgrade_repairs'].map(tbl => (
                  <div key={tbl} className="bg-green-50 p-2 rounded border border-green-200">
                    <code className="text-xs font-mono text-green-800">{tbl}</code>
                  </div>
                ))}
              </div>
              
              {/* Documents & Vault */}
              <div className="space-y-3">
                <Badge className="bg-purple-100 text-purple-800">Documents & Vault</Badge>
                {['user_documents', 'document_folders', 'legacy_locker', 'legacy_locker_files', 'trust_information', 'insurance_policies'].map(tbl => (
                  <div key={tbl} className="bg-purple-50 p-2 rounded border border-purple-200">
                    <code className="text-xs font-mono text-purple-800">{tbl}</code>
                  </div>
                ))}
              </div>
              
              {/* Billing & Admin */}
              <div className="space-y-3">
                <Badge className="bg-amber-100 text-amber-800">Billing & Admin</Badge>
                {['subscribers', 'payment_events', 'gift_subscriptions', 'storage_usage', 'contributors', 'audit_logs'].map(tbl => (
                  <div key={tbl} className="bg-amber-50 p-2 rounded border border-amber-200">
                    <code className="text-xs font-mono text-amber-800">{tbl}</code>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-slate-100 rounded-lg border border-slate-300">
              <span className="font-semibold text-slate-800 text-sm">RLS Policy Pattern:</span>
              <p className="text-xs text-slate-600 mt-1">
                All user data tables have Row Level Security enabled. Policies check <code>auth.uid() = user_id</code> for personal data,
                or use <code>has_contributor_access()</code> for shared account access. Admin users with the 'admin' role bypass certain restrictions.
              </p>
            </div>
          </div>
        </div>
      </FlowChart>
    </div>
  );
};

export default SystemArchitectureFlowcharts;
