import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const CookiePolicy: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Cookie Policy | Asset Safe"
        description="Learn how Asset Safe uses cookies to improve your experience. Manage your cookie preferences and understand our data practices."
        keywords="cookie policy, cookies, data privacy, cookie preferences, asset safe privacy"
        canonicalUrl="https://www.getassetsafe.com/cookie-policy"
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold text-brand-blue mb-8">Cookie Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They help 
              websites remember your preferences, understand how you use the site, and provide a better user experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p>
              Asset Safe uses cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> These are necessary for the website to function properly. 
                They enable core functionality such as security, account authentication, and session management. 
                These cookies cannot be disabled.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> With your consent, we use analytics cookies to understand 
                how visitors interact with our website. This helps us improve our services and user experience.
              </li>
              <li>
                <strong>Marketing Cookies:</strong> With your consent, these cookies are used to track visitors 
                across websites and display relevant advertisements. We may share this data with third-party 
                advertising partners.
              </li>
              <li>
                <strong>Functional Cookies:</strong> These cookies enable enhanced functionality and personalization, 
                such as remembering your preferences and settings.
              </li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Session Cookies</h3>
            <p>
              These are temporary cookies that expire when you close your browser. They are used to maintain 
              your session while you navigate our website.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Persistent Cookies</h3>
            <p>
              These cookies remain on your device for a set period or until you delete them. They help us 
              remember your preferences and settings for future visits.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Third-Party Cookies</h3>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We use services like 
              analytics providers and marketing platforms that may set their own cookies.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
            <p>
              When you first visit our website, you will see a cookie consent banner that allows you to accept 
              or reject different categories of cookies. You can change your preferences at any time by:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Clicking the cookie settings link in the website footer</li>
              <li>Adjusting your browser settings to block or delete cookies</li>
              <li>Using browser extensions that manage cookie consent</li>
            </ul>
            <p className="mt-4">
              Please note that blocking certain cookies may impact your experience on our website and limit 
              the services we can provide.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Browser Settings</h2>
            <p>
              Most web browsers allow you to control cookies through their settings. You can typically find 
              these settings in the "Options," "Preferences," or "Settings" menu of your browser. The following 
              links provide information on how to manage cookies in popular browsers:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for 
              other operational, legal, or regulatory reasons. We encourage you to review this page periodically 
              to stay informed about our use of cookies.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please{' '}
              <Link to="/contact" className="text-brand-blue hover:underline">contact us</Link>.
            </p>
          </section>
          
          <p className="mt-8 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;
