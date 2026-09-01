import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  Building2,
  FileText,
  HomeIcon,
  ShieldCheck,
  Scale,
  Truck,
  Wrench,
  Umbrella,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { breadcrumbSchema } from '@/utils/structuredData';

const pageTitle = 'Asset Safe for Professionals | Help Clients Stay Prepared';
const pageDescription =
  'See how insurance agents, real estate professionals, estate planners, property managers, and other professionals can help clients stay organized and prepared with Asset Safe.';
const canonicalUrl = 'https://getassetsafe.com/professionals';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema([
      { name: 'Home', url: 'https://getassetsafe.com/' },
      { name: 'Professionals', url: canonicalUrl },
    ]),
  ],
};

const moments = [
  'Homeownership',
  'Insurance needs',
  'Moves',
  'Property transitions',
  'Estate planning',
  'Property management',
  'Emergencies',
  'Major life changes',
];

const useCases = [
  {
    icon: Umbrella,
    title: 'Insurance Agents',
    body: 'Help clients document belongings and property before a loss, keep receipts and records organized, and build clearer documentation that may support the claims process.',
    items: [
      'Asset Documentation',
      'Photos and videos',
      'Receipts and records',
      'Asset Values',
      'High-Value Items',
      'Post Damage Report',
    ],
    note: 'Asset Safe does not guarantee claim outcomes, settlement amounts, or insurance approval.',
  },
  {
    icon: HomeIcon,
    title: 'Real Estate Professionals',
    body: 'Give buyers and homeowners a useful tool they can continue using after closing to document property, improvements, records, and household information.',
    items: [
      'Property Profiles',
      'Asset Documentation',
      'Upgrades & Repairs',
      'Paint Codes',
      'Important Locations',
      'Household records',
      'Knowledge Hub',
    ],
    note: 'Ongoing client value after the transaction is complete.',
  },
  {
    icon: Scale,
    title: 'Estate Planning Professionals',
    body: 'Help clients organize important information, instructions, contacts, and digital legacy details alongside their formal estate planning.',
    items: [
      'Secure Vault',
      'Legacy Locker',
      'Legacy Instructions',
      'Digital Access',
      'Emergency Instructions',
      'Trusted Professionals and Contacts',
    ],
    note: 'Asset Safe does not replace a will, estate plan, attorney, financial advisor, or other professional planning.',
  },
  {
    icon: Building2,
    title: 'Property Managers',
    body: 'Keep property details, repairs, improvements, contractor information, and records easier to organize across the properties you manage.',
    items: [
      'Property Profiles',
      'Upgrades & Repairs',
      'Paint Codes',
      'Important Locations',
      'Trusted Professionals',
      'Source Websites',
      'Smart Calendar',
    ],
    note: 'Asset Safe is a documentation and organization tool, not leasing, rent collection, or maintenance dispatch software.',
  },
  {
    icon: Truck,
    title: 'Moving & Storage Professionals',
    body: 'Encourage clients to document belongings before a move and keep important property records organized during transitions.',
    items: [
      'Photos and videos',
      'Belongings documentation',
      'Receipts',
      'Property Profiles',
      'Moving-condition documentation',
    ],
    note: 'Documentation is entered and maintained by the client. Asset Safe does not verify inventories or provide coverage.',
  },
  {
    icon: Wrench,
    title: 'Home Service Professionals',
    body: 'Help clients maintain a clearer record of improvements, repairs, materials, finishes, and important property details after work is complete. Useful for contractors, remodelers, home inspectors, designers, and repair professionals.',
    items: [
      'Upgrades & Repairs',
      'Paint Codes',
      'Source Websites',
      'Receipts',
      'Photos',
      'Documents',
      'Trusted Professionals',
    ],
    note: 'A lasting record of the work you completed, kept by your client.',
  },
];

const platform = [
  {
    icon: FileText,
    title: 'Asset Documentation',
    body: 'Document property, belongings, photos, receipts, records, values, and improvements.',
  },
  {
    icon: Boxes,
    title: 'Knowledge Hub',
    body: 'Keep contacts, notes, household details, reminders, property information, and memories organized.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Vault',
    body: 'Protect sensitive Digital Access and Legacy Locker information in one encrypted space.',
  },
];

const reasons = [
  'Adds practical value beyond the immediate transaction',
  'Encourages clients to stay organized',
  'Helps clients prepare before information is urgently needed',
  'Supports stronger long-term client relationships',
  'Gives clients one place to maintain important property and household information',
];

const Professionals: React.FC = () => {
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
                For Professionals
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Help Your Clients Stay Better Prepared
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mb-4">
                Asset Safe gives professionals a practical way to help clients document, organize, protect, and share important property and household information — before it's needed.
              </p>
              <p className="text-base text-white/75 max-w-3xl mb-8">
                Useful for insurance agents, real estate professionals, estate planners, property managers, and other client-focused professionals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                  <Link to="/features">
                    Explore Asset Safe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white border-white/25 hover:bg-white/20"
                >
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 items-start">
              <div>
                <h2 className="text-3xl font-bold text-brand-blue mb-4">Why Professionals Care</h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    Professionals often help clients through moments when accurate records and organized information matter most.
                  </p>
                  <p>
                    Asset Safe gives clients one place to keep property documentation, important records, household information, and private legacy details organized for the future.
                  </p>
                </div>
              </div>
              <Card className="p-6 border-brand-lightBlue/40">
                <h2 className="text-2xl font-bold text-brand-blue mb-3">Moments That Matter</h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {moments.map((item) => (
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
            <h2 className="text-3xl font-bold text-brand-blue mb-8">How Professionals Use Asset Safe With Clients</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map(({ icon: Icon, title, body, items, note }) => (
                <Card key={title} className="p-6 flex flex-col">
                  <Icon className="h-8 w-8 text-brand-blue mb-4" />
                  <h3 className="text-2xl font-bold text-brand-blue mb-3">{title}</h3>
                  <p className="text-gray-700 mb-4">{body}</p>
                  <ul className="space-y-2 mb-4">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-700">
                        <span className="h-2 w-2 mt-2 rounded-full bg-brand-orange flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-500 mt-auto">{note}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-brand-blue mb-3">One Platform Your Clients Keep Using</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl">
              However you introduce it, your clients are using the same core Asset Safe platform.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {platform.map(({ icon: Icon, title, body }) => (
                <Card key={title} className="p-6">
                  <Icon className="h-8 w-8 text-brand-green mb-4" />
                  <h3 className="text-2xl font-bold text-brand-blue mb-3">{title}</h3>
                  <p className="text-gray-700">{body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-brand-blue mb-8">Why Professionals Recommend It</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reasons.map((reason) => (
                <div key={reason} className="bg-white border rounded-lg p-5 text-gray-700">
                  {reason}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-bold text-brand-blue mb-4">Give Clients Something They Can Keep Using</h2>
            <p className="text-lg text-gray-700 mb-8">
              Asset Safe helps people stay organized long after the appointment, closing, move, or project is complete.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/features">
                  Explore Asset Safe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="text-gray-600 mt-6">
              Interested in working with Asset Safe?{' '}
              <Link to="/contact" className="text-brand-blue hover:underline">
                Contact us.
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Professionals;
