import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertTriangle, FileText, Home, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { breadcrumbSchema } from '@/utils/structuredData';

const IndustryRequirements: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Industry Claims Requirements | Asset Safe"
        description="Complete guide to industry-standard insurance claims processes. Steps, documentation, and requirements for filing property and contents claims successfully."
        keywords="insurance claims process, industry requirements, claims documentation, property claim steps, insurance filing guide"
        canonicalUrl="https://www.getassetsafe.com/industry-requirements"
        structuredData={breadcrumbSchema([
          { name: 'Home', url: 'https://www.getassetsafe.com/' },
          { name: 'Industry Requirements', url: 'https://www.getassetsafe.com/industry-requirements' }
        ])}
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-6">Industry Requirements</h1>
          
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important Notice:</strong> Not all requirements may apply to your situation. Contact your insurance provider for specific details.
            </AlertDescription>
          </Alert>

          {/* General Claims Process Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                1. General Claims Process Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Steps in Filing a Claim:
              </h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Prompt Notification</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Notify insurer immediately after the loss</li>
                    <li>• Required within specific timeframes (varies by policy)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Claim Assignment & Investigation</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Insurer assigns a claims adjuster</li>
                    <li>• Adjuster investigates the cause, extent, and value of the loss</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Proof of Loss Submission</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Policyholder must submit formal documentation verifying the value of the loss</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Damage Evaluation</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Inspection, estimates, or third-party assessments (contractors, engineers, etc.)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Coverage Determination</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Insurer reviews policy terms to determine if the loss is covered</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Settlement Offer & Payment</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Payment is issued for approved losses, sometimes in stages (e.g., ACV then RCV)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Appeals or Dispute Resolution</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• If there's a disagreement, mediation, appraisal, or litigation may follow</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Claims Requirements by Category */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                2. Key Claims Requirements by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Property Claims */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    Property (Homeowners, Renters, Commercial Property)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Proof of ownership (receipts, photos, appraisals)</li>
                      <li>• Inventory of damaged/lost items</li>
                      <li>• Photos/videos of damage</li>
                      <li>• Estimate of repair/replacement costs</li>
                      <li>• Police or fire department report (if applicable)</li>
                    </ul>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Proof of loss form (signed and dated)</li>
                      <li>• Temporary repair receipts</li>
                      <li>• ALE receipts (for hotel, meals, relocation during repairs)</li>
                      <li>• Contractor or engineer reports (if required)</li>
                    </ul>
                  </div>
                </div>

                {/* Disaster-Specific Claims */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Disaster-Specific Claims (FEMA, Flood, Earthquake, etc.)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Separate policies may be required (NFIP for flood, EQ insurance)</li>
                      <li>• Photographic documentation of before-and-after condition</li>
                      <li>• Detailed repair estimates</li>
                      <li>• Community/state disaster declarations (if relevant)</li>
                    </ul>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Elevation certificate (for flood insurance)</li>
                      <li>• Inspection reports from FEMA, if applicable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timelines & Deadlines */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                3. Timelines & Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-foreground">Initial claim filing</h4>
                    <p className="text-muted-foreground">Often within 24–72 hours (check your policy)</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-foreground">Proof of loss</h4>
                    <p className="text-muted-foreground">Typically required within 30–60 days of loss</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-foreground">Repairs/mitigation</h4>
                    <p className="text-muted-foreground">Must be started within a reasonable time to avoid further damage</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-foreground">ALE reimbursement</h4>
                    <p className="text-muted-foreground">Must submit receipts during claim period</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Guide */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                4. Insurance Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Coverage Levels */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Coverage Levels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Actual Cash Value (ACV)</h4>
                      <p className="text-sm text-muted-foreground">Covers replacement cost minus depreciation. Most basic coverage level.</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Replacement Cost</h4>
                      <p className="text-sm text-muted-foreground">Covers full replacement value without depreciation deduction.</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Guaranteed Replacement</h4>
                      <p className="text-sm text-muted-foreground">Most comprehensive. Covers full rebuilding costs even above policy limits.</p>
                    </div>
                  </div>
                </div>

                {/* What's Covered */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Standard Coverage Includes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Structure & Contents</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Fire, lightning, wind, vandalism damage</li>
                        <li>• Personal belongings (typically 50-70% of structure value)</li>
                        <li>• Detached structures (garages, sheds)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Liability & Living Expenses</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Personal liability (recommended $300K minimum)</li>
                        <li>• Pet-related injuries</li>
                        <li>• Temporary housing during repairs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* What's Not Covered */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Common Exclusions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Natural Disasters</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Floods (requires separate NFIP policy)</li>
                        <li>• Earthquakes (separate coverage needed)</li>
                        <li>• Sinkholes (gradual damage)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Maintenance & Other</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Normal wear and tear</li>
                        <li>• Pest damage (termites, rodents)</li>
                        <li>• Intentional damage</li>
                        <li>• Acts of war or terrorism</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Rate Factors */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">How Rates Are Determined</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Claims history (home and personal)</li>
                      <li>• Location and neighborhood crime rate</li>
                      <li>• Home age, condition, and materials</li>
                      <li>• Credit score</li>
                    </ul>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Coverage amount and deductible</li>
                      <li>• Additional riders (jewelry, art)</li>
                      <li>• Risk factors (pools, certain dog breeds)</li>
                      <li>• Building code compliance requirements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndustryRequirements;