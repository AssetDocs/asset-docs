import React from 'react';
import { CheckCircle, XCircle, User, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { breadcrumbSchema } from '@/utils/structuredData';

const guideTitle = 'Why Digital Asset Documentation Beats Spreadsheets + Phone Photos';
const guideDescription =
  'Protect what matters most - with precision, professionalism, and proof. A comprehensive comparison of traditional DIY methods versus professional digital documentation.';

const DigitalDocumentationGuide: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title={guideTitle}
        description={guideDescription}
        canonicalUrl="https://getassetsafe.com/digital-documentation-guide"
        structuredData={breadcrumbSchema([
          { name: 'Home', url: 'https://getassetsafe.com/' },
          { name: 'Resources', url: 'https://getassetsafe.com/resources' },
          { name: 'Digital Documentation Guide', url: 'https://getassetsafe.com/digital-documentation-guide' }
        ])}
      />
      <Navbar />

      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-brand-blue text-white">
                    Featured Guide
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {guideTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Asset Safe Team</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>8 min read</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-lg text-muted-foreground mb-6">
                    Protect what matters most - with precision, professionalism, and proof.
                  </p>

                  <h2 className="text-2xl font-bold mb-4">Digital Asset Documentation vs. DIY Methods</h2>

                  <div className="overflow-x-auto mb-8">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border px-4 py-3 text-left font-semibold">Feature</th>
                          <th className="border border-border px-4 py-3 text-left font-semibold">Spreadsheet + Phone Photos</th>
                          <th className="border border-border px-4 py-3 text-left font-semibold">Asset Safe Digital Documentation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border px-4 py-3 font-medium">Proof of Condition</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Limited context, no timestamps
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Timestamped photos, metadata, verifiable details
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border px-4 py-3 font-medium">Market Valuation</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Manual research required
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              AI-assisted or expert-assigned current value
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-3 font-medium">Insurance Readiness</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Disorganized & hard to verify
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Claim-ready, structured documentation
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border px-4 py-3 font-medium">Disaster Recovery</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Risk of data loss
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Secure cloud storage
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-3 font-medium">Search & Organization</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Manual, time-consuming
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Sort, filter, tag, and export anytime
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border px-4 py-3 font-medium">Legal & Financial Use</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Limited admissibility
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Trusted in legal, financial, and insurance contexts
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-3 font-medium">Maintenance Tracking</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              None
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Track warranties, repairs, and depreciation
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border px-4 py-3 font-medium">Presentation Quality</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Informal
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Professionally formatted, easily shared
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h2 className="text-2xl font-bold mb-4">Who Benefits?</h2>
                  <ul className="list-none space-y-3 mb-8">
                    <li className="flex items-start"><span className="text-primary font-bold mr-2">•</span><strong>Homeowners:</strong> Fire, theft, natural disaster recovery, or estate planning</li>
                    <li className="flex items-start"><span className="text-primary font-bold mr-2">•</span><strong>Business Owners:</strong> Equipment inventory, liability protection, tax prep</li>
                    <li className="flex items-start"><span className="text-primary font-bold mr-2">•</span><strong>Landlords & Investors:</strong> Move-in/out documentation, asset depreciation</li>
                    <li className="flex items-start"><span className="text-primary font-bold mr-2">•</span><strong>Restoration & Insurance Professionals:</strong> Claim support and documentation</li>
                  </ul>

                  <h2 className="text-2xl font-bold mb-4">The Asset Safe Advantage</h2>
                  <ul className="list-none space-y-3 mb-8">
                    <li className="flex items-start"><span className="text-accent font-bold mr-2">✓</span>Interactive Visual Records (tagged images, video walkthroughs)</li>
                    <li className="flex items-start"><span className="text-accent font-bold mr-2">✓</span>Accurate Valuation via AI and web-based tools</li>
                    <li className="flex items-start"><span className="text-accent font-bold mr-2">✓</span>Exportable Reports for insurance, attorneys, or buyers</li>
                    <li className="flex items-start"><span className="text-accent font-bold mr-2">✓</span>Cloud-Backed Security for anytime, anywhere access</li>
                  </ul>

                  <p className="text-lg font-semibold mb-4">
                    Ready to make your assets undeniable, insurable, and easily managed?
                  </p>
                  <p className="text-lg text-primary font-medium">Visit GetAssetSafe.com to get started.</p>
                </div>
              </CardContent>
            </Card>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DigitalDocumentationGuide;
