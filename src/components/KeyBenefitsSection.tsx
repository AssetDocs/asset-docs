import React from 'react';
import { Shield, Scale, Users, Lock, Cloud, CheckCircle } from 'lucide-react';

const SecurityBadges: React.FC = () => (
  <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-200">
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
  const benefits = [
    {
      icon: Shield,
      title: "Secure, encrypted photo, video, and document storage",
      description: "Document your home and belongings with time-stamped, tamper-resistant records — securely stored and accessible when you need them most.",
      showSecurityBadges: true
    },
    {
      icon: Scale,
      title: "Independent third-party verification for claims and estate matters",
      description: "Provide credible, unbiased documentation trusted by insurers, adjusters, and legal professionals when it matters most.",
      showSecurityBadges: false
    },
    {
      icon: Users,
      title: "Permission-based access for trusted parties",
      description: "Grant secure access to the right people — insurers, executors, or heirs — without handing over passwords or digging through files during stressful moments.",
      showSecurityBadges: false
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="flex gap-5 items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-brand-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
                {benefit.showSecurityBadges && <SecurityBadges />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyBenefitsSection;
