import React from 'react';
import { ArrowLeft, Camera, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { breadcrumbSchema } from '@/utils/structuredData';

const PhotographyGuide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Photography Guide for Documentation | Asset Safe"
        description="Best practices for photographing your assets. Lighting, angles, and tips to create insurance-ready property documentation photos."
        keywords="asset photography guide, home inventory photos, insurance documentation photos, property photography tips, how to photograph belongings"
        canonicalUrl="https://www.getassetsafe.com/photography-guide"
        structuredData={breadcrumbSchema([
          { name: 'Home', url: 'https://www.getassetsafe.com/' },
          { name: 'Resources', url: 'https://www.getassetsafe.com/resources' },
          { name: 'Photography Guide', url: 'https://www.getassetsafe.com/photography-guide' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <Camera className="h-8 w-8 text-brand-blue" />
              <div>
                <h1 className="text-3xl font-bold text-brand-blue">
                  How to Capture High-Quality Photos for Asset Documentation
                </h1>
                <div className="flex items-center gap-4 mt-2 text-gray-500">
                  <span className="bg-brand-lightBlue/20 text-brand-blue px-3 py-1 rounded text-sm font-medium">
                    Guide
                  </span>
                  <span className="text-sm">2 min read</span>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-gray-600">
              Ensure your assets are documented with clarity and precision for insurance and planning purposes:
            </p>
          </div>

          {/* Tips Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-blue">
                <CheckCircle className="h-6 w-6 mr-3" />
                Tips for Best Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Use natural lighting:</strong> Take photos near windows or in well-lit areas to avoid glare and harsh shadows.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Declutter the space:</strong> Remove unnecessary objects so the item is clearly visible and distinguishable.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Photograph multiple angles:</strong> Capture front, sides, top, and any identifying details like logos, labels, or serial numbers.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Include scale:</strong> Place a common object (like a coin or ruler) nearby to help convey size when necessary.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Avoid reflections:</strong> Especially important for glossy items—adjust the angle or use indirect lighting.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Use a neutral background:</strong> A plain wall or table helps the AI focus on the item itself.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Ensure sharp focus:</strong> Hold your device steady or use a tripod to prevent blur.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Tip */}
          <Card className="mb-8 bg-orange-50 border-brand-orange">
            <CardHeader>
              <CardTitle className="flex items-center text-brand-orange">
                <Lightbulb className="h-6 w-6 mr-3" />
                Pro Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                For small items like jewelry or collectibles, use your phone's macro mode (if available) to capture fine details that influence value.
              </p>
            </CardContent>
          </Card>

          {/* Key Takeaways */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-brand-blue">
                  <Camera className="h-6 w-6 mr-3" />
                  Key Takeaways for High-Quality Documentation Photos
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Do's */}
                <div>
                  <h4 className="font-semibold text-green-600 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Do This
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Use consistent, diffuse lighting (natural light or softbox)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Choose plain backgrounds for clarity</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Set correct white balance for accurate colors</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Steady your camera with a tripod and use timer</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Capture multiple perspectives and close-ups</span>
                    </div>
                  </div>
                </div>

                {/* Don'ts */}
                <div>
                  <h4 className="font-semibold text-red-600 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Avoid This
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Mix light sources like daylight + fluorescent</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Include busy décor or reflections</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Leave color casts unchecked</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Shoot handheld, causing blur</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Only shoot a single flat angle</span>
                    </div>
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