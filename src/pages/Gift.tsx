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
      price: "$155.88 - 1 year",
      description: "Our most popular plan for comprehensive home documentation",
      features: [
        "Up to 3 properties",
        "25GB secure cloud storage"
      ],
      planType: "standard",
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: "Premium (Professional Plan)",
      price: "$227.88 - 1 year",
      description: "Best suited for estate managers, multiple-property owners, or businesses",
      features: [
        "Unlimited properties",
        "100GB secure cloud storage"
      ],
      planType: "premium",
      icon: <Star className="h-6 w-6" />
    }
  ];

  const commonFeatures = [
    "Photo, video, and document upload",
    "Full web platform access",
    "Voice notes for item details",
    "Post damage documentation",
    "Export detailed reports",
    "Email support",
    "Share with 3 trusted contacts",
    "12-month gift subscription"
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Give the Gift of Protection and Peace of Mind
            </h1>
            <p className="text-lg font-medium text-brand-orange mb-6">
              Practical, Not Disposable – A gift that provides long-term value
            </p>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Help your loved ones protect their most valuable assets with Asset Safe. 
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

            <div className="flex justify-center gap-8 max-w-4xl mx-auto">
              {giftPlans.map((plan) => (
                <div key={plan.title} className="w-full max-w-sm">
                  <SubscriptionPlan
                    title={plan.title}
                    price={plan.price}
                    description={plan.description}
                    features={plan.features}
                    buttonText="Gift This Plan"
                    buttonClassName="w-full bg-brand-orange hover:bg-brand-orange/90"
                    onClick={() => handleGiftPurchase(plan.planType)}
                  />
                </div>
              ))}
            </div>

            {/* Common Features Section */}
            <div className="mt-12 bg-blue-50 rounded-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Features included in both plans
              </h3>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                {commonFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="bg-blue-50 rounded-lg p-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">How Gift Subscriptions Work</h3>
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">For Gift Givers:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Purchase a 12-month subscription</li>
                      <li>• Enter recipient information during checkout</li>
                      <li>• Automatic gift certificate delivered to recipient</li>
                      <li>• No recurring charges - one-time payment</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">For Recipients:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Create an Asset Safe account</li>
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

        {/* Who Is Asset Safe a Great Gift For Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <GiftIcon className="h-8 w-8 text-brand-orange" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Who Is Asset Safe a Great Gift For?
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Homebuyers & Sellers</h3>
                <p className="text-gray-600">A meaningful closing gift that lasts well beyond move-in day</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Newlyweds & Couples</h3>
                <p className="text-gray-600">Start life together organized, protected, and prepared</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Business Owners & Entrepreneurs</h3>
                <p className="text-gray-600">Secure important documents and assets in one place</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Parents & Growing Families</h3>
                <p className="text-gray-600">Protect what matters most and plan ahead with confidence</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Adult Children Gifting Parents</h3>
                <p className="text-gray-600">A thoughtful way to help organize important records</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Graduates & Young Adults</h3>
                <p className="text-gray-600">A smart foundation for independent life</p>
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
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Show someone you care about their security and peace of mind. Asset Safe makes the perfect gift 
              for new homeowners, property investors, or anyone who values protection.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Gift;