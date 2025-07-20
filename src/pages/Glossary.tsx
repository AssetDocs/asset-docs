import React from 'react';
import { ArrowLeft, BookOpen, Building2, FileText, Shield, TrendingUp, Brain, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Glossary = () => {
  const termSections = [
    {
      title: "General Insurance Terms",
      icon: Shield,
      color: "bg-blue-500",
      terms: [
        {
          term: "Policyholder",
          definition: "The person or entity that owns the insurance policy."
        },
        {
          term: "Claim",
          definition: "A formal request made to an insurer for compensation for a covered loss or damage."
        },
        {
          term: "Premium",
          definition: "The amount paid for insurance coverage."
        },
        {
          term: "Deductible",
          definition: "The amount the insured must pay out-of-pocket before insurance coverage kicks in."
        },
        {
          term: "Coverage Limit",
          definition: "The maximum amount an insurer will pay for a covered loss."
        },
        {
          term: "Exclusion",
          definition: "Specific situations or assets not covered by an insurance policy."
        },
        {
          term: "Rider",
          definition: "An add-on provision to an insurance policy that provides additional coverage."
        },
        {
          term: "Underwriting",
          definition: "The process insurers use to evaluate the risk of insuring an individual or asset."
        }
      ]
    },
    {
      title: "Claims & Loss Terminology",
      icon: FileText,
      color: "bg-red-500",
      terms: [
        {
          term: "Proof of Loss",
          definition: "A sworn statement outlining the details of a loss, including cause, value, and damages."
        },
        {
          term: "Adjuster (Claims Adjuster)",
          definition: "A professional who investigates and evaluates insurance claims."
        },
        {
          term: "Total Loss",
          definition: "When the cost to repair or replace property exceeds its insured value."
        },
        {
          term: "Partial Loss",
          definition: "A loss that does not completely destroy the asset."
        },
        {
          term: "Depreciation",
          definition: "The reduction in value of an asset over time due to wear, age, or obsolescence."
        },
        {
          term: "Subrogation",
          definition: "The insurer's right to pursue a third party responsible for the loss after a claim is paid."
        },
        {
          term: "Salvage Value",
          definition: "The estimated value of an item after damage, typically after a loss event."
        },
        {
          term: "Loss of Use",
          definition: "Coverage for additional living expenses if a home is uninhabitable due to a covered event."
        }
      ]
    },
    {
      title: "Valuation Terms",
      icon: TrendingUp,
      color: "bg-green-500",
      terms: [
        {
          term: "Appraisal",
          definition: "A professional assessment of an asset's value."
        },
        {
          term: "Market Value",
          definition: "The price an asset would sell for in a competitive and open market."
        },
        {
          term: "Replacement Cost",
          definition: "The cost to replace an asset with a similar one at current market prices, without deducting depreciation."
        },
        {
          term: "Actual Cash Value (ACV)",
          definition: "The replacement cost of an asset minus depreciation."
        },
        {
          term: "Fair Market Value (FMV)",
          definition: "The value of an asset based on what a willing buyer would pay a willing seller."
        },
        {
          term: "Book Value",
          definition: "The value of an asset recorded on the company's balance sheet."
        },
        {
          term: "Residual Value",
          definition: "The remaining value of an asset after it has been fully depreciated."
        },
        {
          term: "Comparable Sales (Comps)",
          definition: "Recent sales of similar assets used to determine market value."
        },
        {
          term: "Liquidation Value",
          definition: "The estimated amount that could be obtained from selling an asset quickly."
        }
      ]
    },
    {
      title: "Asset Documentation Terms",
      icon: BookOpen,
      color: "bg-purple-500",
      terms: [
        {
          term: "Inventory",
          definition: "A detailed list of assets including descriptions, values, and supporting documentation."
        },
        {
          term: "Asset Tag",
          definition: "A unique ID or barcode used to identify and track an asset."
        },
        {
          term: "Serial Number",
          definition: "A unique identifier for tracking specific items (important for electronics, appliances, etc.)."
        },
        {
          term: "Condition Report",
          definition: "A written or visual assessment of the current state of an item or property."
        },
        {
          term: "Chain of Custody",
          definition: "Documentation of the ownership and handling history of an asset, often for high-value or collectible items."
        },
        {
          term: "Photo Documentation",
          definition: "Visual record of an asset, used for valuation, condition verification, and claims."
        },
        {
          term: "Timestamping",
          definition: "Adding a date and time to documents or images to verify when records were created."
        },
        {
          term: "Metadata",
          definition: "Data embedded in a digital file (like a photo) that contains information such as time, location, and device used."
        }
      ]
    },
    {
      title: "Disaster & Risk-Related Terms",
      icon: Shield,
      color: "bg-orange-500",
      terms: [
        {
          term: "Peril",
          definition: "A specific risk or cause of loss (e.g., fire, theft, flood)."
        },
        {
          term: "Natural Disaster",
          definition: "Large-scale events such as earthquakes, hurricanes, or wildfires that cause widespread damage."
        },
        {
          term: "Catastrophic Loss",
          definition: "A major loss that affects a large number of policyholders and overwhelms insurer resources."
        },
        {
          term: "Business Interruption",
          definition: "Coverage for lost income and operational costs during a disruption caused by a covered peril."
        },
        {
          term: "Force Majeure",
          definition: "A clause or event that excuses a party from liability due to uncontrollable events."
        }
      ]
    },
    {
      title: "Business-Specific Terms",
      icon: Building2,
      color: "bg-indigo-500",
      terms: [
        {
          term: "Business Personal Property (BPP)",
          definition: "Movable property owned by a business (equipment, furniture, inventory)."
        },
        {
          term: "Capital Asset",
          definition: "Long-term assets like buildings, land, and major equipment used in a business."
        },
        {
          term: "Operational Risk",
          definition: "The risk of loss from failed internal processes, people, or systems."
        },
        {
          term: "Asset Lifecycle",
          definition: "The stages an asset goes through: acquisition, use, maintenance, and disposal."
        },
        {
          term: "Depreciable Asset",
          definition: "Business property that loses value over time and can be depreciated for tax purposes."
        },
        {
          term: "Fixed Asset",
          definition: "Long-term tangible property used in business operations (e.g., machinery, buildings)."
        }
      ]
    },
    {
      title: "AI & Digital Integration",
      icon: Brain,
      color: "bg-cyan-500",
      terms: [
        {
          term: "Photo-Based Valuation",
          definition: "Using AI and image recognition to estimate an asset's value from a photo."
        },
        {
          term: "Digital Twin",
          definition: "A virtual representation of a physical asset or property."
        },
        {
          term: "Smart Inventory",
          definition: "Digitally managed asset tracking that uses AI for real-time updates and analytics."
        },
        {
          term: "Automated Valuation Model (AVM)",
          definition: "A system that estimates value using statistical modeling and property data."
        },
        {
          term: "Blockchain Verification",
          definition: "Immutable digital records for ownership and value tracking."
        },
        {
          term: "OCR (Optical Character Recognition)",
          definition: "Technology used to extract text from images, useful for receipts and documentation."
        }
      ]
    },
    {
      title: "Legal & Compliance Terms",
      icon: Scale,
      color: "bg-yellow-500",
      terms: [
        {
          term: "Insurable Interest",
          definition: "The policyholder must stand to suffer a financial loss from damage to the insured asset."
        },
        {
          term: "Indemnity",
          definition: "Compensation for damage or loss; restoring the insured to their original financial position."
        },
        {
          term: "Endorsement",
          definition: "A written amendment to an insurance policy modifying its terms."
        },
        {
          term: "Record Retention",
          definition: "Legal requirements to store and maintain records for a set period."
        },
        {
          term: "Compliance Audit",
          definition: "Review to ensure proper procedures were followed for asset documentation and valuation."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Badge className="mb-4" variant="outline">
              📖 Asset Docs Reference
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Insurance & Valuation Glossary
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive definitions of insurance, valuation, and asset documentation terms 
              to help you navigate your documentation journey with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8">
          {termSections.map((section, sectionIndex) => {
            const IconComponent = section.icon;
            return (
              <Card key={sectionIndex} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {section.terms.map((item, termIndex) => (
                      <div 
                        key={termIndex}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.term}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back to Tools Section */}
        <div className="mt-12 text-center">
          <Link
            to="/checklists"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Explore More Tools & Resources
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Glossary;