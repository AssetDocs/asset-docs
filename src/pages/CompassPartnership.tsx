import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, TrendingUp, Users, Shield, CheckCircle2, Home, FileText, Briefcase, Lightbulb, Target, Mail } from 'lucide-react';

const CompassPartnership = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🏠 Partnership Proposal</h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-3xl font-bold text-primary">Compass</div>
            <span className="text-3xl text-muted-foreground">×</span>
            <div className="text-3xl font-bold text-primary">Asset Safe</div>
          </div>
          <p className="text-xl text-muted-foreground font-semibold">
            Empowering Homeowners with Verified Digital Home Records
          </p>
        </div>

        {/* Executive Summary */}
        <Card className="mb-8">
          <CardHeader>
            <Target className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Objective</h3>
              <p className="text-foreground">
                Forge a partnership between Compass and Asset Safe to provide Compass clients with verified, AI-enhanced digital property records — a value-add that extends Compass's client relationship beyond the transaction.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Vision</h3>
              <p className="text-foreground">
                Every Compass-represented homebuyer or seller receives a personalized <span className="font-bold text-primary">"Digital Home Record"</span> — powered by Asset Safe — that stores 3D documentation, floorplans, AI-generated valuations, and photo verification. This becomes a Compass-branded lifetime resource for homeowners, reinforcing Compass as the trusted partner in property ownership, protection, and resale readiness.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* About Asset Docs */}
        <Card className="mb-8">
          <CardHeader>
            <Home className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">About Asset Safe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              Asset Safe is a third-party verification and property-documentation platform built for insurers, real-estate professionals, and homeowners. It enables users to create interactive 3D property records, AI-assisted valuations, and secure digital archives of home assets for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Insurance claims and disaster recovery</li>
              <li>Estate management and home value tracking</li>
              <li>Pre-listing verification and buyer confidence</li>
            </ul>
            <div className="mt-6">
              <h4 className="font-semibold text-lg mb-3">Core Features</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm">AI photo-based valuation + market data integration</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm">Floorplans and room-by-room photo records</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm">Document vault for receipts, warranties, and records</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm">Automated insurance and estate-planning reporting</p>
                </div>
                <div className="p-3 bg-muted rounded-lg col-span-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm">Subscription tiers with scalable storage (25GB–100GB+)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Compass */}
        <Card className="mb-8">
          <CardHeader>
            <Lightbulb className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Why Compass</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              Compass's tech-driven philosophy aligns perfectly with Asset Safe's mission. By integrating Asset Safe into Compass's ecosystem:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold bg-muted">Compass Priority</th>
                    <th className="text-left p-3 font-semibold bg-muted">Asset Safe Solution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">Enhance client experience beyond closing</td>
                    <td className="p-3 text-primary font-medium">Provide a branded digital home record</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Empower agents with marketing differentiators</td>
                    <td className="p-3 text-primary font-medium">"Compass-Verified Home Record" badge</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Strengthen data and valuation insights</td>
                    <td className="p-3 text-primary font-medium">AI + MLS-backed valuation dashboard</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Drive repeat business</td>
                    <td className="p-3 text-primary font-medium">Annual valuation updates + maintenance reminders</td>
                  </tr>
                  <tr>
                    <td className="p-3">Protect brand trust</td>
                    <td className="p-3 text-primary font-medium">3rd-party verified documentation platform</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Partnership Concept */}
        <Card className="mb-8">
          <CardHeader>
            <Gift className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Partnership Concept: "Compass Home Record Program"</CardTitle>
            <CardDescription className="text-base">
              Tagline: "Your Compass Home Record — powered by Asset Safe."
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Core Concept</h3>
              <p className="text-foreground">
                Every Compass client receives a <span className="font-bold text-primary">free year of Asset Safe property protection service</span> as part of their home purchase experience—positioning Compass as a brand that protects clients long after closing.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">How it Works</h3>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <p className="font-medium">Compass agent enrolls a client</p>
                    <p className="text-sm text-muted-foreground">Via CRM integration or direct invite</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <p className="font-medium">Asset Safe auto-creates a Digital Home Record</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                      <li>MLS listing data (via Compass IDX/API)</li>
                      <li>Property photos and floorplans</li>
                      <li>Initial AI valuation + comp data</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <p className="font-medium">Client receives branded welcome email</p>
                    <p className="text-sm text-muted-foreground italic">"Your Digital Home Record, powered by Compass and Asset Safe."</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <p className="font-medium">Dashboard Access</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                      <li>Client uploads photos, documents, and requests valuations</li>
                      <li>Compass agents retain view-only access to track engagement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services & Value */}
        <Card className="mb-8">
          <CardHeader>
            <Shield className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Services & Value to Homeowners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-semibold mb-2">Real-Time Property Valuation</h4>
                <p className="text-sm text-muted-foreground">
                  IDX-based automated updates keep clients informed of their home's value
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-semibold mb-2">Comprehensive Photo Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Unlimited photo documentation of assets, upgrades, and property conditions
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-semibold mb-2">Asset Documentation Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Track receipts, warranties, and improvements for insurance and resale value
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-semibold mb-2">Post-Damage Documentation</h4>
                <p className="text-sm text-muted-foreground">
                  Streamlined claims process with pre-documented property conditions
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-semibold mb-2">Voice Notes & Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Easy documentation capture and detailed exportable reports
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-semibold mb-2">Secure Sharing</h4>
                <p className="text-sm text-muted-foreground">
                  Share documentation with trusted contacts (family, contractors, etc.)
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <p className="text-center font-semibold text-lg">
                Total Annual Value to Homeowner: <span className="text-primary text-2xl">$299+</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Program Options */}
        <Card className="mb-8">
          <CardHeader>
            <Briefcase className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Program Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold bg-muted">Model</th>
                    <th className="text-left p-3 font-semibold bg-muted">Description</th>
                    <th className="text-left p-3 font-semibold bg-muted">Cost Structure</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-semibold text-primary">Gift Subscription (Preferred)</td>
                    <td className="p-3">Compass provides 1-year free access for every buyer/seller at closing</td>
                    <td className="p-3 font-medium">$79–$99 per home (volume-based discount)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-semibold">Agent Add-On</td>
                    <td className="p-3">Agents optionally gift Asset Safe access to clients as a personal brand gesture</td>
                    <td className="p-3 font-medium">$99 retail / $69 agent price</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Enterprise Partnership</td>
                    <td className="p-3">Compass integrates Asset Safe API directly into its proprietary platform</td>
                    <td className="p-3 font-medium">Custom licensing model</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Technical Integration */}
        <Card className="mb-8">
          <CardHeader>
            <FileText className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Technical Integration Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold bg-muted">Component</th>
                    <th className="text-left p-3 font-semibold bg-muted">Platform</th>
                    <th className="text-left p-3 font-semibold bg-muted">Function</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Authentication / Billing</td>
                    <td className="p-3">Supabase Auth + Stripe + Compass SSO</td>
                    <td className="p-3 text-muted-foreground">Seamless onboarding</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Data Source</td>
                    <td className="p-3">Compass MLS / IDX feed</td>
                    <td className="p-3 text-muted-foreground">Auto-populate home details</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Storage & AI Engine</td>
                    <td className="p-3">Supabase + OpenAI</td>
                    <td className="p-3 text-muted-foreground">Photo analysis + valuation</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Dashboard</td>
                    <td className="p-3">Lovable WebApp</td>
                    <td className="p-3 text-muted-foreground">Client interaction + valuation display</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Branding</td>
                    <td className="p-3">Compass x Asset Safe co-brand</td>
                    <td className="p-3 text-muted-foreground">Consistent white-label experience</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-2">API Integration Option:</p>
              <p className="text-sm text-muted-foreground">
                Asset Safe can integrate via Compass's Bridge API or RESO Web API to automatically pull recent listings and populate property data.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Brand & Marketing Value */}
        <Card className="mb-8">
          <CardHeader>
            <TrendingUp className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Brand & Marketing Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 border-2 border-primary/20 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-primary">For Compass Agents</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Differentiates listings with "Compass-Verified Property Record"</li>
                  <li>• Adds retention touchpoint for annual value updates</li>
                  <li>• Reinforces Compass's reputation for modern, tech-enhanced service</li>
                </ul>
              </div>
              
              <div className="p-4 border-2 border-primary/20 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-primary">For Compass Corporate</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Creates a data bridge between homeownership and resale</li>
                  <li>• Enables branded touchpoints long after closing</li>
                  <li>• Potential for Compass Analytics to leverage anonymized valuation trends</li>
                </ul>
              </div>
              
              <div className="p-4 border-2 border-primary/20 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-primary">For Clients</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Single, secure digital space to store property photos and records</li>
                  <li>• Continuous valuation insights for refinance or resale decisions</li>
                  <li>• Confidence that property details are independently verified</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pilot Program */}
        <Card className="mb-8">
          <CardHeader>
            <Users className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Pilot Program Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Initial Launch Regions</h4>
                <p className="text-muted-foreground">Dallas–Fort Worth, Austin, Denver, and Los Angeles</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pilot Duration</h4>
                <p className="text-muted-foreground">90 days</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Deliverables</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">Up to 250 complimentary Digital Home Records for Compass clients</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">Branded dashboard and reporting</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">Co-branded email templates and digital collateral</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">Analytics on client engagement, valuations, and feature usage</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Success Metrics</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">Agent adoption rate</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">Client activation %</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">Repeat valuation engagement</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">Post-closing satisfaction score</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <Target className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</div>
                <p className="text-foreground pt-1">Schedule a 30-minute introduction with Compass regional leadership (Product or Partnerships)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
                <p className="text-foreground pt-1">Define pilot parameters and data integration pathway (MLS / IDX API)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">3</div>
                <p className="text-foreground pt-1">Draft a data-use agreement and co-branding plan</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">4</div>
                <p className="text-foreground pt-1">Begin 90-day pilot rollout with participating agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bonus Opportunity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Bonus Opportunity</CardTitle>
            <CardDescription className="text-base">
              Enhanced valuation accuracy through MLS integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">
              Compass may allow Asset Safe to pull their own MLS listing data for verified comparable properties (comps), significantly enhancing valuation model accuracy.
            </p>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="font-semibold mb-2">Result:</p>
              <p className="text-muted-foreground">
                More precise, real-time valuations that reinforce client confidence and strengthen the Compass brand as a technology-forward, client-first organization.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <Mail className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Michael Lewis</p>
              <p className="text-muted-foreground">Founder, Asset Safe</p>
              <div className="flex items-center gap-2 mt-4">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:support@assetsafe.net" className="text-primary hover:underline">support@assetsafe.net</a>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                <a href="https://www.assetsafe.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.assetsafe.net</a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Client Experience?</h3>
          <p className="text-muted-foreground mb-6">
            Let's discuss how we can customize this partnership to align with Compass's unique brand and market position.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/contact')}>
              Schedule a Meeting
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/admin')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompassPartnership;
