import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  // Sample blog post data - in production, this would come from a CMS or database
  const blogPosts: Record<string, any> = {
    'welcome-to-asset-safe': {
      title: 'Welcome to Asset Safe — Your Home, Your Legacy, Our Mission',
      category: 'Company News',
      date: '2025-01-20',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop',
      author: 'Asset Safe Team',
      content: `
        <p>Welcome to Asset Safe! We're so glad you're here. Whether you're a homeowner, a soon-to-be homeowner, or someone thinking ahead for your family, we believe that what you own matters. Asset Safe is built to help you preserve, document, and protect those things — not just as property, but as part of your life, legacy, and peace of mind.</p>

        <h2>🛡️ Why Asset Safe Exists</h2>
        <p>We know that life changes. Moves, renovation, remodeling, insurance claims, natural disasters — any of these can threaten not just your home, but your memories and security. The default way many people handle this — scattered receipts, half-remembered room inventories, poorly organized photos, maybe a few notes — often falls short when it counts most.</p>

        <p>Asset Safe transforms that approach. We make the process of documenting property intuitive, comprehensive, and useful when you actually need it: for insurance, resale, estate planning, or simply peace of mind. On our home page, we describe the platform as turning "the traditional, tedious process of property documentation into a modern, intuitive experience that actually works when you need it most."</p>

        <p>For a business owner like you (with roots in real-estate photography, detailed floorplans, and visual documentation), this is more than just a nice-to-have — it's a new standard for how we treat our homes, belongings, and legacies.</p>

        <h2>✨ Our Core Values & What They Mean for You</h2>
        <p>Here's what we at Asset Safe stand for — and how it serves you:</p>

        <h3>Clarity & Transparency</h3>
        <p>Your home and belongings are valuable. You deserve a clear, honest, and organized record of them. Asset Safe helps you avoid hidden surprises when you need documentation.</p>

        <h3>Preparedness & Resilience</h3>
        <p>Unexpected events happen. Proper documentation gives you leverage and protection if you ever need to file an insurance claim, prove ownership, or manage a sale or estate.</p>

        <h3>Simplicity & Accessibility</h3>
        <p>We aim to remove the friction. No more confusing spreadsheets, half-organized photos, or lost receipts. Our tools are designed to make documentation easy, straightforward, and accessible from anywhere.</p>

        <h3>Legacy & Family-Centric Thinking</h3>
        <p>Many of us don't just own things — we build lives, memories, and family stories around them. Asset Safe helps capture that — making it simpler to pass on value, memories, and responsibility to the next generation. This is especially important with our Legacy Locker feature, which helps preserve family stories and important information beyond traditional documentation.</p>

        <h3>Trust & Professionalism</h3>
        <p>Because you come to us for protection and peace of mind, we treat every record seriously. Your documentation — whether photos, floorplans, asset lists — is stored securely and built to stand up when it counts.</p>

        <h2>Who Asset Safe Is For</h2>
        <p>Asset Safe isn't just for real estate professionals or heavy-duty investors. We built it for everyday people and families — folks who care about their home, their possessions, and the future.</p>

        <p>You might be:</p>
        <ul>
          <li>A homeowner wanting to safeguard valuables and household contents</li>
          <li>Preparing for a move or major renovation</li>
          <li>Looking ahead at estate planning and wanting to preserve family assets</li>
          <li>Wanting to streamline insurance claims or have proof of ownership for high-value items</li>
          <li>Simply someone who values order, documentation, and peace of mind</li>
        </ul>

        <h2>What to Expect Going Forward</h2>
        <p>This first blog post isn't just a welcome — it's the start of a conversation. Going forward, we'll publish content to help you get the most out of Asset Safe:</p>

        <ul>
          <li><strong>Tips for documenting your home the right way</strong> (what photos to take, how to organize floorplans, how to catalog heirlooms)</li>
          <li><strong>How-to guides for using Asset Safe</strong> — from easy setups to advanced documentation (ideal for insurance or estate-planning use cases)</li>
          <li><strong>Real stories and case studies</strong> (how other homeowners used asset documentation to recover from loss, simplify sales, or preserve family legacy)</li>
          <li><strong>Advice around home ownership, maintenance, and long-term planning</strong> to help you build not just a house — but a legacy that lasts</li>
        </ul>

        <p>Thank you for trusting Asset Safe with your home and heritage. We're here to help you protect what matters most — today, tomorrow, and for generations to come.</p>

        <p><strong>Welcome aboard — let's build something lasting, together.</strong></p>

        <p>— The Asset Safe Team</p>
      `
    },
    'digital-home-inventory-guide': {
      title: 'The Complete Guide to Creating a Digital Home Inventory',
      category: 'Guides',
      date: '2025-01-15',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop',
      author: 'Asset Safe Team',
      content: `
        <p>Creating a comprehensive digital home inventory is one of the most important steps you can take to protect your assets. Whether you're preparing for insurance purposes, estate planning, or simply want peace of mind, a well-documented inventory can make all the difference.</p>

        <h2>Why You Need a Digital Home Inventory</h2>
        <p>A digital home inventory serves multiple crucial purposes:</p>
        <ul>
          <li><strong>Insurance Claims:</strong> Speed up the claims process and ensure you receive proper compensation</li>
          <li><strong>Estate Planning:</strong> Help loved ones understand and manage your assets</li>
          <li><strong>Tax Purposes:</strong> Track depreciation and support deductions</li>
          <li><strong>Peace of Mind:</strong> Know exactly what you own and its value</li>
        </ul>

        <h2>Getting Started: Room by Room</h2>
        <p>The best approach to creating your inventory is to go room by room. Start with the areas containing your most valuable items:</p>

        <h3>1. Living Areas</h3>
        <p>Document electronics, furniture, artwork, and collectibles. Take clear photos from multiple angles and note:</p>
        <ul>
          <li>Brand and model numbers</li>
          <li>Purchase date and price</li>
          <li>Current condition</li>
          <li>Serial numbers when available</li>
        </ul>

        <h3>2. Kitchen</h3>
        <p>Don't overlook appliances and high-end cookware. Major appliances often represent significant investments that should be documented.</p>

        <h3>3. Bedrooms</h3>
        <p>Jewelry, watches, and personal electronics are often stored here. Consider keeping receipts and appraisals for high-value items.</p>

        <h2>Best Practices for Documentation</h2>

        <h3>Photography Tips</h3>
        <ul>
          <li>Use good lighting - natural light works best</li>
          <li>Capture multiple angles of each item</li>
          <li>Include close-ups of serial numbers and unique features</li>
          <li>Photograph receipts and certificates of authenticity</li>
        </ul>

        <h3>Information to Include</h3>
        <p>For each item, try to record:</p>
        <ul>
          <li>Item name and description</li>
          <li>Brand, model, and serial number</li>
          <li>Purchase date and location</li>
          <li>Original cost and estimated current value</li>
          <li>Condition notes</li>
          <li>Warranty information</li>
        </ul>

        <h2>Using Asset Safe for Your Inventory</h2>
        <p>Asset Safe makes the process simple with features designed specifically for home inventory management:</p>
        <ul>
          <li><strong>Photo Upload:</strong> Easily attach multiple photos to each item</li>
          <li><strong>Receipt Storage:</strong> Keep digital copies of purchase receipts</li>
          <li><strong>Property Organization:</strong> Organize items by property and location</li>
          <li><strong>Secure Storage:</strong> Your data is encrypted and backed up</li>
          <li><strong>Easy Sharing:</strong> Share with insurance companies or family when needed</li>
        </ul>

        <h2>Maintaining Your Inventory</h2>
        <p>Creating your inventory is just the first step. To keep it valuable:</p>
        <ul>
          <li>Update it whenever you make significant purchases</li>
          <li>Review and update values annually</li>
          <li>Add new photos if items' condition changes</li>
          <li>Remove items you no longer own</li>
        </ul>

        <h2>Conclusion</h2>
        <p>A comprehensive digital home inventory is an investment in your financial security and peace of mind. While it may seem time-consuming to create initially, the protection it provides is invaluable. Start with your most valuable items and build from there - you'll be glad you did.</p>

        <p>Ready to start your digital home inventory? <a href="/auth">Sign up for Asset Safe</a> and protect what matters most.</p>
      `
    }
  };

  const post = slug ? blogPosts[slug] : null;

  if (!post) {
    return (
      <>
        <SEOHead title="Post Not Found | Asset Safe Blog" />
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-grow pt-20 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
              <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
              <Link to="/blog" className="text-primary hover:underline">
                ← Back to Blog
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${post.title} | Asset Safe Blog`}
        description={post.content.substring(0, 160).replace(/<[^>]*>/g, '')}
        canonicalUrl={`https://www.assetsafe.net/blog/${slug}`}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-grow pt-20">
          {/* Hero Image */}
          <div className="w-full h-64 md:h-96 relative overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          {/* Article Content */}
          <article className="container mx-auto px-4 -mt-16 relative z-10">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8">
                <CardContent className="p-8 md:p-12">
                  {/* Back Link */}
                  <Link 
                    to="/blog"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blog
                  </Link>

                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-4">
                    {post.category}
                  </Badge>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                    {post.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <div className="ml-auto">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div 
                    className="prose prose-lg max-w-none
                      prose-headings:text-foreground prose-headings:font-bold
                      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:text-muted-foreground prose-ul:my-4
                      prose-li:mb-2"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card className="bg-gradient-to-br from-primary/10 to-background mb-8">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Start Protecting Your Assets Today</h3>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of homeowners who trust Asset Safe to document and protect their valuable assets.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/auth">
                      <Button size="lg" className="w-full sm:w-auto">
                        Get Started Free
                      </Button>
                    </Link>
                    <Link to="/features">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;