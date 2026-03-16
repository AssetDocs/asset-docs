import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Lock, Image, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import SecurityBadges from './SecurityBadges';
import { cn } from '@/lib/utils';

const moreItems = [
  'Guided documentation checklists',
  'Room-by-room inventory tools',
  'Insurance & claim-ready exports',
  'Emergency instructions',
  'Password & digital access catalog',
  'Family archive (memories, notes, history)',
  'Property profiles (homes, rentals, vacation properties)',
  'Secure sharing with authorized users',
  'Post-damage documentation tools',
];

const DocumentProtectSection: React.FC = () => {
  const [securityOpen, setSecurityOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  
  const steps = [
    { number: 1, title: 'Capture', description: 'Photos, videos, and details that document what you own.' },
    { number: 2, title: 'Secure', description: 'Store everything safely with encryption and private access.' },
    { number: 3, title: 'Prove', description: 'Access verified records whenever insurance, legal, or estate needs arise.' },
  ];

  const features = [
    {
      icon: <Image className="w-5 h-5" />,
      title: 'Photo, video, and document storage',
      description: 'Time-stamped, tamper-resistant records for your home and belongings.',
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Secure Vault - Legacy Locker & Digital Access',
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
        <p className="text-center text-base md:text-lg text-muted-foreground mb-4">Perfect for homeowners, families, landlords, and small business owners.</p>
        <h2 className="section-title mb-10">Most people don't realize how unprepared they are—until it's too late.</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Left: 3-Step Process in Single Box */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-foreground mb-6">How It Works</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Security & Privacy expandable */}
            <div
            className="mt-auto -mx-6 -mb-6 px-6 pb-6 pt-4 border-t border-border rounded-b-lg"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(42,157,143,0.18))' }}
            >
              <button
                onClick={() => setSecurityOpen(!securityOpen)}
                className="flex w-full items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>🔒 Security & Privacy</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", securityOpen && "rotate-180")} />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  securityOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                )}
              >
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Built for: Homeowners • Renters • Families • Property owners • Small businesses
                </p>
                <SecurityBadges variant="compact" />
              </div>
            </div>
          </div>
          
          {/* Right: Features in Single Box */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-foreground mb-6">What You Get</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Expandable more items */}
            <div
              className="mt-auto -mx-6 -mb-6 px-6 pb-6 pt-4 border-t border-border rounded-b-lg"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(42,157,143,0.18))' }}
            >
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="flex w-full items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>More ways Asset Safe supports your life</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", moreOpen && "rotate-180")} />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  moreOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                )}
              >
                <ul className="space-y-1.5">
                  {moreItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 text-muted-foreground/50">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 text-center">
          <p className="text-primary text-lg md:text-xl font-medium mx-auto max-w-md text-center md:whitespace-nowrap md:max-w-none">
            Not just storage — a guided path to being fully prepared.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DocumentProtectSection;
