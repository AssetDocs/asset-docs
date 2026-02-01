import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Lock, Image, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import SecurityBadges from './SecurityBadges';
import { cn } from '@/lib/utils';

const DocumentProtectSection: React.FC = () => {
  const [securityOpen, setSecurityOpen] = useState(false);
  
  const steps = [
    { number: 1, title: 'Document', description: 'Capture photos, videos, and details of your property and possessions.' },
    { number: 2, title: 'Store', description: 'Securely save everything in the cloud with encryption and privacy controls.' },
    { number: 3, title: 'Protect', description: 'Access your records anytime for claims, planning, or property sales.' },
  ];

  const features = [
    {
      icon: <Image className="w-5 h-5" />,
      title: 'Photo, video, and document storage',
      description: 'Time-stamped, tamper-resistant records for your home and belongings.',
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Legacy Locker & Secure Vault',
      description: 'Encrypted storage for life\'s most important details and instructions.',
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: 'Permission-based access',
      description: 'Grant secure access to trusted parties when they need it most.',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-10">Most people don't realize how unprepared they are—until it's too late.</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left: 3-Step Process in Single Box */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">How It Works</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Features in Single Box */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">What You Get</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Info Dropdown */}
        <div className="max-w-5xl mx-auto mt-8">
          <button
            onClick={() => setSecurityOpen(!securityOpen)}
            className="w-full bg-brand-green text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-brand-green/90 transition-colors"
          >
            <span>🔒 Security & Privacy</span>
            {securityOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              securityOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="bg-card border border-t-0 border-border rounded-b-lg p-6 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Built for: Homeowners • Renters • Families • Property owners • Small businesses
              </p>
              <SecurityBadges variant="compact" />
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/features">Features & Tools</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/scenarios">Solutions</Link>
            </Button>
          </div>
          <p className="mt-6 text-primary text-lg md:text-xl font-medium max-w-lg mx-auto">
            Asset Safe isn't just storage.<br />
            It's a step-by-step system that tells you what to do next.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DocumentProtectSection;
