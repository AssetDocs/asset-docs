
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">What Our Customers Say</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Real stories from real customers who trust Asset Docs to protect their valuable assets.
          </p>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "I never knew a service like this existed! I'm so grateful I found them before it was too late! I've told all of my friends and family about Asset Docs."
              </blockquote>
              <cite className="text-brand-blue font-semibold">— Mark S.</cite>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "I wish I had discovered Asset Docs before our home was destroyed. Now, every member of my family has their possessions securely documented with Asset Docs."
              </blockquote>
              <cite className="text-brand-blue font-semibold">— Maria G.</cite>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "We've invested so much in our small business, and now I can rest easy knowing the claims process will be hassle-free if anything happens."
              </blockquote>
              <cite className="text-brand-blue font-semibold">— Business Owner</cite>
            </div>
            
            {/* Testimonial 4 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "Managing rentals is tough, but with Asset Docs, tracking property condition before and after tenants is quick and easy!"
              </blockquote>
              <cite className="text-brand-blue font-semibold">— Susan H.</cite>
            </div>
            
            {/* Testimonial 5 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "I run a small construction company and used to worry about lost, stolen, or damaged equipment. With Asset Docs, I know exactly what I own and what it's worth—one less thing to stress about."
              </blockquote>
              <cite className="text-brand-blue font-semibold">— James T.</cite>
            </div>
            
            {/* Testimonial 6 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "At just $12 a month, it's a no-brainer - I spend more than that on my morning coffee and bagel"
              </blockquote>
              <cite className="text-brand-blue font-semibold">— Charlotte B.</cite>
            </div>
            
            {/* Testimonial 7 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "As a creative professional, I manage passwords for more than 150 websites. Having a secure place to store not only my financial and business account details, but also all of those login credentials, is essential."
              </blockquote>
              <cite className="text-brand-blue font-semibold">— Cambria S.</cite>
            </div>
            
            {/* Testimonial 8 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "At first, I thought uploading all my information would take forever. Instead, I had every asset secured with Asset Docs in less than two weekends."
              </blockquote>
              <cite className="text-brand-blue font-semibold">— Todd W.</cite>
            </div>
            
            {/* Testimonial 9 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "In the mortgage world, a complete and organized list of assets can determine whether a transaction succeeds or falls apart. I suggest Asset Docs to customers every chance I get"
              </blockquote>
              <cite className="text-brand-blue font-semibold">— Navida Y.</cite>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-brand-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Satisfied Customers</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Experience the peace of mind that comes with comprehensive asset documentation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/signup" className="bg-white text-orange-500 hover:bg-gray-100 px-6 py-3 rounded-md font-medium">
              Start Your Free Trial
            </a>
            <a href="/pricing" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium">
              View Pricing
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Testimonials;
