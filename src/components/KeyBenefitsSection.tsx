import React from 'react';
import { Shield, Scale, Users } from 'lucide-react';

const KeyBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Secure, encrypted photo, video, and document storage",
      description: "Document your home and belongings with time-stamped, tamper-resistant records — securely stored and accessible when you need them most."
    },
    {
      icon: Scale,
      title: "Independent third-party verification for claims and estate matters",
      description: "Provide credible, unbiased documentation trusted by insurers, adjusters, and legal professionals when it matters most."
    },
    {
      icon: Users,
      title: "Permission-based access for trusted parties",
      description: "Grant secure access to the right people — insurers, executors, or heirs — without handing over passwords or digging through files during stressful moments."
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyBenefitsSection;
