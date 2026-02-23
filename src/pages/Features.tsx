import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Camera, Shield, Lock, FileImage, BarChart, Clock, Home, Building, Briefcase, Scale, Truck, Users, TrendingUp, Heart, Handshake, MapPin, Smartphone, Cloud, Share2, FileText, DollarSign, UserCheck, Globe, Calculator, ClipboardList, ShieldCheck, Timer, Archive, Download, GraduationCap, Car, Plane, Anchor, Factory, Stethoscope, HardHat, Church, Palette, Hammer, Trash2, Scan, Upload, CheckCircle, AlertTriangle, KeyRound, UserPlus, ChevronDown, Contact, Mic, BookOpen, ChefHat, CalendarDays, Package, StickyNote } from 'lucide-react';
import { breadcrumbSchema } from '@/utils/structuredData';

// Feature card component for reuse
const FeatureCard = ({ icon: Icon, title, description, customIcon }: { 
  icon?: React.ElementType; 
  title: string; 
  description: string;
  customIcon?: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow">
    {customIcon ? customIcon : Icon && <Icon className="h-8 w-8 text-brand-blue mb-3" />}
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Collapsible category component
const FeatureCategory = ({ title, children, defaultOpen = false }: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors">
        <h3 className="text-xl font-semibold text-brand-blue">{title}</h3>
        <ChevronDown className={`h-5 w-5 text-brand-blue transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const Features: React.FC = () => {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: 'https://www.getassetsafe.com/' },
    { name: 'Features', url: 'https://www.getassetsafe.com/features' }
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Features - Documentation & Protection | Asset Safe"
        description="Comprehensive property documentation features for homeowners, renters, businesses, and landlords. Digital inventory, insurance claims support, legacy planning, and secure cloud storage."
        keywords="property documentation features, digital home inventory, insurance claims support, legacy locker, asset tracking, home inventory software"
        canonicalUrl="https://www.getassetsafe.com/features"
        structuredData={breadcrumbs}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Complete Asset Documentation Solution</h1>
          <p className="text-xl max-w-3xl mx-auto mb-6">
            Comprehensive protection and documentation services for homeowners, renters, business owners, landlords, and more.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                View Pricing
              </Button>
            </Link>
          </div>
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
              
              {/* Property & Assets */}
              <FeatureCategory title="Property & Assets" defaultOpen={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard 
                    icon={Camera} 
                    title="Property Documentation" 
                    description="Complete visual inventory of your home, improvements, and possessions for insurance and resale value."
                    customIcon={
                      <div className="flex items-center gap-2 mb-3">
                        <Camera className="h-8 w-8 text-brand-blue" />
                        <Trash2 className="h-8 w-8 text-brand-blue" />
                      </div>
                    }
                  />
                  <FeatureCard icon={TrendingUp} title="Asset Valuation" description="Document home improvements and upgrades to maximize property value when selling." />
                  <FeatureCard icon={Archive} title="Assets" description="Comprehensive asset tracking with photos, receipts, and valuations for complete property and personal inventory management." />
                  <FeatureCard icon={FileText} title="Export Assets" description="Export your complete asset inventory to CSV, PDF, or other formats for insurance, legal, or personal use." />
                  <FeatureCard icon={Download} title="Download All Files" description="Bulk download all your photos, videos, documents, and files for backup or external storage purposes." />
                </div>
              </FeatureCategory>

              {/* Life Support */}
              <FeatureCategory title="Life Support">
                <div className="space-y-8">
                  {/* Family Archive */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Family Archive</h4>
                    <p className="text-sm text-gray-500 mb-4">Everyday life, organized and protected.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FeatureCard icon={Contact} title="VIP Contacts" description="Your most important contacts with priority levels." />
                      <FeatureCard icon={Mic} title="Voice Notes" description="Record and store voice memos for your records." />
                      <FeatureCard icon={Briefcase} title="Trusted Professionals" description="Track your trusted service providers and contractors." />
                      <FeatureCard icon={BookOpen} title="Notes & Traditions" description="Capture family traditions, stories, and important notes." />
                      <FeatureCard icon={ChefHat} title="Family Recipes" description="Preserve cherished family recipes for generations." />
                      <FeatureCard icon={Archive} title="Memory Safe" description="A protected place for the memories you want to keep — and pass on." />
                    </div>
                  </div>

                  {/* Insights & Tools */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Insights & Tools</h4>
                    <p className="text-sm text-gray-500 mb-4">Manage repairs and organize property details.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FeatureCard icon={CalendarDays} title="Smart Calendar" description="Reminders, records, and timelines — all in one place." />
                      <FeatureCard icon={Package} title="Manual Entry Items" description="Add items manually with descriptions and values." />
                      <FeatureCard icon={Hammer} title="Upgrades & Repairs" description="Document property improvements and repair history." />
                      <FeatureCard icon={Globe} title="Source Websites" description="Save product sources and reference links." />
                      <FeatureCard icon={Palette} title="Paint Codes" description="Store paint colors, brands, and finish details." />
                      <FeatureCard icon={StickyNote} title="Quick Notes" description="Jot down quick reminders or thoughts." />
                    </div>
                  </div>
                </div>
              </FeatureCategory>

              {/* Protection & Insurance */}
              <FeatureCategory title="Protection & Insurance">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Shield} title="Insurance Claims" description="Streamlined claims process with pre-documented proof of ownership and condition." />
                  <FeatureCard icon={AlertTriangle} title="Post Damage Documentation" description="Comprehensive damage recording with photos, videos, and detailed reports for insurance claims." />
                  <FeatureCard icon={Truck} title="Moving Protection" description="Pre-move documentation to protect against damage claims during relocation." />
                </div>
              </FeatureCategory>

              {/* Life Events */}
              <FeatureCategory title="Life Events">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Heart} title="Estate Planning" description="Detailed asset records for inheritance planning and family legacy protection." />
                  <FeatureCard icon={Handshake} title="Divorce Protection" description="Comprehensive asset documentation for fair property division during separation." />
                </div>
              </FeatureCategory>

              {/* Security & Access */}
              <FeatureCategory title="Security & Access">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={KeyRound} title="Password and Accounts Catalog" description="Securely store website passwords and financial account information in one encrypted location. Never forget credentials again with end-to-end encryption protecting your sensitive data." />
                  <FeatureCard icon={UserPlus} title="Authorized Users" description="Invite others to collaborate on your property documentation. Assign specific permission levels—Administrator, Contributor, or Viewer access." />
                  <FeatureCard 
                    title="Voice Notes" 
                    description="Add voice recordings to capture sentimental value, historical significance, and important details that photos can't convey."
                    customIcon={<span className="h-8 w-8 bg-brand-blue text-white rounded-lg flex items-center justify-center text-sm font-bold mb-3">♪</span>}
                  />
                </div>
              </FeatureCategory>

              {/* Legacy Locker */}
              <FeatureCategory title="Legacy Locker">
                <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-brand-blue">
                  <div className="flex items-start gap-4">
                    <Shield className="h-10 w-10 text-brand-blue flex-shrink-0" />
                    <div className="flex-1">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">What It Is</h4>
                          <p className="text-gray-600">A secure, encrypted vault inside Asset Safe where you can store the most important details your loved ones will need—photos, videos, account access, personal notes, and instructions that clarify your wishes. It's a modern way to organize the information that often gets lost, forgotten, or overlooked.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">What It's Not</h4>
                          <p className="text-gray-600">Legacy Locker is not a legally recognized will or electronic will. It does not replace formal estate-planning documents, notarized paperwork, or attorney guidance. Instead, it serves as a companion resource that supports and enhances them.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Why It Matters for Homeowners</h4>
                          <p className="text-gray-600">Legacy Locker gives peace of mind by ensuring your family or trusted contacts can easily access essential information about your home, your assets, and your digital life. It reduces confusion, speeds up decisions during emergencies or transitions, and preserves the story behind your belongings.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FeatureCategory>
            </TabsContent>
            
            {/* Renters Tab */}
            <TabsContent value="renters" className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">For Renters</h2>
                <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto">
                  Protect your personal belongings and security deposits with professional documentation.
                </p>
              </div>
              
              {/* Rental Documentation */}
              <FeatureCategory title="Rental Documentation">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={FileText} title="Move-In Documentation" description="Document property condition at move-in to protect your security deposit." />
                  <FeatureCard icon={DollarSign} title="Deposit Recovery" description="Photo evidence to dispute unfair deposit deductions and property damage claims." />
                  <FeatureCard icon={UserCheck} title="Tenant Rights Protection" description="Document maintenance issues and landlord responsibilities for legal protection." />
                  <FeatureCard icon={Truck} title="Moving Documentation" description="Pre-move inventory to claim damages from moving companies or landlords." />
                </div>
              </FeatureCategory>

              {/* Personal Property */}
              <FeatureCategory title="Personal Property">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Archive} title="Personal Property Inventory" description="Complete inventory of belongings for renter's insurance claims and moving protection." />
                  <FeatureCard icon={Archive} title="Assets" description="Document your personal belongings and valuable items with comprehensive asset tracking for rental insurance and protection." />
                  <FeatureCard icon={FileText} title="Export Assets" description="Export your personal property inventory for insurance claims, legal documentation, or moving purposes." />
                  <FeatureCard icon={Download} title="Download All Files" description="Download all your documentation and files for personal backup or sharing with landlords, insurance, or legal representatives." />
                </div>
              </FeatureCategory>

              {/* Protection & Insurance */}
              <FeatureCategory title="Protection & Insurance">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Shield} title="Insurance Support" description="Detailed records for renter's insurance claims and coverage verification." />
                  <FeatureCard icon={AlertTriangle} title="Post Damage Documentation" description="Document rental property damage with detailed reports to protect your security deposit and personal property." />
                </div>
              </FeatureCategory>

              {/* Security & Access */}
              <FeatureCategory title="Security & Access">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={KeyRound} title="Password and Accounts Catalog" description="Securely store website passwords and financial account information in one encrypted location. Never forget credentials again with end-to-end encryption protecting your sensitive data." />
                  <FeatureCard icon={UserPlus} title="Authorized Users" description="Invite others to collaborate on your property documentation. Assign specific permission levels—Administrator, Contributor, or Viewer access." />
                  <FeatureCard 
                    title="Voice Notes" 
                    description="Record important details about personal belongings, their history, and emotional significance for comprehensive documentation."
                    customIcon={<span className="h-8 w-8 bg-brand-blue text-white rounded-lg flex items-center justify-center text-sm font-bold mb-3">♪</span>}
                  />
                </div>
              </FeatureCategory>
            </TabsContent>
            
            {/* Business Tab */}
            <TabsContent value="business" className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">For Business Owners</h2>
                <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto">
                  Comprehensive asset management and documentation for business continuity and growth.
                </p>
              </div>
              
              {/* Business Assets */}
              <FeatureCategory title="Business Assets">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Building} title="Commercial Property Documentation" description="Complete documentation of commercial spaces, equipment, and infrastructure." />
                  <FeatureCard icon={Calculator} title="Value Authentication" description="Document business improvements and upgrades to maximize property value when selling or raising capital." />
                  <FeatureCard icon={ClipboardList} title="Inventory Documentation" description="Comprehensive inventory documentation for equipment, supplies, and assets." />
                  <FeatureCard icon={Archive} title="Assets" description="Complete business asset management including equipment, inventory, and infrastructure tracking for financing, compliance, and insurance purposes." />
                </div>
              </FeatureCategory>

              {/* Compliance & Financing */}
              <FeatureCategory title="Compliance & Financing">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={ShieldCheck} title="Compliance Documentation" description="Maintain records for regulatory compliance and audit requirements." />
                  <FeatureCard icon={DollarSign} title="Business Financing" description="Asset documentation for loan applications and investment opportunities." />
                  <FeatureCard icon={FileText} title="Export Assets" description="Export business asset inventories for accounting, insurance, loan applications, and regulatory compliance reporting." />
                  <FeatureCard icon={Download} title="Download All Files" description="Bulk download all business documentation for backup, compliance audits, or sharing with stakeholders and partners." />
                </div>
              </FeatureCategory>

              {/* Protection & Recovery */}
              <FeatureCategory title="Protection & Recovery">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Timer} title="Disaster Recovery" description="Essential documentation for business continuity and insurance claims." />
                  <FeatureCard icon={AlertTriangle} title="Post Damage Documentation" description="Professional damage documentation with comprehensive reports for business insurance and continuity planning." />
                </div>
              </FeatureCategory>

              {/* Security & Access */}
              <FeatureCategory title="Security & Access">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={KeyRound} title="Password and Accounts Catalog" description="Securely store website passwords and financial account information in one encrypted location. Never forget credentials again with end-to-end encryption protecting your sensitive data." />
                  <FeatureCard icon={UserPlus} title="Authorized Users" description="Invite others to collaborate on your property documentation. Assign specific permission levels—Administrator, Contributor, or Viewer access." />
                  <FeatureCard 
                    title="Voice Notes" 
                    description="Capture business asset history, operational details, and critical information that supplements visual documentation."
                    customIcon={<span className="h-8 w-8 bg-brand-blue text-white rounded-lg flex items-center justify-center text-sm font-bold mb-3">♪</span>}
                  />
                </div>
              </FeatureCategory>
            </TabsContent>
            
            {/* Landlords Tab */}
            <TabsContent value="landlords" className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center text-brand-blue mb-4">For Landlords & Property Managers</h2>
                <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto">
                  Professional property management and tenant protection through comprehensive documentation.
                </p>
              </div>
              
              {/* Property Management */}
              <FeatureCategory title="Property Management">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Home} title="Multi-Property Management" description="Document unlimited rental properties with centralized management portal." />
                  <FeatureCard icon={FileText} title="Tenant Move-In/Out" description="Professional documentation to protect deposits and resolve disputes." />
                  <FeatureCard icon={TrendingUp} title="Property Value Tracking" description="Document improvements and maintenance to maximize rental income and property value." />
                  <FeatureCard icon={Users} title="Tenant Communication" description="Share property documentation and maintenance records with tenants securely." />
                </div>
              </FeatureCategory>

              {/* Legal & Protection */}
              <FeatureCategory title="Legal & Protection">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Scale} title="Legal Protection" description="Court-ready documentation for evictions and tenant disputes." />
                  <FeatureCard icon={Shield} title="Insurance Claims" description="Streamlined claims process for property damage and liability issues." />
                  <FeatureCard icon={AlertTriangle} title="Post Damage Documentation" description="Detailed damage tracking and reporting for property management, insurance claims, and tenant relations." />
                </div>
              </FeatureCategory>

              {/* Assets & Records */}
              <FeatureCategory title="Assets & Records">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={Archive} title="Assets" description="Multi-property asset management with comprehensive tracking of appliances, fixtures, and tenant belongings for effective property management." />
                  <FeatureCard icon={FileText} title="Export Assets" description="Export property asset inventories for insurance, tax documentation, property sales, and tenant move-in/out reports." />
                  <FeatureCard icon={Download} title="Download All Files" description="Download complete property documentation for backup, legal proceedings, or sharing with tenants and property management teams." />
                </div>
              </FeatureCategory>

              {/* Security & Access */}
              <FeatureCategory title="Security & Access">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard icon={KeyRound} title="Password and Accounts Catalog" description="Securely store website passwords and financial account information in one encrypted location. Never forget credentials again with end-to-end encryption protecting your sensitive data." />
                  <FeatureCard icon={UserPlus} title="Authorized Users" description="Invite others to collaborate on your property documentation. Assign specific permission levels—Administrator, Contributor, or Viewer access." />
                  <FeatureCard 
                    title="Voice Notes" 
                    description="Record property maintenance history, tenant interactions, and important property details for comprehensive records."
                    customIcon={<span className="h-8 w-8 bg-brand-blue text-white rounded-lg flex items-center justify-center text-sm font-bold mb-3">♪</span>}
                  />
                </div>
              </FeatureCategory>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Core Features Section */}
      <FeatureCategory title="Core Platform Features">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <Camera className="h-8 w-8 text-brand-blue mb-3" />
                <h3 className="text-lg font-semibold mb-2">High-Resolution Photography</h3>
                <p className="text-gray-600 text-sm">Upload high-quality images directly from your mobile device.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <Smartphone className="h-8 w-8 text-brand-blue mb-3" />
                <h3 className="text-lg font-semibold mb-2">Mobile-Optimized Platform</h3>
                <p className="text-gray-600 text-sm">Responsive web platform optimized for mobile devices and on-the-go documentation.</p>
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
                <h3 className="text-lg font-semibold mb-2">Property Options</h3>
                <p className="text-gray-600 text-sm">We offer 3 property profiles on our homeowner plan and unlimited property profiles on our professional plan.</p>
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
      </FeatureCategory>
      
      {/* Industry Applications */}
      <FeatureCategory title="Industry Applications">
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
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
      </FeatureCategory>
      
      {/* Industries We Serve */}
      <FeatureCategory title="Industries We Serve">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <p className="text-center text-lg text-gray-600 max-w-4xl mx-auto mb-8">
              Asset Safe provides specialized documentation solutions across diverse industries, helping protect valuable assets and streamline operations for professionals and organizations worldwide.
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
                  <li>• Library collections and archives</li>
                  <li>• Sports equipment and facilities</li>
                </ul>
              </div>
              
              {/* Automotive */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <Car className="h-8 w-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-brand-blue">Automotive Industry</h3>
                <p className="text-gray-700 mb-4">
                  Dealerships, collectors, and enthusiasts document vehicles, parts inventory, and restoration projects.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Classic car collections and valuations</li>
                  <li>• Dealership inventory management</li>
                  <li>• Parts and accessories documentation</li>
                  <li>• Restoration progress tracking</li>
                </ul>
              </div>
              
              {/* Aviation & Marine */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <Plane className="h-8 w-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-brand-blue">Aviation & Marine</h3>
                <p className="text-gray-700 mb-4">
                  Aircraft and boat owners maintain comprehensive records for maintenance, insurance, and regulatory compliance.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Aircraft and vessel documentation</li>
                  <li>• Maintenance and service records</li>
                  <li>• Equipment and avionics inventory</li>
                  <li>• Regulatory compliance documentation</li>
                </ul>
              </div>
              
              {/* Manufacturing */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <Factory className="h-8 w-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-brand-blue">Manufacturing</h3>
                <p className="text-gray-700 mb-4">
                  Factories and production facilities document machinery, equipment, and production line assets.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Production equipment inventory</li>
                  <li>• Machinery maintenance records</li>
                  <li>• Safety equipment documentation</li>
                  <li>• Warehouse and storage tracking</li>
                </ul>
              </div>
              
              {/* Healthcare */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <Stethoscope className="h-8 w-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-brand-blue">Healthcare</h3>
                <p className="text-gray-700 mb-4">
                  Medical practices and facilities protect expensive diagnostic equipment and patient care assets.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Medical equipment documentation</li>
                  <li>• Diagnostic machinery inventory</li>
                  <li>• Office furnishings and fixtures</li>
                  <li>• Compliance and certification records</li>
                </ul>
              </div>
              
              {/* Construction */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <HardHat className="h-8 w-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-brand-blue">Construction</h3>
                <p className="text-gray-700 mb-4">
                  Contractors and builders document tools, vehicles, and equipment across multiple job sites.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Heavy equipment and machinery</li>
                  <li>• Tool inventory and tracking</li>
                  <li>• Vehicle fleet documentation</li>
                  <li>• Job site condition reports</li>
                </ul>
              </div>
              
              {/* Religious Organizations */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <Church className="h-8 w-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-brand-blue">Religious Organizations</h3>
                <p className="text-gray-700 mb-4">
                  Churches, temples, and religious institutions protect sacred items, historical artifacts, and community assets.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Religious artifacts and artwork</li>
                  <li>• Musical instruments and equipment</li>
                  <li>• Historical documents and archives</li>
                  <li>• Community hall furnishings</li>
                </ul>
              </div>
              
              {/* Art & Collectibles */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <Palette className="h-8 w-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-brand-blue">Art & Collectibles</h3>
                <p className="text-gray-700 mb-4">
                  Galleries, collectors, and artists document valuable artwork, collections, and creative assets.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Fine art and sculpture inventory</li>
                  <li>• Antique and collectible documentation</li>
                  <li>• Provenance and authentication records</li>
                  <li>• Exhibition and display tracking</li>
                </ul>
              </div>
              
              {/* Home Services */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <Hammer className="h-8 w-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-brand-blue">Home Services</h3>
                <p className="text-gray-700 mb-4">
                  Contractors, plumbers, electricians, and service professionals document work and protect equipment.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Service vehicle equipment</li>
                  <li>• Specialized tool inventory</li>
                  <li>• Before/after project documentation</li>
                  <li>• Client property protection</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </FeatureCategory>
      
      {/* CTA Section */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Protect Your Assets?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners, renters, and businesses who trust Asset Safe for their property documentation needs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/pricing">
              <Button size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Features;
