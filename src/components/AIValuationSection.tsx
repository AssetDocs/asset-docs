
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Scan, Search } from 'lucide-react';

const AIValuationSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title">AI-Powered Asset Identification & Valuation</h2>
        <p className="text-center text-lg text-gray-600 mb-8 italic">(Optional feature)</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-semibold mb-4 text-brand-blue">Intelligent Asset Recognition</h3>
            <p className="text-lg mb-6 text-gray-700">
              Our advanced AI technology automatically identifies items in your uploaded images, 
              cataloging them with detailed descriptions and specifications without any manual input required.
            </p>
            
            <h3 className="text-2xl font-semibold mb-4 text-brand-blue">Accurate Value Estimation</h3>
            <p className="text-lg mb-6 text-gray-700">
              Each identified item receives an estimated market value based on current pricing data, 
              helping you maintain an up-to-date inventory for insurance and financial planning.
            </p>
            
            <h3 className="text-2xl font-semibold mb-4 text-brand-blue">Receipt Integration</h3>
            <p className="text-lg mb-6 text-gray-700">
              Link purchase receipts to your documented items automatically. Our system matches 
              receipts with corresponding items, creating a comprehensive record of ownership and value.
            </p>
            
            <div className="mt-8">
              <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-lightBlue text-white">
                <Link to="/features">Learn How It Works</Link>
              </Button>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 bg-gray-50 p-8 rounded-xl shadow-lg">
            <div className="relative">
              <div className="bg-white p-5 rounded-lg shadow-md mb-6">
                <div className="flex items-center mb-3">
                  <Scan className="w-8 h-8 text-brand-blue mr-3" />
                  <h4 className="text-xl font-semibold">AI Scanning Process</h4>
                </div>
                <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                  <li>Upload photos of your possessions</li>
                  <li>Our AI identifies each individual item</li>
                  <li>Items are matched against pricing databases</li>
                  <li>Estimated values are assigned to each item</li>
                  <li>Upload receipts for precise value recording</li>
                </ol>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <Search className="w-8 h-8 text-brand-blue mr-3" />
                  <h4 className="text-xl font-semibold">Smart Cataloging</h4>
                </div>
                <p className="text-gray-700 mb-4">
                  Items are automatically categorized for easy searching and reporting:
                </p>
                <ul className="grid grid-cols-2 gap-2 text-gray-700">
                  <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Electronics</li>
                  <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Furniture</li>
                  <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Appliances</li>
                  <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Artwork</li>
                  <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Jewelry</li>
                  <li className="flex items-center"><span className="bg-brand-blue w-2 h-2 rounded-full mr-2"></span> Collectibles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIValuationSection;
