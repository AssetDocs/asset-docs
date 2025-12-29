import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Blog = () => {
  // Sample blog posts - in production, this would come from a CMS or database
  const blogPosts = [
    {
      id: 'what-documents-to-upload',
      title: 'What Documents Should I Upload to Asset Safe?',
      excerpt: "A comprehensive guide to the types of documents you should store in Asset Safe—and why each one matters for insurance claims, legal matters, and estate planning.",
      category: 'Guides',
      date: '2025-01-22',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&h=400&fit=crop',
      featured: true
    },
    {
      id: 'welcome-to-asset-safe',
      title: 'Welcome to Asset Safe — Your Home, Your Legacy, Our Mission',
      excerpt: "We're here to help you preserve, document, and protect what matters most — not just as property, but as part of your life, legacy, and peace of mind.",
      category: 'Company News',
      date: '2025-01-20',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
      featured: false
    },
    {
      id: 'legacy-locker-modern-protection',
      title: 'Legacy Locker — The Modern Way to Protect Your Wishes, Memories, and Home',
      excerpt: "A will tells people what you want. A Legacy Locker shows them what you meant. Discover the missing piece that gives clarity and peace of mind to the people you love.",
      category: 'Estate Planning',
      date: '2025-01-18',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop',
      featured: false
    },
    {
      id: 'digital-home-inventory-guide',
      title: 'The Complete Guide to Creating a Digital Home Inventory',
      excerpt: 'Learn how to document your assets effectively with our comprehensive guide to digital home inventory management.',
      category: 'Guides',
      date: '2025-01-15',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
      featured: false
    },
    {
      id: 'estate-planning-digital-vault',
      title: 'Why Every Estate Plan Needs a Digital Vault',
      excerpt: 'Discover how Legacy Locker complements traditional estate planning and why digital asset management is crucial.',
      category: 'Estate Planning',
      date: '2025-01-10',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop'
    },
    {
      id: 'insurance-claims-documentation',
      title: 'How Proper Documentation Speeds Up Insurance Claims',
      excerpt: 'Real stories from homeowners who used Asset Safe to streamline their insurance claims process.',
      category: 'Insurance',
      date: '2025-01-05',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop'
    },
    {
      id: 'organizing-receipts-warranties',
      title: 'The Smart Way to Organize Receipts and Warranties',
      excerpt: 'Stop losing important documents. Learn proven strategies for organizing and storing receipts digitally.',
      category: 'Organization',
      date: '2024-12-28',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop'
    },
    {
      id: 'protecting-high-value-items',
      title: 'Protecting High-Value Items: A Collector\'s Guide',
      excerpt: 'Special considerations for documenting art, jewelry, antiques, and other valuable collectibles.',
      category: 'Protection',
      date: '2024-12-20',
      readTime: '9 min read',
      image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&h=400&fit=crop'
    },
    {
      id: 'disaster-preparedness-checklist',
      title: 'Disaster Preparedness: Your Essential Checklist',
      excerpt: 'Be ready for the unexpected with our comprehensive disaster preparedness and asset protection checklist.',
      category: 'Preparedness',
      date: '2024-12-15',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=800&h=400&fit=crop'
    }
  ];

  const categories = ['All', 'Company News', 'Guides', 'Estate Planning', 'Insurance', 'Organization', 'Protection', 'Preparedness'];

  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);

  return (
    <>
      <SEOHead 
        title="Blog - Asset Protection & Estate Planning Insights | Asset Safe"
        description="Expert insights on home inventory management, estate planning, insurance claims, and asset protection. Learn how to protect what matters most."
        canonicalUrl="https://www.assetsafe.net/blog"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-grow pt-20">
          {/* Header */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  Asset Safe Blog
                </h1>
                <p className="text-lg text-muted-foreground">
                  Expert insights on protecting your assets, estate planning, and making the most of Asset Safe
                </p>
              </div>
            </div>
          </section>

          {/* Featured Post */}
          {featuredPost && (
            <section className="container mx-auto px-4 py-12">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center">
                    <Badge variant="secondary" className="w-fit mb-3">
                      {featuredPost.category}
                    </Badge>
                    <CardTitle className="text-2xl md:text-3xl mb-4">
                      {featuredPost.title}
                    </CardTitle>
                    <CardDescription className="text-base mb-4">
                      {featuredPost.excerpt}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                    <Link 
                      to={`/blog/${featuredPost.id}`}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold group"
                    >
                      Read Article 
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </CardContent>
                </div>
              </Card>
            </section>
          )}

          {/* Category Filter */}
          <section className="container mx-auto px-4 py-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {post.category}
                    </Badge>
                    <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                      <Link to={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="mb-4">
                      {post.excerpt}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <Link 
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm group"
                    >
                      Read More 
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Ready to Protect Your Assets?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start documenting your valuable assets today with Asset Safe's comprehensive platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/auth"
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link 
                  to="/features"
                  className="inline-flex items-center justify-center px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Explore Features
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;