import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock } from 'lucide-react';

const PressNews: React.FC = () => {
  const articles = [
    {
      id: 1,
      title: "Why Your Insurance Claim Could Be Denied: The Critical Importance of Proving Your Losses",
      excerpt: "Understanding your responsibility to provide sufficient evidence when filing insurance claims - and what happens when documentation falls short.",
      author: "Legal Team",
      date: "2024-06-20",
      readTime: "6 min read",
      category: "Legal Guide",
      content: "When filing an insurance claim, the burden of proof lies entirely with you, the policyholder. This fundamental principle is backed by policy language, legal precedent, and industry practice. Most standard homeowners policies explicitly require a 'Proof of Loss' within 60 days, including detailed inventories, repair estimates, and supporting documentation. The legal principle is clear: you must prove coverage while insurers prove exclusions. Major insurers like Allstate and State Farm emphasize the need for detailed lists and sworn statements. Consumer Reports identifies inadequate documentation as the leading cause of claim disputes. The key takeaway: always maintain receipts, photos, videos, and updated inventories to protect your claim from delays, underpayment, or denial."
    },
    {
      id: 2,
      title: "Family Loses $50,000 After Fire Insurance Claim Denied Due to Insufficient Photo Documentation",
      excerpt: "The Martinez family's claim was rejected when they couldn't provide detailed photos of their belongings before the house fire. Their story highlights the critical importance of comprehensive property documentation.",
      author: "Sarah Johnson",
      date: "2024-06-15",
      readTime: "5 min read",
      category: "Case Study",
      content: "When the Martinez family's home was destroyed in a wildfire last year, they thought their insurance policy would cover the $200,000 in damages. However, their claim was denied because they couldn't provide sufficient photographic evidence of their personal belongings and property improvements made over the years..."
    },
    {
      id: 3,
      title: "New California Law Requires Enhanced Documentation Standards for Insurance Claims",
      excerpt: "Assembly Bill 2273 mandates stricter documentation requirements for property insurance claims, putting pressure on homeowners to maintain detailed records.",
      author: "Legal Team",
      date: "2024-06-10",
      readTime: "7 min read",
      category: "Legal Update",
      content: "California's new insurance documentation law, effective January 2025, will require homeowners to provide comprehensive visual evidence of their property and belongings when filing claims over $10,000..."
    },
    {
      id: 4,
      title: "Hurricane Victim's $75,000 Claim Rejected: 'I Wish I Had Better Records'",
      excerpt: "After Hurricane Isabel damaged her coastal home, Jane Wilson's insurance claim was partially denied due to lack of proper documentation of recent renovations and high-value items.",
      author: "Michael Chen",
      date: "2024-06-05",
      readTime: "6 min read",
      category: "Personal Story",
      content: "Jane Wilson had lived in her beachfront home for 15 years, making numerous improvements and collecting valuable antiques. When Hurricane Isabel struck, she lost everything – and then her insurance company denied most of her claim..."
    },
    {
      id: 5,
      title: "Insurance Industry Report: 40% of Claims Delayed Due to Insufficient Documentation",
      excerpt: "A comprehensive study reveals that poor documentation is the leading cause of insurance claim delays and denials, costing homeowners millions annually.",
      author: "Insurance Research Institute",
      date: "2024-05-28",
      readTime: "8 min read",
      category: "Industry Report",
      content: "The latest industry analysis shows a troubling trend: nearly half of all property insurance claims face delays or partial denials due to inadequate documentation provided by policyholders..."
    },
    {
      id: 6,
      title: "Apartment Renter Denied $25,000 After Flood: Personal Property Documentation Gaps",
      excerpt: "College student loses everything in apartment flood but receives minimal payout due to lack of photographic evidence of belongings and their values.",
      author: "Emma Rodriguez",
      date: "2024-05-20",
      readTime: "4 min read",
      category: "Renter Stories",
      content: "Twenty-two-year-old Alex Thompson thought his renter's insurance would cover the electronics, textbooks, and personal belongings destroyed when a pipe burst in his apartment building..."
    },
    {
      id: 7,
      title: "Supreme Court Ruling Strengthens Insurance Companies' Right to Require Photo Evidence",
      excerpt: "Recent court decision upholds insurers' ability to deny claims lacking proper visual documentation, emphasizing the need for comprehensive property records.",
      author: "Legal Correspondent",
      date: "2024-05-15",
      readTime: "9 min read",
      category: "Legal Update",
      content: "In a 7-2 decision, the Supreme Court ruled in favor of insurance companies' right to establish strict documentation requirements for claims processing..."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <div className="bg-brand-blue text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Press & News
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Stay informed about insurance claim stories, legal updates, and industry news that highlight the importance of proper property documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    <CardTitle className="text-2xl leading-tight hover:text-brand-blue transition-colors cursor-pointer">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {article.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        By {article.author}
                      </div>
                      <button className="text-brand-blue hover:text-brand-darkBlue font-medium transition-colors">
                        Read Full Story →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-16 p-8 bg-brand-blue text-white rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">
                Don't Let Your Story Become Another Statistic
              </h2>
              <p className="text-lg text-blue-100 mb-6">
                Protect yourself with comprehensive property documentation before disaster strikes.
              </p>
              <div className="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <button className="w-full sm:w-auto bg-white text-brand-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Start Documenting Today
                </button>
                <button className="w-full sm:w-auto border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-blue transition-colors">
                  Learn More
                </button>
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
