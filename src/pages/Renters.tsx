import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  ClipboardList,
  FileText,
  Home,
  Package,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { breadcrumbSchema, faqSchema } from '@/utils/structuredData';

const pageTitle = 'Apartment Inventory & Move-In Documentation | Asset Safe';
const pageDescription =
  "Document your belongings and your rental's condition in one secure place. Photos, receipts, values, and move-in and move-out records with Asset Safe.";
const canonicalUrl = 'https://getassetsafe.com/renters';

const faqData = [
  {
    question: 'What should renters document when moving into an apartment?',
    answer:
      'Renters should document the condition of each room, walls, floors, ceilings, doors, windows, appliances, fixtures, counters, cabinets, included items, and visible marks or damage. They can also begin a belongings inventory at the same time.',
  },
  {
    question: 'Should I photograph a rental before I move in?',
    answer:
      'Yes. Dated photos and video walkthroughs can give you a record you keep for yourself showing how the rental looked before your belongings were fully moved in.',
  },
  {
    question: 'What belongings should renters include in an inventory?',
    answer:
      'Include electronics, furniture, appliances you own, jewelry, tools, collections, clothing of notable value, receipts, warranties, serial or model numbers, estimated values, and condition notes.',
  },
  {
    question: 'How should I document damage that was already there?',
    answer:
      'Photograph existing scratches, stains, dents, chips, water marks, damaged fixtures, appliance condition, and visible wear. Add notes with dates so you have clearer documentation available later.',
  },
  {
    question: 'Can documentation help if there is a disagreement about a security deposit?',
    answer:
      'A dated record gives you clearer documentation to reference if a disagreement arises. Asset Safe is a documentation tool and does not provide legal advice or promise any deposit outcome.',
  },
  {
    question: 'Should I keep my own copy of maintenance requests?',
    answer:
      'Yes. Keeping your own organized copy of maintenance concerns, repair requests, completed repairs, photos before and after, dates, and related documents can make your rental records easier to review later.',
  },
  {
    question: 'Is a belongings inventory useful for renters insurance?',
    answer:
      'A belongings inventory may be useful when preparing a renters-insurance claim because it keeps item descriptions, photos, receipts, values, and ownership details in one organized place.',
  },
  {
    question: 'How often should renters update their documentation?',
    answer:
      'Update your documentation when you move in, move out, make important purchases, notice condition changes, submit or complete repairs, replace items, or reorganize rooms.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema([
      { name: 'Home', url: 'https://getassetsafe.com/' },
      { name: 'Resources', url: 'https://getassetsafe.com/resources' },
      { name: 'Renters', url: canonicalUrl },
    ]),
    faqSchema(faqData),
  ],
};

const conditionItems = [
  'Wide room views',
  'Walls, floors, and ceilings',
  'Doors and windows',
  'Appliances and fixtures',
  'Counters and cabinets',
  'Existing marks or damage',
  'Condition of included items',
];

const belongingsItems = [
  'Photos and videos',
  'Receipts and purchase records',
  'Estimated values',
  'Serial and model numbers',
  'Warranties',
  'Condition notes',
];

const Renters: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <Navbar />

      <main className="flex-grow">
        <section className="bg-brand-blue text-white">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/75 mb-4">
                For Renters
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Document Your Belongings and Your Rental's Condition
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mb-8">
                Keep a dated record of how your rental looked when you moved in, document what you own, and keep supporting photos, receipts, values, and notes organized over time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                  <Link to="/pricing">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white border-white/25 hover:bg-white/20"
                >
                  <Link to="/sample-dashboard">View Sample Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 items-start">
              <div>
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Why Renters Document More Than Belongings</h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    Renters often need to keep track of two different records: personal property they own and the condition of the place they are renting.
                  </p>
                  <p>
                    That makes renter documentation different from a general <Link to="/home-inventory" className="text-brand-blue hover:underline">home inventory</Link>. A renter's record should show both what belongs to them and how the apartment, house, or room looked at important points in time.
                  </p>
                </div>
              </div>
              <Card className="p-6 border-brand-lightBlue/40">
                <h2 className="text-2xl font-bold text-brand-blue mb-4">Two Records, One Place</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-brand-green mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Rental condition records for move-in, maintenance, repairs, and move-out.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-brand-green mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Belongings records for furniture, electronics, valuables, receipts, and item details.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <Package className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Document Your Belongings</h2>
                <p className="text-lg text-gray-700 mb-5">
                  Keep a concise inventory of the items you own, with enough detail to recognize, value, repair, replace, or discuss them later.
                </p>
                <ul className="grid sm:grid-cols-2 gap-3 mb-5">
                  {belongingsItems.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-brand-orange flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700">
                  Use the <Link to="/home-inventory" className="text-brand-blue hover:underline">home inventory guide</Link> for the broader method, and the <Link to="/asset-documentation" className="text-brand-blue hover:underline">asset documentation guide</Link> for what to keep with each record.
                </p>
              </Card>

              <Card className="p-6">
                <Camera className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Document the Rental at Move-In</h2>
                <p className="text-lg text-gray-700 mb-5">
                  Create a dated visual record when you move in, before boxes and furniture make it harder to see the rental's condition.
                </p>
                <ul className="grid sm:grid-cols-2 gap-3 mb-5">
                  {conditionItems.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-brand-orange flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700">
                  For detailed visual technique, use the <Link to="/photography-guide" className="text-brand-blue hover:underline">photography guide</Link>.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <ClipboardList className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Existing Damage and Condition</h2>
                <p className="text-gray-700">
                  Photograph scratches, stains, dents, chips, water marks, damaged fixtures, appliance condition, and visible wear. This is a record you keep for yourself so you have clearer documentation available later.
                </p>
              </Card>
              <Card className="p-6">
                <Wrench className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Maintenance Concerns and Repairs</h2>
                <p className="text-gray-700">
                  Keep your own organized record of maintenance concerns, repair requests, completed repairs, before-and-after photos, dates, and receipts or documents where relevant.
                </p>
              </Card>
              <Card className="p-6">
                <Receipt className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Receipts, Records, and Communications</h2>
                <p className="text-gray-700">
                  Supporting information is easier to find when receipts, warranties, purchase records, maintenance documentation, and condition notes stay near the relevant belongings or property record. The <Link to="/asset-documentation" className="text-brand-blue hover:underline">asset documentation guide</Link> explains the broader recordkeeping approach.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <RefreshCw className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Prepare for Move-Out</h2>
                <p className="text-lg text-gray-700">
                  When you move out, recreate similar room views, document final condition, capture belongings as they are moved, and compare your own move-in and move-out records.
                </p>
              </Card>
              <Card className="p-6">
                <FileText className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Security-Deposit Documentation</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Dated visual records, your own copy of condition documentation, maintenance issue notes, and move-in and move-out comparisons can give you clearer documentation available if a disagreement arises.
                </p>
                <p className="text-sm text-gray-600">
                  Asset Safe is a documentation tool and does not provide legal advice.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <ShieldCheck className="h-8 w-8 text-brand-green mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Renters Insurance Preparedness</h2>
                <p className="text-gray-700">
                  Organized belongings documentation may be useful when preparing a renters-insurance claim. For claim-focused records, read the <Link to="/claims" className="text-brand-blue hover:underline">claims documentation guide</Link>.
                </p>
              </Card>
              <Card className="p-6">
                <Home className="h-8 w-8 text-brand-green mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Moving or Unexpected Loss</h2>
                <p className="text-gray-700">
                  Rental records can help during relocation, theft, fire, water damage, storm damage, or other unexpected property loss. Review common <Link to="/scenarios" className="text-brand-blue hover:underline">property damage scenarios</Link> for broader context.
                </p>
              </Card>
              <Card className="p-6">
                <Package className="h-8 w-8 text-brand-green mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">How Asset Safe Organizes It</h2>
                <p className="text-gray-700">
                  Use a Property to Room to Item or Record structure, then connect renter documentation to Asset Documentation, Knowledge Hub, and Secure Vault. See the <Link to="/features" className="text-brand-blue hover:underline">features page</Link> for the broader system.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-brand-blue mb-6">Related Guidance</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                ['Home Inventory', '/home-inventory'],
                ['Asset Documentation', '/asset-documentation'],
                ['Photography Guide', '/photography-guide'],
                ['Resources', '/resources'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  to={href}
                  className="bg-white border rounded-lg p-5 hover:border-brand-blue hover:shadow-md transition"
                >
                  <span className="font-semibold text-brand-blue">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">Renters FAQs</h2>
              <div className="space-y-4">
                {faqData.map((faq) => (
                  <Card key={faq.question} className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-700">{faq.answer}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-brand-blue text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Organize Your Rental Records Before You Need Them</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Keep condition records, belongings, receipts, and notes connected in one organized place.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                <Link to="/pricing">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/25 hover:bg-white/20"
              >
                <Link to="/sample-dashboard">View Sample Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Renters;
