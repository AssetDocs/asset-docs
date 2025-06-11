
import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import ShareButton from '@/components/ShareButton';
import { Link } from 'react-router-dom';
import { Shield, Camera, Lock, FileImage, BarChart, Clock, Scan, Search, Info } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-full mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
                Your Digital Safety Net for Asset Protection
              </h1>
              <p className="text-xl mb-8 animate-slide-up opacity-90">
                Secure documentation of your property and possessions with professional-grade tools and third-party verification.
              </p>
              
              {/* Platform Clarification */}
              <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 animate-slide-up">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Asset Documentation Platform</p>
                    <p className="text-xs text-white/80">
                      AssetDocs is designed for property documentation and insurance protection, not inventory management or business operations.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up">
                <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                  <Link to="/signup">Start Your Free Trial</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Link to="/features">Learn More</Link>
                </Button>
                <ShareButton 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-white text-white hover:bg-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* AI Powered Valuation Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">AI-Powered Asset Identification & Valuation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">Intelligent Asset Recognition</h3>
              <p className="text-lg mb-6 text-gray-700">
                Our advanced AI technology automatically identifies items in your uploaded images, 
                cataloging them with detailed descriptions and specifications without any manual input required.
              </p>
              
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">Accurate Value Estimation</h3>
              <p className="text-lg mb-6 text-gray-700">
                Each identified item receives an estimated market value based on current pricing data, 
                helping you maintain an up-to-date inventory for insurance and financial planning.
              </p>
              
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">Receipt Integration</h3>
              <p className="text-lg mb-6 text-gray-700">
                Link purchase receipts to your documented items automatically. Our system matches 
                receipts with corresponding items, creating a comprehensive record of ownership and value.
              </p>
              
              <div className="mt-8">
                <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-lightBlue text-white">
                  <Link to="/features">Learn How It Works</Link>
                </Button>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 bg-gray-50 p-8 rounded-xl shadow-lg">
              <div className="relative">
                <div className="bg-white p-5 rounded-lg shadow-md mb-6">
                  <div className="flex items-center mb-3">
                    <Scan className="w-8 h-8 text-brand-blue mr-3" />
                    <h4 className="text-xl font-semibold">AI Scanning Process</h4>
                  </div>
                  <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                    <li>Upload photos of your possessions</li>
                    <li>Our AI identifies each individual item</li>
                    <li>Items are matched against pricing databases</li>
                    <li>Estimated values are assigned to each item</li>
                    <li>Upload receipts for precise value recording</li>
                  </ol>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-md">
                  <div className="flex items-center mb-3">
                    <Search className="w-8 h-8 text-brand-blue mr-3" />
                    <h4 className="text-xl font-semibold">Smart Cataloging</h4>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Items are automatically categorized for easy searching and reporting:
                  </p>
                  <ul className="grid grid-cols-2 gap-2 text-gray-700">
                    <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Electronics</li>
                    <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Furniture</li>
                    <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Appliances</li>
                    <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Artwork</li>
                    <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Jewelry</li>
                    <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Collectibles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Comprehensive Documentation Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Camera size={48} />}
              title="High Resolution Documentation"
              description="Capture detailed images and video of your property and possessions with our easy-to-use tools."
            />
            <FeatureCard 
              icon={<FileImage size={48} />}
              title="3D Virtual Tours"
              description="Create interactive 3D models of your property with precise measurements and asset location references."
            />
            <FeatureCard 
              icon={<Shield size={48} />}
              title="Third-Party Verification"
              description="Get professional verification of your assets to ensure accurate insurance claims and valuations."
            />
            <FeatureCard 
              icon={<Lock size={48} />}
              title="Secure Cloud Storage"
              description="Store all your documentation securely with enterprise-grade encryption and privacy controls."
            />
            <FeatureCard 
              icon={<BarChart size={48} />}
              title="Detailed Reports"
              description="Generate comprehensive reports for insurance, estate planning, or property sales."
            />
            <FeatureCard 
              icon={<Clock size={48} />}
              title="Disaster Preparedness"
              description="Be prepared for unforeseen events with complete documentation of your assets."
            />
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-lightBlue">
              <Link to="/features">View All Features</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="section-title">How AssetDocs Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Document</h3>
              <p className="text-gray-600">
                Take photos and videos of your property and possessions using our mobile app or professional service.
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 rounded-full bg-brand-lightBlue text-white flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Store</h3>
              <p className="text-gray-600">
                Your documentation is securely stored in the cloud with privacy controls and encryption.
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 rounded-full bg-brand-green text-white flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Protect</h3>
              <p className="text-gray-600">
                Access your documentation anytime for insurance claims, estate planning, or property sales.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-brand-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Property Documentation?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of property owners who trust AssetDocs to protect their valuable assets and provide peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
              <Link to="/signup">Start Your Free 14-Day Trial</Link>
            </Button>
            <ShareButton 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-white text-white hover:bg-white/10"
            />
          </div>
          <p className="mt-4 text-sm opacity-90">No credit card required. Cancel anytime.</p>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
