import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, Heart, Shield, Check } from 'lucide-react';
import { breadcrumbSchema } from '@/utils/structuredData';
import {
  featuresHero,
  destinations,
  featureSections,
  audiences,
  industries,
  secureVaultExplainer,
} from '@/data/featuresContent';

const Features: React.FC = () => {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: 'https://getassetsafe.com/' },
    { name: 'Features', url: 'https://getassetsafe.com/features' },
  ]);

  const destinationIcon = (id: string) => {
    if (id === 'asset-documentation') return <FolderOpen className="h-7 w-7" />;
    if (id === 'knowledge-hub') return <Heart className="h-7 w-7" />;
    return <Shield className="h-7 w-7" />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Features | Asset Safe"
        description="Asset Documentation, Knowledge Hub, and an encrypted Secure Vault — see everything Asset Safe does for your property, records, and private information."
        canonicalUrl="https://getassetsafe.com/features"
        structuredData={breadcrumbs}
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-5">{featuresHero.title}</h1>
          <p className="text-xl max-w-3xl mx-auto mb-6">{featuresHero.subtitle}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                View Pricing
              </Button>
            </Link>
            <Link to="/features-list">
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                All Features Index
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Three destinations */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            {featuresHero.overview} If you are building a room-by-room record first, start with the <Link to="/home-inventory" className="text-brand-blue hover:underline">home inventory guide</Link>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <a
                key={destination.id}
                href={`#${destination.id}`}
                className={`block p-6 rounded-lg border transition-shadow hover:shadow-lg ${
                  destination.accent === 'amber'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div
                  className={
                    destination.accent === 'amber' ? 'text-amber-700 mb-3' : 'text-brand-blue mb-3'
                  }
                >
                  {destinationIcon(destination.id)}
                </div>
                <h2 className="text-xl font-semibold mb-2">{destination.name}</h2>
                <p className="text-gray-600">{destination.tagline}</p>
                {destination.contains && (
                  <p className="text-sm text-amber-800 mt-3 font-medium">{destination.contains}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Feature sections */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 space-y-14">
          {featureSections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-brand-blue mb-2">{section.name}</h2>
              <p className="text-lg text-gray-700 mb-1">{section.tagline}</p>
              <p className="text-gray-600 max-w-3xl mb-8">{section.intro}</p>

              {section.id === 'secure-vault' && (
                <div className="bg-white border-2 border-amber-200 rounded-lg p-6 mb-8 grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">What It Is</h3>
                    <p className="text-gray-600">{secureVaultExplainer.whatItIs}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">What It's Not</h3>
                    <p className="text-gray-600">{secureVaultExplainer.whatItIsNot}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Why It Matters</h3>
                    <p className="text-gray-600">{secureVaultExplainer.whyItMatters}</p>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {section.groups.map((group) => (
                  <div key={group.heading}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
                      {group.heading}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map((item) => (
                        <div key={item.name} className="bg-white p-6 rounded-lg shadow">
                          <h4 className="text-lg font-semibold mb-2">{item.name}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {section.id === 'access-security' && (
                <p className="text-xs text-gray-500 mt-6 max-w-3xl">
                  Asset Safe operates under SOC 2–aligned practices. Your records stay portable — see
                  Export Account Archive and Download All Files under Asset Documentation.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Audience narratives */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-blue mb-3">
            How People Use Asset Safe
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
            The same platform, applied to different situations. Every feature above is available to
            everyone.
          </p>

          <Tabs defaultValue={audiences[0].id} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              {audiences.map((audience) => (
                <TabsTrigger key={audience.id} value={audience.id}>
                  {audience.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {audiences.map((audience) => (
              <TabsContent key={audience.id} value={audience.id} forceMount className="animate-fade-in">
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-brand-blue mb-2">{audience.headline}</h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">{audience.intro}</p>
                  {audience.id === 'homeowners' && (
                    <p className="text-gray-600 max-w-2xl mx-auto mt-3">
                      Homeowners usually start with a <Link to="/home-inventory" className="text-brand-blue hover:underline">room-by-room home inventory</Link> covering belongings, photos, receipts, and values.
                    </p>
                  )}
                  {audience.id === 'renters' && (
                    <p className="text-gray-600 max-w-2xl mx-auto mt-3">
                      See the <Link to="/renters" className="text-brand-blue hover:underline">renters documentation guide</Link> for move-in condition records and belongings inventory basics.
                    </p>
                  )}
                  {audience.id === 'landlords' && (
                    <p className="text-gray-600 max-w-2xl mx-auto mt-3">
                      See the <Link to="/landlords" className="text-brand-blue hover:underline">landlords documentation guide</Link> for rental property condition history, repairs, and improvements.
                    </p>
                  )}
                  {audience.id === 'business' && (
                    <p className="text-gray-600 max-w-2xl mx-auto mt-3">
                      See the <Link to="/small-business" className="text-brand-blue hover:underline">small business documentation guide</Link> for equipment, premises, receipts, warranties, repairs, and supporting records.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {audience.focus.map((focus) => (
                    <div key={focus.heading} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold mb-2">{focus.heading}</h4>
                      <p className="text-gray-600 text-sm mb-4">{focus.body}</p>
                      <ul className="space-y-1">
                        {focus.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Industries */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-blue mb-3">Where It Gets Used</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
            Asset Safe is a documentation platform. These are the settings where organized records
            tend to matter most.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => (
              <div key={industry.name} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">{industry.name}</h3>
                <p className="text-gray-600 text-sm">{industry.description}</p>
                {industry.scope && (
                  <p className="text-xs text-gray-500 mt-3 italic">{industry.scope}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Documenting What Matters</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            One account covers your property, your records, and your most private information.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/pricing">
              <Button size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
