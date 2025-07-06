
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Camera, Receipt, Shield, Phone, AlertCircle } from 'lucide-react';

const Claims: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Insurance Claims Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Essential documents needed when filing property and contents insurance claims
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 text-sm">
                <strong>Disclaimer:</strong> This information is provided for reference purposes only. 
                Requirements may vary by insurer and policy. Please contact your insurance provider 
                for specific documentation requirements for your claim.
              </p>
            </div>
          </div>

          {/* Required Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Proof of Loss Statement */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-brand-blue mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Proof of Loss Statement</h3>
              </div>
              <p className="text-gray-600 mb-3">A formal document detailing your claim:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Date and cause of loss</li>
                <li>• Description of damaged items</li>
                <li>• Estimated replacement costs</li>
                <li>• Policy number and contact info</li>
                <li>• Emergency repairs made</li>
              </ul>
            </div>

            {/* Photos and Videos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Camera className="h-8 w-8 text-brand-blue mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Photos & Videos</h3>
              </div>
              <p className="text-gray-600 mb-3">Visual documentation of damage:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Before and after photos</li>
                <li>• Damaged property and rooms</li>
                <li>• Close-up shots of specific items</li>
                <li>• Videos showing extent of damage</li>
              </ul>
            </div>

            {/* Item Inventory */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-brand-blue mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Item Inventory</h3>
              </div>
              <p className="text-gray-600 mb-3">Detailed list of damaged/lost items:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Item descriptions and conditions</li>
                <li>• Make, model, serial numbers</li>
                <li>• Purchase dates and prices</li>
                <li>• Current estimated values</li>
              </ul>
            </div>

            {/* Proof of Ownership */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Receipt className="h-8 w-8 text-brand-blue mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Proof of Ownership</h3>
              </div>
              <p className="text-gray-600 mb-3">Documentation proving item ownership:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Original purchase receipts</li>
                <li>• Credit card statements</li>
                <li>• Warranties and user manuals</li>
                <li>• Appraisals for valuable items</li>
              </ul>
            </div>

            {/* Repair Estimates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-brand-blue mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Repair Estimates</h3>
              </div>
              <p className="text-gray-600 mb-3">Professional assessments and quotes:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Contractor repair quotes</li>
                <li>• Emergency service receipts</li>
                <li>• Replacement cost estimates</li>
                <li>• Professional inspection reports</li>
              </ul>
            </div>

            {/* Official Reports */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-brand-blue mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Official Reports</h3>
              </div>
              <p className="text-gray-600 mb-3">Required for certain types of claims:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Police reports (theft, vandalism)</li>
                <li>• Fire department reports</li>
                <li>• Weather service reports</li>
                <li>• Municipal incident reports</li>
              </ul>
            </div>
          </div>

          {/* Additional Requirements */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Policy Information</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Insurance policy or declaration page</li>
                  <li>• Coverage limits and exclusions</li>
                  <li>• Deductible information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Communication Records</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Emails with insurer or adjusters</li>
                  <li>• Call logs and correspondence</li>
                  <li>• Claim number references</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-brand-blue text-white rounded-lg p-8 text-center">
            <Phone className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Need Help with Your Claim?</h3>
            <p className="text-lg mb-6">
              Asset Docs helps you organize and maintain all the documentation you need for insurance claims.
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                For specific claim requirements, contact your insurance provider directly.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Claims;
