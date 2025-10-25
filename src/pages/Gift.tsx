import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Gift as GiftIcon, Heart, Shield, Users, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Gift: React.FC = () => {
  const navigate = useNavigate();

  const giftPlans = [
    {
      title: "Standard (Homeowner Plan)",
      price: "$155.88/year",
      description: "Our most popular plan for comprehensive home documentation",
      features: [
        "30-day free trial",
        "Up to 3 properties",
        "25GB secure cloud storage",
        "Unlimited photo and video uploads",
        "Full web platform access",
        "Voice notes for item details",
        "Post damage documentation",
        "Export detailed reports",
        "Email support",
        "Share with 3 trusted contacts",
        "12-month gift subscription"
      ],
      planType: "standard",
      recommended: true,
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: "Premium (Professional Plan)",
      price: "$227.88/year",
      description: "Best suited for estate managers, multiple-property owners, or businesses",
      features: [
        "30-day free trial",
        "Unlimited properties",
        "100GB secure cloud storage",
        "Unlimited photo and video uploads",
        "Full web platform access",
        "Voice notes for item details",
        "Post damage documentation",
        "Export detailed reports",
        "Email support",
        "Share with 3 trusted contacts",
        "12-month gift subscription"
      ],
      planType: "premium",
      icon: <Star className="h-6 w-6" />
    }
  ];

  const handleGiftPurchase = (planType: string) => {
    navigate('/gift-checkout', { 
      state: { 
        selectedPlan: planType,
        isGift: true,
        giftDuration: '12months'
      } 
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-brand-orange/10 p-4 rounded-full">
                <GiftIcon className="h-12 w-12 text-brand-orange" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Give the Gift of Protection and Peace of Mind
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Help your loved ones protect their most valuable assets with Asset Docs. 
              A thoughtful gift that provides lasting security and organization for their properties and belongings.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Comprehensive Protection</h3>
                <p className="text-gray-600">Safeguard valuable assets with detailed documentation and organization</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Peace of Mind</h3>
                <p className="text-gray-600">Know that important documents and photos are secure and accessible</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Family Security</h3>
                <p className="text-gray-600">Protect multiple properties and keep family assets organized</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gift Plans Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose the Perfect Gift Plan
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                All gift subscriptions include a full year of service. Your recipient will receive immediate access 
                to all features and can start protecting their assets right away.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {giftPlans.map((plan, index) => (
                <div key={plan.title} className={`relative ${plan.recommended ? 'transform scale-105' : ''}`}>
                  <SubscriptionPlan
                    title={plan.title}
                    price={plan.price}
                    description={plan.description}
                    features={plan.features}
                    recommended={plan.recommended}
                    buttonText="Gift This Plan"
                    onClick={() => handleGiftPurchase(plan.planType)}
                  />
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <div className="bg-blue-50 rounded-lg p-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">How Gift Subscriptions Work</h3>
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">For Gift Givers:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Purchase a 12-month subscription</li>
                      <li>• Receive a gift certificate via email</li>
                      <li>• Share the gift code with your recipient</li>
                      <li>• No recurring charges - one-time payment</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">For Recipients:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Create an Asset Docs account</li>
                      <li>• Enter the gift code during setup</li>
                      <li>• Enjoy full access for 12 months</li>
                      <li>• Option to continue with their own subscription</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-brand-blue to-brand-lightBlue py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Give a Gift That Truly Matters
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Show someone you care about their security and peace of mind. Asset Docs makes the perfect gift 
              for new homeowners, property investors, or anyone who values protection.
            </p>
            <Button 
              size="lg" 
              className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg"
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            >
              Browse Gift Plans
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Gift;