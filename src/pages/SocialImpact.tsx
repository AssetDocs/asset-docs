import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SocialImpact: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Social Impact
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Asset Docs, we believe that peace of mind should be accessible to everyone—especially during life's most uncertain moments. From families navigating divorce or disaster to small business owners protecting their investments, we're committed to making documentation and recovery easier, faster, and fairer for all.
            </p>
          </header>

          <div className="space-y-12">
            {/* Helping Communities */}
            <section className="bg-card p-8 rounded-lg border">
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-3xl">🛡️</div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Helping Communities Prepare and Recover
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Natural disasters, theft, and accidents can happen without warning. Our platform empowers individuals and families to document their belongings before the worst happens—and recover faster when it does. We've helped users file claims with confidence and reduce stress during emergency situations.
                  </p>
                  <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground">
                    "Asset Docs made it possible to submit our insurance claim within days after the storm. It was one less thing to worry about."
                    <footer className="mt-2 font-medium text-foreground">— Lisa R., Texas homeowner</footer>
                  </blockquote>
                </div>
              </div>
            </section>

            {/* Supporting Small Business */}
            <section className="bg-card p-8 rounded-lg border">
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-3xl">💼</div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Supporting Small Business Owners
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For contractors, rental property managers, and local businesses, equipment and inventory are lifelines. We help entrepreneurs maintain clear, secure records to prevent loss, manage risk, and keep operations running—no matter what.
                  </p>
                </div>
              </div>
            </section>

            {/* Families in Transition */}
            <section className="bg-card p-8 rounded-lg border">
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-3xl">👨‍👩‍👧‍👦</div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Standing with Families in Transition
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Divorce, estate planning, and elder care can be emotionally overwhelming. Our service provides a neutral, secure way to document personal property fairly—promoting transparency, protecting rights, and supporting respectful negotiations.
                  </p>
                </div>
              </div>
            </section>

            {/* Accessibility */}
            <section className="bg-card p-8 rounded-lg border">
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-3xl">🎯</div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Making Documentation More Accessible
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    We believe everyone deserves the ability to protect what matters most. That's why we offer:
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span>Free inventory templates and checklists</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span>Discounted services for seniors, veterans, and low-income families</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span>Custom support for non-profits, churches, and schools</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Partnerships */}
            <section className="bg-card p-8 rounded-lg border">
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-3xl">🤝</div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Partnerships for Good
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We're building connections with community organizations, insurance providers, and emergency management teams to expand our reach and improve preparedness across neighborhoods.
                  </p>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    If you're part of an organization that helps families, seniors, or disaster victims, let's talk.
                  </p>
                </div>
              </div>
            </section>

            {/* Integrity */}
            <section className="bg-card p-8 rounded-lg border">
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-3xl">🔒</div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Built on Integrity, Privacy, and Purpose
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Every decision we make is grounded in:
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <div>
                        <span className="font-medium text-foreground">Security</span> – Your data is encrypted and protected.
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <div>
                        <span className="font-medium text-foreground">Clarity</span> – No fine print or hidden fees.
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <div>
                        <span className="font-medium text-foreground">Compassion</span> – We understand what's at stake when loss happens.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="bg-primary/5 p-8 rounded-lg border border-primary/20 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Want to join us or learn more?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Contact us at{' '}
                <a 
                  href="mailto:info@assetdocs.net" 
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  info@assetdocs.net
                </a>{' '}
                to get involved or recommend a program for support.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SocialImpact;