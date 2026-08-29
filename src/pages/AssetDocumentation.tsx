import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card } from '@/components/ui/card';
import { Camera, FileText, Home, Package, Receipt, ShieldCheck, Wrench } from 'lucide-react';
import { breadcrumbSchema } from '@/utils/structuredData';

const documentationAreas = [
  {
    icon: Package,
    title: 'Belongings and equipment',
    details: 'Record furniture, electronics, appliances, jewelry, tools, collections, and small-business equipment you would want to identify later.'
  },
  {
    icon: Camera,
    title: 'Photos and videos',
    details: 'Pair room-level photos, individual item images, detail shots, and walkthrough videos with the right property or item record.'
  },
  {
    icon: Receipt,
    title: 'Receipts and purchase details',
    details: 'Save purchase dates, prices, stores, order confirmations, receipts, manuals, and warranty documents when they are available.'
  },
  {
    icon: FileText,
    title: 'Identifiers and descriptions',
    details: 'Capture make, model, serial numbers, dimensions, materials, distinguishing marks, and notes that make an item easy to recognize.'
  },
  {
    icon: Home,
    title: 'Property records',
    details: 'Keep records for rooms, structures, major systems, renovations, upgrades, repairs, and improvements tied to the property itself.'
  },
  {
    icon: Wrench,
    title: 'Condition and value notes',
    details: 'Document current condition, known issues, appraisals, estimated values, service history, and changes over time where appropriate.'
  }
];

const AssetDocumentation: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Asset Documentation | Organize Property, Belongings & Records"
        description="Learn what to document about belongings, property, equipment, receipts, photos, videos, values, serial numbers, warranties, and condition records."
        canonicalUrl="https://getassetsafe.com/asset-documentation"
        structuredData={breadcrumbSchema([
          { name: 'Home', url: 'https://getassetsafe.com/' },
          { name: 'Asset Documentation', url: 'https://getassetsafe.com/asset-documentation' }
        ])}
      />
      <Navbar />

      <main className="flex-grow bg-gray-50">
        <section className="bg-brand-blue text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Document What You Own Before You Need It
              </h1>
              <p className="text-xl opacity-90">
                Asset documentation is the practical record of your property, belongings, important details, and supporting files, organized so they are ready when life asks for proof.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <section className="mb-16">
            <Card className="p-8">
              <h2 className="text-3xl font-bold text-brand-blue mb-6">What Asset Documentation Means</h2>
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-4">
                  Asset documentation is a clear, organized record of the things you own and the information that may matter later. It can include belongings, property records, photos, videos, receipts, purchase details, condition notes, warranties, appraisals, and identifying numbers.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  The goal is not to create a financial statement. The goal is to make your records useful for everyday organization, moves, maintenance, insurance claim preparation, estate conversations, resale, repairs, and moments when you need to remember or prove what was there.
                </p>
                <p className="text-lg text-gray-700">
                  A strong record answers simple questions: what is it, where is it, what condition is it in, what supports ownership or value, and what should someone know if they need to act on your behalf?
                </p>
                <p className="text-lg text-gray-700 mt-4">
                  If you are starting with household belongings, the <Link to="/home-inventory" className="text-brand-blue hover:underline">home inventory guide</Link> shows how to organize records by property, room, and item.
                </p>
                <p className="text-lg text-gray-700 mt-4">
                  Renters can also use <Link to="/renters" className="text-brand-blue hover:underline">rental condition documentation</Link> to keep move-in, maintenance, and move-out records alongside belongings.
                </p>
                <p className="text-lg text-gray-700 mt-4">
                  Rental property owners can use <Link to="/landlords" className="text-brand-blue hover:underline">landlord documentation</Link> to keep condition history, repairs, improvements, receipts, and warranties organized by property.
                </p>
                <p className="text-lg text-gray-700 mt-4">
                  Small businesses can use <Link to="/small-business" className="text-brand-blue hover:underline">business equipment and property documentation</Link> to keep equipment details, premises records, receipts, warranties, and repair history organized.
                </p>
              </div>
            </Card>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">
              What to Capture in Each Record
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentationAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <Card key={area.title} className="p-6 hover:shadow-lg transition-shadow">
                    <Icon className="h-8 w-8 text-brand-blue mb-4" />
                    <h3 className="text-xl font-semibold text-brand-blue mb-3">{area.title}</h3>
                    <p className="text-gray-700">{area.details}</p>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="mb-16">
            <Card className="p-8">
              <h2 className="text-3xl font-bold text-brand-blue mb-6">A Practical Documentation Workflow</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Start broad, then add detail</h3>
                  <p className="text-gray-700 mb-4">
                    Begin with room-level photos or a video walkthrough so the overall context is preserved. Then document individual items that are valuable, hard to replace, newly purchased, frequently serviced, or personally important.
                  </p>
                  <p className="text-gray-700">
                    For visual records, use the <Link to="/photography-guide" className="text-brand-blue hover:underline">photography guide</Link> to capture rooms, labels, serial numbers, scale, and condition clearly.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Attach the supporting proof</h3>
                  <p className="text-gray-700 mb-4">
                    Connect each item or property record with receipts, warranties, manuals, appraisals, purchase information, maintenance records, and notes about upgrades or repairs.
                  </p>
                  <p className="text-gray-700">
                    If you are documenting after a loss, the <Link to="/claims" className="text-brand-blue hover:underline">claims documentation guide</Link> explains the types of records insurers may request.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">
              Why Documentation Matters Later
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <ShieldCheck className="h-8 w-8 text-brand-green mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Preparedness</h3>
                <p className="text-gray-700">
                  When fire, theft, storm damage, a move, or another disruption happens, organized records reduce guesswork and help you respond with clearer information.
                </p>
              </Card>
              <Card className="p-6">
                <FileText className="h-8 w-8 text-brand-green mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Organization</h3>
                <p className="text-gray-700">
                  Receipts, warranty details, serial numbers, maintenance notes, and property improvements are easier to find when they live with the item or property they describe.
                </p>
              </Card>
              <Card className="p-6">
                <Home className="h-8 w-8 text-brand-green mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Continuity</h3>
                <p className="text-gray-700">
                  Clear records help family members, trusted contacts, buyers, advisors, or service professionals understand what exists and what information goes with it.
                </p>
              </Card>
            </div>
          </section>

          <section>
            <Card className="p-8 bg-white">
              <h2 className="text-3xl font-bold text-brand-blue mb-6">Spreadsheets, Photos, and a Better Record</h2>
              <p className="text-lg text-gray-700 mb-4">
                A spreadsheet can list items, and phone photos can show what something looked like. The problem is that they often become separated from receipts, rooms, dates, notes, serial numbers, and the context that makes the record useful.
              </p>
              <p className="text-lg text-gray-700">
                The <Link to="/digital-documentation-guide" className="text-brand-blue hover:underline">digital documentation guide</Link> compares those DIY methods with organized digital records that keep the details together.
              </p>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AssetDocumentation;
