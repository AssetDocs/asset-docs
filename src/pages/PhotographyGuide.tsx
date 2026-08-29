import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle, ClipboardList, Home, Image, Lightbulb, Video, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { breadcrumbSchema } from '@/utils/structuredData';

const PhotographyGuide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Photography Guide for Property Documentation | Asset Safe"
        description="Practical photo and video tips for documenting belongings, rooms, condition details, serial numbers, receipts, renovations, and property records."
        canonicalUrl="https://getassetsafe.com/photography-guide"
        structuredData={breadcrumbSchema([
          { name: 'Home', url: 'https://getassetsafe.com/' },
          { name: 'Resources', url: 'https://getassetsafe.com/resources' },
          { name: 'Photography Guide', url: 'https://getassetsafe.com/photography-guide' }
        ])}
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <Camera className="h-8 w-8 text-brand-blue" />
              <div>
                <h1 className="text-3xl font-bold text-brand-blue">
                  How to Photograph Belongings and Property for Better Documentation
                </h1>
                <div className="flex items-center gap-4 mt-2 text-gray-500">
                  <span className="bg-brand-lightBlue/20 text-brand-blue px-3 py-1 rounded text-sm font-medium">
                    Guide
                  </span>
                  <span className="text-sm">8 min read</span>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-600">
              Clear images make your records easier to understand later. Use these practical steps to document rooms, belongings, paperwork, condition, and changes over time.
            </p>
            <p className="text-gray-600 mt-3">
              If you are creating a full room-by-room record, pair these photo tips with the <Link to="/home-inventory" className="text-brand-blue hover:underline">home inventory guide</Link>.
            </p>
            <p className="text-gray-600 mt-3">
              Small businesses can apply the same photo principles to <Link to="/small-business" className="text-brand-blue hover:underline">business equipment and property documentation</Link>.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-blue">
                <Home className="h-6 w-6 mr-3" />
                Start with the Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Begin each room with wide photos from multiple corners. Capture closets, cabinets, shelves, garages, attics, storage areas, and built-ins so the overall context is preserved.
              </p>
              <p>
                Add a slow video walkthrough when a room has many belongings or connected spaces. Narrate key details if useful, such as recent upgrades, high-value items, or areas that already show wear.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-blue">
                <Image className="h-6 w-6 mr-3" />
                Photograph Individual Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {[
                  ['Use natural or even lighting', 'Take photos near windows or in well-lit areas. Avoid harsh glare and deep shadows.'],
                  ['Capture multiple angles', 'Photograph the front, back, sides, top, underside, tags, labels, and any unique marks.'],
                  ['Show condition clearly', 'Include scratches, dents, wear, repairs, stains, or other details that describe current condition.'],
                  ['Record serial and model numbers', 'Zoom in on serial plates, model labels, VINs, manufacturer tags, and identifying stickers.'],
                  ['Include scale when needed', 'Use a ruler, coin, hand, doorway, or nearby object when size would otherwise be hard to judge.'],
                  ['Use a clean background', 'A plain wall, table, or floor keeps the item easy to see and reduces visual confusion.'],
                  ['Keep images sharp', 'Hold your device steady, tap to focus, clean the lens, and retake blurry photos immediately.']
                ].map(([title, detail]) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>{title}:</strong> {detail}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-blue">
                <ClipboardList className="h-6 w-6 mr-3" />
                Pair Photos with Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Photograph receipts, warranty cards, appraisals, manuals, certificates, and service paperwork next to the item when it helps connect the record. Keep the text readable and capture the entire page.
              </p>
              <p>
                For renovations and improvements, take before, during, and after photos. Save contractor invoices, permits, materials receipts, and warranty information with the related room or system.
              </p>
              <p>
                The <Link to="/asset-documentation" className="text-brand-blue hover:underline">asset documentation guide</Link> explains what information belongs with each item or property record.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-blue">
                <Video className="h-6 w-6 mr-3" />
                Use Video for Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Video walkthroughs are useful for showing layout, room condition, move-in or move-out condition, and groups of items that do not need individual photos.
              </p>
              <p>
                Renters can use the <Link to="/renters" className="text-brand-blue hover:underline">renters documentation guide</Link> to connect move-in and move-out visuals with their own rental condition records.
              </p>
              <p>
                Rental property owners can use the <Link to="/landlords" className="text-brand-blue hover:underline">landlords documentation guide</Link> to organize condition photos with turnover, repair, and improvement records.
              </p>
              <p>
                Move slowly, keep the camera level, and pause on labels, serial numbers, damage, upgrades, or high-value items. A quiet narrated walkthrough can help explain what viewers are seeing.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-orange-50 border-brand-orange">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-orange">
                <Lightbulb className="h-6 w-6 mr-3" />
                Keep It Organized
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Good photos are most useful when they stay connected to the right item, room, receipt, warranty, or property record. Add labels while the details are fresh.
              </p>
              <p>
                For insurance-specific preparation, see the <Link to="/claims" className="text-brand-blue hover:underline">claims documentation guide</Link>. For a comparison of scattered photos versus organized records, read the <Link to="/digital-documentation-guide" className="text-brand-blue hover:underline">digital documentation guide</Link>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-brand-blue">
                <Camera className="h-6 w-6 mr-3" />
                Quick Photo Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-semibold text-green-600 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Do This
                  </h2>
                  <div className="space-y-3">
                    {[
                      'Capture each room before individual items',
                      'Photograph labels, serial numbers, and model numbers',
                      'Take close-ups of high-value item details',
                      'Include receipts or paperwork when useful',
                      'Document move-in, move-out, and renovation condition'
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-semibold text-red-600 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Avoid This
                  </h2>
                  <div className="space-y-3">
                    {[
                      'Relying on one photo for an important item',
                      'Leaving serial numbers unreadable',
                      'Using dark, blurry, or highly reflective images',
                      'Letting receipts and photos become separated',
                      'Waiting until after an event to document condition'
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PhotographyGuide;
