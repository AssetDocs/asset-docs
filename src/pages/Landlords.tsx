import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Camera,
  FileText,
  Hammer,
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

const pageTitle = 'Rental Property Documentation for Landlords | Asset Safe';
const pageDescription =
  'Landlords can document each rental property in one place — unit condition, move-in and move-out records, repairs, improvements, receipts, and warranties.';
const canonicalUrl = 'https://getassetsafe.com/landlords';

const faqData = [
  {
    question: 'What records should landlords keep for each rental property?',
    answer:
      'Landlords can keep condition photos, move-in and move-out records, appliance and fixture details, repair notes, maintenance history, improvement records, receipts, invoices, warranties, and supporting property documents.',
  },
  {
    question: "How should a landlord document a property's condition?",
    answer:
      'Create dated photos or videos of rooms, walls, floors, ceilings, doors, windows, appliances, fixtures, existing wear, visible damage, and property-specific condition details.',
  },
  {
    question: 'Should landlords photograph a rental before someone moves in?',
    answer:
      'Yes. A dated visual record before occupancy helps preserve your own property history and gives you clearer documentation to compare with later condition records.',
  },
  {
    question: 'What property items should be documented in a rental?',
    answer:
      'Document owner-owned appliances, fixtures, furnishings where provided, equipment, accessory items, serial and model numbers, receipts, warranties, and condition notes.',
  },
  {
    question: 'How can landlords keep repair and improvement records organized?',
    answer:
      'Keep dates, before-and-after photos, invoices, receipts, warranty information, product sources, paint codes, appliance replacements, and related property notes with the correct rental property record.',
  },
  {
    question: 'Can Asset Safe organize more than one rental property?',
    answer:
      'Yes. Asset Safe lets you keep separate property documentation profiles so each rental property has its own rooms, areas, items, records, photos, receipts, and history.',
  },
  {
    question: 'Is property documentation useful when preparing an insurance claim?',
    answer:
      'Organized property, repair, improvement, and included-item documentation may be useful when preparing a property-related insurance claim.',
  },
  {
    question: 'Does Asset Safe replace property-management software?',
    answer:
      'No. Asset Safe is the documentation layer behind each property. It works alongside the tools you use for leasing, rent collection, maintenance operations, and other property-management workflows.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema([
      { name: 'Home', url: 'https://getassetsafe.com/' },
      { name: 'Resources', url: 'https://getassetsafe.com/resources' },
      { name: 'Landlords', url: canonicalUrl },
    ]),
    faqSchema(faqData),
  ],
};

const conditionItems = [
  'Wide room views',
  'Walls, floors, and ceilings',
  'Doors and windows',
  'Appliances and fixtures',
  'Existing wear',
  'Visible damage',
  'Property-specific condition details',
];

const includedProperty = [
  'Appliances',
  'Fixtures',
  'Furnishings where provided',
  'Equipment',
  'Accessory items',
  'Serial and model numbers',
  'Receipts and warranties',
  'Condition notes',
];

const Landlords: React.FC = () => {
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
                For Landlords
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Keep a Documented History for Each Rental Property
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mb-8">
                Maintain one organized documentation history per rental property, including condition records, repairs, improvements, receipts, warranties, and repeatable organization across one or several properties.
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
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Why Rental-Property Documentation Matters</h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    Rental properties change over time. Occupants change, appliances are replaced, repairs are completed, improvements are made, and paperwork can end up scattered across emails, folders, camera rolls, and invoices.
                  </p>
                  <p>
                    Asset Safe gives each rental property an organized documentation history instead of relying on memory or disconnected files.
                  </p>
                </div>
              </div>
              <Card className="p-6 border-brand-lightBlue/40">
                <Building2 className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">One Organized Record for Each Property</h2>
                <p className="text-gray-700 mb-4">
                  Keep a separate documented profile for each property, with rooms, areas, items, and records scoped to the right rental.
                </p>
                <p className="text-gray-700">
                  See the broader organization model on the <Link to="/features" className="text-brand-blue hover:underline">features page</Link>.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <Camera className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Document Property Condition</h2>
                <p className="text-lg text-gray-700 mb-5">
                  Capture what the property looks like at meaningful moments so the condition history stays connected to the right rental.
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
                  For photo and video technique, use the <Link to="/photography-guide" className="text-brand-blue hover:underline">photography guide</Link>.
                </p>
              </Card>

              <Card className="p-6">
                <RefreshCw className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Move-In and Move-Out Condition Records</h2>
                <p className="text-lg text-gray-700 mb-4">
                  From the owner's documentation perspective, record property condition before occupancy, included appliances and fixtures, and the same areas again after move-out.
                </p>
                <p className="text-gray-700">
                  These turnover records help preserve your own property history over time. For the renter-side perspective, see the <Link to="/renters" className="text-brand-blue hover:underline">renters documentation guide</Link>.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <Package className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Appliances, Fixtures, and Included Property</h2>
                <ul className="space-y-2 mb-4">
                  {includedProperty.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-brand-orange flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700">
                  The <Link to="/asset-documentation" className="text-brand-blue hover:underline">asset documentation guide</Link> explains the broader what-to-document framework.
                </p>
              </Card>
              <Card className="p-6">
                <Wrench className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Repairs and Maintenance History</h2>
                <p className="text-gray-700">
                  Keep repair history, maintenance documentation, dates, before-and-after photos, invoices, receipts, warranties, appliance replacement details, and related property notes organized with the right rental.
                </p>
              </Card>
              <Card className="p-6">
                <Hammer className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Improvements and Renovations</h2>
                <p className="text-gray-700">
                  Document renovations, upgrades, replaced materials, before-and-after photos, receipts, invoices, warranties, product sources, paint codes, and improvement history as the property changes.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <Receipt className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Receipts, Warranties, and Supporting Records</h2>
                <p className="text-lg text-gray-700">
                  Receipts, invoices, warranty information, purchase records, product details, and condition notes are easier to find when they stay associated with the relevant property, appliance, repair, or improvement.
                </p>
              </Card>
              <Card className="p-6">
                <Building2 className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Multiple Properties, One Account</h2>
                <p className="text-lg text-gray-700">
                  Use one account to keep separate documentation for each property, repeat the same organization structure, and keep records scoped to the appropriate rental.
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
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Insurance Preparedness</h2>
                <p className="text-gray-700">
                  Organized property, repair, improvement, and included-item documentation may be useful when preparing a property-related insurance claim. See the <Link to="/claims" className="text-brand-blue hover:underline">claims documentation guide</Link> and common <Link to="/scenarios" className="text-brand-blue hover:underline">property damage scenarios</Link>.
                </p>
              </Card>
              <Card className="p-6">
                <FileText className="h-8 w-8 text-brand-green mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">If Questions Come Up</h2>
                <p className="text-gray-700 mb-4">
                  Dated condition records, repair documentation, and move-in and move-out records can be compared so clearer documentation is available when questions arise.
                </p>
                <p className="text-sm text-gray-600">
                  Asset Safe is a documentation tool and does not provide legal advice.
                </p>
              </Card>
              <Card className="p-6">
                <Home className="h-8 w-8 text-brand-green mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Alongside Property Management</h2>
                <p className="text-gray-700">
                  Asset Safe organizes the documentation behind each property. It works alongside the tools you use for leasing and rent collection rather than replacing property-management software.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-brand-blue mb-6">Related Guidance</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                ['Asset Documentation', '/asset-documentation'],
                ['Photography Guide', '/photography-guide'],
                ['Claims', '/claims'],
                ['Scenarios', '/scenarios'],
                ['Renters', '/renters'],
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
              <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">Landlord Documentation FAQs</h2>
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
            <h2 className="text-3xl font-bold mb-4">Keep Every Rental Property Better Documented</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Keep condition history, repairs, improvements, receipts, and warranties organized by property.
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

export default Landlords;
