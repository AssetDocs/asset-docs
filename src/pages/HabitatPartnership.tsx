import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Shield, FileText, Users, DollarSign, Target, CheckCircle, Building, Heart, AlertTriangle, Handshake, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const HabitatPartnership = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    'why-fits': true,
    'partnership-options': false,
    'where-lives': false,
    'product-tier': false,
    'revenue-model': false,
    'why-yes': false,
    'rollout': false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-brand-blue">🏠 Asset Safe × Habitat for Humanity</h1>
            <p className="text-muted-foreground">B2B Partnership Concept: "Homeownership Protection & Resilience Program"</p>
          </div>
        </div>

        {/* Core Idea */}
        <Card className="mb-8 border-l-4 border-l-brand-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-brand-blue" />
              Core Idea
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-brand-blue mb-4">
              Habitat doesn't just build homes — they build stability.
            </p>
            <p className="text-muted-foreground mb-4">
              Asset Safe becomes the digital layer that helps Habitat homeowners:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Protect what they own</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Document their home and belongings</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-green-600" />
                <span>Recover faster after disaster</span>
              </li>
              <li className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-600" />
                <span>Build generational security</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Why This Fits */}
        <Collapsible open={openSections['why-fits']} onOpenChange={() => toggleSection('why-fits')} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-brand-blue" />
                  Why This Fits Habitat's Business Model
                </CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections['why-fits'] ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Affordable Homeownership */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Affordable Homeownership</h4>
                  <p className="text-sm text-muted-foreground mb-2">Families purchase homes with manageable mortgages.</p>
                  <p className="text-sm font-medium">Asset Safe adds:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>A digital "homeownership binder"</li>
                    <li>Asset + home documentation</li>
                    <li>Peace-of-mind protection</li>
                  </ul>
                </div>

                {/* Education + Stewardship */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">✅ Education + Stewardship</h4>
                  <p className="text-sm text-muted-foreground mb-2">Habitat requires "homeowner education" (maintenance, budgeting, insurance).</p>
                  <p className="text-sm font-medium">Asset Safe becomes part of the curriculum:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>"How to document your home"</li>
                    <li>"How to prepare for emergencies"</li>
                    <li>"How to simplify insurance claims"</li>
                  </ul>
                </div>

                {/* Disaster Response */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">✅ Disaster Response + Rebuilding</h4>
                  <p className="text-sm text-muted-foreground mb-2">Habitat is deeply involved in rebuilding after: Fires, Floods, Tornadoes, Hurricanes</p>
                  <p className="text-sm font-medium">Asset Safe makes recovery faster:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Pre-loss documentation</li>
                    <li>Post-loss uploads</li>
                    <li>Centralized records for FEMA/insurance</li>
                  </ul>
                </div>

                {/* Community Support */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">✅ Community Support & Donor Trust</h4>
                  <p className="text-sm text-muted-foreground mb-2">Habitat depends on donors and partners.</p>
                  <p className="text-sm font-medium">Asset Safe strengthens reporting:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Verified home documentation</li>
                    <li>Impact tracking</li>
                    <li>Digital transparency</li>
                  </ul>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Partnership Structure Options */}
        <Collapsible open={openSections['partnership-options']} onOpenChange={() => toggleSection('partnership-options')} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-6 w-6 text-brand-blue" />
                  Partnership Structure Options
                </CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections['partnership-options'] ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Option 1 */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-brand-blue mb-2">Option 1: "Habitat Homeowner Digital Starter Kit"</h4>
                  <p className="text-sm text-muted-foreground mb-3">Every new Habitat homeowner receives:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mb-3">
                    <li>Asset Safe account</li>
                    <li>Property record vault</li>
                    <li>Guided home inventory checklist</li>
                    <li>Emergency documentation tools</li>
                  </ul>
                  <p className="text-sm italic">Included as part of closing/onboarding</p>
                  <div className="mt-3 p-3 bg-muted rounded">
                    <p className="text-sm"><strong>Habitat benefit:</strong> better-prepared homeowners</p>
                    <p className="text-sm"><strong>Asset Safe benefit:</strong> scaled distribution through affiliates</p>
                  </div>
                </div>

                {/* Option 2 */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-brand-blue mb-2">Option 2: Sponsor-Funded Memberships</h4>
                  <p className="text-sm text-muted-foreground mb-3">Habitat can offer Asset Safe memberships paid by:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mb-3">
                    <li>Insurance partners</li>
                    <li>Banks/mortgage sponsors</li>
                    <li>Local corporate donors</li>
                  </ul>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm italic">"State Farm sponsors 500 Habitat families with Asset Safe protection."</p>
                  </div>
                  <div className="mt-3 p-3 bg-muted rounded">
                    <p className="text-sm"><strong>Habitat wins:</strong> donor value-add</p>
                    <p className="text-sm"><strong>Sponsor wins:</strong> community goodwill</p>
                    <p className="text-sm"><strong>Asset Safe wins:</strong> recurring revenue</p>
                  </div>
                </div>

                {/* Option 3 */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-brand-blue mb-2">Option 3: Disaster Resilience Program Add-On</h4>
                  <p className="text-sm text-muted-foreground mb-3">Habitat affiliates offer Asset Safe as part of:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mb-3">
                    <li>Disaster prep packages</li>
                    <li>Recovery services</li>
                    <li>Community resilience grants</li>
                  </ul>
                  <p className="text-sm italic">This aligns with federal/community funding.</p>
                </div>

                {/* Option 4 */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-brand-blue mb-2">Option 4: Habitat Affiliate Enterprise Dashboard</h4>
                  <p className="text-sm text-muted-foreground mb-3">Habitat staff get a portal to manage:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mb-3">
                    <li>Homeowner accounts</li>
                    <li>Documentation completion rates</li>
                    <li>Disaster readiness status</li>
                    <li>Support workflows</li>
                  </ul>
                  <p className="text-sm font-medium text-brand-blue">Habitat becomes an organizational customer, not just individuals.</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Where Asset Safe Lives Inside Habitat */}
        <Collapsible open={openSections['where-lives']} onOpenChange={() => toggleSection('where-lives')} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-brand-blue" />
                  Where Asset Safe Lives Inside Habitat
                </CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections['where-lives'] ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">🔨 During Home Build Phase</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Create the digital home record</li>
                      <li>Store floorplans, warranties, appliance docs</li>
                      <li>Capture baseline photos</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">🎉 At Home Dedication / Move-In</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Family receives Asset Safe access</li>
                      <li>Checklist: "Secure Your Home in 30 Minutes"</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">📅 Annual Stewardship</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Reminder: update inventory</li>
                      <li>Maintenance log</li>
                      <li>Insurance renewal support</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <h4 className="font-semibold mb-2 text-red-800">🚨 Disaster Event</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Upload damage photos immediately</li>
                      <li>Centralized claim-ready records</li>
                      <li>Faster assistance coordination</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Habitat-Specific Product Tier */}
        <Collapsible open={openSections['product-tier']} onOpenChange={() => toggleSection('product-tier')} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-brand-blue" />
                  "Asset Safe – Habitat Edition"
                </CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections['product-tier'] ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <p className="text-muted-foreground mb-4">Designed for affordability and mission alignment:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Included Features</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Home inventory starter template</li>
                      <li>Secure document vault</li>
                      <li>Emergency contacts + recovery checklist</li>
                      <li>Mobile-first access</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Optional Add-Ons</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Verified documentation visit (pro-tier)</li>
                      <li>Insurance claim export package</li>
                      <li>Sponsor-funded upgrades</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Revenue Model */}
        <Collapsible open={openSections['revenue-model']} onOpenChange={() => toggleSection('revenue-model')} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-brand-blue" />
                  Revenue Model (Nonprofit-Friendly)
                </CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections['revenue-model'] ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-semibold mb-2">Per Household (Sponsored)</h4>
                    <p className="text-2xl font-bold text-brand-blue">$2–$4/month</p>
                    <p className="text-sm text-muted-foreground">Paid annually by sponsor or affiliate</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-semibold mb-2">Per Affiliate License</h4>
                    <p className="text-2xl font-bold text-brand-blue">$500–$2,000/year</p>
                    <p className="text-sm text-muted-foreground">Depending on size</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-semibold mb-2">Disaster Grant Bundles</h4>
                    <p className="text-lg font-bold text-brand-blue">Custom Pricing</p>
                    <p className="text-sm text-muted-foreground">Paid through FEMA mitigation or resilience funding</p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Why Habitat Would Say Yes */}
        <Collapsible open={openSections['why-yes']} onOpenChange={() => toggleSection('why-yes')} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-brand-blue" />
                  Why Habitat Would Say Yes
                </CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections['why-yes'] ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <p className="text-muted-foreground mb-4">Asset Safe helps Habitat deliver on outcomes they already care about:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Long-term homeowner success</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Reduced disaster vulnerability</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Stronger financial resilience</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Better donor reporting</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Modernized homeownership support</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-lg">
                  <p className="text-center font-medium text-brand-blue">
                    Asset Safe is not "extra software"…<br />
                    <span className="text-lg">It's a digital extension of Habitat's mission.</span>
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Pilot Rollout Strategy */}
        <Collapsible open={openSections['rollout']} onOpenChange={() => toggleSection('rollout')} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-brand-blue" />
                  Pilot Rollout Strategy
                </CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections['rollout'] ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold">Start With One Affiliate (Dallas/Fort Worth)</h4>
                      <p className="text-sm text-muted-foreground">Pilot with 25–50 families.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold">Measure Outcomes</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>% completing inventory</li>
                        <li>Disaster readiness engagement</li>
                        <li>Time saved in document retrieval</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold">Expand Through Habitat Network</h4>
                      <p className="text-sm text-muted-foreground">Habitat affiliates share proven programs quickly.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Pitch Lines */}
        <Card className="mb-8 bg-gradient-to-r from-brand-blue to-blue-700 text-white">
          <CardHeader>
            <CardTitle className="text-white">🔥 Suggested Pitch Lines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="text-xl font-medium italic border-l-4 border-white/50 pl-4">
              "Habitat builds the home.<br />
              Asset Safe helps families protect it for life."
            </blockquote>
            <p className="text-white/80">or</p>
            <blockquote className="text-xl font-medium italic border-l-4 border-white/50 pl-4">
              "A Habitat home is a fresh start — Asset Safe ensures it stays secure, documented, and resilient."
            </blockquote>
          </CardContent>
        </Card>

        {/* Link to Pilot Program */}
        <Card className="border-2 border-brand-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-brand-blue" />
              Detailed Pilot Program
            </CardTitle>
            <CardDescription>
              Ready to see the full pilot program outline for Collin County?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/habitat-pilot')} className="bg-brand-blue hover:bg-brand-blue/90">
              View Collin County Pilot Outline →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabitatPartnership;
