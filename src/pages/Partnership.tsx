import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const Partnership: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <SEOHead
        title="Partnership Opportunities | Asset Safe"
        description="Explore partnership opportunities with Asset Safe. Insurance, real estate, and home service professionals welcome. Grow together."
        keywords="asset safe partnership, real estate partnership, insurance partnership, home service partnership, business collaboration"
        canonicalUrl="https://www.getassetsafe.com/partnership"
      />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl">🏡</span>
                <CardTitle className="text-3xl font-bold text-primary">
                  Partnership Proposal: Asset Safe x RE/MAX
                </CardTitle>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Presented to:</strong> Chris Harden, RE/MAX Broker</p>
                <p><strong>From:</strong> Michael Lewis, Founder – Asset Safe</p>
                <p><strong>Contact:</strong> support@assetsafe.net | www.getassetsafe.com</p>
              </div>
            </CardHeader>
          </Card>

          {/* What is Asset Docs */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <CardTitle className="text-2xl">What is Asset Safe?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-lg">
                Asset Safe provides professional-grade digital documentation of a homeowner's belongings and property. Our services include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Photo, video, and documents uploads</span>
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
                <CardTitle className="text-2xl">Why Partner with Asset Safe?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-lg">
                By partnering with Asset Safe, RE/MAX agents can offer clients real, lasting value beyond the transaction. It's a smart way to:
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
                <p className="mb-2">Offer an Asset Safe package as part of your closing gift.</p>
                <p className="text-muted-foreground">
                  🎁 Clients receive a year of professional home inventory services — practical, lasting, and appreciated.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">2. Relocation & Life Transition Support</h3>
                <p className="mb-2">Asset Safe is ideal for clients moving across the country, managing estates, or navigating divorce.</p>
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
                <p className="mb-2">Asset Safe provides RE/MAX agents with flyers, email templates, and digital handouts.</p>
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

          {/* Why Documentation Matters */}
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <CardTitle className="text-2xl">Why Documentation Matters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">
                In any of these scenarios, having comprehensive pre-incident documentation through Asset Safe can:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Expedite insurance claims processing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ensure accurate settlement amounts</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Provide proof of ownership and condition</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Support legal proceedings if necessary</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Facilitate emergency planning and recovery</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Applications */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                <CardTitle className="text-2xl">Industry Applications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-secondary pl-4">
                <h3 className="text-xl font-semibold mb-2">Legal & Estate Planning</h3>
                <p className="text-muted-foreground">
                  Asset documentation for probate, inheritance, divorce proceedings, and legal disputes.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-4">
                <h3 className="text-xl font-semibold mb-2">Insurance Industry</h3>
                <p className="text-muted-foreground">
                  Pre-loss documentation for faster claims processing and accurate settlements.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-4">
                <h3 className="text-xl font-semibold mb-2">Real Estate</h3>
                <p className="text-muted-foreground">
                  Property condition reports, improvement documentation, and value authentication.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-4">
                <h3 className="text-xl font-semibold mb-2">Moving & Storage</h3>
                <p className="text-muted-foreground">
                  Pre-move documentation to protect against damage and loss during relocation.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-4">
                <h3 className="text-xl font-semibold mb-2">Property Management</h3>
                <p className="text-muted-foreground">
                  Comprehensive documentation for rental properties and tenant management.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-4">
                <h3 className="text-xl font-semibold mb-2">Financial Services</h3>
                <p className="text-muted-foreground">
                  Asset verification for loans, mortgages, and investment opportunities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Our Mission */}
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">
                We believe everyone deserves the confidence that comes with knowing their most precious belongings are properly documented and protected. Asset Safe transforms the traditional, tedious process of property documentation into a modern, intuitive experience that actually works when you need it most.
              </p>
              
              <blockquote className="border-l-4 border-primary pl-6 py-4 bg-background/50 rounded-r-lg">
                <p className="text-lg italic text-primary">
                  "Because when disaster strikes, the last thing you should worry about is whether you can prove what you've lost. With Asset Safe, you're not just documenting possessions— you're securing your family's future."
                </p>
              </blockquote>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                <CardTitle className="text-2xl">Learn More</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to="/social-impact">
                    <div className="text-center">
                      <div className="text-lg font-semibold">Social Impact</div>
                      <div className="text-sm text-muted-foreground">Our community mission</div>
                    </div>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to="/features">
                    <div className="text-center">
                      <div className="text-lg font-semibold">Features</div>
                      <div className="text-sm text-muted-foreground">Full platform overview</div>
                    </div>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to="/scenarios">
                    <div className="text-center">
                      <div className="text-lg font-semibold">Scenarios</div>
                      <div className="text-sm text-muted-foreground">Real-world use cases</div>
                    </div>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to="/claims">
                    <div className="text-center">
                      <div className="text-lg font-semibold">Claims Documentation</div>
                      <div className="text-sm text-muted-foreground">Insurance support</div>
                    </div>
                  </Link>
                </Button>
              </div>
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
                <p className="text-lg font-medium text-primary mb-3">Founder, Asset Safe</p>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span>📞</span>
                    <a href="tel:214-493-1900" className="text-primary hover:underline">214-493-1900</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📧</span>
                    <a href="mailto:support@assetsafe.net" className="text-primary hover:underline">support@assetsafe.net</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🌐</span>
                    <a href="https://www.getassetsafe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.getassetsafe.com</a>
                  </p>
                </div>
                
                <div className="mt-6">
                  <Button asChild className="w-full">
                    <a href="https://www.getassetsafe.com" target="_blank" rel="noopener noreferrer">
                      Go to Asset Safe Website
                    </a>
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Partnership;