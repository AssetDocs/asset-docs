import React from 'react';
import { BookOpen, Camera, FileText, Shield, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { breadcrumbSchema } from '@/utils/structuredData';

const termSections = [
  {
    title: 'Documentation & Property Records',
    icon: BookOpen,
    color: 'bg-brand-blue',
    terms: [
      { term: 'Asset Documentation', definition: 'An organized record of belongings, property details, supporting files, and notes that may matter later.' },
      { term: 'Home Inventory', definition: 'A room-by-room or item-by-item list of household belongings with descriptions, photos, and supporting records.', href: '/home-inventory' },
      { term: 'Property Record', definition: 'Information tied to a home, room, structure, system, upgrade, repair, or improvement.' },
      { term: 'Inventory', definition: 'A structured list of items with details such as location, description, condition, and estimated value.' },
      { term: 'Documentation Checklist', definition: 'A repeatable list of records to collect so important details are not missed.' },
      { term: 'Record Retention', definition: 'The practice of keeping useful records available for future reference, service, claims, resale, or planning.' }
    ]
  },
  {
    title: 'Proof, Receipts & Identifiers',
    icon: FileText,
    color: 'bg-green-600',
    terms: [
      { term: 'Proof of Ownership', definition: 'Evidence that helps connect an item or property to its owner, such as receipts, photos, statements, registrations, or appraisals.' },
      { term: 'Receipt', definition: 'A purchase record showing where and when an item was bought, what it cost, and often how it was paid for.' },
      { term: 'Serial Number', definition: 'A unique item identifier often found on electronics, appliances, tools, equipment, and other manufactured goods.' },
      { term: 'Model Number', definition: 'A manufacturer identifier that distinguishes a product version, style, or configuration.' },
      { term: 'Warranty', definition: 'A manufacturer, retailer, or service agreement that may cover repair or replacement under stated conditions.' },
      { term: 'Appraisal', definition: 'A professional opinion of value, often used for jewelry, art, collectibles, antiques, or other high-value items.' }
    ]
  },
  {
    title: 'Photos, Condition & Visual Evidence',
    icon: Camera,
    color: 'bg-orange-500',
    terms: [
      { term: 'Condition Documentation', definition: 'Photos, videos, and notes that show an item or property area at a specific point in time.' },
      { term: 'Room-Level Documentation', definition: 'Wide photos or video walkthroughs that show the contents and condition of an entire room or space.' },
      { term: 'Detail Shot', definition: 'A close-up photo of labels, serial numbers, damage, wear, craftsmanship, markings, or other important details.' },
      { term: 'Video Walkthrough', definition: 'A slow visual recording that captures layout, context, belongings, and condition across a property or room.' },
      { term: 'Move-In/Move-Out Condition', definition: 'Visual records that show the state of a property before or after occupancy, moving, or handoff.', href: '/renters' },
      { term: 'High-Value Item', definition: 'An item that deserves extra documentation because of its cost, rarity, sentimental value, or replacement difficulty.' }
    ]
  },
  {
    title: 'Value & Claim-Support Terms',
    icon: TrendingUp,
    color: 'bg-purple-600',
    terms: [
      { term: 'Estimated Value', definition: 'A user-entered or researched value used to keep a practical record of what something may be worth.' },
      { term: 'Replacement Cost', definition: 'The cost to replace an item with a similar one at current prices, without deducting depreciation.' },
      { term: 'Depreciation', definition: 'The reduction in value over time because of age, wear, use, or obsolescence.' },
      { term: 'Actual Cash Value', definition: 'A value approach often described as replacement cost minus depreciation.' },
      { term: 'Proof of Loss', definition: 'A formal claim document that may summarize what happened, what was damaged or lost, and the value being claimed.' },
      { term: 'Claim-Support Documentation', definition: 'Photos, receipts, item details, estimates, reports, and records that may help explain a loss to an insurer or advisor.' }
    ]
  },
  {
    title: 'Risk & Preparedness',
    icon: Shield,
    color: 'bg-red-500',
    terms: [
      { term: 'Peril', definition: 'An event or cause of damage, such as fire, theft, wind, water, smoke, or vandalism.' },
      { term: 'Mitigation', definition: 'Steps taken to reduce damage, prevent additional loss, or address a known risk.' },
      { term: 'Loss Event', definition: 'An incident that damages, destroys, or removes property or belongings.' },
      { term: 'Emergency Record', definition: 'A document or note that helps someone act quickly during a disruption, evacuation, repair, or family emergency.' },
      { term: 'Preparedness', definition: 'Planning and organizing information before it is urgently needed.' },
      { term: 'Maintenance Record', definition: 'Documentation of service, repairs, inspections, parts, dates, vendors, and warranties.' }
    ]
  }
];

const Glossary = () => {
  const structuredData = breadcrumbSchema([
    { name: 'Home', url: 'https://getassetsafe.com/' },
    { name: 'Resources', url: 'https://getassetsafe.com/resources' },
    { name: 'Glossary', url: 'https://getassetsafe.com/glossary' }
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Documentation & Property Records Glossary | Asset Safe"
        description="Plain-language definitions for asset documentation, property records, receipts, serial numbers, appraisals, condition documentation, values, and claim-support terms."
        canonicalUrl="https://getassetsafe.com/glossary"
        structuredData={structuredData}
      />
      <Navbar />

      <main className="flex-grow bg-gray-50">
        <section className="bg-white">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <Badge className="mb-4" variant="outline">
                Asset Safe Reference
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Documentation & Property Records Glossary
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Plain-language terms for organizing belongings, property records, values, receipts, visual documentation, and claim-support information.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-8">
            {termSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Card key={section.title} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${section.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {section.terms.map((item) => (
                        <div
                          key={item.term}
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <h2 className="font-semibold text-gray-900 mb-2 text-base">
                            {'href' in item && item.href ? (
                              <Link to={item.href} className="text-brand-blue hover:underline">
                                {item.term}
                              </Link>
                            ) : (
                              item.term
                            )}
                          </h2>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {item.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/resources"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Explore More Resources
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Glossary;
