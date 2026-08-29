import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  CheckCircle,
  FileText,
  Home,
  Package,
  Receipt,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { breadcrumbSchema, faqSchema } from '@/utils/structuredData';

const pageTitle = 'Home Inventory App | Document What You Own | Asset Safe';
const pageDescription =
  'Build a complete home inventory in one secure place. Document belongings room by room with photos, receipts, and values, then keep it current with Asset Safe.';
const canonicalUrl = 'https://getassetsafe.com/home-inventory';

const faqData = [
  {
    question: 'What should I include in a home inventory?',
    answer:
      'Include rooms, major belongings, high-value items, electronics, appliances, furniture, tools, jewelry, collections, receipts, warranty details, serial numbers, photos, videos, and condition notes.',
  },
  {
    question: 'Do I need to finish my entire inventory at once?',
    answer:
      'No. Start with one room, one closet, or your most important items, then keep adding records as you make purchases, move items, or find supporting documents.',
  },
  {
    question: 'How does a home inventory help with insurance preparation?',
    answer:
      'A home inventory keeps item descriptions, photos, receipts, values, and ownership details together so you have clearer information available when preparing for a property or contents claim.',
  },
  {
    question: 'Can I organize more than one property?',
    answer:
      'Yes. Asset Safe is built around properties, rooms, and items, so you can keep records for a primary home, storage area, vacation property, rental, or family property in the right place.',
  },
  {
    question: 'Should I photograph every item?',
    answer:
      'Room-level photos and walkthrough videos are useful for context, while individual photos are most important for valuable, hard-to-replace, recently purchased, or frequently serviced items.',
  },
  {
    question: 'How often should I update my home inventory?',
    answer:
      'Update your inventory when you buy or sell important items, complete renovations, move rooms, replace appliances, service valuable property, or notice a meaningful change in condition.',
  },
  {
    question: 'Is Asset Safe only for insurance claims?',
    answer:
      'No. A home inventory can also support everyday organization, moving, maintenance, estate conversations, family continuity, warranty lookups, resale preparation, and clearer record keeping.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema([
      { name: 'Home', url: 'https://getassetsafe.com/' },
      { name: 'Resources', url: 'https://getassetsafe.com/resources' },
      { name: 'Home Inventory', url: canonicalUrl },
    ]),
    faqSchema(faqData),
  ],
};

const checklistGroups = [
  {
    title: 'Belongings',
    items: ['Furniture', 'Electronics', 'Appliances', 'Tools', 'Jewelry', 'Art', 'Collections'],
  },
  {
    title: 'Proof',
    items: ['Receipts', 'Warranties', 'Manuals', 'Serial numbers', 'Model numbers', 'Appraisals'],
  },
  {
    title: 'Context',
    items: ['Room photos', 'Video walkthroughs', 'Condition notes', 'Purchase details', 'Value notes'],
  },
];

const featurePillars = [
  {
    icon: Package,
    title: 'Structured asset records',
    body: 'Keep each item connected to the property, room, photos, receipts, values, and notes that describe it.',
  },
  {
    icon: FileText,
    title: 'Supporting files',
    body: 'Attach receipts, warranty documents, appraisals, manuals, policies, and related paperwork where they belong.',
  },
  {
    icon: ShieldCheck,
    title: 'Prepared access',
    body: 'Keep organized records available for household planning, trusted contacts, claim preparation, and transitions.',
  },
];

const HomeInventory: React.FC = () => {
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
                Home inventory app
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Create a Home Inventory of Everything You Own
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mb-8">
                Build a room-by-room record of belongings, photos, receipts, values, and identifying details so your household information is easier to find when it matters.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                  <Link to="/pricing">
                    View Pricing
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
            <div className="grid lg:grid-cols-[1fr_0.85fr] gap-10 items-start">
              <div>
                <h2 className="text-3xl font-bold text-brand-blue mb-4">What Is a Home Inventory?</h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    A home inventory is a practical record of the belongings and property details you may need to identify later. It can be as simple as room photos and a few item notes, or as detailed as receipts, warranties, serial numbers, values, and condition records.
                  </p>
                  <p>
                    Asset Safe helps keep those details connected instead of scattered across camera rolls, folders, email receipts, and spreadsheets. For a broader framework, use the <Link to="/asset-documentation" className="text-brand-blue hover:underline">asset documentation guide</Link> alongside this page.
                  </p>
                </div>
              </div>
              <Card className="p-6 border-brand-lightBlue/40">
                <h2 className="text-2xl font-bold text-brand-blue mb-4">Why It Matters</h2>
                <div className="space-y-4">
                  {[
                    'Know what you own without relying on memory.',
                    'Keep proof of ownership and value details closer to each item.',
                    'Prepare clearer records before a move, loss, repair, or family transition.',
                    'Make receipts, photos, warranties, and notes easier to retrieve.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mb-8">
              <h2 className="text-3xl font-bold text-brand-blue mb-4">What to Include</h2>
              <p className="text-lg text-gray-700">
                Start with the records that make an item easy to recognize: what it is, where it is, what supports ownership, and what someone should know if the item needs repair, replacement, sale, or review.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {checklistGroups.map((group) => (
                <Card key={group.title} className="p-6">
                  <h3 className="text-xl font-semibold text-brand-blue mb-4">{group.title}</h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-700">
                        <span className="h-2 w-2 rounded-full bg-brand-orange flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <Home className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Work Room by Room</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Asset Safe is organized around a simple Property to Room to Item model. Capture each room first, then add individual records for important belongings, appliances, furniture, tools, collections, and electronics.
                </p>
                <p className="text-gray-700">
                  The <Link to="/blog/digital-home-inventory-guide" className="text-brand-blue hover:underline">digital home inventory guide</Link> walks through a room-by-room starting approach in more detail.
                </p>
              </div>
              <div>
                <Camera className="h-8 w-8 text-brand-blue mb-4" />
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Add Photos, Video, and Receipts</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Pair wide room photos with item close-ups, serial number images, receipt photos, warranty documents, and video walkthroughs. Visual context helps records make sense later.
                </p>
                <p className="text-gray-700">
                  Use the <Link to="/photography-guide" className="text-brand-blue hover:underline">photography guide</Link> for practical tips on lighting, labels, condition details, and readable documents.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <Receipt className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Values and Identifying Info</h2>
                <p className="text-gray-700">
                  Record purchase dates, stores, prices, estimated values, brand names, model numbers, serial numbers, dimensions, and distinguishing details when they are available.
                </p>
              </Card>
              <Card className="p-6">
                <RefreshCw className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Keep It Current</h2>
                <p className="text-gray-700">
                  Update your inventory when you buy, sell, replace, move, repair, renovate, or notice a meaningful condition change. A useful inventory grows with your home.
                </p>
              </Card>
              <Card className="p-6">
                <ShieldCheck className="h-8 w-8 text-brand-orange mb-4" />
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Insurance Preparedness</h2>
                <p className="text-gray-700">
                  For claim-focused records, read the <Link to="/claims" className="text-brand-blue hover:underline">claims documentation guide</Link> and review common <Link to="/scenarios" className="text-brand-blue hover:underline">property damage scenarios</Link>.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[0.8fr_1fr] gap-10 items-start">
              <div>
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Moving and Life Transitions</h2>
                <p className="text-lg text-gray-700">
                  A home inventory is useful before a move, after a renovation, when combining households, when preparing family records, or when handing information to someone you trust. Clear records reduce the amount of household knowledge that lives only in your memory.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-brand-blue mb-6">Beyond a Basic Home Inventory</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {featurePillars.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <Card key={pillar.title} className="p-5">
                        <Icon className="h-6 w-6 text-brand-blue mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">{pillar.title}</h3>
                        <p className="text-sm text-gray-600">{pillar.body}</p>
                      </Card>
                    );
                  })}
                </div>
                <p className="text-gray-700 mt-5">
                  See the complete platform overview on the <Link to="/features" className="text-brand-blue hover:underline">features page</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <Card className="p-8">
              <h2 className="text-3xl font-bold text-brand-blue mb-4">Home Inventory App vs. Spreadsheets and Camera Rolls</h2>
              <p className="text-lg text-gray-700 mb-4">
                Spreadsheets can list items, and camera rolls can show what a room looked like, but they often separate the photo from the receipt, the item from the room, and the value note from the supporting detail.
              </p>
              <p className="text-lg text-gray-700">
                Asset Safe keeps item records, supporting files, and household context together. For a deeper comparison, read <Link to="/digital-documentation-guide" className="text-brand-blue hover:underline">why digital asset documentation beats spreadsheets and phone photos</Link>.
              </p>
            </Card>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">Home Inventory FAQs</h2>
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
      </main>

      <Footer />
    </div>
  );
};

export default HomeInventory;
