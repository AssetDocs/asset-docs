import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Tag, TrendingUp, Camera, Target, BarChart3, AlertCircle } from 'lucide-react';

const AIValuationGuide: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              🤖 2 min read
            </Badge>
            <h1 className="text-4xl font-bold text-brand-blue mb-4">
              How Our AI Determines Value
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI valuation engine reviews multiple data layers for every documented item. Here's what it analyzes:
            </p>
          </div>

          <div className="space-y-8">
            {/* Visual Recognition Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-6 w-6 mr-3 text-brand-blue" />
                  1. Visual Recognition & Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Identifies the item type (e.g., "leather sectional sofa" vs. "accent chair")</p>
                <p>• Classifies by material, style, condition, and brand indicators</p>
                <p>• Compares the image against a trained dataset of similar items</p>
              </CardContent>
            </Card>

            {/* Metadata Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-6 w-6 mr-3 text-brand-blue" />
                  2. Item Metadata & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Brand, model, and serial number (if available)</p>
                <p>• Purchase date or age (user-submitted or estimated visually)</p>
                <p>• Condition notes or visible wear</p>
              </CardContent>
            </Card>

            {/* Market Data Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-brand-blue" />
                  3. Market Data Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">Real-time comparison to:</p>
                <p>• Retail prices</p>
                <p>• Resale listings (eBay, Facebook Marketplace, Chairish, etc.)</p>
                <p>• Auction results and collector values (for high-end or rare items)</p>
                <p>• Historical depreciation curves for common categories (e.g., electronics, furniture, tools)</p>
              </CardContent>
            </Card>

            {/* Image Quality Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-6 w-6 mr-3 text-brand-blue" />
                  4. Image Quality Confidence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• High-resolution, well-lit, multi-angle images lead to more accurate valuations</p>
                <p>• Blurry, dark, or obstructed photos reduce accuracy and confidence score</p>
              </CardContent>
            </Card>

            {/* Factors Section */}
            <Card className="bg-blue-50 border-brand-blue">
              <CardHeader>
                <CardTitle className="flex items-center text-brand-blue">
                  <Target className="h-6 w-6 mr-3" />
                  🎯 What Factors Matter Most in AI Valuation?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">1. Condition</h4>
                  <p className="text-gray-700">Why it matters: Signs of wear, damage, or like-new condition directly impact resale value</p>
                </div>
                <div>
                  <h4 className="font-semibold">2. Brand/Model</h4>
                  <p className="text-gray-700">Why it matters: Premium brands (e.g., Apple, Herman Miller, Dyson) retain value longer</p>
                </div>
                <div>
                  <h4 className="font-semibold">3. Age</h4>
                  <p className="text-gray-700">Why it matters: Most items depreciate over time unless considered collectible or rare</p>
                </div>
                <div>
                  <h4 className="font-semibold">4. Category Type</h4>
                  <p className="text-gray-700">Why it matters: Market demand varies by item — e.g., tools retain value better than small appliances</p>
                </div>
                <div>
                  <h4 className="font-semibold">5. Photo Clarity</h4>
                  <p className="text-gray-700">Why it matters: Clear, detailed images allow better identification and confidence in assessment</p>
                </div>
              </CardContent>
            </Card>

            {/* Value Ranges Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-brand-blue" />
                  📈 Value Ranges & Confidence Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Our AI returns a current market value estimate alongside a confidence score:</p>
                <div className="space-y-2 mt-4">
                  <p><strong>High Confidence (90–100%):</strong> Excellent photo + metadata match + strong market data</p>
                  <p><strong>Medium Confidence (70–89%):</strong> One or two data points missing or unclear</p>
                  <p><strong>Low Confidence (below 70%):</strong> Poor photo quality or insufficient comparable data</p>
                </div>
              </CardContent>
            </Card>

            {/* Why It Matters Section */}
            <Card className="bg-orange-50 border-brand-orange">
              <CardHeader>
                <CardTitle className="text-brand-orange">
                  📝 Why It Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Accurate asset valuation helps you:</p>
                <p>• Speed up insurance claims</p>
                <p>• Back up estate or divorce asset divisions</p>
                <p>• Track depreciation for tax and business purposes</p>
                <p>• Understand replacement costs before a loss occurs</p>
              </CardContent>
            </Card>

            {/* Note Section */}
            <Card className="bg-yellow-50 border-yellow-300">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-800">
                  <AlertCircle className="h-6 w-6 mr-3" />
                  📌 Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-800">
                  Our AI valuations are intended as informational estimates and do not replace professional appraisals for high-value or rare items. Users may choose to request verified expert valuations through Asset Docs for added documentation or legal purposes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AIValuationGuide;