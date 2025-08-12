
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Scan, Search, Receipt } from 'lucide-react';

const AIValuationSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title">AI-Powered Asset Identification & Valuation</h2>
        <p className="text-center text-lg text-gray-600 mb-8 italic">(Optional feature)</p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-gray-800">Smart Recognition</h4>
            <p className="text-gray-600">
              AI automatically identifies and catalogs items in your photos with detailed descriptions and specifications.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-gray-800">Accurate Valuation</h4>
            <p className="text-gray-600">
              Each item receives estimated market values based on current pricing data for insurance and planning.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-gray-800">Receipt Integration</h4>
            <p className="text-gray-600">
              Link purchase receipts to items automatically, creating comprehensive ownership and value records.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-lightBlue text-white">
            <Link to="/features">Learn How It Works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AIValuationSection;
