import React, { useState } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const ComparisonSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-border">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full p-6 flex items-center justify-between text-left bg-brand-green hover:bg-brand-green/90 transition-colors"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Why Asset Safe Works Better
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  Compare our comprehensive platform to traditional methods
                </p>
              </div>
              <ChevronDown className={cn("h-6 w-6 text-white transition-transform flex-shrink-0 ml-4", isOpen && "rotate-180")} />
            </button>

            <div className={cn("transition-all", isOpen ? "block" : "hidden")}>
              <div className="px-6 pt-6 pb-6">
                <p className="text-muted-foreground mb-6">
                  Asset Safe combines property documentation, estate planning, and insurance support in one comprehensive platform—unlike traditional home inventory apps or paper-based systems.
                </p>

                <div className="bg-secondary/5 rounded-lg overflow-hidden border border-border">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 md:gap-x-8 p-4 md:p-6 bg-primary/5 border-b border-border">
                    <div></div>
                    <div className="text-center min-w-[80px] md:min-w-[120px]">
                      <div className="inline-block bg-primary text-primary-foreground px-2 md:px-4 py-1 md:py-2 rounded-lg font-semibold text-xs md:text-base whitespace-nowrap">
                        Asset Safe
                      </div>
                    </div>
                    <div className="text-center min-w-[80px] md:min-w-[120px]">
                      <div className="inline-block bg-muted text-muted-foreground px-2 md:px-4 py-1 md:py-2 rounded-lg font-semibold text-xs md:text-base whitespace-nowrap">
                        Traditional
                      </div>
                    </div>
                  </div>

                  {comparisons.map((item, index) => (
                    <div 
                      key={index} 
                      className={`grid grid-cols-[1fr_auto_auto] gap-x-4 md:gap-x-8 p-4 md:p-6 ${index !== comparisons.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div className="flex items-center">
                        <span className="text-foreground font-medium text-sm md:text-base">{item.feature}</span>
                      </div>
                      <div className="flex items-center justify-center min-w-[80px] md:min-w-[120px]">
                        {item.assetSafe ? (
                          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100">
                            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100">
                            <X className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center min-w-[80px] md:min-w-[120px]">
                        {item.traditional ? (
                          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100">
                            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100">
                            <X className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
