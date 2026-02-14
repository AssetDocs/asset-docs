import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ClipboardList, Home, Building2, Users, Factory } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  text: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

interface ChecklistData {
  roomView: ChecklistSection[];
  categoryView: ChecklistSection[];
}

// Individual check encouragement messages (shown in rotation)
const individualMessages = [
  "Saved securely",
  "Item documented",
  "Recorded successfully",
  "Progress saved",
  "Information secured",
  "Nice progress",
  "One step closer",
];

// Block completion messages
const blockCompletionMessages = [
  "This information is ready if you ever need it",
  "You're building a solid record",
];

// Track message index for rotation
let messageIndex = 0;

interface DocumentationChecklistProps {
  embedded?: boolean;
}

const DocumentationChecklist: React.FC<DocumentationChecklistProps> = ({ embedded = false }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [viewModes, setViewModes] = useState<Record<string, 'room' | 'category'>>({
    homeowners: 'room',
    business: 'room',
    management: 'room',
    industrial: 'room',
  });
  const { toast } = useToast();

  const toggleViewMode = (tab: string) => {
    setViewModes(prev => ({
      ...prev,
      [tab]: prev[tab] === 'room' ? 'category' : 'room',
    }));
  };

  // ==================== HOMEOWNER DATA ====================
  const homeownerData: ChecklistData = {
    roomView: [
      {
        title: "Exterior",
        items: [
          { id: "hr1", text: "Front, sides, rear of home" },
          { id: "hr2", text: "Roof" },
          { id: "hr3", text: "Foundation" },
          { id: "hr4", text: "Garage exterior" },
          { id: "hr5", text: "Driveway / walkways" },
          { id: "hr6", text: "Fence, sheds, outdoor structures" },
        ]
      },
      {
        title: "Living Areas",
        items: [
          { id: "hr7", text: "Living room" },
          { id: "hr8", text: "Dining room" },
          { id: "hr9", text: "Hallways / common spaces" },
        ]
      },
      {
        title: "Kitchen",
        items: [
          { id: "hr10", text: "Wide shots" },
          { id: "hr11", text: "Appliances (serial numbers)" },
          { id: "hr12", text: "Cabinets & counters" },
          { id: "hr13", text: "Plumbing under sink" },
        ]
      },
      {
        title: "Bedrooms",
        items: [
          { id: "hr14", text: "Bedroom 1" },
          { id: "hr15", text: "Bedroom 2+" },
          { id: "hr16", text: "Closets" },
        ]
      },
      {
        title: "Bathrooms",
        items: [
          { id: "hr17", text: "Fixtures" },
          { id: "hr18", text: "Vanities" },
          { id: "hr19", text: "Plumbing access" },
        ]
      },
      {
        title: "Utility Areas",
        items: [
          { id: "hr20", text: "Electrical panel" },
          { id: "hr21", text: "HVAC system" },
          { id: "hr22", text: "Water heater" },
          { id: "hr23", text: "Attic / crawlspace / basement" },
        ]
      },
      {
        title: "Garage / Workshop",
        items: [
          { id: "hr24", text: "Tools & equipment" },
          { id: "hr25", text: "Vehicles (if applicable)" },
          { id: "hr26", text: "Storage items" },
        ]
      },
    ],
    categoryView: [
      {
        title: "Property Overview",
        items: [
          { id: "hc1", text: "Deed & ownership docs" },
          { id: "hc2", text: "Survey & boundary maps" },
          { id: "hc3", text: "Appraisals / assessments" },
          { id: "hc4", text: "Tax records" },
        ]
      },
      {
        title: "Structural Documentation",
        items: [
          { id: "hc5", text: "Exterior photos" },
          { id: "hc6", text: "Interior room photos" },
          { id: "hc7", text: "Roof, foundation" },
          { id: "hc8", text: "Inspection reports" },
        ]
      },
      {
        title: "Systems & Utilities",
        items: [
          { id: "hc9", text: "Electrical" },
          { id: "hc10", text: "Plumbing" },
          { id: "hc11", text: "HVAC" },
          { id: "hc12", text: "Septic / sewer / well" },
        ]
      },
      {
        title: "High-Value Items",
        items: [
          { id: "hc13", text: "Electronics & appliances" },
          { id: "hc14", text: "Jewelry & collectibles" },
          { id: "hc15", text: "Artwork & antiques" },
          { id: "hc16", text: "Tools & equipment" },
        ]
      },
      {
        title: "Insurance",
        items: [
          { id: "hc17", text: "Policy & declarations" },
          { id: "hc18", text: "Claims history" },
          { id: "hc19", text: "Endorsements" },
        ]
      },
    ],
  };

  // ==================== BUSINESS DATA ====================
  const businessData: ChecklistData = {
    roomView: [
      {
        title: "Exterior",
        items: [
          { id: "br1", text: "Building exterior" },
          { id: "br2", text: "Parking areas" },
          { id: "br3", text: "Signage" },
        ]
      },
      {
        title: "Public Areas",
        items: [
          { id: "br4", text: "Lobby / reception" },
          { id: "br5", text: "Waiting areas" },
          { id: "br6", text: "Showroom / retail floor" },
        ]
      },
      {
        title: "Work Areas",
        items: [
          { id: "br7", text: "Offices" },
          { id: "br8", text: "Cubicles" },
          { id: "br9", text: "Conference rooms" },
        ]
      },
      {
        title: "Operational Areas",
        items: [
          { id: "br10", text: "Storage rooms" },
          { id: "br11", text: "Back offices" },
          { id: "br12", text: "Supply rooms" },
        ]
      },
      {
        title: "Equipment Areas",
        items: [
          { id: "br13", text: "Server rooms" },
          { id: "br14", text: "Machinery areas" },
          { id: "br15", text: "Specialized equipment spaces" },
        ]
      },
      {
        title: "Utility Areas",
        items: [
          { id: "br16", text: "Electrical" },
          { id: "br17", text: "HVAC" },
          { id: "br18", text: "Security systems" },
        ]
      },
    ],
    categoryView: [
      {
        title: "Business Property",
        items: [
          { id: "bc1", text: "Lease or ownership docs" },
          { id: "bc2", text: "Floor plans" },
          { id: "bc3", text: "Permits" },
        ]
      },
      {
        title: "Assets & Equipment",
        items: [
          { id: "bc4", text: "Furniture" },
          { id: "bc5", text: "Computers & electronics" },
          { id: "bc6", text: "Machinery & tools" },
        ]
      },
      {
        title: "IT & Systems",
        items: [
          { id: "bc7", text: "Servers" },
          { id: "bc8", text: "Network equipment" },
          { id: "bc9", text: "Security systems" },
        ]
      },
      {
        title: "Insurance & Compliance",
        items: [
          { id: "bc10", text: "Business insurance policies" },
          { id: "bc11", text: "Certificates" },
          { id: "bc12", text: "Claims history" },
        ]
      },
      {
        title: "Records & Contracts",
        items: [
          { id: "bc13", text: "Vendor contracts" },
          { id: "bc14", text: "Warranties" },
          { id: "bc15", text: "Licenses" },
        ]
      },
    ],
  };

  // ==================== MANAGEMENT DATA ====================
  const managementData: ChecklistData = {
    roomView: [
      {
        title: "Exterior (Property-Level)",
        items: [
          { id: "mr1", text: "Building exterior" },
          { id: "mr2", text: "Roof" },
          { id: "mr3", text: "Parking" },
          { id: "mr4", text: "Common outdoor areas" },
        ]
      },
      {
        title: "Common Areas",
        items: [
          { id: "mr5", text: "Hallways" },
          { id: "mr6", text: "Stairwells" },
          { id: "mr7", text: "Elevators" },
          { id: "mr8", text: "Laundry rooms" },
        ]
      },
      {
        title: "Unit Interior",
        items: [
          { id: "mr9", text: "Living areas" },
          { id: "mr10", text: "Kitchen" },
          { id: "mr11", text: "Bedrooms" },
          { id: "mr12", text: "Bathrooms" },
        ]
      },
      {
        title: "Unit Systems",
        items: [
          { id: "mr13", text: "Electrical panel" },
          { id: "mr14", text: "HVAC" },
          { id: "mr15", text: "Plumbing" },
        ]
      },
      {
        title: "Storage & Utility",
        items: [
          { id: "mr16", text: "Storage lockers" },
          { id: "mr17", text: "Mechanical rooms" },
        ]
      },
    ],
    categoryView: [
      {
        title: "Property & Units",
        items: [
          { id: "mc1", text: "Unit inventory" },
          { id: "mc2", text: "Floor plans" },
          { id: "mc3", text: "Square footage" },
        ]
      },
      {
        title: "Tenant Turnover",
        items: [
          { id: "mc4", text: "Move-in condition" },
          { id: "mc5", text: "Move-out condition" },
          { id: "mc6", text: "Damage documentation" },
        ]
      },
      {
        title: "Maintenance & Repairs",
        items: [
          { id: "mc7", text: "Work orders" },
          { id: "mc8", text: "Vendor invoices" },
          { id: "mc9", text: "Warranties" },
        ]
      },
      {
        title: "Systems & Infrastructure",
        items: [
          { id: "mc10", text: "Electrical" },
          { id: "mc11", text: "HVAC" },
          { id: "mc12", text: "Plumbing" },
          { id: "mc13", text: "Fire systems" },
        ]
      },
      {
        title: "Insurance & Risk",
        items: [
          { id: "mc14", text: "Property insurance" },
          { id: "mc15", text: "Claims & incidents" },
        ]
      },
    ],
  };

  // ==================== INDUSTRIAL DATA ====================
  const industrialData: ChecklistData = {
    roomView: [
      {
        title: "Exterior & Grounds",
        items: [
          { id: "ir1", text: "Building exterior" },
          { id: "ir2", text: "Loading docks" },
          { id: "ir3", text: "Yards & fencing" },
        ]
      },
      {
        title: "Production Areas",
        items: [
          { id: "ir4", text: "Manufacturing floor" },
          { id: "ir5", text: "Assembly lines" },
          { id: "ir6", text: "Processing zones" },
        ]
      },
      {
        title: "Storage Areas",
        items: [
          { id: "ir7", text: "Raw materials" },
          { id: "ir8", text: "Finished goods" },
          { id: "ir9", text: "Hazardous materials (if applicable)" },
        ]
      },
      {
        title: "Equipment Zones",
        items: [
          { id: "ir10", text: "Heavy machinery" },
          { id: "ir11", text: "Control panels" },
          { id: "ir12", text: "Robotics / automation" },
        ]
      },
      {
        title: "Utility & Safety Areas",
        items: [
          { id: "ir13", text: "Electrical rooms" },
          { id: "ir14", text: "Boiler rooms" },
          { id: "ir15", text: "Fire suppression systems" },
          { id: "ir16", text: "Emergency exits" },
        ]
      },
    ],
    categoryView: [
      {
        title: "Facilities",
        items: [
          { id: "ic1", text: "Building documentation" },
          { id: "ic2", text: "Floor plans" },
          { id: "ic3", text: "Permits" },
        ]
      },
      {
        title: "Machinery & Equipment",
        items: [
          { id: "ic4", text: "Asset lists" },
          { id: "ic5", text: "Serial numbers" },
          { id: "ic6", text: "Maintenance logs" },
        ]
      },
      {
        title: "Safety & Compliance",
        items: [
          { id: "ic7", text: "OSHA documentation" },
          { id: "ic8", text: "Safety inspections" },
          { id: "ic9", text: "Incident reports" },
        ]
      },
      {
        title: "Utilities & Infrastructure",
        items: [
          { id: "ic10", text: "Electrical systems" },
          { id: "ic11", text: "HVAC / ventilation" },
          { id: "ic12", text: "Plumbing" },
        ]
      },
      {
        title: "Insurance & Risk",
        items: [
          { id: "ic13", text: "Industrial insurance policies" },
          { id: "ic14", text: "Claims" },
          { id: "ic15", text: "Environmental reports" },
        ]
      },
    ],
  };

  // Toggle checked with encouragement messages
  const toggleChecked = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
      
      // Check if this completes a block
      const allSections = [
        ...homeownerData.roomView, ...homeownerData.categoryView,
        ...businessData.roomView, ...businessData.categoryView,
        ...managementData.roomView, ...managementData.categoryView,
        ...industrialData.roomView, ...industrialData.categoryView,
      ];
      const section = allSections.find(s => s.items.some(item => item.id === itemId));
      
      if (section) {
        const allItemsInSection = section.items.map(item => item.id);
        const isBlockComplete = allItemsInSection.every(id => 
          id === itemId || newCheckedItems.has(id)
        );
        
        if (isBlockComplete) {
          // Show block completion message
          const blockMessage = blockCompletionMessages[Math.floor(Math.random() * blockCompletionMessages.length)];
          toast({
            title: blockMessage,
            duration: 2500,
          });
        } else {
          // Show individual message in rotation
          const message = individualMessages[messageIndex % individualMessages.length];
          messageIndex++;
          toast({
            title: message,
            duration: 1500,
          });
        }
      }
    }
    setCheckedItems(newCheckedItems);
  };

  // Calculate progress for a specific checklist
  const calculateProgress = (checklist: ChecklistSection[]) => {
    const totalItems = checklist.reduce((sum, section) => sum + section.items.length, 0);
    const completedItems = checklist.reduce(
      (sum, section) => sum + section.items.filter(item => checkedItems.has(item.id)).length,
      0
    );
    return { totalItems, completedItems, percentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0 };
  };

  // Calculate overall progress
  const allChecklists = [
    ...homeownerData.roomView, ...homeownerData.categoryView,
    ...businessData.roomView, ...businessData.categoryView,
    ...managementData.roomView, ...managementData.categoryView,
    ...industrialData.roomView, ...industrialData.categoryView,
  ];
  const totalItems = allChecklists.reduce((sum, section) => sum + section.items.length, 0);
  const completedItems = allChecklists.reduce(
    (sum, section) => sum + section.items.filter(item => checkedItems.has(item.id)).length,
    0
  );
  const overallPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const ChecklistComponent: React.FC<{
    tabKey: string;
    title: string;
    icon: React.ReactNode;
    data: ChecklistData;
  }> = ({ tabKey, title, icon, data }) => {
    const currentView = viewModes[tabKey];
    const roomProgress = calculateProgress(data.roomView);
    const categoryProgress = calculateProgress(data.categoryView);
    const currentChecklist = currentView === 'room' ? data.roomView : data.categoryView;

    return (
      <div className="space-y-6">
        {/* Header with title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {icon}
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
          <span className={`text-sm font-medium transition-colors ${currentView === 'room' ? 'text-primary' : 'text-muted-foreground'}`}>
            🏠 Room View
          </span>
          <Switch
            checked={currentView === 'category'}
            onCheckedChange={() => toggleViewMode(tabKey)}
          />
          <span className={`text-sm font-medium transition-colors ${currentView === 'category' ? 'text-primary' : 'text-muted-foreground'}`}>
            📂 Category View
          </span>
        </div>

        {/* Dual Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`transition-all ${currentView === 'room' ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">🏠 Room View Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {roomProgress.completedItems}/{roomProgress.totalItems}
                  </span>
                </div>
                <Progress value={roomProgress.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(roomProgress.percentage)}% complete
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`transition-all ${currentView === 'category' ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">📂 Category View Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {categoryProgress.completedItems}/{categoryProgress.totalItems}
                  </span>
                </div>
                <Progress value={categoryProgress.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(categoryProgress.percentage)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current View Label */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {currentView === 'room' ? '🏠 Room View' : '📂 Category View'} Active
          </span>
        </div>

        {/* Checklist Items */}
        <div className="grid gap-4">
          {currentChecklist.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                        checkedItems.has(item.id) 
                          ? 'bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        id={item.id}
                        checked={checkedItems.has(item.id)}
                        onCheckedChange={() => toggleChecked(item.id)}
                        className="transition-transform duration-200 data-[state=checked]:scale-110"
                      />
                      <label
                        htmlFor={item.id}
                        className={`text-sm cursor-pointer flex-1 transition-all duration-300 ${
                          checkedItems.has(item.id) 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                        }`}
                      >
                        {item.text}
                      </label>
                      {checkedItems.has(item.id) && (
                        <span className="text-primary text-lg animate-scale-in">✓</span>
                      )}
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
    <>
      {embedded ? (
        <div className="p-4">
          <Tabs defaultValue="homeowners" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="homeowners" className="text-xs sm:text-sm">
                <Home className="h-4 w-4 mr-1 hidden sm:inline" />
                Homeowner
              </TabsTrigger>
              <TabsTrigger value="business" className="text-xs sm:text-sm">
                <Building2 className="h-4 w-4 mr-1 hidden sm:inline" />
                Business
              </TabsTrigger>
              <TabsTrigger value="management" className="text-xs sm:text-sm">
                <Users className="h-4 w-4 mr-1 hidden sm:inline" />
                Management
              </TabsTrigger>
              <TabsTrigger value="industrial" className="text-xs sm:text-sm">
                <Factory className="h-4 w-4 mr-1 hidden sm:inline" />
                Industrial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="homeowners">
              <ChecklistComponent tabKey="homeowners" title="Homeowner Documentation" icon={<Home className="h-6 w-6 text-primary" />} data={homeownerData} />
            </TabsContent>
            <TabsContent value="business">
              <ChecklistComponent tabKey="business" title="Business Documentation" icon={<Building2 className="h-6 w-6 text-primary" />} data={businessData} />
            </TabsContent>
            <TabsContent value="management">
              <ChecklistComponent tabKey="management" title="Management / Landlord Documentation" icon={<Users className="h-6 w-6 text-primary" />} data={managementData} />
            </TabsContent>
            <TabsContent value="industrial">
              <ChecklistComponent tabKey="industrial" title="Industrial Documentation" icon={<Factory className="h-6 w-6 text-primary" />} data={industrialData} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card className="w-full">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-xl">Complete Documentation Checklist</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <Tabs defaultValue="homeowners" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="homeowners" className="text-xs sm:text-sm">
                      <Home className="h-4 w-4 mr-1 hidden sm:inline" />
                      Homeowner
                    </TabsTrigger>
                    <TabsTrigger value="business" className="text-xs sm:text-sm">
                      <Building2 className="h-4 w-4 mr-1 hidden sm:inline" />
                      Business
                    </TabsTrigger>
                    <TabsTrigger value="management" className="text-xs sm:text-sm">
                      <Users className="h-4 w-4 mr-1 hidden sm:inline" />
                      Management
                    </TabsTrigger>
                    <TabsTrigger value="industrial" className="text-xs sm:text-sm">
                      <Factory className="h-4 w-4 mr-1 hidden sm:inline" />
                      Industrial
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="homeowners">
                    <ChecklistComponent tabKey="homeowners" title="Homeowner Documentation" icon={<Home className="h-6 w-6 text-primary" />} data={homeownerData} />
                  </TabsContent>
                  <TabsContent value="business">
                    <ChecklistComponent tabKey="business" title="Business Documentation" icon={<Building2 className="h-6 w-6 text-primary" />} data={businessData} />
                  </TabsContent>
                  <TabsContent value="management">
                    <ChecklistComponent tabKey="management" title="Management / Landlord Documentation" icon={<Users className="h-6 w-6 text-primary" />} data={managementData} />
                  </TabsContent>
                  <TabsContent value="industrial">
                    <ChecklistComponent tabKey="industrial" title="Industrial Documentation" icon={<Factory className="h-6 w-6 text-primary" />} data={industrialData} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </>
  );
};

export default DocumentationChecklist;
