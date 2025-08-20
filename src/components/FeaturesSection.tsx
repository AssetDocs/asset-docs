
import React from 'react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import { Link } from 'react-router-dom';
import { Shield, Camera, Lock, BarChart, Clock } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const FeaturesSection: React.FC = () => {
  const { translate } = useTranslation();

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">{translate('features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Camera size={48} />}
            title="High Resolution Documentation"
            description="Capture detailed images and video of your property and possessions with our easy-to-use tools."
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
          <FeatureCard 
            icon={<Shield size={48} />}
            title="Real Estate"
            description="Property condition reports, improvement documentation, and value authentication."
          />
        </div>
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-lightBlue">
              <Link to="/features">{translate('features.viewAll')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/sample-dashboard">View Sample Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
