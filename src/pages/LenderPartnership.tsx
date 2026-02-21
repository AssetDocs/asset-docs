import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, ChevronDown, Shield, CheckCircle, Gift, TrendingUp, Heart, Banknote } from 'lucide-react';

const LenderPartnership: React.FC = () => {
  const navigate = useNavigate();
  const [openAdvantage, setOpenAdvantage] = React.useState(false);
  const [openGift, setOpenGift] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">Asset Safe for Lenders</h1>
          <p className="text-xl text-muted-foreground">Win before underwriting. Stay valuable after closing.</p>
        </div>

        {/* Section 1 */}
        <Collapsible open={openAdvantage} onOpenChange={setOpenAdvantage} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Shield className="w-6 h-6 text-primary" />
                  The Asset Safe Advantage
                </CardTitle>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openAdvantage ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-8 pt-0">
                <p className="text-muted-foreground">
                  Asset Safe is a secure, third-party documentation platform that helps borrowers organize, verify, and maintain their financial and property records—before they're needed and long after closing.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Why Lenders Care (Immediately)</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-foreground mb-3">🟢 Pre-Lending Advantage</h4>
                        <p className="text-sm text-muted-foreground mb-2">Borrowers using Asset Safe:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Arrive organized and prepared</li>
                          <li>Understand what documentation matters</li>
                          <li>Submit cleaner, more complete files</li>
                          <li>Reduce last-minute underwriting friction</li>
                        </ul>
                        <p className="text-sm font-medium text-primary mt-3">Result: Faster processing, fewer surprises, cleaner approvals.</p>
                      </CardContent>
                    </Card>
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-foreground mb-3">🟢 Reduced Risk Through Better Documentation</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Timestamped uploads</li>
                          <li>Structured asset organization</li>
                          <li>Photo & video documentation when relevant</li>
                          <li>Clear file history</li>
                        </ul>
                        <p className="text-sm font-medium text-primary mt-3">Result: Lower exposure, higher confidence.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">The Missed Opportunity in Lending</h3>
                  <p className="text-muted-foreground mb-3">Most lenders disappear after closing. Asset Safe allows you to:</p>
                  <ul className="text-muted-foreground space-y-1 list-disc pl-5 mb-3">
                    <li>Stay valuable without selling</li>
                    <li>Be remembered for foresight, not paperwork</li>
                    <li>Support homeowners during real-life moments:</li>
                  </ul>
                  <div className="flex flex-wrap gap-2 pl-5">
                    {['Insurance claims', 'Refinances', 'Estate planning', 'Life changes'].map(item => (
                      <span key={item} className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">The Big Differentiator: Asset Safe as a Closing Gift</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Instead of:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                        <li>Branded swag</li>
                        <li>Bottles of wine</li>
                        <li>Gift cards that get forgotten</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">You give:</p>
                      <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
                        <li>A secure digital vault</li>
                        <li>Long-term protection</li>
                        <li>Organization during stressful moments</li>
                        <li>A gift that grows in value over time</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">What This Does for Your Brand</h3>
                  <div className="space-y-2">
                    {[
                      'Elevates perceived value',
                      'Builds long-term trust',
                      'Drives organic referrals',
                      'Positions you as proactive and modern',
                      'Keeps your name relevant years after closing',
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground border-l-4 border-primary pl-4 italic">
                  Asset Safe helps lenders close smarter and build lasting relationships by giving borrowers a secure, verified way to organize and protect their most important documents—before and after the loan.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 2 */}
        <Collapsible open={openGift} onOpenChange={setOpenGift} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Gift className="w-6 h-6 text-primary" />
                  A Modern Closing Gift for Modern Lenders
                </CardTitle>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openGift ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-8 pt-0">
                <div className="text-center">
                  <p className="text-lg text-muted-foreground italic">Not all gifts are remembered.</p>
                  <p className="text-lg font-medium text-foreground">The right one becomes part of someone's life.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Why Asset Safe Works as a Gift</h3>
                  <div className="space-y-2">
                    {[
                      'Immediately useful',
                      'Emotionally aligned with homeownership',
                      'Feels premium without being flashy',
                      'No clutter, no waste',
                      'Zero awkward selling',
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-muted-foreground italic border-l-4 border-primary pl-4">
                    "We didn't just help you buy your home—we helped you protect everything in it."
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Gift Packages for Lenders</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-primary/30">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🎁</span>
                          <h4 className="font-semibold text-foreground">Essential Home Gift</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Perfect for standard closings</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Secure document vault</li>
                          <li>Property & asset organization</li>
                          <li>Guided onboarding</li>
                          <li>Easy sharing with trusted contacts</li>
                        </ul>
                        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                          <span>Duration: 12 months</span>
                          <span>Lender Cost: Low</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🎁</span>
                          <h4 className="font-semibold text-foreground">Premium Homeowner Gift</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Ideal for repeat clients & higher-value loans</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Everything in Essential</li>
                          <li>Expanded storage</li>
                          <li>Advanced asset categories</li>
                          <li>Long-term readiness features</li>
                        </ul>
                        <div className="mt-4 text-xs text-muted-foreground">
                          <span>Duration: 12 months</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">How Lenders Use It</h3>
                  <ul className="text-muted-foreground space-y-1 list-disc pl-5">
                    <li>Included in closing package</li>
                    <li>Delivered via co-branded welcome page</li>
                    <li>Positioned as a "thank you" — not software</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    After the gift period: Homeowners choose whether to continue on their own. No pressure. No awkwardness.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Why This Makes Financial Sense for Lenders</h3>
                  <div className="space-y-2">
                    {[
                      'Costs less than many physical gifts',
                      'Feels more valuable than it costs',
                      'Reinforces trust instead of advertising',
                      'Creates long-term brand recall',
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2 text-muted-foreground">
                        <Banknote className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                    <p className="text-sm font-medium text-primary mt-2">This is a relationship investment, not an expense.</p>
                  </div>
                </div>

                <Card className="bg-accent/50 border-none">
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground italic mb-2">
                      "This ended up being one of the most useful things we received when we bought our home."
                    </p>
                    <p className="text-sm text-muted-foreground">— That's the reaction lenders want.</p>
                  </CardContent>
                </Card>

                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-foreground">Close With Confidence</h3>
                  <p className="text-muted-foreground">Asset Safe isn't another tool. It's a statement.</p>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {['We think ahead', 'We care beyond closing', 'We protect what matters'].map(item => (
                      <span key={item} className="bg-primary/10 text-primary text-sm px-4 py-2 rounded-full font-medium">{item}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
};

export default LenderPartnership;
