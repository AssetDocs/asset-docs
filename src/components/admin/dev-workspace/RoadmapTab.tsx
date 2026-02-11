import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Map, Shield, CreditCard, Mail, HardDrive, FileOutput, Activity, Brain, Rocket, Building2, Smartphone, Users, BarChart3, Zap, Globe, CheckCircle2 } from 'lucide-react';

interface WeekBlock {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

interface Phase {
  id: string;
  label: string;
  emoji: string;
  title: string;
  timeline: string;
  goal: string;
  color: string;
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
  weeks: WeekBlock[];
  notes?: string[];
}

const phases: Phase[] = [
  {
    id: 'phase-0',
    label: 'Phase 0',
    emoji: '🏗',
    title: 'Foundation Stabilization',
    timeline: '2–3 Weeks',
    goal: 'Make the platform secure and technically correct before pushing growth.',
    color: 'border-red-500/60 bg-red-500/5',
    badgeVariant: 'destructive',
    weeks: [
      {
        title: 'Week 1 – Security + Roles',
        icon: <Shield className="w-4 h-4" />,
        items: [
          'Backend: Confirm full RLS enforcement',
          'Backend: Confirm role table logic',
          'Backend: Lock Premium vs Standard feature access',
          'Backend: Test bypass attempts',
          'Frontend: Hide gated features visually',
          'Frontend: Confirm backend still blocks direct URL attempts',
          'Frontend: Secure Vault MFA enforcement',
          'Edge Functions: Secure vault unlock logic',
          'Edge Functions: Trusted contact invitation function',
        ],
      },
      {
        title: 'Week 2 – Stripe + Subscription Sync',
        icon: <CreditCard className="w-4 h-4" />,
        items: [
          'Stripe: Products & price IDs locked',
          'Stripe: Monthly + annual verified',
          'Stripe: Cancellation logic clean',
          'Webhook: checkout.session.completed',
          'Webhook: invoice.payment_failed',
          'Webhook: customer.subscription.updated',
          'Webhook: customer.subscription.deleted',
          'DB Sync: Subscription status updates role automatically',
          'DB Sync: Downgrade removes Premium access immediately',
        ],
      },
      {
        title: 'Week 3 – Email Infrastructure',
        icon: <Mail className="w-4 h-4" />,
        items: [
          'Welcome email',
          'Subscription confirmation',
          'Failed payment warning',
          'Trusted contact invite',
          'Password reset',
          'SPF / DKIM / DMARC verified',
        ],
      },
    ],
  },
  {
    id: 'phase-1',
    label: 'Phase 1',
    emoji: '💰',
    title: 'Revenue Lock + Launch Ready',
    timeline: '3–4 Weeks',
    goal: 'Ready for real paying customers.',
    color: 'border-yellow-500/60 bg-yellow-500/5',
    badgeVariant: 'default',
    weeks: [
      {
        title: 'Week 4 – Storage + Upload System',
        icon: <HardDrive className="w-4 h-4" />,
        items: [
          'Enforce storage limits',
          'Enforce property limits (Standard vs Premium)',
          'Upload error handling',
          'High-value item tagging',
          'File categorization logic',
        ],
      },
      {
        title: 'Week 5 – Claim-Ready Export Engine',
        icon: <FileOutput className="w-4 h-4" />,
        items: [
          'Full documentation export',
          'High-value summary page',
          'Timestamped proof',
          'Clean branding',
          'Executor-ready version',
        ],
      },
      {
        title: 'Week 6 – Logging + Monitoring',
        icon: <Activity className="w-4 h-4" />,
        items: [
          'Supabase log review system',
          'Stripe webhook monitoring',
          'Admin activity logs',
          'Account access log (for users)',
        ],
      },
    ],
    notes: ['The Claim-Ready Export Engine becomes a core selling feature.'],
  },
  {
    id: 'phase-2',
    label: 'Phase 2',
    emoji: '🧠',
    title: 'Retention + Authority',
    timeline: '4–6 Weeks',
    goal: 'Make users stay and feel secure.',
    color: 'border-blue-500/60 bg-blue-500/5',
    badgeVariant: 'secondary',
    weeks: [
      {
        title: 'Onboarding Optimization',
        icon: <CheckCircle2 className="w-4 h-4" />,
        items: [
          '"Start Here" checklist',
          '% complete tracker',
          'Email nudges for incomplete setup',
          'Vault completion badge',
        ],
      },
      {
        title: 'Dashboard Refinement',
        icon: <BarChart3 className="w-4 h-4" />,
        items: [
          'High-value container visible',
          'Cleaner Secure Vault hierarchy (Vault → Password Catalog → Legacy Locker)',
          'Owner vs Dev toggle stable',
        ],
      },
      {
        title: 'Security Trust Layer',
        icon: <Shield className="w-4 h-4" />,
        items: [
          '🔒 Security Info page refined',
          'Clear explanation of encryption',
          'Clear explanation of storage & data ownership',
          'Legal disclaimers aligned',
        ],
      },
    ],
  },
  {
    id: 'phase-3',
    label: 'Phase 3',
    emoji: '🚀',
    title: 'Expansion + Growth Systems',
    timeline: '6–8 Weeks',
    goal: 'Add growth engines.',
    color: 'border-green-500/60 bg-green-500/5',
    badgeVariant: 'outline',
    weeks: [
      {
        title: 'Influencer / Affiliate Tracking',
        icon: <Users className="w-4 h-4" />,
        items: [
          'Referral codes',
          'Stripe metadata mapping',
          'Commission tracking dashboard',
        ],
      },
      {
        title: 'AI Valuation System',
        icon: <Brain className="w-4 h-4" />,
        items: [
          'Photo upload → AI valuation',
          'Confidence score',
          'Disclaimer automation',
          'Tagline: "Know what you own."',
        ],
      },
      {
        title: 'White-Label Foundation',
        icon: <Globe className="w-4 h-4" />,
        items: [
          'Custom logo injection',
          'Company name header',
          'Admin controls',
          'Tiered enterprise pricing logic',
        ],
      },
    ],
  },
  {
    id: 'phase-4',
    label: 'Phase 4',
    emoji: '🏢',
    title: 'Enterprise + Scale',
    timeline: 'Ongoing',
    goal: 'Position for real contracts.',
    color: 'border-purple-500/60 bg-purple-500/5',
    badgeVariant: 'outline',
    weeks: [
      {
        title: 'Enterprise Controls',
        icon: <Building2 className="w-4 h-4" />,
        items: [
          'Bulk user import',
          'Company dashboard',
          'Usage reporting',
          'Admin-level analytics',
        ],
      },
      {
        title: 'Performance Optimization',
        icon: <Zap className="w-4 h-4" />,
        items: [
          'Image compression',
          'CDN tuning',
          'Query optimization',
          'Caching',
        ],
      },
      {
        title: 'PWA → App Strategy',
        icon: <Smartphone className="w-4 h-4" />,
        items: [
          'Improve Add to Home Screen flow',
          'Push notification groundwork',
          'Eventually wrap with Capacitor, Expo, or full native rebuild',
        ],
      },
    ],
  },
];

const assumptions = [
  'Supabase backend',
  'Stripe billing',
  'Resend email',
  'Role-based access',
  'Browser-first product (PWA later)',
];

export const RoadmapTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Product Roadmap
          </CardTitle>
          <CardDescription>
            Strategic phased plan from foundation to enterprise scale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {assumptions.map((a) => (
              <Badge key={a} variant="secondary" className="text-xs">
                {a}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <Accordion type="multiple" defaultValue={['phase-0']} className="space-y-4">
        {phases.map((phase) => (
          <AccordionItem key={phase.id} value={phase.id} className="border-none">
            <Card className={`border-l-4 ${phase.color}`}>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="text-xl">{phase.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={phase.badgeVariant} className="text-xs">{phase.label}</Badge>
                      <span className="font-semibold">{phase.title}</span>
                      <span className="text-xs text-muted-foreground">({phase.timeline})</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{phase.goal}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {phase.weeks.map((week, idx) => (
                    <Card key={idx} className="border bg-card">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {week.icon}
                          {week.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <ul className="space-y-1.5">
                          {week.items.map((item, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {phase.notes && (
                  <div className="mt-3 p-3 rounded-md bg-muted/50 border border-dashed">
                    {phase.notes.map((note, i) => (
                      <p key={i} className="text-xs text-muted-foreground italic">💡 {note}</p>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="text-xs text-muted-foreground text-center">
        💡 This roadmap is for internal planning. Update via code as priorities shift.
      </p>
    </div>
  );
};
