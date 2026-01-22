import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Store, ShoppingBag, Presentation, CheckCircle2, QrCode, AlertTriangle, Lightbulb, Trophy, Shield } from 'lucide-react';

const HomeImprovementPartnership = () => {
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
          <h1 className="text-4xl font-bold mb-4">🏠 Home Improvement Partnership</h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-3xl font-bold text-primary">Lowe's</div>
            <span className="text-3xl text-muted-foreground">×</span>
            <div className="text-3xl font-bold text-primary">Asset Safe</div>
          </div>
          <p className="text-xl text-muted-foreground font-semibold">
            Retail Partnership Strategy for In-Store Presence
          </p>
        </div>

        {/* Strategy 1: In-Aisle Sign */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">1️⃣ The In-Aisle Sign / Placard</CardTitle>
                <CardDescription className="text-base">Highest Probability, Fastest Win</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🎯 Goal</h3>
              <p className="text-foreground font-bold text-xl">
                Zero inventory. Zero shelf space. Maximum trust.
              </p>
              <p className="text-muted-foreground mt-2">
                This is the "yes before they know they said yes" option.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">📍 Placement (Very Important)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-medium">Smoke alarms / CO detectors</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-medium">Emergency preparedness endcaps</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-medium">Storm season displays</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-medium">New homeowner bundles</p>
                </div>
              </div>
            </div>

            {/* Sign Option A */}
            <div className="border-2 border-primary/30 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">🪧 Sign Headline (Option A – Safety Framed)</h3>
              <div className="bg-muted p-6 rounded-lg">
                <h4 className="text-2xl font-bold mb-4 text-center">Protect What You've Built—Not Just Your Home</h4>
                <p className="text-muted-foreground mb-4 text-center">
                  Most homeowners don't have proper documentation if disaster strikes.<br />
                  Asset Safe helps Lowe's customers securely document and protect their belongings—before it's needed most.
                </p>
                <div className="text-center mt-6 p-4 bg-primary/10 rounded-lg">
                  <p className="font-bold text-primary">👉 Exclusive Lowe's Customer Offer</p>
                  <p className="text-lg">Scan to receive 20% off Asset Safe</p>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Powered by Asset Safe • Trusted by homeowners nationwide
                </p>
              </div>
            </div>

            {/* Sign Option B */}
            <div className="border-2 border-orange-500/30 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">🪧 Sign Headline (Option B – Emotional Framed)</h3>
              <div className="bg-muted p-6 rounded-lg">
                <h4 className="text-2xl font-bold mb-4 text-center">If You Lost Everything Tomorrow—Would You Be Ready?</h4>
                <p className="text-muted-foreground mb-4 text-center">
                  Insurance claims are stressful. Asset Safe helps you prepare now—so recovery is faster, easier, and documented.
                </p>
                <div className="text-center mt-6 p-4 bg-orange-500/10 rounded-lg">
                  <p className="font-bold text-orange-600">📱 Scan for your Lowe's customer discount</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-green-700">✅ Why Lowe's Likes This</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">No SKU</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">No returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">No POS training</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Positions Lowe's as protective, not transactional</span>
                </div>
              </div>
              <p className="text-green-700 font-bold text-lg mt-4 text-center">This is retail gold.</p>
            </div>
          </CardContent>
        </Card>

        {/* Strategy 2: Gift Card Hanger */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">2️⃣ The Asset Safe Hanger (Gift-Card Style Pilot)</CardTitle>
                <CardDescription className="text-base">Phase 2 Physical Presence</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Designed to look boring enough for retail but meaningful enough for customers.
            </p>

            <div>
              <h3 className="font-semibold text-lg mb-4">🎁 Physical Format</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-medium">Same size as a gift card hanger</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-medium">Lightweight cardstock</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-medium">No electronics</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="font-medium">QR + activation code only</p>
                </div>
              </div>
            </div>

            {/* Hanger Design */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-primary rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-4 text-center">Front Copy</h4>
                <div className="bg-muted p-6 rounded-lg text-center space-y-4">
                  <p className="text-2xl font-bold text-primary">ASSET SAFE</p>
                  <p className="text-xl font-semibold">Protect What Matters—Before It's Too Late</p>
                </div>
              </div>
              <div className="border-2 border-primary/50 rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-4 text-center">Back Copy</h4>
                <div className="bg-muted p-6 rounded-lg text-sm space-y-4">
                  <p>Most homeowners don't realize insurance claims depend on proof.</p>
                  <p>Asset Safe helps you securely document your belongings, store them privately, and access them when it matters most.</p>
                  <div className="space-y-1 text-left">
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Fast setup</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Secure storage</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Insurance-ready documentation</p>
                  </div>
                  <p className="font-semibold text-primary">Exclusive Lowe's Customer Activation Inside</p>
                </div>
              </div>
            </div>

            {/* Activation Flow */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Activation Flow (Critical)
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                  <p className="font-medium pt-1">Scan QR</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <p className="font-medium">Landing page says:</p>
                    <p className="text-muted-foreground italic">"Welcome, Lowe's Customers"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                  <p className="font-medium pt-1">Discount auto-applied</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">4</div>
                  <p className="font-medium pt-1">Clear "Why this matters" explainer (60 seconds max)</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-primary/20 space-y-1 text-sm text-muted-foreground">
                <p>✓ No app download pressure.</p>
                <p>✓ No complexity.</p>
                <p>✓ No cognitive overload.</p>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-green-700">✅ Why This Works in Retail</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Treated like a service, not software</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Zero fulfillment burden</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Seasonal placement potential (storms, fires, floods)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Can be piloted regionally (Texas, Florida, California)</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Strategy 3: The Pilot Pitch */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Presentation className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">3️⃣ The Pilot Pitch</CardTitle>
                <CardDescription className="text-base">What You'd Actually Say to Lowe's Corporate</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground italic">This is the framing that gets meetings.</p>

            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🎯 Pitch Title</h3>
              <p className="text-2xl font-bold text-primary">
                Helping Lowe's Customers Recover Faster—Before Disaster Strikes
              </p>
            </div>

            {/* The Problem */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                The Problem (Retail-Relevant)
              </h3>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Most homeowners do not have documented inventories</li>
                <li>• Insurance claims fail or stall due to lack of proof</li>
                <li>• Customers blame:</li>
              </ul>
              <div className="grid grid-cols-3 gap-3 ml-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-center text-sm">
                  Insurance companies
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-center text-sm">
                  Contractors
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-center text-sm">
                  Retailers they trusted
                </div>
              </div>
              <p className="mt-4 font-semibold text-orange-700 dark:text-orange-400">
                Lowe's is already in the prevention aisle—but not the recovery conversation.
              </p>
            </div>

            {/* The Opportunity */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                The Opportunity
              </h3>
              <p className="mb-3">Asset Safe allows Lowe's to:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Extend customer care beyond the sale</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Provide a non-physical, zero-inventory solution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Strengthen brand trust during high-stress moments</span>
                </li>
              </ul>
              <p className="mt-4 font-bold text-green-700 dark:text-green-400 text-center">
                This is not a product. It's a customer protection initiative.
              </p>
            </div>

            {/* Pilot Proposal */}
            <div>
              <h3 className="font-semibold text-lg mb-4">📋 Pilot Proposal (Low Risk)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Pilot Details</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 50–100 stores</li>
                    <li>• 1 aisle sign OR hanger placement</li>
                    <li>• Lowe's-specific promo code</li>
                    <li>• 90-day test</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Success Metrics</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• QR scans</li>
                    <li>• Account activations</li>
                    <li>• Conversion rate</li>
                    <li>• Customer feedback sentiment</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Why Lowe's Says Yes */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Why Lowe's Says Yes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 bg-background rounded-lg text-center">
                  <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-medium">No operational disruption</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-medium">No shelf displacement</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-medium">No returns</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-medium">No liability</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-medium">Strong ESG narrative</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Truth */}
        <Card className="mb-8 border-2 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">🔥 Strategic Truth (Founder-to-Founder)</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl font-bold text-center">You are not pitching software.</p>
            
            <div className="p-6 bg-primary/10 rounded-lg">
              <p className="text-lg mb-4 text-center">You're pitching:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-background rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">Peace of mind</p>
                </div>
                <div className="p-4 bg-background rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">Preparedness</p>
                </div>
                <div className="p-4 bg-background rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">Recovery</p>
                </div>
                <div className="p-4 bg-background rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">Trust</p>
                </div>
              </div>
            </div>

            <p className="text-xl font-bold text-center text-primary">
              That's why this belongs in a home improvement store.
            </p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/admin')} className="px-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeImprovementPartnership;
