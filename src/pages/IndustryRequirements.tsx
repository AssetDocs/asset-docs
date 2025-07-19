import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertTriangle, FileText, Home, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const IndustryRequirements: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndustryRequirements;