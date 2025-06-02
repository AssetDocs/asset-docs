
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Shield, Lock, FileImage, BarChart, Clock, Home, Building, Briefcase, Scale, Truck, Users, TrendingUp, Heart, Handshake, MapPin, Smartphone, Cloud, Share2, FileText, DollarSign, UserCheck, Globe, Calculator, ClipboardList, ShieldCheck, Timer, Archive, Download } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Complete Asset Documentation Solution</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Comprehensive protection and documentation services for homeowners, renters, business owners, landlords, and more.
          </p>
        </div>
      </section>
      
      {/* User Groups Tabs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="homeowners" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="homeowners">Homeowners</TabsTrigger>
              <TabsTrigger value="renters">Renters</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="landlords">Landlords</TabsTrigger>
            </TabsList>
            
            {/* Homeowners Tab */}
            <TabsContent value="homeowners" className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">For Homeowners</h2>
                <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto">
                  Protect your most valuable investment with comprehensive property documentation.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <Camera className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Property Documentation</h3>
                  <p className="text-gray-600">Complete visual inventory of your home, improvements, and possessions for insurance and resale value.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <TrendingUp className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Value Authentication</h3>
                  <p className="text-gray-600">Document home improvements and upgrades to maximize property value when selling.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Heart className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Estate Planning</h3>
                  <p className="text-gray-600">Detailed asset records for inheritance planning and family legacy protection.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Handshake className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Divorce Protection</h3>
                  <p className="text-gray-600">Comprehensive asset documentation for fair property division during separation.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Truck className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Moving Protection</h3>
                  <p className="text-gray-600">Pre-move documentation to protect against damage claims during relocation.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Shield className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Insurance Claims</h3>
                  <p className="text-gray-600">Streamlined claims process with pre-documented proof of ownership and condition.</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Renters Tab */}
            <TabsContent value="renters" className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">For Renters</h2>
                <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto">
                  Protect your personal belongings and security deposits with professional documentation.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <FileText className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Move-In Documentation</h3>
                  <p className="text-gray-600">Document property condition at move-in to protect your security deposit.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Archive className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Personal Property Inventory</h3>
                  <p className="text-gray-600">Complete inventory of belongings for renter's insurance claims and moving protection.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <DollarSign className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Deposit Recovery</h3>
                  <p className="text-gray-600">Photo evidence to dispute unfair deposit deductions and property damage claims.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <UserCheck className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Tenant Rights Protection</h3>
                  <p className="text-gray-600">Document maintenance issues and landlord responsibilities for legal protection.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Truck className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Moving Documentation</h3>
                  <p className="text-gray-600">Pre-move inventory to claim damages from moving companies or landlords.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Shield className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Insurance Support</h3>
                  <p className="text-gray-600">Detailed records for renter's insurance claims and coverage verification.</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Business Tab */}
            <TabsContent value="business" className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">For Business Owners</h2>
                <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto">
                  Comprehensive asset management and documentation for business continuity and growth.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <Building className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Commercial Property Documentation</h3>
                  <p className="text-gray-600">Complete documentation of commercial spaces, equipment, and infrastructure.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Calculator className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Asset Valuation</h3>
                  <p className="text-gray-600">Professional asset valuation for insurance, loans, and business sales.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <ClipboardList className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
                  <p className="text-gray-600">Comprehensive inventory tracking for equipment, supplies, and assets.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <ShieldCheck className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Compliance Documentation</h3>
                  <p className="text-gray-600">Maintain records for regulatory compliance and audit requirements.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <DollarSign className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Business Financing</h3>
                  <p className="text-gray-600">Asset documentation for loan applications and investment opportunities.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Timer className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Disaster Recovery</h3>
                  <p className="text-gray-600">Essential documentation for business continuity and insurance claims.</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Landlords Tab */}
            <TabsContent value="landlords" className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">For Landlords & Property Managers</h2>
                <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto">
                  Professional property management and tenant protection through comprehensive documentation.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <Home className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Multi-Property Management</h3>
                  <p className="text-gray-600">Document unlimited rental properties with centralized management portal.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <FileText className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Tenant Move-In/Out</h3>
                  <p className="text-gray-600">Professional documentation to protect deposits and resolve disputes.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Scale className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Legal Protection</h3>
                  <p className="text-gray-600">Court-ready documentation for evictions and tenant disputes.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <TrendingUp className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Property Value Tracking</h3>
                  <p className="text-gray-600">Document improvements and maintenance to maximize rental income and property value.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Shield className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Insurance Claims</h3>
                  <p className="text-gray-600">Streamlined claims process for property damage and liability issues.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <Users className="h-8 w-8 text-brand-blue mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Tenant Communication</h3>
                  <p className="text-gray-600">Share property documentation and maintenance records with tenants securely.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Core Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-blue mb-12">Core Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <Camera className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-lg font-semibold mb-2">High-Resolution Photography</h3>
              <p className="text-gray-600 text-sm">Professional quality images with automatic organization and tagging.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <Smartphone className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-lg font-semibold mb-2">Mobile App Access</h3>
              <p className="text-gray-600 text-sm">iOS and Android apps for on-the-go documentation and access.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <Cloud className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-lg font-semibold mb-2">Secure Cloud Storage</h3>
              <p className="text-gray-600 text-sm">Enterprise-grade security with automatic backups and redundancy.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <Share2 className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-lg font-semibold mb-2">Controlled Sharing</h3>
              <p className="text-gray-600 text-sm">Share specific documents with insurance, legal, or family members.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <BarChart className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-lg font-semibold mb-2">Detailed Reports</h3>
              <p className="text-gray-600 text-sm">Comprehensive reports for insurance, legal, and financial purposes.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <MapPin className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-lg font-semibold mb-2">Unlimited Properties</h3>
              <p className="text-gray-600 text-sm">Document unlimited residential and commercial properties.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <Globe className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-lg font-semibold mb-2">Online Client Portal</h3>
              <p className="text-gray-600 text-sm">24/7 access to all documentation through secure web portal.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <Download className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-lg font-semibold mb-2">Export & Download</h3>
              <p className="text-gray-600 text-sm">Download reports and documentation in multiple formats.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Industry Applications */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-blue mb-12">Industry Applications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <Scale className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-xl font-semibold mb-2">Legal & Estate Planning</h3>
              <p className="text-gray-600">Asset documentation for probate, inheritance, divorce proceedings, and legal disputes.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <Shield className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-xl font-semibold mb-2">Insurance Industry</h3>
              <p className="text-gray-600">Pre-loss documentation for faster claims processing and accurate settlements.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <Home className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-xl font-semibold mb-2">Real Estate</h3>
              <p className="text-gray-600">Property condition reports, improvement documentation, and value authentication.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <Truck className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-xl font-semibold mb-2">Moving & Storage</h3>
              <p className="text-gray-600">Pre-move documentation to protect against damage and loss during relocation.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <Building className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-xl font-semibold mb-2">Property Management</h3>
              <p className="text-gray-600">Comprehensive documentation for rental properties and tenant management.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <DollarSign className="h-8 w-8 text-brand-blue mb-3" />
              <h3 className="text-xl font-semibold mb-2">Financial Services</h3>
              <p className="text-gray-600">Asset verification for loans, mortgages, and investment opportunities.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-brand-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Protect What Matters Most</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of property owners, renters, and business professionals who trust Asset Docs for comprehensive asset protection.
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
