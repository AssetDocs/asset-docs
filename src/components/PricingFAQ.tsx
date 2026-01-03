
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FAQAccordion from '@/components/FAQAccordion';

const PricingFAQ: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-6 bg-white rounded-lg shadow-sm border border-border hover:bg-muted/30 transition-colors"
          >
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            {isExpanded ? (
              <ChevronUp className="h-6 w-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-6 w-6 text-muted-foreground" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border border-border">
              <FAQAccordion />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
