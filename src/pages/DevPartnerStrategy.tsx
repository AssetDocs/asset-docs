import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Handshake, 
  Code, 
  Database, 
  CreditCard, 
  Shield,
  Mail,
  Server,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DevPartnerStrategy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Asset Safe — Dev Partner Strategy</h1>
          <p className="text-xl text-muted-foreground">Backend Stability & Ownership Summary</p>
          <Badge variant="outline" className="mt-4">Developer Partnership Brief (Supabase + Stripe + Webhooks)</Badge>
        </div>

        {/* Project Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Asset Safe is a secure digital home inventory and asset documentation platform designed for homeowners, 
              renters, and families. The product helps users document belongings, store supporting media, and maintain 
              organized records for insurance claims, estate planning, and legacy protection.
            </p>
            <p className="font-medium text-primary">
              The front-end is already well underway and visually strong — the primary need now is backend reliability, 
              payment enforcement, and long-term stability.
            </p>
          </CardContent>
        </Card>

        {/* Current Stack */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Current Stack (Already Implemented)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Front End
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Lovable</strong> — UI + user dashboard experience</li>
                  <li>Core workflows are built and functioning from a user-facing perspective</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Backend & Infrastructure
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Supabase</strong> — Authentication, Postgres database, File storage, Role-based access foundation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Payments
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Stripe</strong> — Subscriptions + webhooks</li>
                  <li>Subscription plans exist</li>
                  <li>Webhook-based account entitlement logic is partially implemented</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Resend</strong> — Transactional emails (welcome, confirmations, lifecycle messaging)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Codebase</h4>
              <p className="text-muted-foreground"><strong>GitHub</strong> — All project code is accessible and organized for collaboration</p>
            </div>
          </CardContent>
        </Card>

        {/* What's Working Well */}
        <Card className="mb-6 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              What's Working Well
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                <span>Strong front-end foundation and brand-ready UI</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                <span>Supabase backend is established and connected</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                <span>Stripe billing is integrated at a basic level</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                <span>Core product concept and workflows are validated</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                <span>The platform is close to being ready for real paying users</span>
              </li>
            </ul>
            <p className="mt-4 font-medium text-green-700 dark:text-green-400">
              The project is not a rebuild — it is a stabilization and ownership opportunity.
            </p>
          </CardContent>
        </Card>

        {/* Primary Challenge */}
        <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Primary Challenge (Where Help Is Needed)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">The main shortcoming is backend consistency and reliability:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Webhooks occasionally fail or misfire</li>
              <li>• Subscription access is not always enforced cleanly</li>
              <li>• Small disconnects across auth, billing, storage, and UI compound into UX friction</li>
              <li>• There is currently no single hardened "source of truth" for plan status + access control</li>
            </ul>
            <p className="font-medium text-amber-700 dark:text-amber-400">
              At this stage, the product needs a dedicated backend owner to make the system boring, predictable, and scalable.
            </p>
          </CardContent>
        </Card>

        {/* Development Priorities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Immediate Development Priorities (Stability Sprint)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">1. Stripe Webhook Hardening</h4>
              <p className="text-muted-foreground mb-2">Implement full webhook reliability:</p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Event logging</li>
                <li>• Idempotency (prevent duplicate processing)</li>
                <li>• Retry-safe processing</li>
                <li>• Clear error visibility</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Entitlements & Access Control (Source of Truth)</h4>
              <p className="text-muted-foreground mb-2">Create a clean internal model such as:</p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                user_id | plan tier | subscription status | storage limits | renewal state | access flags
              </div>
              <p className="text-sm text-muted-foreground mt-2">The UI should read from this table — not scattered logic.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Subscription → Feature Enforcement</h4>
              <p className="text-muted-foreground mb-2">Ensure paid plan behavior is consistent:</p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Checkout always unlocks access</li>
                <li>• Past-due or canceled plans restrict correctly</li>
                <li>• Storage limits and contributor roles behave predictably</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4. Upload + Storage Integrity</h4>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Ensure user uploads never orphan or disappear</li>
                <li>• Confirm storage rules match subscription tiers</li>
                <li>• Improve media lifecycle reliability</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5. Admin Debug Tools (Minimal but Critical)</h4>
              <p className="text-muted-foreground mb-2">Build a lightweight internal admin view for:</p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• User subscription status</li>
                <li>• Recent Stripe events</li>
                <li>• Webhook failures</li>
                <li>• Manual overrides (beta users, comp access)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Definition of Success */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Definition of Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">A successful dev partnership delivers:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span>A fully reliable billing + entitlement system</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span>Webhooks that are observable and error-proof</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span>Clean backend enforcement of plans and permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span>A stable foundation ready for first paying customers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span>Confidence that the platform will scale correctly</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Partnership Need */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-primary" />
              Partnership Need
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>I am looking for a developer who can act as a <strong>long-term technical owner</strong> of the backend foundation:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Supabase + Postgres + Auth + RLS</li>
              <li>• Stripe subscriptions + webhook architecture</li>
              <li>• Edge Functions / server-side enforcement</li>
              <li>• Startup-minded, practical, and reliability-focused</li>
            </ul>
            <p className="font-medium text-primary">
              This is not a feature-build sprint — it is a backend stabilization and ownership role.
            </p>
          </CardContent>
        </Card>

        {/* Compensation Structure */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Compensation & Partnership Structure (Flexible)
            </CardTitle>
            <CardDescription>
              Because Asset Safe is currently pre-revenue, I'm open to structuring this partnership in a founder-friendly, incentive-aligned way.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <Badge className="w-fit mb-2">Preferred</Badge>
                  <CardTitle className="text-lg">Option A — Small Retainer + Milestone Bonuses</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="mb-2">A lean monthly support retainer combined with outcome-based bonuses tied to stability deliverables:</p>
                  <ul className="space-y-1">
                    <li>• Webhook reliability + event logging complete</li>
                    <li>• Subscription → access enforcement fully consistent</li>
                    <li>• Storage + upload integrity confirmed</li>
                    <li>• 30-day "zero critical billing failures" benchmark</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Option B — Equity with Vesting</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="mb-2">Equity for the right developer, structured safely:</p>
                  <ul className="space-y-1">
                    <li>• Standard vesting schedule</li>
                    <li>• 4-year vesting with 1-year cliff</li>
                    <li>• Equity earned through continued contribution</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Option C — Milestone-Based Equity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="mb-2">Equity tied directly to completed deliverables:</p>
                  <ul className="space-y-1">
                    <li>• Stripe webhook system hardened + idempotent</li>
                    <li>• Entitlements model finalized as source of truth</li>
                    <li>• Admin visibility tools delivered</li>
                    <li>• Backend stability sprint completed</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Option D — Hybrid (Cash-Light + Equity)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="mb-2">A practical combination:</p>
                  <ul className="space-y-1">
                    <li>• Small monthly payment (affordable)</li>
                    <li>• Smaller equity allocation</li>
                    <li>• Clear scope + defined backend ownership</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Founder Principles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Founder Principles (Non-Negotiables)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">To ensure the partnership is clean and sustainable:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Asset Safe retains ownership</strong> of all core accounts (Stripe, Supabase, domains, GitHub)</li>
              <li>• All work is committed into the main repo</li>
              <li>• Clear documentation is required for maintainability</li>
              <li>• Exit-friendly structure if either side needs to disengage</li>
            </ul>
          </CardContent>
        </Card>

        {/* Immediate Engagement */}
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Immediate Engagement Proposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The first engagement would ideally be a <strong>2–4 week Backend Stability Sprint</strong>, focused entirely on:</p>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">Stripe + webhook reliability</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">Subscription entitlements + enforcement</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">Upload/storage integrity</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">Logging + admin debugging tools</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded md:col-span-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">Establishing a scalable backend foundation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outreach Template */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Short Developer Outreach Version (Email / LinkedIn)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg text-sm space-y-3">
              <p className="font-semibold">Subject: Backend Stability Partner Needed (Supabase + Stripe)</p>
              <p>Hi [Name],</p>
              <p>
                I'm building Asset Safe, a secure digital home inventory platform (Lovable front-end + Supabase backend) 
                designed for homeowners to document assets for insurance, claims, and legacy planning.
              </p>
              <p>
                The product UI is strong and the core workflows are in place — but I'm at the stage where backend reliability 
                is critical, especially around:
              </p>
              <ul className="ml-4 space-y-1">
                <li>• Stripe subscriptions + webhook enforcement</li>
                <li>• Entitlements / plan-based access control</li>
                <li>• Upload + storage consistency</li>
                <li>• Logging + observability for billing events</li>
              </ul>
              <p>
                I'm looking for a developer who can act as a dedicated backend owner to stabilize the system and build a clean, 
                scalable foundation (not a rebuild — more of a "stability sprint").
              </p>
              <p>
                If this sounds aligned with your experience (Supabase + Stripe + edge functions), I'd love to schedule a quick 
                call and share the current architecture and priorities.
              </p>
              <p>
                Thanks,<br />
                <strong>Michael Lewis</strong><br />
                Founder — Asset Safe
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Next Step</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">I'd love to discuss:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Your approach to Stripe webhook reliability</li>
              <li>• How you model entitlements cleanly</li>
              <li>• A 2–4 week "Stability Sprint" plan</li>
              <li>• Ongoing support options (fractional CTO / retainer)</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DevPartnerStrategy;
