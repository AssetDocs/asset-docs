
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Camera, FileText, AlertTriangle, Play, CheckCircle, Home, Building, Factory, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChecklistItem {
  id: string;
  text: string;
  category?: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

const EducationalResources: React.FC = () => {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleChecked = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const resources = [
    {
      icon: Camera,
      title: "Photography Best Practices",
      description: "Learn how to capture high-quality photos that maximize AI valuation accuracy.",
      type: "Guide",
      duration: "2 min read"
    },
    {
      icon: FileText,
      title: "Documentation Checklist",
      description: "Complete interactive checklist for documenting your property and possessions effectively.",
      type: "Interactive Guide",
      duration: "15 min read"
    },
    {
      icon: AlertTriangle,
      title: "Insurance Claim Preparation",
      description: "Step-by-step guide to preparing documentation for insurance claims.",
      type: "Video",
      duration: "12 min watch"
    },
    {
      icon: BookOpen,
      title: "Asset Valuation Explained",
      description: "Understanding how our AI determines values and what factors matter most.",
      type: "Article",
      duration: "8 min read"
    }
  ];

  const homeownersChecklist: ChecklistSection[] = [
    {
      title: "Essential Documentation",
      items: [
        { id: "h1", text: "Property deed and ownership documents" },
        { id: "h2", text: "Homeowner's insurance policy and declarations page" },
        { id: "h3", text: "Property tax assessments and records" },
        { id: "h4", text: "Home inspection reports" },
        { id: "h5", text: "Warranty documents for major systems (HVAC, roofing, etc.)" }
      ]
    },
    {
      title: "Interior Documentation",
      items: [
        { id: "h6", text: "Photos of each room from multiple angles" },
        { id: "h7", text: "Close-up photos of valuable items and appliances" },
        { id: "h8", text: "Serial numbers and model information for electronics" },
        { id: "h9", text: "Receipts for furniture, electronics, and appliances" },
        { id: "h10", text: "Jewelry and valuable collection appraisals" },
        { id: "h11", text: "Artwork, antiques, and collectibles documentation" }
      ]
    },
    {
      title: "Property Features",
      items: [
        { id: "h12", text: "Exterior photos of home from all sides" },
        { id: "h13", text: "Landscaping and outdoor features documentation" },
        { id: "h14", text: "Pool, deck, and patio documentation" },
        { id: "h15", text: "Garage and storage area inventory" },
        { id: "h16", text: "Fence, gate, and security system documentation" }
      ]
    },
    {
      title: "Maintenance Records",
      items: [
        { id: "h17", text: "HVAC service and maintenance records" },
        { id: "h18", text: "Plumbing and electrical work documentation" },
        { id: "h19", text: "Roofing repairs and replacements" },
        { id: "h20", text: "Floor refinishing and carpet replacement records" },
        { id: "h21", text: "Major appliance service records" }
      ]
    }
  ];

  const businessChecklist: ChecklistSection[] = [
    {
      title: "Business Property Documentation",
      items: [
        { id: "b1", text: "Commercial property lease or deed" },
        { id: "b2", text: "Business insurance policies (property, liability, business interruption)" },
        { id: "b3", text: "Business license and permits" },
        { id: "b4", text: "Building permits and certificates of occupancy" },
        { id: "b5", text: "Fire safety and security system documentation" }
      ]
    },
    {
      title: "Equipment & Technology",
      items: [
        { id: "b6", text: "Complete inventory of business equipment" },
        { id: "b7", text: "Computer systems, servers, and IT infrastructure" },
        { id: "b8", text: "Manufacturing or specialized equipment documentation" },
        { id: "b9", text: "Vehicle fleet documentation and registrations" },
        { id: "b10", text: "Tools and machinery serial numbers and values" },
        { id: "b11", text: "Software licenses and subscriptions" }
      ]
    },
    {
      title: "Inventory & Assets",
      items: [
        { id: "b12", text: "Product inventory with current values" },
        { id: "b13", text: "Raw materials and supplies documentation" },
        { id: "b14", text: "Finished goods inventory records" },
        { id: "b15", text: "Office furniture and fixtures" },
        { id: "b16", text: "Signage and marketing materials" }
      ]
    },
    {
      title: "Financial Records",
      items: [
        { id: "b17", text: "Business financial statements" },
        { id: "b18", text: "Equipment purchase receipts and invoices" },
        { id: "b19", text: "Lease agreements for equipment" },
        { id: "b20", text: "Maintenance and service contracts" },
        { id: "b21", text: "Business interruption loss projections" }
      ]
    }
  ];

  const managementChecklist: ChecklistSection[] = [
    {
      title: "Property Portfolio Management",
      items: [
        { id: "m1", text: "Master property list with addresses and legal descriptions" },
        { id: "m2", text: "Insurance policies for all managed properties" },
        { id: "m3", text: "Property management agreements and contracts" },
        { id: "m4", text: "Tenant lease agreements and contact information" },
        { id: "m5", text: "Emergency contact procedures and protocols" }
      ]
    },
    {
      title: "Individual Property Documentation",
      items: [
        { id: "m6", text: "Detailed photos of each unit and common areas" },
        { id: "m7", text: "Move-in/move-out inspection reports" },
        { id: "m8", text: "Maintenance request logs and completion records" },
        { id: "m9", text: "Capital improvement documentation" },
        { id: "m10", text: "Utility and service provider information" }
      ]
    },
    {
      title: "Compliance & Legal",
      items: [
        { id: "m11", text: "Building code compliance certificates" },
        { id: "m12", text: "Safety inspection reports" },
        { id: "m13", text: "Environmental compliance documentation" },
        { id: "m14", text: "ADA compliance records" },
        { id: "m15", text: "Local permit and licensing documentation" }
      ]
    },
    {
      title: "Financial Management",
      items: [
        { id: "m16", text: "Rent roll and income statements" },
        { id: "m17", text: "Operating expense records" },
        { id: "m18", text: "Security deposit tracking" },
        { id: "m19", text: "Insurance claim history" },
        { id: "m20", text: "Property tax assessments and payments" }
      ]
    }
  ];

  const industrialChecklist: ChecklistSection[] = [
    {
      title: "Facility Documentation",
      items: [
        { id: "i1", text: "Industrial property deeds and zoning permits" },
        { id: "i2", text: "Environmental compliance certificates" },
        { id: "i3", text: "Safety and OSHA compliance documentation" },
        { id: "i4", text: "Fire suppression and emergency systems" },
        { id: "i5", text: "Utility infrastructure and capacity documentation" }
      ]
    },
    {
      title: "Manufacturing Equipment",
      items: [
        { id: "i6", text: "Complete machinery and equipment inventory" },
        { id: "i7", text: "Equipment specifications, manuals, and warranties" },
        { id: "i8", text: "Maintenance schedules and service records" },
        { id: "i9", text: "Safety equipment and protective systems" },
        { id: "i10", text: "Quality control and testing equipment" }
      ]
    },
    {
      title: "Infrastructure Systems",
      items: [
        { id: "i11", text: "Electrical systems and power distribution" },
        { id: "i12", text: "HVAC and climate control systems" },
        { id: "i13", text: "Water, steam, and compressed air systems" },
        { id: "i14", text: "Waste management and treatment systems" },
        { id: "i15", text: "Security and access control systems" }
      ]
    },
    {
      title: "Regulatory & Insurance",
      items: [
        { id: "i16", text: "Industrial insurance policies and coverage limits" },
        { id: "i17", text: "Environmental liability coverage" },
        { id: "i18", text: "Workers' compensation documentation" },
        { id: "i19", text: "Regulatory permits and licenses" },
        { id: "i20", text: "Emergency response and contingency plans" }
      ]
    }
  ];

  const ChecklistComponent = ({ checklist, title }: { checklist: ChecklistSection[], title: string }) => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-brand-blue mb-2">{title}</h3>
        <p className="text-gray-600">
          Complete this comprehensive checklist to ensure thorough documentation of your assets.
        </p>
      </div>
      
      {checklist.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="border-l-4 border-l-brand-blue">
          <CardHeader>
            <CardTitle className="text-lg text-brand-blue">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={item.id}
                    checked={checkedItems.has(item.id)}
                    onCheckedChange={() => toggleChecked(item.id)}
                    className="data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
                  />
                  <label
                    htmlFor={item.id}
                    className={`text-sm leading-relaxed cursor-pointer ${
                      checkedItems.has(item.id) ? 'line-through text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    {item.text}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-700 font-medium">
              Progress: {checklist.reduce((acc, section) => acc + section.items.length, 0)} total items, {
                checklist.reduce((acc, section) => 
                  acc + section.items.filter(item => checkedItems.has(item.id)).length, 0
                )
              } completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-blue mb-4">
          Learn & Maximize Your Protection
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Get the most out of Asset Docs with our comprehensive guides and best practices. 
          Learn from insurance professionals and property documentation experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <resource.icon className="h-6 w-6 mr-3 text-brand-blue" />
                {resource.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="bg-brand-lightBlue/20 text-brand-blue px-2 py-1 rounded">
                  {resource.type}
                </span>
                <span>{resource.duration}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                {resource.description}
              </CardDescription>
              <Button 
                className="w-full bg-brand-orange hover:bg-brand-orange/90"
                onClick={() => {
                  if (resource.title === "Photography Best Practices") {
                    navigate('/photography-guide');
                  } else if (resource.title === "Asset Valuation Explained") {
                    navigate('/ai-valuation-guide');
                  } else if (resource.title === "Documentation Checklist") {
                    document.getElementById('documentation-checklist')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {resource.type === "Video" ? (
                  <Play className="h-4 w-4 mr-2" />
                ) : resource.type === "Interactive Guide" ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <BookOpen className="h-4 w-4 mr-2" />
                )}
                Access {resource.type}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div id="documentation-checklist" className="mt-12">
        <Card className="border-2 border-brand-blue">
          <CardHeader className="bg-brand-blue text-white">
            <CardTitle className="text-2xl flex items-center">
              <FileText className="h-7 w-7 mr-3" />
              Complete Documentation Checklist
            </CardTitle>
            <CardDescription className="text-blue-100">
              Select your property type below to access a customized documentation checklist
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="homeowners" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="homeowners" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Homeowners</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Business</span>
                </TabsTrigger>
                <TabsTrigger value="management" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Property Mgmt</span>
                </TabsTrigger>
                <TabsTrigger value="industrial" className="flex items-center space-x-2">
                  <Factory className="h-4 w-4" />
                  <span>Industrial</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="homeowners">
                <ChecklistComponent 
                  checklist={homeownersChecklist} 
                  title="Homeowner Documentation Checklist" 
                />
              </TabsContent>

              <TabsContent value="business">
                <ChecklistComponent 
                  checklist={businessChecklist} 
                  title="Business Owner Documentation Checklist" 
                />
              </TabsContent>

              <TabsContent value="management">
                <ChecklistComponent 
                  checklist={managementChecklist} 
                  title="Property Management Documentation Checklist" 
                />
              </TabsContent>

              <TabsContent value="industrial">
                <ChecklistComponent 
                  checklist={industrialChecklist} 
                  title="Industrial Facility Documentation Checklist" 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-orange-50 border-brand-orange">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-brand-orange mb-2">
              Need Personal Assistance?
            </h3>
            <p className="text-gray-700 mb-4">
              Schedule a free consultation with our property documentation specialists. 
              Get personalized advice for your specific situation.
            </p>
            <Button className="bg-brand-orange hover:bg-brand-orange/90">
              Schedule Free Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationalResources;
