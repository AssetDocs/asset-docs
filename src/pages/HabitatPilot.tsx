import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Shield, FileText, Users, Target, CheckCircle, Calendar, MapPin, BarChart, DollarSign, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const HabitatPilot = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/habitat-partnership')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-brand-blue">🏠 Asset Safe × Habitat for Humanity Collin County</h1>
            <p className="text-muted-foreground">Pilot Program Outline: Homeownership Protection & Resilience Initiative</p>
          </div>
        </div>

        {/* Program Name & Purpose */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-l-brand-blue">
            <CardHeader>
              <CardTitle className="text-lg">1. Program Name</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-brand-blue">Habitat Home Protection Pilot (Collin County)</p>
              <p className="text-muted-foreground italic">Powered by Asset Safe</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg">2. Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">To provide Habitat homeowners in Collin County with a simple, secure way to:</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Document their home and belongings</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Store critical housing records</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Strengthen disaster readiness</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Improve recovery outcomes after loss events</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Why Collin County */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-blue" />
              3. Why Collin County?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">Collin County is a strong pilot market due to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">📈 Rapid residential growth</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm">⛈️ Increasing storm, hail, and fire-related claims</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm">💰 High value of household contents relative to income vulnerability</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm">🤝 Strong Habitat affiliate network and community partnerships</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pilot Goals */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-blue" />
              4. Pilot Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-3">Habitat Goals</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Improve homeowner preparedness</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Reduce administrative burden after disasters</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Strengthen stewardship and education programs</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Provide additional value to donors and sponsors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-brand-blue mb-3">Asset Safe Goals</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-blue" /> Validate program fit within Habitat workflows</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-blue" /> Measure engagement and homeowner outcomes</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-blue" /> Establish a scalable affiliate rollout model</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pilot Scope */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-blue" />
              5. Pilot Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-brand-blue/5 rounded-lg border border-brand-blue/20">
                <h4 className="font-semibold mb-2">Duration</h4>
                <p className="text-2xl font-bold text-brand-blue">90-Day Pilot Program</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2">Participant Group</h4>
                <p className="text-lg font-bold text-green-700">25–50 Habitat Collin County homeowners</p>
                <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                  <li>New homeowners (move-in within last 12 months)</li>
                  <li>Families in high-risk weather zones</li>
                  <li>Homeowners enrolled in Habitat education programs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Homeowners Receive */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-blue" />
              6. What Homeowners Receive
            </CardTitle>
            <CardDescription>Each participating family receives an Asset Safe Habitat Edition account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-brand-blue mb-3">📦 Digital Home Protection Kit</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Guided home inventory checklist</li>
                  <li>✓ Secure document vault for:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Mortgage paperwork</li>
                      <li>Insurance policies</li>
                      <li>Appliance warranties</li>
                      <li>Maintenance records</li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-orange-600 mb-3">🚨 Emergency Readiness Tools</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Disaster recovery checklist</li>
                  <li>✓ "After Damage" photo/video upload prompts</li>
                  <li>✓ One-tap access via mobile home screen</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Habitat Affiliate Support Tools */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-blue" />
              7. Habitat Affiliate Support Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">Habitat Collin County staff receive:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Simple onboarding materials</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Printable "Home Protection Starter Sheet"</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Optional affiliate dashboard showing:
                <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                  <li>Enrollment progress</li>
                  <li>Completion rates</li>
                  <li>Support needs</li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Program Workflow */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-blue" />
              8. Program Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Phase 1 */}
              <div className="relative pl-8 border-l-2 border-brand-blue pb-6">
                <div className="absolute -left-3 top-0 w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="font-semibold text-brand-blue">Phase 1 — Setup (Weeks 1–2)</h4>
                <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                  <li>Confirm pilot participant list</li>
                  <li>Habitat co-branded Asset Safe landing page created</li>
                  <li>Orientation packet delivered to homeowners</li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="relative pl-8 border-l-2 border-green-500 pb-6">
                <div className="absolute -left-3 top-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="font-semibold text-green-700">Phase 2 — Onboarding & Education (Weeks 3–6)</h4>
                <p className="text-sm text-muted-foreground mt-2">Homeowners complete:</p>
                <ul className="text-sm text-muted-foreground mt-1">
                  <li>✅ Add property profile</li>
                  <li>✅ Upload key home documents</li>
                  <li>✅ Complete "Top 10 Items" starter inventory</li>
                  <li>✅ Emergency contacts + recovery plan</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2 italic">Habitat integrates Asset Safe into existing homeowner education.</p>
              </div>

              {/* Phase 3 */}
              <div className="relative pl-8 border-l-2 border-orange-500 pb-6">
                <div className="absolute -left-3 top-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="font-semibold text-orange-700">Phase 3 — Documentation Sprint (Weeks 7–10)</h4>
                <p className="text-sm text-muted-foreground mt-2">Families complete:</p>
                <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                  <li>Full room-by-room inventory</li>
                  <li>Photo documentation of major assets</li>
                  <li>Secure storage of key receipts/manuals</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2 italic">Optional: Asset Safe "Verified Documentation Visit" for select homes.</p>
              </div>

              {/* Phase 4 */}
              <div className="relative pl-8 border-l-2 border-purple-500">
                <div className="absolute -left-3 top-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <h4 className="font-semibold text-purple-700">Phase 4 — Review & Outcomes Report (Weeks 11–13)</h4>
                <p className="text-sm text-muted-foreground mt-2">Asset Safe provides Habitat Collin County with:</p>
                <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                  <li>Engagement summary</li>
                  <li>Completion rates</li>
                  <li>Homeowner feedback</li>
                  <li>Recommended next steps for expansion</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-brand-blue" />
              9. Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Target Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Enrollment</TableCell>
                  <TableCell>80%+ of invited families participate</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Completion</TableCell>
                  <TableCell>60%+ complete starter inventory</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Document Storage</TableCell>
                  <TableCell>75% upload at least 3 critical home docs</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Preparedness</TableCell>
                  <TableCell>Families report increased confidence</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Habitat Impact</TableCell>
                  <TableCell>Reduced post-loss confusion and admin load</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sponsorship Opportunity */}
        <Card className="mb-6 border-2 border-yellow-400">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              10. Sponsorship Opportunity (Optional Add-On)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-muted-foreground mb-4">Local sponsors can fund memberships for Habitat families:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-muted rounded-lg text-center text-sm">Banks / mortgage partners</div>
              <div className="p-3 bg-muted rounded-lg text-center text-sm">Insurance agencies</div>
              <div className="p-3 bg-muted rounded-lg text-center text-sm">Home improvement retailers</div>
              <div className="p-3 bg-muted rounded-lg text-center text-sm">Community foundations</div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-center font-medium">Example:</p>
              <p className="text-center text-lg font-bold text-yellow-700">
                "$2,500 sponsors 50 Habitat families with home protection access for one year."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expansion Path */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-blue" />
              11. Expansion Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">If successful, the pilot scales to:</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold">Full Rollout</h4>
                  <p className="text-sm text-muted-foreground">All Habitat Collin County homeowners</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold">Regional Expansion</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Denton County</li>
                    <li>Dallas County</li>
                    <li>North Texas Habitat network</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold">National Affiliate Partnership</h4>
                  <p className="text-sm text-muted-foreground">Model through Habitat International</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Program Message */}
        <Card className="bg-gradient-to-r from-brand-blue to-blue-700 text-white">
          <CardHeader>
            <CardTitle className="text-white">12. Key Program Message</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-2xl font-medium italic text-center">
              "Habitat builds the home.<br />
              Asset Safe helps families protect everything inside it — for life."
            </blockquote>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/admin/habitat-partnership')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partnership Overview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HabitatPilot;
