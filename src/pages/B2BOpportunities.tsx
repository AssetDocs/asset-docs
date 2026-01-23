import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Building2, 
  Home, 
  Hammer, 
  Scale, 
  Users, 
  Landmark, 
  HardHat,
  CheckCircle,
  Target,
  Lightbulb
} from 'lucide-react';

const B2BOpportunities = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">B2B Opportunities</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Strategic partnership categories for Asset Safe expansion
          </p>
        </div>

        {/* 1. Insurance & Risk */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">1️⃣ Insurance & Risk-Adjoining Organizations</CardTitle>
                <p className="text-sm text-green-600 font-medium mt-1">Very Strong Fit</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why this works</h3>
              <p className="text-muted-foreground">
                They live in the before + after loss space but rarely provide tools that help before claims happen.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Independent Insurance Agents & Brokers of America (Big "Trusted Advisor" energy)</li>
                <li>Regional insurance broker associations</li>
                <li>Property & casualty carrier affinity programs</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Asset Safe Positioning</h3>
              <p className="text-primary font-medium italic">"Claim readiness & documentation tool for policyholders"</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Value to them</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Fewer disputes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Better documentation</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Higher customer satisfaction</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Reduced friction (even if claims still occur)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 2. Mortgage, Lending & Title */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">2️⃣ Mortgage, Lending & Title Companies</CardTitle>
                <p className="text-sm text-amber-600 font-medium mt-1">Underrated but Powerful</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why this works</h3>
              <p className="text-muted-foreground mb-2">These companies already guide people through:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Ownership</li>
                <li>Risk disclosures</li>
                <li>Long-term responsibility</li>
              </ul>
              <p className="text-muted-foreground mt-2">They want to stay relevant after closing.</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Mortgage broker networks</li>
                <li>Title & escrow firms</li>
                <li>First-time homebuyer programs</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Asset Safe Positioning</h3>
              <p className="text-primary font-medium italic">"Post-close homeowner protection & documentation benefit"</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Why they say yes</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Extends relationship beyond transaction</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Differentiates them from competitors</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Zero ongoing liability</li>
              </ul>
              <p className="text-muted-foreground mt-3 italic">This pairs beautifully with new homeowner kits.</p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Property Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">3️⃣ Property Management Companies</CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1">Residential & Commercial</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why this works</h3>
              <p className="text-muted-foreground mb-2">Property managers deal with:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Disputes</li>
                <li>Damage</li>
                <li>Move-in / move-out condition issues</li>
                <li>Tenant accountability</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Multi-family property managers</li>
                <li>HOA management firms</li>
                <li>Commercial building operators</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Asset Safe Positioning</h3>
              <p className="text-primary font-medium italic">"Condition documentation & personal property protection"</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Value</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Clear records</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Reduced finger-pointing</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Better tenant/owner communication</li>
              </ul>
              <p className="text-muted-foreground mt-3 italic">This is especially strong for high-end rentals.</p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Restoration & Disaster Recovery */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Hammer className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">4️⃣ Restoration & Disaster Recovery Companies</CardTitle>
                <p className="text-sm text-green-600 font-medium mt-1">Extremely Natural</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why this works</h3>
              <p className="text-muted-foreground">
                They show up after things go wrong — when documentation is missing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Fire & water restoration companies</li>
                <li>Storm response contractors</li>
                <li>Mold remediation firms</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Asset Safe Positioning</h3>
              <p className="text-primary font-medium italic">"Pre-loss documentation = faster recovery"</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Why they love it</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Faster job approvals</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Fewer claim delays</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Smoother coordination with insurers</li>
              </ul>
              <p className="text-muted-foreground mt-3 italic">This can even be referral-based.</p>
            </div>
          </CardContent>
        </Card>

        {/* 5. Estate Planning */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">5️⃣ Estate Planning, Trust & Elder Care Networks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why this works</h3>
              <p className="text-muted-foreground mb-2">These organizations already talk about:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Legacy</li>
                <li>Organization</li>
                <li>Reducing burden on family</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Estate planning attorney networks</li>
                <li>Elder care advisors</li>
                <li>Financial planners (fee-only RIAs)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Asset Safe Positioning</h3>
              <p className="text-primary font-medium italic">"Digital household record & legacy documentation"</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Value</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Helps families during transition</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Reduces chaos after loss</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Complements wills & trusts</li>
              </ul>
              <p className="text-muted-foreground mt-3 italic">This ties directly into your Legacy Locker concept.</p>
            </div>
          </CardContent>
        </Card>

        {/* 6. Employer Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">6️⃣ Employer Benefits & Employee Assistance Programs (EAPs)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why this works</h3>
              <p className="text-muted-foreground mb-2">Employers are desperate for:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Meaningful benefits</li>
                <li>Stress-reducing tools</li>
                <li>Non-health perks that actually get used</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>EAP providers</li>
                <li>HR benefits brokers</li>
                <li>Corporate wellness programs</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Asset Safe Positioning</h3>
              <p className="text-primary font-medium italic">"Personal preparedness & life-event resilience benefit"</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Works especially well for</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Utility companies</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Municipal workers</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Healthcare systems</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 7. Financial Institutions */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Landmark className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">7️⃣ Financial Institutions & Credit Unions</CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1">Trust Heavy</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why this works</h3>
              <p className="text-muted-foreground mb-2">Credit unions and community banks emphasize:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Member care</li>
                <li>Long-term relationships</li>
                <li>Financial resilience</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Regional credit unions</li>
                <li>Community banks</li>
                <li>Member-owned financial institutions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Asset Safe Positioning</h3>
              <p className="text-primary font-medium italic">"Member household protection & documentation vault"</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">They LOVE things that feel</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Protective</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Non-predatory</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Community-oriented</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 8. Builders & Developers */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <HardHat className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">8️⃣ Builders, Developers & New Construction Programs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Why this works</h3>
              <p className="text-muted-foreground mb-2">Builders already hand over:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Warranties</li>
                <li>Manuals</li>
                <li>Disclosures</li>
              </ul>
              <p className="text-muted-foreground mt-2">They don't handle:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Personal property documentation</li>
                <li>Ongoing homeowner readiness</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Regional home builders</li>
                <li>Luxury developers</li>
                <li>Build-to-rent operators</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Asset Safe Positioning</h3>
              <p className="text-primary font-medium italic">"New homeowner readiness & documentation toolkit"</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Pairs beautifully with</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Move-in walkthroughs</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Warranty packets</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Closing gifts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* The Pattern - Key Insight */}
        <Card className="mb-8 border-2 border-primary">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">The Pattern (This Is the Key Insight)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="text-center">
              <p className="text-lg font-semibold mb-4">Every strong partner shares this truth:</p>
              <p className="text-2xl font-bold text-primary mb-6">They already care, but they lack a tool.</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Asset Safe becomes:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-lg">The tool behind the care</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-lg">The infrastructure behind advocacy</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-lg">The system behind preparedness</span>
                </li>
              </ul>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xl font-bold text-primary">
                That's why this model scales horizontally across industries.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button onClick={() => navigate('/admin')} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default B2BOpportunities;
