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
  Zap,
  FileText,
  Scale,
  Lock,
  UserCheck,
  Briefcase,
  AlertCircle,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Clock
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

        {/* Equity Framework */}
        <Card className="mb-6 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Equity Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-lg font-semibold text-primary mb-2">Target equity range: 12–18%</p>
              <p className="text-muted-foreground">(earned over time through vesting)</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Standard Startup Vesting:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>4-year vesting</strong> schedule</li>
                <li>• <strong>1-year cliff</strong></li>
                <li>• <strong>Monthly vesting</strong> thereafter</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Equity Vesting Diagram */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Equity Vesting Diagram — Example (16%)
            </CardTitle>
            <CardDescription>
              At month 12, 25% vests immediately (4%). Remaining equity vests monthly through month 48.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">Time Period</th>
                    <th className="text-left py-2 px-3 font-semibold">Status</th>
                    <th className="text-right py-2 px-3 font-semibold">Vested Equity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-muted/30">
                    <td className="py-3 px-3 font-medium">0–12 months</td>
                    <td className="py-3 px-3 text-muted-foreground">Cliff period</td>
                    <td className="py-3 px-3 text-right font-mono">0%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-3 font-medium">Month 12</td>
                    <td className="py-3 px-3 text-muted-foreground">Cliff vests (25% of total)</td>
                    <td className="py-3 px-3 text-right font-mono text-primary font-semibold">4%</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="py-3 px-3 font-medium">Month 24</td>
                    <td className="py-3 px-3 text-muted-foreground">Monthly vesting continues</td>
                    <td className="py-3 px-3 text-right font-mono">8%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-3 font-medium">Month 36</td>
                    <td className="py-3 px-3 text-muted-foreground">Monthly vesting continues</td>
                    <td className="py-3 px-3 text-right font-mono">12%</td>
                  </tr>
                  <tr className="bg-primary/10">
                    <td className="py-3 px-3 font-medium">Month 48</td>
                    <td className="py-3 px-3 text-primary font-semibold">Fully vested</td>
                    <td className="py-3 px-3 text-right font-mono text-primary font-semibold">16%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Upside */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Revenue Upside (5-Year View)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Base Consumer Growth:</h4>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { year: 'Year 1', amount: '~$43K' },
                  { year: 'Year 2', amount: '~$216K' },
                  { year: 'Year 3', amount: '~$720K' },
                  { year: 'Year 4', amount: '~$1.7M' },
                  { year: 'Year 5', amount: '~$3.6M' },
                ].map((item) => (
                  <div key={item.year} className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">{item.year}</p>
                    <p className="font-semibold text-primary">{item.amount}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                With B2B Acceleration (Brokerages, Insurers, AHA):
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">Year 3+</p>
                  <p className="text-2xl font-bold text-green-600">$1M+</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">Year 5 Potential</p>
                  <p className="text-2xl font-bold text-green-600">$7M+</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Meeting Discussion Points */}
        <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <MessageSquare className="w-5 h-5" />
              Key Meeting Discussion Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0">1</div>
                <span><strong>Compatibility and communication style</strong> — How do we work together effectively?</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0">2</div>
                <span><strong>Commitment level and availability</strong> — Especially during critical incidents</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0">3</div>
                <span><strong>Security-first mindset alignment</strong> — This platform handles sensitive user data</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0">4</div>
                <span><strong>Ownership model</strong> — Contractor vs CTO vs true co-founder expectations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0">5</div>
                <span><strong>Next step</strong> — Complete Stability Sprint, then formalize partnership</span>
              </li>
            </ul>
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

        {/* Mock CTO Partner Agreement */}
        <Card className="mb-8 border-2 border-dashed border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                DRAFT / TEMPLATE
              </Badge>
            </div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Mock Development / CTO Partner Agreement
            </CardTitle>
            <CardDescription>
              Asset Safe, LLC (or future entity) — Technology Development + IP Assignment + Confidentiality Agreement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="text-muted-foreground">
                This Agreement is entered into as of <span className="font-mono">[Date]</span>, by and between:
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li><strong>Asset Safe</strong> ("Company"), located at <span className="font-mono">[Address]</span>, and</li>
                <li><strong><span className="font-mono">[Developer/CTO Name]</span></strong> ("Partner"), located at <span className="font-mono">[Address]</span>.</li>
              </ul>
              <p className="mt-2 text-muted-foreground">Collectively referred to as the "Parties."</p>
            </div>

            {/* Section 1: Purpose */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Purpose
              </h4>
              <p className="text-muted-foreground text-sm">
                The Company is developing a software platform known as <strong>Asset Safe</strong>, a secure digital inventory and 
                documentation system for homeowners, insurance readiness, and legacy planning.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Partner agrees to provide technology development, advisory, and/or CTO-level services to support the Company's product roadmap.
              </p>
            </div>

            {/* Section 2: Services */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Services to Be Provided
              </h4>
              <p className="text-muted-foreground text-sm mb-2">Partner will provide the following services ("Services"):</p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Backend development (APIs, edge functions, database logic)</li>
                <li>• Subscription and billing infrastructure (Stripe integration)</li>
                <li>• Security architecture and authentication systems</li>
                <li>• Ongoing technical strategy and scalability planning</li>
                <li>• Maintenance, bug fixes, and deployment support</li>
                <li>• Additional tasks may be agreed upon in writing</li>
              </ul>
            </div>

            {/* Section 3: Compensation */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                Compensation
              </h4>
              <p className="text-muted-foreground text-sm mb-3">Partner will be compensated as follows (check one):</p>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-5 h-5 border-2 rounded mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Option A: Cash Compensation</p>
                    <p className="text-xs text-muted-foreground">Company will pay Partner $<span className="font-mono">[Rate]</span>/hour or $<span className="font-mono">[Monthly Fee]</span>.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-5 h-5 border-2 rounded mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Option B: Equity Compensation</p>
                    <p className="text-xs text-muted-foreground">Partner will receive <span className="font-mono">[X]</span>% equity in the Company, subject to vesting terms below.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-5 h-5 border-2 rounded mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Option C: Hybrid</p>
                    <p className="text-xs text-muted-foreground">Partner will receive $<span className="font-mono">[Amount]</span> + <span className="font-mono">[X]</span>% equity, subject to vesting.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Equity Vesting */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                Equity Vesting (If Applicable)
              </h4>
              <p className="text-muted-foreground text-sm mb-2">Any equity granted under this Agreement shall vest as follows:</p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• 4-year vesting schedule</li>
                <li>• 1-year cliff</li>
                <li>• Vesting occurs monthly thereafter</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2 italic">
                If Partner stops providing Services before vesting, all unvested equity is forfeited.
              </p>
            </div>

            {/* Section 5: IP Ownership - CRITICAL */}
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                <Scale className="w-4 h-4 text-primary" />
                Intellectual Property Ownership
                <Badge variant="destructive" className="ml-2">MOST IMPORTANT</Badge>
              </h4>
              <p className="text-sm font-medium mb-2">Partner agrees that:</p>
              <p className="text-sm text-muted-foreground mb-3">
                All work product created under this Agreement is the <strong>exclusive property of the Company</strong>.
              </p>
              <p className="text-sm text-muted-foreground mb-2">This includes, without limitation:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {['Source code', 'Backend systems', 'UI/UX implementations', 'Database architecture', 'Documentation', 'Integrations', 'Automation workflows', 'AI valuation logic', 'Any inventions or discoveries'].map((item) => (
                  <div key={item} className="text-xs bg-background p-2 rounded border flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium">
                Partner hereby irrevocably assigns to the Company all rights, title, and interest in any such work product.
              </p>
              <p className="text-sm text-primary font-semibold mt-2">
                This is a "work-for-hire" and full IP assignment agreement.
              </p>
            </div>

            {/* Section 6: Pre-existing Tools */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
                Pre-Existing Tools or Code
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• If Partner uses any pre-existing libraries, frameworks, or proprietary tools, Partner must disclose them in writing.</li>
                <li>• Partner may not incorporate any third-party IP that would restrict Company ownership.</li>
              </ul>
            </div>

            {/* Section 7: Confidentiality */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">7</span>
                <Lock className="w-4 h-4" />
                Confidentiality + Non-Disclosure
              </h4>
              <p className="text-sm text-muted-foreground mb-2">Partner agrees to keep confidential all non-public information including:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {['Business plans', 'Customer data', 'Product roadmap', 'Codebase', 'Pricing strategy', 'Insurance partnerships', 'Investor discussions'].map((item) => (
                  <div key={item} className="text-xs bg-muted p-2 rounded flex items-center gap-1">
                    <Shield className="w-3 h-3 text-muted-foreground shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Partner may not disclose or use Company Confidential Information outside the scope of this Agreement.
              </p>
              <p className="text-sm font-medium mt-2">This obligation survives termination for 5 years.</p>
            </div>

            {/* Section 8: Non-Compete */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">8</span>
                Non-Compete / Non-Circumvention (Limited)
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Partner agrees that during the term of this Agreement and for <strong>12 months thereafter</strong>, Partner will not:
              </p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Build a directly competing product substantially similar to Asset Safe</li>
                <li>• Solicit Company customers, partners, or investors for a competing platform</li>
                <li>• Repurpose proprietary workflows developed inside Asset Safe</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2 italic">
                (Note: enforceability varies by state; Texas allows limited restrictions.)
              </p>
            </div>

            {/* Section 9: Access + Security */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">9</span>
                Access + Security
              </h4>
              <p className="text-sm text-muted-foreground mb-2">Partner will follow reasonable security practices including:</p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Using Company-owned GitHub repositories</li>
                <li>• Maintaining access controls</li>
                <li>• Not storing production data locally</li>
                <li>• Returning all credentials upon termination</li>
              </ul>
            </div>

            {/* Section 10: Term + Termination */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">10</span>
                Term + Termination
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                This Agreement begins on <span className="font-mono">[Start Date]</span> and continues until terminated.
              </p>
              <p className="text-sm text-muted-foreground mb-2">Either Party may terminate with <strong>14 days written notice</strong>.</p>
              <p className="text-sm text-muted-foreground mb-1">Upon termination:</p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• All work product must be delivered to Company</li>
                <li>• All access credentials must be returned</li>
                <li>• Unvested equity is forfeited</li>
              </ul>
            </div>

            {/* Section 11: Independent Contractor */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">11</span>
                <UserCheck className="w-4 h-4" />
                Independent Contractor Status
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Partner is an <strong>independent contractor</strong> and not an employee.
              </p>
              <p className="text-sm text-muted-foreground mb-1">Partner is responsible for:</p>
              <div className="flex gap-2 flex-wrap">
                {['Taxes', 'Insurance', 'Benefits', 'Equipment'].map((item) => (
                  <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Nothing herein creates an employment relationship.</p>
            </div>

            {/* Section 12: Dispute Resolution */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">12</span>
                Dispute Resolution
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Any disputes will be resolved first through good-faith mediation.</li>
                <li>• If unresolved, disputes will be handled in the courts of <strong>Collin County, Texas</strong>.</li>
              </ul>
            </div>

            {/* Section 13: Entire Agreement */}
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">13</span>
                Entire Agreement
              </h4>
              <p className="text-sm text-muted-foreground">
                This Agreement represents the full understanding between the Parties and supersedes prior discussions.
                Any modifications must be in writing and signed by both Parties.
              </p>
            </div>

            {/* Signatures */}
            <div className="border-t pt-6 mt-6">
              <h4 className="font-semibold text-lg mb-4">Signatures</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="font-medium">Asset Safe</p>
                  <div className="border-b border-dashed pb-6" />
                  <p className="text-sm text-muted-foreground">By: ___________________________</p>
                  <p className="text-sm"><strong>Name:</strong> Michael Lewis</p>
                  <p className="text-sm"><strong>Title:</strong> Founder</p>
                  <p className="text-sm"><strong>Date:</strong> _______________</p>
                </div>
                <div className="space-y-3">
                  <p className="font-medium">Partner / Developer / CTO</p>
                  <div className="border-b border-dashed pb-6" />
                  <p className="text-sm text-muted-foreground">By: ___________________________</p>
                  <p className="text-sm"><strong>Name:</strong> _________________________</p>
                  <p className="text-sm"><strong>Date:</strong> _______________</p>
                </div>
              </div>
            </div>

            {/* Optional Add-ons */}
            <div className="bg-muted/50 rounded-lg p-4 mt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Optional Add-Ons (Highly Recommended)
              </h4>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-background p-3 rounded border">
                  <p className="font-medium text-sm">Exhibit A</p>
                  <p className="text-xs text-muted-foreground">Scope of Work + Deliverables</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">(Prevents vague "I thought you meant…" issues)</p>
                </div>
                <div className="bg-background p-3 rounded border">
                  <p className="font-medium text-sm">Exhibit B</p>
                  <p className="text-xs text-muted-foreground">Equity Grant + Role Expectations</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">(Defines CTO authority, decision rights, vesting acceleration, etc.)</p>
                </div>
                <div className="bg-background p-3 rounded border">
                  <p className="font-medium text-sm">Exhibit C</p>
                  <p className="text-xs text-muted-foreground">Exit + Buyback Rights</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">(If they leave early, Company can repurchase vested shares.)</p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                Founder Recommendation for Asset Safe
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                If you're meeting CTO-level partners, you want <strong>two separate documents</strong>:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-background p-3 rounded border">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <span className="bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                    NDA
                  </p>
                  <p className="text-xs text-muted-foreground">(signed immediately before sharing details)</p>
                </div>
                <div className="bg-background p-3 rounded border">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <span className="bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                    CTO Partner Agreement
                  </p>
                  <p className="text-xs text-muted-foreground">(only after alignment)</p>
                </div>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-3 font-medium">
                Most founders jump straight into "equity discussions" without paper. This contract prevents 90% of startup horror stories.
              </p>
            </div>
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
