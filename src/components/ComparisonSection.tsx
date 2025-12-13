import React from 'react';
import { Check, X } from 'lucide-react';

const ComparisonSection: React.FC = () => {
  const comparisons = [
    {
      feature: "Comprehensive property documentation",
      assetSafe: true,
      traditional: false
    },
    {
      feature: "Legacy Locker for estate information",
      assetSafe: true,
      traditional: false
    },
    {
      feature: "Post-damage documentation tools",
      assetSafe: true,
      traditional: false
    },
    {
      feature: "Secure password catalog",
      assetSafe: true,
      traditional: false
    },
    {
      feature: "Voice notes for sentimental items",
      assetSafe: true,
      traditional: false
    },
    {
      feature: "Unlimited photo/video uploads",
      assetSafe: true,
      traditional: false
    },
    {
      feature: "Designed for insurance claims",
      assetSafe: true,
      traditional: false
    },
    {
      feature: "Multi-property support",
      assetSafe: true,
      traditional: false
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Asset Safe?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Asset Safe combines property documentation, estate planning, and insurance support in one comprehensive platform—unlike traditional home inventory apps or paper-based systems.
            </p>
          </div>

          <div className="bg-secondary/5 rounded-lg overflow-hidden border border-border">
            <div className="grid grid-cols-3 gap-4 p-6 bg-primary/5 border-b border-border">
              <div className="col-span-1"></div>
              <div className="text-center">
                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold">
                  Asset Safe
                </div>
              </div>
              <div className="text-center">
                <div className="inline-block bg-muted text-muted-foreground px-4 py-2 rounded-lg font-semibold">
                  Traditional Methods
                </div>
              </div>
            </div>

            {comparisons.map((item, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-3 gap-4 p-6 ${index !== comparisons.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="col-span-1 flex items-center">
                  <span className="text-foreground font-medium">{item.feature}</span>
                </div>
                <div className="flex items-center justify-center">
                  {item.assetSafe ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  {item.traditional ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Ready to experience the difference?
            </p>
            <a 
              href="/signup" 
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Activate Your Account
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;