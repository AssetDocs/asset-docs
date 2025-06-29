
import React from 'react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import { Link } from 'react-router-dom';
import { Shield, Camera, Lock, FileImage, BarChart, Clock } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Comprehensive Documentation Tools</h2>
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
  );
};

export default FeaturesSection;
