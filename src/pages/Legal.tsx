import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Scale, FileText, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Legal: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Legal & Ethical Considerations</h1>
            <p className="text-lg text-gray-600">
              Important disclaimers and legal information regarding property valuations and documentation.
            </p>
          </div>

          <Alert className="border-amber-200 bg-amber-50 mb-8">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> All valuations provided are estimates for documentation purposes only and should not be considered official appraisals.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-brand-blue" />
                  Valuation Disclaimers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estimates vs. Official Appraisals</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Valuations are AI-generated estimates based on available data</li>
                    <li>• Not substitute for professional property appraisals</li>
                    <li>• Market conditions and local factors may affect actual values</li>
                    <li>• Estimates may vary from current market prices</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Accuracy Limitations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Based on automated analysis of provided documentation</li>
                    <li>• May not reflect recent market changes</li>
                    <li>• Property condition assessments are preliminary</li>
                    <li>• Individual item valuations are approximate</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-blue" />
                  Insurance & Estate Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Insurance Claims</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Documentation supports claim preparation</li>
                    <li>• Insurance companies may require official appraisals</li>
                    <li>• Keep original receipts and purchase documentation</li>
                    <li>• Verify coverage limits with your insurance provider</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estate Planning</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Consult qualified estate planning professionals</li>
                    <li>• May require certified appraisals for legal purposes</li>
                    <li>• Tax implications should be reviewed with CPA</li>
                    <li>• Regular updates recommended for accuracy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-blue" />
                Data Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Data</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• All uploaded content remains your property</li>
                    <li>• Data encrypted and securely stored</li>
                    <li>• You control sharing and access permissions</li>
                    <li>• Right to delete data at any time</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Professional Use</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Platform designed for personal documentation</li>
                    <li>• Not intended for commercial property management</li>
                    <li>• Consult professionals for business use cases</li>
                    <li>• Compliance with local regulations is user responsibility</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Notice</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              This platform provides property documentation tools and estimated valuations for personal use. 
              For official appraisals, insurance claims, estate planning, or legal proceedings, please consult qualified professionals. 
              Asset Docs is not liable for decisions made based on estimated valuations or documentation provided through this platform.
              By using this service, you acknowledge that all valuations are estimates only and should not be considered professional appraisals or legal advice.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Legal;