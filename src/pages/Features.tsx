import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Shield, Lock, FileImage, BarChart, Clock, Home, Building, Briefcase, Scale, Truck, Users, TrendingUp, Heart, Handshake, MapPin, Smartphone, Cloud, Share2, FileText, DollarSign, UserCheck, Globe, Calculator, ClipboardList, ShieldCheck, Timer, Archive, Download, GraduationCap, Car, Plane, Anchor, Factory, Stethoscope, HardHat, Church, Palette, Hammer, Trash2 } from 'lucide-react';

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
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="h-8 w-8 text-brand-blue" />
                    <Trash2 className="h-8 w-8 text-brand-blue" />
                  </div>
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
              <p className="text-gray-600 text-sm">Upload high quality images straight from your mobile device with automatic organization and tagging.</p>
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
      
      {/* Industries We Serve - New Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">Industries We Serve</h2>
          <p className="text-center text-lg text-gray-600 max-w-4xl mx-auto mb-12">
            Asset Docs provides specialized documentation solutions across diverse industries, helping protect valuable assets and streamline operations for professionals and organizations worldwide.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Educational Institutions */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <GraduationCap className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Educational Institutions</h3>
              <p className="text-gray-700 mb-4">
                Schools, universities, and training centers protect valuable educational assets, laboratory equipment, and technology infrastructure.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Computer labs and technology inventory</li>
                <li>• Scientific equipment and instruments</li>
                <li>• Library assets and rare collections</li>
                <li>• Campus facility documentation</li>
              </ul>
            </div>

            {/* Automotive Industry */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Car className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Automotive Industry</h3>
              <p className="text-gray-700 mb-4">
                Dealerships, repair shops, and fleet managers document vehicles, parts inventory, and specialized equipment for insurance and operational efficiency.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vehicle inventory and condition reports</li>
                <li>• Specialized automotive tools and equipment</li>
                <li>• Parts inventory management</li>
                <li>• Fleet asset tracking and documentation</li>
              </ul>
            </div>

            {/* Aviation & Transportation */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Plane className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Aviation & Transportation</h3>
              <p className="text-gray-700 mb-4">
                Airlines, airports, and transportation companies maintain detailed records of aircraft, ground equipment, and safety-critical assets.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Aircraft and component documentation</li>
                <li>• Ground support equipment tracking</li>
                <li>• Maintenance facility assets</li>
                <li>• Regulatory compliance documentation</li>
              </ul>
            </div>

            {/* Marine & Maritime */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Anchor className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Marine & Maritime</h3>
              <p className="text-gray-700 mb-4">
                Marinas, boat dealers, and shipping companies document vessels, marine equipment, and port facilities for insurance and regulatory purposes.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vessel condition and equipment documentation</li>
                <li>• Marina and dock facility records</li>
                <li>• Marine equipment and safety gear</li>
                <li>• Charter and rental fleet management</li>
              </ul>
            </div>

            {/* Manufacturing */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Factory className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Manufacturing</h3>
              <p className="text-gray-700 mb-4">
                Manufacturing facilities document production equipment, raw materials, and finished goods for operational efficiency and insurance coverage.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Production machinery and equipment</li>
                <li>• Raw materials and inventory tracking</li>
                <li>• Quality control equipment</li>
                <li>• Facility infrastructure documentation</li>
              </ul>
            </div>

            {/* Healthcare */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Stethoscope className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Healthcare</h3>
              <p className="text-gray-700 mb-4">
                Hospitals, clinics, and medical practices protect expensive medical equipment and maintain compliance with healthcare regulations.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Medical equipment and devices</li>
                <li>• Pharmaceutical inventory</li>
                <li>• Facility and infrastructure assets</li>
                <li>• Compliance and audit documentation</li>
              </ul>
            </div>

            {/* Construction */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <HardHat className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Construction</h3>
              <p className="text-gray-700 mb-4">
                Construction companies document heavy equipment, tools, and materials across multiple job sites for theft protection and project management.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Heavy machinery and equipment</li>
                <li>• Tools and material inventory</li>
                <li>• Job site progress documentation</li>
                <li>• Equipment maintenance records</li>
              </ul>
            </div>

            {/* Religious Organizations */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Church className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Religious Organizations</h3>
              <p className="text-gray-700 mb-4">
                Churches, temples, and religious institutions protect sacred artifacts, musical instruments, and facility assets for preservation and insurance.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sacred artifacts and religious items</li>
                <li>• Musical instruments and sound equipment</li>
                <li>• Facility and building documentation</li>
                <li>• Historical preservation records</li>
              </ul>
            </div>

            {/* Arts & Entertainment */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Palette className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Arts & Entertainment</h3>
              <p className="text-gray-700 mb-4">
                Museums, galleries, theaters, and entertainment venues document valuable collections, equipment, and performance assets.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Art collections and exhibitions</li>
                <li>• Performance equipment and instruments</li>
                <li>• Audio/visual technology</li>
                <li>• Venue and facility documentation</li>
              </ul>
            </div>

            {/* Skilled Trades */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Hammer className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Skilled Trades</h3>
              <p className="text-gray-700 mb-4">
                Electricians, plumbers, HVAC technicians, and other tradespeople protect expensive tools and equipment from theft and damage.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Specialized tools and equipment</li>
                <li>• Vehicle and trailer inventory</li>
                <li>• Material and supply documentation</li>
                <li>• Job site equipment tracking</li>
              </ul>
            </div>

            {/* Government & Public Sector */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Building className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Government & Public Sector</h3>
              <p className="text-gray-700 mb-4">
                Government agencies, municipalities, and public organizations maintain accountability and transparency through comprehensive asset documentation.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Public facility and infrastructure</li>
                <li>• Vehicle fleet management</li>
                <li>• Equipment and technology assets</li>
                <li>• Compliance and audit requirements</li>
              </ul>
            </div>

            {/* Non-Profit Organizations */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <Heart className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Non-Profit Organizations</h3>
              <p className="text-gray-700 mb-4">
                Charities, foundations, and community organizations document donated assets and operational equipment for donor transparency and grant compliance.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Donated equipment and supplies</li>
                <li>• Facility and program assets</li>
                <li>• Grant compliance documentation</li>
                <li>• Volunteer and community resources</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-semibold text-brand-blue mb-4">Why Choose Asset Docs?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <Shield className="h-12 w-12 text-brand-blue mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Comprehensive Protection</h4>
                <p className="text-sm text-gray-600">Complete documentation for insurance claims, legal proceedings, and regulatory compliance.</p>
              </div>
              <div className="text-center">
                <Timer className="h-12 w-12 text-brand-blue mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Time & Cost Savings</h4>
                <p className="text-sm text-gray-600">Streamlined documentation process reduces administrative burden and operational costs.</p>
              </div>
              <div className="text-center">
                <UserCheck className="h-12 w-12 text-brand-blue mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Professional Standards</h4>
                <p className="text-sm text-gray-600">Industry-specific documentation that meets professional and regulatory requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Scenarios Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">Scenarios</h2>
          <p className="text-center text-lg text-gray-600 max-w-4xl mx-auto mb-12">
            Asset Docs is invaluable in these situations where comprehensive documentation protects your interests and streamlines the claims process.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Natural Disasters */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl mb-4">🔥</div>
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Natural Disasters</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🌪️ Weather & Storm-Related</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tornadoes</li>
                    <li>• Hurricanes</li>
                    <li>• Hailstorms</li>
                    <li>• Thunderstorms / Windstorms</li>
                    <li>• Blizzards</li>
                    <li>• Ice Storms / Freezing Rain</li>
                    <li>• Lightning Strikes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🌊 Water-Related</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Flooding (from heavy rain, river overflow, storm surge)</li>
                    <li>• Tsunamis</li>
                    <li>• Snowmelt Runoff / Ice Dams</li>
                    <li>• Sewer Backup (covered by endorsements)</li>
                    <li>• Burst Pipes due to Freeze</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🌋 Geological</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Earthquakes</li>
                    <li>• Landslides / Mudslides</li>
                    <li>• Sinkholes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🔥 Fire-Related</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Wildfires</li>
                    <li>• Lightning-induced fires</li>
                    <li>• Smoke Damage (from nearby fires)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Man-Made Events */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl mb-4">🏚️</div>
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Man-Made Events / Other Insurable Incidents</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🚗 Property & Liability-Related</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• House fires (non-natural cause)</li>
                    <li>• Theft or burglary</li>
                    <li>• Vandalism</li>
                    <li>• Riots / Civil commotion</li>
                    <li>• Explosion (e.g., gas leaks)</li>
                    <li>• Power surge (e.g., electrical damage)</li>
                    <li>• Vehicle crashing into property</li>
                    <li>• Falling objects (e.g., trees, construction debris)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🏢 Business-Specific</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Business interruption (due to disaster)</li>
                    <li>• Cyberattacks (for cyber liability insurance)</li>
                    <li>• Equipment breakdown</li>
                    <li>• Loss of income due to forced closure</li>
                    <li>• Supply chain disruption</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Special Insurance Scenarios */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl mb-4">🌀</div>
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Special Insurance Scenarios</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Loss during evacuation (ALE - Additional Living Expenses)</li>
                <li>• Mold damage (if caused by a covered peril)</li>
                <li>• Loss of use or habitability</li>
                <li>• Damage from construction defects (builder's risk insurance)</li>
                <li>• HVAC or appliance failure (covered by warranties or service plans)</li>
              </ul>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-brand-blue mb-2">Why Documentation Matters</h4>
                <p className="text-sm text-gray-700">
                  In any of these scenarios, having comprehensive pre-incident documentation through Asset Docs can:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Expedite insurance claims processing</li>
                  <li>• Ensure accurate settlement amounts</li>
                  <li>• Provide proof of ownership and condition</li>
                  <li>• Support legal proceedings if necessary</li>
                  <li>• Facilitate emergency planning and recovery</li>
                </ul>
              </div>
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
