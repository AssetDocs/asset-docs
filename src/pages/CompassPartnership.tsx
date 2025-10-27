import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, TrendingUp, Users, Shield, CheckCircle2 } from 'lucide-react';

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
          <h1 className="text-4xl font-bold mb-4">Strategic Partnership Proposal</h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-2xl font-semibold text-primary">Compass</div>
            <span className="text-2xl text-muted-foreground">×</span>
            <div className="text-2xl font-semibold text-primary">AssetDocs</div>
          </div>
          <p className="text-xl text-muted-foreground">
            Elevating Client Experience Through Property Protection
          </p>
        </div>

        {/* Co-Branded Program */}
        <Card className="mb-8">
          <CardHeader>
            <Gift className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">The Compass × AssetDocs Property Protection</CardTitle>
            <CardDescription className="text-base">
              A co-branded client-gift program that sets Compass apart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Core Concept</h3>
              <p className="text-foreground">
                Every Compass client receives a <span className="font-bold text-primary">free year of AssetDocs property protection service</span> as part of their home purchase experience—positioning Compass as a brand that protects clients long after closing.
              </p>
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
                  Share documentation with up to 3 trusted contacts (family, contractors, etc.)
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <p className="text-center font-semibold text-lg">
                Total Annual Value to Homeowner: <span className="text-primary">$299+</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <TrendingUp className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">How It Works</CardTitle>
            <CardDescription className="text-base">
              Seamless integration into the Compass closing process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Compass Agent Closes Sale</h4>
                  <p className="text-muted-foreground">
                    Transaction completion automatically triggers a "Gift Subscription" in the AssetDocs system
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Branded Welcome Email</h4>
                  <p className="text-muted-foreground">
                    AssetDocs sends a co-branded email: <span className="italic">"Your Compass Home Protection, powered by AssetDocs"</span>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Client Activation</h4>
                  <p className="text-muted-foreground">
                    Client activates their dashboard → receives valuation updates, photo storage, and documentation tools
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Agent Visibility</h4>
                  <p className="text-muted-foreground">
                    Compass agent receives notifications on client engagement, demonstrating ongoing value and care
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Value Exchange */}
        <Card className="mb-8">
          <CardHeader>
            <Users className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">Value Exchange</CardTitle>
            <CardDescription className="text-base">
              A win-win partnership model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border-2 border-primary rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-primary">Compass Investment</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Bulk or per-client pricing at <span className="font-semibold text-foreground">$79/year per home</span></li>
                  <li>• Volume discounts available for high-transaction offices</li>
                  <li>• Optional tiered pricing based on home value or tier of service</li>
                </ul>
              </div>
              
              <div className="p-6 border-2 border-primary rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-primary">AssetDocs Delivers</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• IDX-based property valuation technology</li>
                  <li>• Long-term brand engagement with clients</li>
                  <li>• Co-branded experience reinforcing Compass value</li>
                  <li>• Agent engagement analytics and reporting</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-muted rounded-lg">
              <h4 className="font-semibold text-lg mb-3">Strategic Benefits for Compass</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold mb-1">Client Retention</p>
                  <p className="text-sm text-muted-foreground">Regular touchpoints keep Compass top-of-mind</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Referral Generation</p>
                  <p className="text-sm text-muted-foreground">Satisfied clients become advocates</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Competitive Edge</p>
                  <p className="text-sm text-muted-foreground">Differentiation in premium market</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bonus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Bonus Opportunity</CardTitle>
            <CardDescription className="text-base">
              Enhanced valuation accuracy through MLS integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">
              Compass may allow AssetDocs to pull their own MLS listing data for verified comparable properties (comps), significantly enhancing valuation model accuracy.
            </p>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="font-semibold mb-2">Result:</p>
              <p className="text-muted-foreground">
                More precise, real-time valuations that reinforce client confidence and strengthen the Compass brand as a technology-forward, client-first organization.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Client Experience?</h3>
          <p className="text-muted-foreground mb-6">
            Let's discuss how we can customize this partnership to align with Compass's unique brand and market position.
          </p>
          <div className="flex gap-4 justify-center">
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
