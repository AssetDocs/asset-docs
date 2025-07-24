import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  category?: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

const DocumentationChecklist: React.FC = () => {
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

  const homeownersChecklist: ChecklistSection[] = [
    {
      title: "Property Overview Documentation",
      items: [
        { id: "h1", text: "Property deed and ownership documents" },
        { id: "h2", text: "Property survey and boundary maps" },
        { id: "h3", text: "Recent property appraisal or assessment" },
        { id: "h4", text: "Homeowner's insurance policy and declarations page" },
        { id: "h5", text: "Property tax records" }
      ]
    },
    {
      title: "Structural Documentation",
      items: [
        { id: "h6", text: "Complete exterior photos (all sides, roof, foundation)" },
        { id: "h7", text: "Interior photos of each room (multiple angles)" },
        { id: "h8", text: "Floor plans or architectural drawings" },
        { id: "h9", text: "Recent inspection reports (home, pest, radon)" },
        { id: "h10", text: "HVAC system documentation and maintenance records" }
      ]
    },
    {
      title: "Systems & Utilities",
      items: [
        { id: "h11", text: "Electrical panel and major electrical work documentation" },
        { id: "h12", text: "Plumbing system overview and recent repairs" },
        { id: "h13", text: "Water heater specifications and maintenance" },
        { id: "h14", text: "Septic system or sewer connection documentation" },
        { id: "h15", text: "Well water system documentation (if applicable)" }
      ]
    },
    {
      title: "High-Value Items Inventory",
      items: [
        { id: "h16", text: "Electronics and appliances with serial numbers" },
        { id: "h17", text: "Jewelry and valuable collections" },
        { id: "h18", text: "Artwork and antiques with appraisals" },
        { id: "h19", text: "Tools and equipment in garage/workshop" },
        { id: "h20", text: "Outdoor equipment and recreational items" }
      ]
    }
  ];

  const businessChecklist: ChecklistSection[] = [
    {
      title: "Business Property Documentation",
      items: [
        { id: "b1", text: "Commercial property lease or ownership documents" },
        { id: "b2", text: "Business license and operational permits" },
        { id: "b3", text: "Commercial insurance policies (property, liability, business interruption)" },
        { id: "b4", text: "Property management agreements (if applicable)" },
        { id: "b5", text: "Zoning compliance documentation" }
      ]
    },
    {
      title: "Equipment & Inventory",
      items: [
        { id: "b6", text: "Complete equipment inventory with serial numbers" },
        { id: "b7", text: "Machinery and specialized equipment documentation" },
        { id: "b8", text: "IT infrastructure and technology assets" },
        { id: "b9", text: "Office furniture and fixtures inventory" },
        { id: "b10", text: "Vehicle fleet documentation (if applicable)" }
      ]
    },
    {
      title: "Operational Documentation",
      items: [
        { id: "b11", text: "Security system installation and monitoring records" },
        { id: "b12", text: "Emergency procedures and evacuation plans" },
        { id: "b13", text: "Maintenance contracts and service agreements" },
        { id: "b14", text: "Utility accounts and consumption records" },
        { id: "b15", text: "Waste management and disposal documentation" }
      ]
    },
    {
      title: "Financial & Legal Records",
      items: [
        { id: "b16", text: "Business financial statements and tax returns" },
        { id: "b17", text: "Accounts receivable and payable records" },
        { id: "b18", text: "Employee records and payroll documentation" },
        { id: "b19", text: "Vendor and supplier agreements" },
        { id: "b20", text: "Intellectual property documentation" }
      ]
    }
  ];

  const managementChecklist: ChecklistSection[] = [
    {
      title: "Portfolio Overview",
      items: [
        { id: "m1", text: "Complete property portfolio inventory" },
        { id: "m2", text: "Individual property deeds and titles" },
        { id: "m3", text: "Master insurance policies for all properties" },
        { id: "m4", text: "Property management agreements and contracts" },
        { id: "m5", text: "Local regulations and compliance requirements" }
      ]
    },
    {
      title: "Tenant & Lease Documentation",
      items: [
        { id: "m6", text: "Current lease agreements for all units" },
        { id: "m7", text: "Tenant screening and application records" },
        { id: "m8", text: "Security deposit documentation" },
        { id: "m9", text: "Rent payment history and arrears records" },
        { id: "m10", text: "Tenant correspondence and communication logs" }
      ]
    },
    {
      title: "Maintenance & Operations",
      items: [
        { id: "m11", text: "Property condition assessments and inspection reports" },
        { id: "m12", text: "Maintenance request logs and resolution records" },
        { id: "m13", text: "Vendor and contractor agreements" },
        { id: "m14", text: "Utility account management and billing" },
        { id: "m15", text: "Emergency contact lists and procedures" }
      ]
    },
    {
      title: "Financial Management",
      items: [
        { id: "m16", text: "Monthly and annual financial statements" },
        { id: "m17", text: "Operating expense tracking and budgets" },
        { id: "m18", text: "Capital improvement plans and records" },
        { id: "m19", text: "Tax documentation and depreciation schedules" },
        { id: "m20", text: "Reserve fund documentation and planning" }
      ]
    }
  ];

  const industrialChecklist: ChecklistSection[] = [
    {
      title: "Facility Documentation",
      items: [
        { id: "i1", text: "Industrial property ownership or lease documentation" },
        { id: "i2", text: "Environmental compliance certificates and permits" },
        { id: "i3", text: "Safety and health compliance documentation (OSHA)" },
        { id: "i4", text: "Specialized industrial insurance policies" },
        { id: "i5", text: "Facility engineering drawings and schematics" }
      ]
    },
    {
      title: "Equipment & Machinery",
      items: [
        { id: "i6", text: "Complete machinery inventory with specifications" },
        { id: "i7", text: "Equipment maintenance schedules and history" },
        { id: "i8", text: "Calibration records and certifications" },
        { id: "i9", text: "Spare parts inventory and supplier information" },
        { id: "i10", text: "Equipment warranties and service contracts" }
      ]
    },
    {
      title: "Safety & Compliance",
      items: [
        { id: "i11", text: "Material Safety Data Sheets (MSDS) for all chemicals" },
        { id: "i12", text: "Emergency response plans and procedures" },
        { id: "i13", text: "Fire suppression and safety system documentation" },
        { id: "i14", text: "Personal protective equipment inventory" },
        { id: "i15", text: "Incident reports and safety training records" }
      ]
    },
    {
      title: "Operational Records",
      items: [
        { id: "i16", text: "Production records and quality control documentation" },
        { id: "i17", text: "Inventory management and tracking systems" },
        { id: "i18", text: "Supply chain and vendor documentation" },
        { id: "i19", text: "Transportation and logistics records" },
        { id: "i20", text: "Research and development documentation" }
      ]
    }
  ];

  const ChecklistComponent: React.FC<{
    title: string;
    checklist: ChecklistSection[];
  }> = ({ title, checklist }) => {
    const totalItems = checklist.reduce((sum, section) => sum + section.items.length, 0);
    const completedItems = checklist.reduce(
      (sum, section) => sum + section.items.filter(item => checkedItems.has(item.id)).length,
      0
    );
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="space-y-2">
            <Progress value={completionPercentage} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-gray-600">
              {completedItems} of {totalItems} items completed ({Math.round(completionPercentage)}%)
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {checklist.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={item.id}
                        checked={checkedItems.has(item.id)}
                        onCheckedChange={() => toggleChecked(item.id)}
                      />
                      <label
                        htmlFor={item.id}
                        className={`text-sm cursor-pointer flex-1 ${
                          checkedItems.has(item.id) 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-700'
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
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Complete Documentation Checklist
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Comprehensive checklists tailored to your property type to ensure complete documentation coverage
        </p>
      </div>

      <Tabs defaultValue="homeowners" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="homeowners">Homeowners</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="industrial">Industrial</TabsTrigger>
        </TabsList>

        <TabsContent value="homeowners">
          <ChecklistComponent
            title="Homeowners Documentation Checklist"
            checklist={homeownersChecklist}
          />
        </TabsContent>

        <TabsContent value="business">
          <ChecklistComponent
            title="Business Property Documentation Checklist"
            checklist={businessChecklist}
          />
        </TabsContent>

        <TabsContent value="management">
          <ChecklistComponent
            title="Property Management Documentation Checklist"
            checklist={managementChecklist}
          />
        </TabsContent>

        <TabsContent value="industrial">
          <ChecklistComponent
            title="Industrial Property Documentation Checklist"
            checklist={industrialChecklist}
          />
        </TabsContent>
      </Tabs>

      <div className="text-center pt-8">
        <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Professional Assistance?
          </h3>
          <p className="text-blue-700 mb-4">
            Our experts can help you complete your documentation efficiently and ensure nothing is missed.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Consultation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationChecklist;