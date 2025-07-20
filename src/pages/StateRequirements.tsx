import React from 'react';
import { MapPin, Building, AlertTriangle, Clock, FileText, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StateRequirements = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Badge className="mb-4" variant="outline">
              🗺️ Regional Guidance
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              State Requirements & Regional Differences
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding how insurance requirements, claim processes, and documentation standards 
              vary across states and insurance providers.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8">
          
          {/* Important Notice */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Important:</strong> This information is for general guidance only. 
              Always consult your specific state's Department of Insurance and your insurance policy 
              for current, binding requirements.
            </AlertDescription>
          </Alert>

          {/* State-by-State Differences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                State-by-State Differences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Each U.S. state regulates insurance through its own Department of Insurance, 
                which means significant variations in how claims are handled and documented.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Regulatory Variations
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Policy standards and disclosures may differ</li>
                    <li>• Consumer protections and bad faith claim rules differ</li>
                    <li>• Statutes of limitations vary by state</li>
                    <li>• Public adjuster licensing varies</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timeline Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Insurer response times vary by state</li>
                    <li>• Claim payment deadlines differ</li>
                    <li>• Replacement cost vs. actual cash value standards</li>
                    <li>• Prompt notice requirements vary</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-4">State-Specific Examples</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded border-l-4 border-red-400">
                      <h4 className="font-medium text-red-900">Texas</h4>
                      <p className="text-sm text-red-700">
                        Insurers must acknowledge claims within 15 days and have specific 
                        handling timeline requirements thereafter.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded border-l-4 border-yellow-400">
                      <h4 className="font-medium text-yellow-900">California</h4>
                      <p className="text-sm text-yellow-700">
                        15 calendar days for acknowledgment, but different post-acknowledgment 
                        handling rules compared to Texas.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                      <h4 className="font-medium text-blue-900">Florida</h4>
                      <p className="text-sm text-blue-700">
                        Requires specific hurricane-related documentation and has unique 
                        prompt notice requirements for weather-related claims.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Provider Differences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500 text-white">
                  <Building className="h-5 w-5" />
                </div>
                Insurance Provider Differences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Insurance companies can set their own internal processes and documentation requirements, 
                within the bounds of state law. This creates additional variation in what's required for claims.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Common Provider Variations
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-900 mb-1">Documentation Requirements</h4>
                      <p className="text-sm text-purple-700">
                        Different forms for proof of loss, varying receipt and photo requirements, 
                        serial number documentation standards.
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h4 className="font-medium text-indigo-900 mb-1">Submission Methods</h4>
                      <p className="text-sm text-indigo-700">
                        Online portals, mobile apps, in-person requirements, 
                        or mail-only submissions vary by company.
                      </p>
                    </div>
                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <h4 className="font-medium text-cyan-900 mb-1">Adjuster Process</h4>
                      <p className="text-sm text-cyan-700">
                        Some use third-party adjusters, others use in-house staff, 
                        affecting timelines and documentation flow.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Real-World Example</h3>
                  <div className="bg-gray-50 p-5 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-3">Water Damage Claim Scenario</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded border-l-4 border-green-400">
                        <h5 className="font-medium text-green-900">Company A</h5>
                        <p className="text-sm text-green-700">
                          Requires independent contractor repair estimate, 
                          detailed photo documentation, and original receipts.
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded border-l-4 border-orange-400">
                        <h5 className="font-medium text-orange-900">Company B</h5>
                        <p className="text-sm text-orange-700">
                          Uses in-house adjuster valuation, accepts digital photos, 
                          and allows receipt copies or credit card statements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-3">Additional Provider Variables</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li>• Preferred repair vendor networks</li>
                    <li>• Multiple estimate requirements</li>
                    <li>• Valuation tool preferences</li>
                    <li>• Settlement negotiation processes</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li>• Digital vs. paper documentation</li>
                    <li>• Professional appraisal thresholds</li>
                    <li>• Communication preferences</li>
                    <li>• Timeline expectations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Steps */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">What This Means for You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">Know Your State</h3>
                  <p className="text-sm text-blue-700">
                    Research your state's specific requirements and consumer protections.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-2">Understand Your Insurer</h3>
                  <p className="text-sm text-purple-700">
                    Review your policy and insurer's specific claim processes and requirements.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-900 mb-2">Document Everything</h3>
                  <p className="text-sm text-green-700">
                    Maintain comprehensive records that meet both state and insurer standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="text-center space-y-4">
            <Link
              to="/glossary"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mr-4"
            >
              View Insurance Glossary
            </Link>
            <Link
              to="/checklists"
              className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Access Documentation Checklists
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StateRequirements;