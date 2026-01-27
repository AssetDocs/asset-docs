import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Lock, Image, Share2, Shield, Cloud, CheckCircle } from 'lucide-react';

const DocumentProtectSection: React.FC = () => {
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

  const securityBadges = [
    { icon: <Shield className="w-3.5 h-3.5" />, label: '256-bit AES Encryption' },
    { icon: <Lock className="w-3.5 h-3.5" />, label: 'SOC 2 Compliant' },
    { icon: <Cloud className="w-3.5 h-3.5" />, label: 'AWS Cloud Storage' },
    { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'GDPR Ready' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-10">Everything You Need to Document and Protect</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left: 3-Step Process in Single Box */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-6">How It Works</h3>
            <div className="space-y-4 flex-1">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Built for: Homeowners • Renters • Families • Property owners • Small businesses
              </p>
            </div>
          </div>
          
          {/* Right: Features in Single Box */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-6">What You Get</h3>
            <div className="space-y-4 flex-1">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                {securityBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="text-primary">{badge.icon}</span>
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Callout text below */}
        <p className="text-center text-lg md:text-xl font-medium text-muted-foreground mt-10 max-w-3xl mx-auto">
          Most people don't realize how unprepared they are—until it's too late.
        </p>
        
        {/* CTAs */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/features">View All Features</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/scenarios">Solutions</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentProtectSection;
