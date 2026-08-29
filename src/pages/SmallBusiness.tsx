import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Camera,
  FileText,
  MapPinned,
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

const pageTitle = 'Business Equipment & Property Documentation | Asset Safe';
const pageDescription =
  'Small businesses can document equipment, premises, and records in one place — photos, serial numbers, receipts, warranties, condition, and repair history.';
const canonicalUrl = 'https://getassetsafe.com/small-business';

const faqData = [
  {
    question: 'What business equipment should I document?',
    answer:
      'Document the physical equipment and property your business owns, such as tools, machinery, computers, electronics, furnishings, fixtures, and equipment used in offices, shops, studios, workshops, service spaces, and storage areas.',
  },
  {
    question: 'What records should a small business keep for its equipment and property?',
    answer:
      'Keep photos, make and model details, serial numbers, purchase information, receipts, warranties, manuals, estimated values entered by you, condition notes, repair records, and supporting documents connected to the right equipment or property record.',
  },
  {
    question: 'Should I photograph equipment, serial numbers, and model plates?',
    answer:
      'Yes. Overview photos, detail photos, serial and model plates, condition photos, and supporting paperwork can make each record easier to identify and understand later.',
  },
  {
    question: 'Can receipts, warranties, and manuals stay with the equipment record?',
    answer:
      'Yes. Asset Safe lets you keep receipts, warranty documents, manuals, invoices, purchase details, and supporting files with the relevant equipment or business property record.',
  },
  {
    question: 'How should a business document repairs, maintenance, and equipment replacements?',
    answer:
      'Keep repair dates, maintenance history, before-and-after photos, invoices, receipts, warranties, vendor notes, servicing details, replacement equipment information, and supporting records with the item or location they belong to.',
  },
  {
    question: 'Can Asset Safe organize more than one business location?',
    answer:
      'Yes. A business can keep separate Property Profiles for different locations, then organize rooms, areas, equipment, and records under the appropriate business location.',
  },
  {
    question: 'Is business property documentation useful when preparing an insurance claim?',
    answer:
      'Organized equipment, property, receipt, and condition documentation may be useful when preparing a business-property insurance claim after events such as fire, theft, storm, water damage, or accidental property damage.',
  },
  {
    question: 'Does Asset Safe replace inventory-management or accounting software?',
    answer:
      'No. Asset Safe organizes documentation for physical business property and records. It works alongside the operational, accounting, and inventory software your business already uses.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema([
      { name: 'Home', url: 'https://getassetsafe.com/' },
      { name: 'Resources', url: 'https://getassetsafe.com/resources' },
      { name: 'Small Business', url: canonicalUrl },
    ]),
    faqSchema(faqData),
  ],
};

const documentationItems = [
  'Tools and machinery',
  'Computers and electronics',
  'Furnishings and fixtures',
  'Make, model, and serial numbers',
  'Purchase details and receipts',
  'Warranties and manuals',
  'Condition notes',
  'Supporting documents',
];

const recordSources = [
  'Camera rolls',
  'Email',
  'Folders',
  'Receipts',
  'Invoices',
  'Warranty documents',
  'Equipment manuals',
  'Notes',
];

const relatedGuidance = [
  ['Asset Documentation', '/asset-documentation'],
  ['Photography Guide', '/photography-guide'],
  ['Claims', '/claims'],
  ['Scenarios', '/scenarios'],
  ['Features', '/features'],
  ['Resources', '/resources'],
];

const SmallBusiness: React.FC = () => {
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
                For Small Businesses
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Document the Equipment and Property Your Business Owns
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mb-8">
                Keep physical equipment, business property, condition details, repairs, replacements, and supporting records organized in one place.
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
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Why Business Documentation Matters</h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    Business property information can become scattered across camera rolls, email, folders, receipts, invoices, warranty documents, equipment manuals, and notes.
                  </p>
                  <p>
                    Asset Safe helps create a consistent documentation record so the important details about equipment, premises, condition, repairs, and replacements stay connected.
                  </p>
                </div>
              </div>
              <Card className="p-6 border-brand-lightBlue/40">
                <BriefcaseBusiness className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Records That Stay Together</h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {recordSources.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-brand-orange flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <Package className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Document Equipment and Business Property</h2>
                <p className="text-lg text-gray-700 mb-5">
                  Build a documented equipment list for the physical property your business owns, with identifying details and supporting records attached where they belong.
                </p>
                <ul className="grid sm:grid-cols-2 gap-3 mb-5">
                  {documentationItems.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-brand-orange flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700">
                  See the <Link to="/asset-documentation" className="text-brand-blue hover:underline">asset documentation guide</Link> for the broader framework.
                </p>
              </Card>

              <Card className="p-6">
                <Camera className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Photos, Serials, Receipts, and Warranties</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Connect overview photos, detail photos, serial and model plates, receipts, warranties, manuals, and condition photos with each equipment or business property record.
                </p>
                <p className="text-gray-700">
                  For practical photo technique, use the <Link to="/photography-guide" className="text-brand-blue hover:underline">photography guide</Link>.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <MapPinned className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Organize Records by Location and Area</h2>
                <p className="text-gray-700">
                  Keep a separate Property Profile for each business location, then organize rooms, areas, equipment, and records under the place they belong. See the <Link to="/features" className="text-brand-blue hover:underline">features page</Link> for the broader organization model.
                </p>
              </Card>
              <Card className="p-6">
                <Wrench className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Repairs and Maintenance History</h2>
                <p className="text-gray-700">
                  Organize repair dates, maintenance history, before-and-after photos, invoices, receipts, warranties, vendor notes, equipment servicing, and replacement records with the related equipment or area.
                </p>
              </Card>
              <Card className="p-6">
                <RefreshCw className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Equipment Replacements and Improvements</h2>
                <p className="text-gray-700">
                  Document replacement equipment, upgraded equipment, renovations, new fixtures, before-and-after records, purchase information, supporting receipts, warranties, and product sources.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <Building2 className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Premises, Furnishings, and Fixtures</h2>
                <p className="text-lg text-gray-700">
                  Document offices, shops, studios, workshops, service-business spaces, storage areas, furnishings, fixtures, equipment areas, and warehouse spaces as physical places and property records.
                </p>
              </Card>
              <Card className="p-6">
                <FileText className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Supporting Documents and Records</h2>
                <p className="text-lg text-gray-700">
                  Keep purchase records, warranties, equipment manuals, invoices, commercial lease documents where appropriate, business property documents, and repair records connected to the right record.
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
                  Organized equipment, property, receipt, and condition documentation may be useful when preparing a business-property insurance claim. See the <Link to="/claims" className="text-brand-blue hover:underline">claims documentation guide</Link> and common <Link to="/scenarios" className="text-brand-blue hover:underline">property damage scenarios</Link>.
                </p>
              </Card>
              <Card className="p-6">
                <Receipt className="h-8 w-8 text-brand-green mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Records for Unexpected Loss</h2>
                <p className="text-gray-700">
                  Fire, theft, storm, water damage, or accidental property damage can leave business owners trying to gather details quickly. A documentation history gives you clearer information to reference.
                </p>
              </Card>
              <Card className="p-6">
                <BriefcaseBusiness className="h-8 w-8 text-brand-green mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Alongside Business Software</h2>
                <p className="text-gray-700">
                  Asset Safe is the documentation layer for the physical property and records your business owns. It works alongside the accounting, inventory, and operations software you already use rather than replacing it.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-brand-blue mb-6">Related Guidance</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedGuidance.map(([label, href]) => (
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
              <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">Small Business Documentation FAQs</h2>
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
            <h2 className="text-3xl font-bold mb-4">Keep Your Business Property Better Documented</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Keep equipment, premises, receipts, warranties, condition, repairs, and replacement records organized in one place.
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

export default SmallBusiness;
