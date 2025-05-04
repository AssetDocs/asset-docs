import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import { Link } from 'react-router-dom';
import { Shield, Camera, Lock, FileImage, BarChart, Clock } from 'lucide-react';

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
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up">
                <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                  <Link to="/signup">Start Your Free Trial</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Link to="/features">Learn More</Link>
                </Button>
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
          <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
            <Link to="/signup">Start Your Free 14-Day Trial</Link>
          </Button>
          <p className="mt-4 text-sm opacity-90">No credit card required. Cancel anytime.</p>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
