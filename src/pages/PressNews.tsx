import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, Search, CheckCircle, XCircle } from 'lucide-react';

const PressNews: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const articles = [
    {
      id: 1,
      title: "Why Digital Asset Documentation Beats Spreadsheets + Phone Photos",
      excerpt: "Protect what matters most - with precision, professionalism, and proof. A comprehensive comparison of traditional DIY methods versus professional digital documentation.",
      author: "Asset Docs Team",
      date: "2024-07-22",
      readTime: "8 min read",
      category: "Featured Guide",
      content: `
        <div class="prose max-w-none">
          <p class="text-lg text-gray-700 mb-6">Protect what matters most - with precision, professionalism, and proof.</p>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-4">✅ Digital Asset Documentation vs. DIY Methods</h3>
          
          <div class="overflow-x-auto mb-8">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-300 px-4 py-3 text-left font-semibold">Feature</th>
                  <th class="border border-gray-300 px-4 py-3 text-left font-semibold">Spreadsheet + Phone Photos</th>
                  <th class="border border-gray-300 px-4 py-3 text-left font-semibold">Asset Docs Digital Documentation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium">Proof of Condition</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Limited context, no timestamps</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Timestamped photos, metadata, verifiable details</span></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 font-medium">Market Valuation</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Manual research required</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>AI-assisted or expert-assigned current value</span></td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium">Insurance Readiness</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Disorganized & hard to verify</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Claim-ready, structured documentation</span></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 font-medium">Disaster Recovery</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Risk of data loss</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Secure cloud storage</span></td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium">Search & Organization</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Manual, time-consuming</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Sort, filter, tag, and export anytime</span></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 font-medium">Legal & Financial Use</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Limited admissibility</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Trusted in legal, financial, and insurance contexts</span></td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium">Maintenance Tracking</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>None</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Track warranties, repairs, and depreciation</span></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 font-medium">Presentation Quality</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Informal</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Professionally formatted, easily shared</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="text-2xl font-bold text-gray-900 mb-4">📈 Who Benefits?</h3>
          <ul class="list-none space-y-3 mb-8">
            <li class="flex items-start"><span class="text-green-600 font-bold mr-2">•</span><strong>Homeowners:</strong> Fire, theft, natural disaster recovery, or estate planning</li>
            <li class="flex items-start"><span class="text-green-600 font-bold mr-2">•</span><strong>Business Owners:</strong> Equipment inventory, liability protection, tax prep</li>
            <li class="flex items-start"><span class="text-green-600 font-bold mr-2">•</span><strong>Landlords & Investors:</strong> Move-in/out documentation, asset depreciation</li>
            <li class="flex items-start"><span class="text-green-600 font-bold mr-2">•</span><strong>Restoration & Insurance Professionals:</strong> Claim support and documentation</li>
          </ul>

          <h3 class="text-2xl font-bold text-gray-900 mb-4">✨ The Asset Docs Advantage</h3>
          <ul class="list-none space-y-3 mb-8">
            <li class="flex items-start"><span class="text-blue-600 font-bold mr-2">✓</span>Interactive Visual Records (3D tours, floorplans, tagged images)</li>
            <li class="flex items-start"><span class="text-blue-600 font-bold mr-2">✓</span>Accurate Valuation via AI and app-based tools</li>
            <li class="flex items-start"><span class="text-blue-600 font-bold mr-2">✓</span>Exportable Reports for insurance, attorneys, or buyers</li>
            <li class="flex items-start"><span class="text-blue-600 font-bold mr-2">✓</span>Cloud-Backed Security for anytime, anywhere access</li>
          </ul>

          <p class="text-lg font-semibold text-gray-800 mb-4">Ready to make your assets undeniable, insurable, and easily managed?</p>
          <p class="text-lg text-blue-600 font-medium">Visit AssetDocs.net to get started.</p>
        </div>
      `,
      featured: true
    },
    {
      id: 2,
      title: "Why Your Insurance Claim Could Be Denied: The Critical Importance of Proving Your Losses",
      excerpt: "Understanding your responsibility to provide sufficient evidence when filing insurance claims - and what happens when documentation falls short.",
      author: "Legal Team",
      date: "2024-06-20",
      readTime: "6 min read",
      category: "Legal Guide",
      content: "When filing an insurance claim, the burden of proof lies entirely with you, the policyholder. This fundamental principle is backed by policy language, legal precedent, and industry practice. Most standard homeowners policies explicitly require a 'Proof of Loss' within 60 days, including detailed inventories, repair estimates, and supporting documentation. The legal principle is clear: you must prove coverage while insurers prove exclusions. Major insurers like Allstate and State Farm emphasize the need for detailed lists and sworn statements. Consumer Reports identifies inadequate documentation as the leading cause of claim disputes. The key takeaway: always maintain receipts, photos, videos, and updated inventories to protect your claim from delays, underpayment, or denial."
    },
    {
      id: 3,
      title: "Family Loses $50,000 After Fire Insurance Claim Denied Due to Insufficient Photo Documentation",
      excerpt: "The Martinez family's claim was rejected when they couldn't provide detailed photos of their belongings before the house fire. Their story highlights the critical importance of comprehensive property documentation.",
      author: "Sarah Johnson",
      date: "2024-06-15",
      readTime: "5 min read",
      category: "Case Study",
      content: "When the Martinez family's home was destroyed in a wildfire last year, they thought their insurance policy would cover the $200,000 in damages. However, their claim was denied because they couldn't provide sufficient photographic evidence of their personal belongings and property improvements made over the years..."
    },
    {
      id: 4,
      title: "New California Law Requires Enhanced Documentation Standards for Insurance Claims",
      excerpt: "Assembly Bill 2273 mandates stricter documentation requirements for property insurance claims, putting pressure on homeowners to maintain detailed records.",
      author: "Legal Team",
      date: "2024-06-10",
      readTime: "7 min read",
      category: "Legal Update",
      content: "California's new insurance documentation law, effective January 2025, will require homeowners to provide comprehensive visual evidence of their property and belongings when filing claims over $10,000..."
    },
    {
      id: 5,
      title: "Hurricane Victim's $75,000 Claim Rejected: 'I Wish I Had Better Records'",
      excerpt: "After Hurricane Isabel damaged her coastal home, Jane Wilson's insurance claim was partially denied due to lack of proper documentation of recent renovations and high-value items.",
      author: "Michael Chen",
      date: "2024-06-05",
      readTime: "6 min read",
      category: "Personal Story",
      content: "Jane Wilson had lived in her beachfront home for 15 years, making numerous improvements and collecting valuable antiques. When Hurricane Isabel struck, she lost everything – and then her insurance company denied most of her claim..."
    },
    {
      id: 6,
      title: "Insurance Industry Report: 40% of Claims Delayed Due to Insufficient Documentation",
      excerpt: "A comprehensive study reveals that poor documentation is the leading cause of insurance claim delays and denials, costing homeowners millions annually.",
      author: "Insurance Research Institute",
      date: "2024-05-28",
      readTime: "8 min read",
      category: "Industry Report",
      content: "The latest industry analysis shows a troubling trend: nearly half of all property insurance claims face delays or partial denials due to inadequate documentation provided by policyholders..."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Featured Guide':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
      case 'Legal Guide':
        return 'bg-indigo-100 text-indigo-800';
      case 'Case Study':
        return 'bg-red-100 text-red-800';
      case 'Legal Update':
        return 'bg-blue-100 text-blue-800';
      case 'Personal Story':
        return 'bg-purple-100 text-purple-800';
      case 'Industry Report':
        return 'bg-green-100 text-green-800';
      case 'Renter Stories':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'readTime':
          const aTime = parseInt(a.readTime.split(' ')[0]);
          const bTime = parseInt(b.readTime.split(' ')[0]);
          return aTime - bTime;
        default:
          return 0;
      }
    });
  }, [searchQuery, sortBy]);

  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const toggleArticle = (id: number) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-darkBlue text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Press & News
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Stay informed about insurance claim stories, legal updates, and industry insights that highlight the importance of proper property documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search articles by keyword, category, or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="md:w-48">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Latest First</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="readTime">Read Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {filteredAndSortedArticles.length} article{filteredAndSortedArticles.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {filteredAndSortedArticles.map((article) => (
                <Card key={article.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${article.featured ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(article.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {article.readTime}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl leading-tight hover:text-brand-blue transition-colors">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    
                    {expandedArticle === article.id && (
                      <div className="mb-6 border-t pt-6">
                        {article.content.includes('<div class="prose') ? (
                          <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        ) : (
                          <p className="text-gray-700 leading-relaxed">{article.content}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        By {article.author}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => toggleArticle(article.id)}
                        className="text-brand-blue hover:text-brand-darkBlue font-medium"
                      >
                        {expandedArticle === article.id ? 'Show Less' : 'Read Full Article'} →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAndSortedArticles.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-16 p-8 bg-gradient-to-r from-brand-blue to-brand-darkBlue text-white rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">
                Don't Let Your Story Become Another Statistic
              </h2>
              <p className="text-lg text-blue-100 mb-6">
                Protect yourself with comprehensive property documentation before disaster strikes.
              </p>
              <div className="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Button className="w-full sm:w-auto bg-white text-brand-blue hover:bg-gray-100">
                  Start Documenting Today
                </Button>
                <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-brand-blue">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PressNews;