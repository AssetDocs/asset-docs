import React from 'react';
import { Shield, Lock, Cloud, CheckCircle } from 'lucide-react';

const SecurityBadges: React.FC = () => (
  <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <Shield className="w-3.5 h-3.5 text-brand-blue" />
      <span>256-bit AES Encryption</span>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <Lock className="w-3.5 h-3.5 text-brand-blue" />
      <span>SOC 2 Compliant</span>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <Cloud className="w-3.5 h-3.5 text-brand-blue" />
      <span>AWS Cloud Storage</span>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <CheckCircle className="w-3.5 h-3.5 text-brand-blue" />
      <span>GDPR Ready</span>
    </div>
  </div>
);

const KeyBenefitsSection: React.FC = () => {
  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-2">
          Built for: Homeowners • Renters • Families • Property owners • Small businesses
        </p>
        <SecurityBadges />
      </div>
    </section>
  );
};

export default KeyBenefitsSection;
