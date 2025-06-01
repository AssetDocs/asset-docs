import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Shield, Lock, FileImage, BarChart, Clock, Home, Building, Briefcase, Scale, Truck, Users } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Comprehensive Asset Documentation Features</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Discover all the powerful tools and services that AssetDocs offers to protect your property and possessions.
          </p>
        </div>
      </section>
      
      {/* Features Tabs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="documentation" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="security">Security & Privacy</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>
            
            {/* Documentation Tab */}
            <TabsContent value="documentation" className="animate-fade-in">
              {/* Unlimited Properties Notice */}
              <div className="bg-brand-green text-white p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold mb-2">📍 No Limits on Properties</h3>
                <p className="text-lg">
                  Document unlimited properties and businesses with AssetDocs. Whether you own a single home, multiple rental properties, vacation homes, or various business locations - there are no restrictions on how many properties you can document and manage through our platform.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Camera className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">High Resolution Photos</h3>
                  </div>
                  <p className="text-gray-600">
                    Capture detailed images of your property and possessions with our mobile app. Our system automatically organizes and tags your photos for easy retrieval.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <BarChart className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Detailed Reports</h3>
                  </div>
                  <p className="text-gray-600">
                    Generate comprehensive reports of your property and possessions, including valuations, condition assessments, and detailed inventories. Perfect for insurance claims, estate planning, and property sales.
                  </p>
                </div>
              </div>

              {/* Client Portal Notice */}
              <div className="bg-gray-100 p-6 rounded-lg mt-8">
                <h3 className="text-xl font-semibold mb-2 text-brand-blue">📱 Online Client Portal</h3>
                <p className="text-lg text-gray-700">
                  All documentation, links, reports, and files are securely accessible through your personalized online portal. Access your complete property documentation anytime, anywhere, with full privacy controls and sharing capabilities.
                </p>
              </div>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Lock className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Enterprise-Grade Security</h3>
                  </div>
                  <p className="text-gray-600">
                    Your data is protected with enterprise-grade encryption both in transit and at rest. Our multi-layer security approach ensures your documentation remains private and secure.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Clock className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Privacy Controls</h3>
                  </div>
                  <p className="text-gray-600">
                    Control who can access your documentation with granular permission settings. Share specific documents with insurers, estate planners, or family members while maintaining overall privacy.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Lock className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Secure Cloud Backup</h3>
                  </div>
                  <p className="text-gray-600">
                    Your documentation is automatically backed up to secure cloud storage, ensuring that your valuable information is always available even in the event of a disaster or device loss.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Usage Tab */}
            <TabsContent value="usage" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Home className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Residential Properties</h3>
                  </div>
                  <p className="text-gray-600">
                    Comprehensive documentation services for homeowners, covering primary residences, vacation homes, and rental properties. Perfect for insurance, estate planning, and home sales.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Building className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Commercial Properties</h3>
                  </div>
                  <p className="text-gray-600">
                    Specialized documentation services for commercial buildings, retail spaces, and office properties. Includes detailed asset tracking, condition reports, and valuation services.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Scale className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Estate Planning</h3>
                  </div>
                  <p className="text-gray-600">
                    Specialized services for estate planning, helping to document and value assets for probate, inheritance planning, and ensuring clear division of property among beneficiaries.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Truck className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Moving</h3>
                  </div>
                  <p className="text-gray-600">
                    Having complete asset documentation before your next move provides crucial protection against damage during transit. With detailed photos, valuations, and condition reports of all your belongings, you can quickly identify and claim compensation for any items damaged by moving companies, ensuring you're fully protected throughout the relocation process.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Users className="h-8 w-8 text-brand-blue mr-3" />
                    <h3 className="text-xl font-semibold">Separation</h3>
                  </div>
                  <p className="text-gray-600">
                    Comprehensive asset documentation provides crucial evidence for court decisions during divorce proceedings. Having detailed records, photos, and valuations of all marital property helps ensure fair asset division, reduces disputes, and provides the court with objective evidence needed to make informed decisions about property distribution.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Additional Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Additional Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Mobile Access</h3>
              <p className="text-gray-600">
                Access your complete documentation library from anywhere using our mobile app, available for iOS and Android devices.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Document Sharing</h3>
              <p className="text-gray-600">
                Securely share specific documentation with insurance companies, attorneys, or family members with controlled access and permissions.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-brand-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Experience the AssetDocs Difference</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of property owners who trust AssetDocs to protect their valuable assets and provide peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/signup" className="bg-white text-brand-green hover:bg-gray-100 px-6 py-3 rounded-md font-medium">
              Start Your Free Trial
            </a>
            <a href="/pricing" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium">
              View Pricing
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Features;
