import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Partnership: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl">🏡</span>
                <CardTitle className="text-3xl font-bold text-primary">
                  Partnership Proposal: Asset Docs x RE/MAX
                </CardTitle>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Presented to:</strong> Chris Harden, RE/MAX Broker</p>
                <p><strong>From:</strong> Michael Lewis, Founder – Asset Docs</p>
                <p><strong>Contact:</strong> info@assetdocs.net | www.assetdocs.net</p>
              </div>
            </CardHeader>
          </Card>

          {/* What is Asset Docs */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <CardTitle className="text-2xl">What is Asset Docs?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-lg">
                Asset Docs provides professional-grade digital documentation of a homeowner's belongings and property. Our services include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Photo, video, and documents uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Detailed floor plans with measurements</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Secure photo-based home inventory tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>AI-assisted valuation for key assets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Post damage documentation and reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Controlled sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Cloud-based recordkeeping</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Detailed Asset Breakdown</span>
                </div>
              </div>
              <p className="mt-4 text-lg">
                We help homeowners, renters, business, and landlords stay protected and prepared — no matter what life brings.
              </p>
            </CardContent>
          </Card>

          {/* Why Partner */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                <CardTitle className="text-2xl">Why Partner with RE/MAX?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-lg">
                By partnering with Asset Docs, RE/MAX agents can offer clients real, lasting value beyond the transaction. It's a smart way to:
              </p>
              <ul className="space-y-2 text-lg">
                <li>• Differentiate your services</li>
                <li>• Build deeper client relationships</li>
                <li>• Provide peace of mind during major life changes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Partnership Opportunities */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔑</span>
                <CardTitle className="text-2xl">Key Partnership Opportunities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">1. Premium Closing Gift</h3>
                <p className="mb-2">Offer an Asset Docs package as part of your closing gift.</p>
                <p className="text-muted-foreground">
                  🎁 Clients receive a year of professional home inventory services — practical, lasting, and appreciated.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">2. Relocation & Life Transition Support</h3>
                <p className="mb-2">Asset Docs is ideal for clients moving across the country, managing estates, or navigating divorce.</p>
                <p className="text-muted-foreground">
                  📦 We simplify the process of documenting and organizing everything that matters.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">3. Affiliate Revenue Program</h3>
                <p className="mb-2">Agents receive a unique referral code to share with clients.</p>
                <p className="text-muted-foreground">
                  💸 Earn commissions on each paid subscription while offering clients real protection.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">4. Co-Branded Materials</h3>
                <p className="mb-2">Asset Docs provides RE/MAX agents with flyers, email templates, and digital handouts.</p>
                <p className="text-muted-foreground">
                  📩 Makes offering the service seamless and professional.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits for Agents */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <CardTitle className="text-2xl">How This Helps RE/MAX Agents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">•</Badge>
                  <span>Adds immediate and long-term value to every closing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">•</Badge>
                  <span>Strengthens your referral pipeline through elevated service</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">•</Badge>
                  <span>Supports clients well after the sale</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">•</Badge>
                  <span>Creates a passive income stream</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">•</Badge>
                  <span>Enhances your reputation as a full-service, client-first agent</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <CardTitle className="text-2xl">Let's Talk Next Steps</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">
                We'd love to set up a custom RE/MAX partner package and explore a pilot program with your team. 
                I'm happy to provide samples, answer questions, or walk through a quick demo at your convenience.
              </p>
              
              <div className="bg-secondary/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Michael Lewis</h3>
                <p className="text-lg font-medium text-primary mb-3">Founder, Asset Docs</p>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span>📞</span>
                    <a href="tel:214-493-1900" className="text-primary hover:underline">214-493-1900</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📧</span>
                    <a href="mailto:info@assetdocs.net" className="text-primary hover:underline">info@assetdocs.net</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🌐</span>
                    <a href="https://www.assetdocs.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.assetdocs.net</a>
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <a href="mailto:info@assetdocs.net?subject=RE/MAX Partnership Discussion">
                    Schedule a Discussion
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Partnership;