import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { FileText, TrendingUp, Building2, Package, Zap, Clock } from 'lucide-react';

const AssetDocumentation: React.FC = () => {
  const assetTypes = [
    {
      icon: <Zap className="h-6 w-6 text-brand-blue" />,
      title: "Current/Liquid Assets",
      description: "Assets that can be easily converted into cash within a year.",
      examples: "Cash, inventory, accounts receivable, marketable securities"
    },
    {
      icon: <Building2 className="h-6 w-6 text-brand-blue" />,
      title: "Fixed Assets",
      description: "Assets that cannot easily be converted into cash within a year.",
      examples: "Real estate, patents, machinery, long-term investments"
    },
    {
      icon: <Package className="h-6 w-6 text-brand-blue" />,
      title: "Tangible Assets",
      description: "Physical assets that you can touch and see.",
      examples: "Cash, office supplies, tools, equipment, furniture, vehicles"
    },
    {
      icon: <FileText className="h-6 w-6 text-brand-blue" />,
      title: "Intangible Assets",
      description: "Assets with no physical presence but significant value.",
      examples: "Brand reputation, trademarks, patents, research & development"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-brand-blue" />,
      title: "Operating Assets",
      description: "Assets that allow you to generate ongoing revenue.",
      examples: "Equipment, patents, inventory, business real estate"
    },
    {
      icon: <Clock className="h-6 w-6 text-brand-blue" />,
      title: "Non-Operating Assets",
      description: "Assets you own that don't necessarily generate ongoing revenue.",
      examples: "Short-term investments, unused equipment, vacant land"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <div className="bg-brand-blue text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Asset Documentation Guide
              </h1>
              <p className="text-xl opacity-90">
                Understanding asset documents and their importance in business and personal financial matters
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* What is Asset Documentation */}
          <section className="mb-16">
            <Card className="p-8">
              <h2 className="text-3xl font-bold text-brand-blue mb-6">What is an Asset Document?</h2>
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-4">
                  Asset documents are comprehensive records that detail relevant assets and their characteristics. These documents play a crucial role in various business and personal financial processes, providing verification and detailed information about what you own.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  For instance, when applying for a mortgage, lenders typically require asset documentation listing everything contributing to your net worth—including cash, savings accounts, physical assets like jewelry and artwork, and liquid assets such as stocks and bonds. These assets are evaluated against your borrowing amount to determine loan approval and terms.
                </p>
                <p className="text-lg text-gray-700">
                  Asset documents serve various purposes across different scenarios, from loan applications to business transactions, insurance claims, and estate planning.
                </p>
              </div>
            </Card>
          </section>

          {/* Importance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">
              The Importance of Asset Documentation
            </h2>
            <Card className="p-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-4">
                  Asset documents are essential in both business and personal dealings because they provide verification of assets. This ensures that all parties involved have a clear understanding of:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>What you own and its current value</li>
                  <li>Whether assets are liquid (easily converted to cash) or fixed</li>
                  <li>The net worth represented by your assets</li>
                  <li>The nature and characteristics of each asset</li>
                </ul>
                <p className="text-lg text-gray-700">
                  Proper asset documentation can significantly impact important life decisions, from mortgage lending and business negotiations to insurance coverage and financial planning.
                </p>
              </div>
            </Card>
          </section>

          {/* Common Uses */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">
              Common Uses for Asset Documents
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-brand-blue mb-3">Loan Approvals</h3>
                <p className="text-gray-700">
                  Asset documents help lenders assess your ability to repay large loans by providing a comprehensive view of your financial resources and net worth.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-brand-blue mb-3">Mortgage Applications</h3>
                <p className="text-gray-700">
                  Lenders use asset documentation to evaluate risk levels and determine mortgage terms, including interest rates and down payment requirements.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-brand-blue mb-3">Shipping & Insurance</h3>
                <p className="text-gray-700">
                  Asset documents serve as records of net worth and proof of assets, which is critical in cases of loss, theft, or damage during transportation.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-brand-blue mb-3">Business Transactions</h3>
                <p className="text-gray-700">
                  When selling or merging a business, asset documents clarify the company's net worth and the nature of its assets, informing negotiations.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-brand-blue mb-3">Business Liquidation</h3>
                <p className="text-gray-700">
                  Asset documents show exactly what a business owns and how quickly those assets can be converted into cash.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-brand-blue mb-3">Estate Planning</h3>
                <p className="text-gray-700">
                  Comprehensive asset documentation helps with estate planning, tax preparation, and ensuring proper distribution of assets.
                </p>
              </Card>
            </div>
          </section>

          {/* Types of Assets */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">
              Understanding Asset Types
            </h2>
            <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
              Asset documents may include several types of assets. Depending on your specific needs, you may need to document one, some, or all of these categories:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assetTypes.map((asset, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {asset.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-blue mb-2">
                        {asset.title}
                      </h3>
                      <p className="text-gray-700 mb-3 text-sm">
                        {asset.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Examples:</span> {asset.examples}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Important Note:</strong> Some assets may belong to multiple categories. For example, operating assets may also be tangible or intangible. When preparing your documentation, list such assets in all applicable categories, but ensure you account for this overlap when calculating totals.
              </p>
            </div>
          </section>

          {/* Asset Statement vs Asset Document */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-brand-blue mb-8 text-center">
              Asset Statement vs. Asset Document
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-brand-blue mb-4">Asset Document</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-brand-blue mr-2">•</span>
                    <span>Focuses on assets and their values</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-blue mr-2">•</span>
                    <span>Used for risk assessment and net worth verification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-blue mr-2">•</span>
                    <span>Common in loan applications and business negotiations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-blue mr-2">•</span>
                    <span>Provides verification for financial transactions</span>
                  </li>
                </ul>
              </Card>
              
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-brand-blue mb-4">Asset Statement</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-brand-blue mr-2">•</span>
                    <span>Similar to a balance sheet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-blue mr-2">•</span>
                    <span>Includes both assets and liabilities (debts, expenses)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-blue mr-2">•</span>
                    <span>Typically used for tax purposes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-blue mr-2">•</span>
                    <span>Calculates net revenue and overall financial position</span>
                  </li>
                </ul>
              </Card>
            </div>
          </section>

          {/* Getting Started */}
          <section>
            <Card className="p-8 bg-gradient-to-r from-brand-blue to-blue-600 text-white">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Getting Started with Asset Documentation
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-lg mb-6">
                  Proper asset documentation requires secure storage and management. Your asset documents contain sensitive information about your possessions and financial resources, making security a top priority.
                </p>
                <p className="text-lg mb-6">
                  Asset Docs provides everything you need to create, organize, and securely store comprehensive asset documentation:
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Secure, encrypted storage for all your asset records</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Photo and video documentation capabilities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Organized categorization by asset type</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Easy sharing with lenders, insurers, or business partners</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Regular updates to maintain accurate records</span>
                  </li>
                </ul>
                <div className="text-center">
                  <a 
                    href="/signup" 
                    className="inline-block bg-white text-brand-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Start Documenting Your Assets
                  </a>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AssetDocumentation;