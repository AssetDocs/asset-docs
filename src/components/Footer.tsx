import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Smartphone, Video } from 'lucide-react';
import { audienceNavGroupLabel, audienceNavLinks } from '@/data/audienceNav';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const linkClass = 'text-gray-300 hover:text-white transition-colors text-sm';
const subHeadClass = 'text-md font-medium text-gray-200 mb-2';
const listClass = 'space-y-1';

const SocialIcons: React.FC = () => (
  <div className="flex space-x-4">
    <a href="https://www.facebook.com/getassetsafe" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
      <span className="sr-only">Facebook</span>
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    </a>
    <a href="https://x.com/AssetSafe" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
      <span className="sr-only">X (Twitter)</span>
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </a>
    <a href="https://www.youtube.com/@Asset-Safe" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
      <span className="sr-only">YouTube</span>
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    </a>
    <a href="https://www.instagram.com/getassetsafe" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
      <span className="sr-only">Instagram</span>
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.28.073-1.689.073-4.948 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    </a>
  </div>
);

const ContactBlock: React.FC = () => (
  <div>
    <address className="not-italic text-gray-300">
      <p className="mb-2">McKinney, Texas</p>
      <p className="mb-4">United States</p>
    </address>
  </div>
);

const ChatSupportLine: React.FC = () => (
  <div className="flex items-center space-x-2">
    <MessageCircle className="h-6 w-6 text-brand-green" />
    <span className="text-gray-300 text-sm">Ask Ashley — Chat support available</span>
  </div>
);

const QuickLinksContent: React.FC = () => (
  <>
    <div className="mb-4">
      <h4 className={subHeadClass}>Services</h4>
      <ul className={listClass}>
        <li><Link to="/features" className={linkClass}>All Features</Link></li>
        <li><Link to="/pricing" className={linkClass}>Pricing</Link></li>
        <li><Link to="/gift" className={linkClass}>Gift Subscriptions</Link></li>
        <li><Link to="/testimonials" className={linkClass}>Testimonials</Link></li>
      </ul>
    </div>
    <div>
      <h4 className={subHeadClass}>Support</h4>
      <ul className={listClass}>
        <li><Link to="/qa" className={linkClass}>FAQs</Link></li>
        <li><Link to="/contact" className={linkClass}>Contact</Link></li>
        <li><Link to="/account-assistance" className={linkClass}>Account Assistance</Link></li>
        <li>
          <Link to="/install" className={`${linkClass} flex items-center gap-1`}>
            <Smartphone className="h-3 w-3" />
            Add to Home Screen
          </Link>
        </li>
        <li>
          <Link to="/video-help" className={`${linkClass} flex items-center gap-1`}>
            <Video className="h-3 w-3" />
            Video Help
          </Link>
        </li>
      </ul>
    </div>
  </>
);

const WhoItsForContent: React.FC = () => (
  <ul className={listClass}>
    {audienceNavLinks.map((link) => (
      <li key={link.href}>
        <Link to={link.href} className={linkClass}>{link.label}</Link>
      </li>
    ))}
    <li><Link to="/features#industries" className={linkClass}>Industry Applications</Link></li>
  </ul>
);

const GuidesContent: React.FC = () => (
  <ul className={listClass}>
    <li><Link to="/blog" className={linkClass}>Blog</Link></li>
    <li><Link to="/resources" className={linkClass}>Resources</Link></li>
    <li><Link to="/awareness-guide" className={linkClass}>Awareness Guide</Link></li>
    <li><Link to="/glossary" className={linkClass}>Glossary</Link></li>
  </ul>
);

const DocsClaimsContent: React.FC = () => (
  <ul className={listClass}>
    <li><Link to="/asset-documentation" className={linkClass}>Asset Documentation</Link></li>
    <li><Link to="/claims" className={linkClass}>Claims</Link></li>
    <li><Link to="/scenarios" className={linkClass}>Scenarios</Link></li>
    <li><Link to="/state-requirements" className={linkClass}>State Requirements</Link></li>
    <li><Link to="/industry-requirements" className={linkClass}>Industry Requirements</Link></li>
  </ul>
);

const AboutContent: React.FC = () => (
  <>
    <ul className={`${listClass} mb-4`}>
      <li><Link to="/about" className={linkClass}>About Us</Link></li>
      <li><Link to="/social-impact" className={linkClass}>Social Impact</Link></li>
      <li><Link to="/features-list" className={linkClass}>Technical</Link></li>
    </ul>
    <div>
      <h4 className={subHeadClass}>Legal</h4>
      <ul className={listClass}>
        <li><Link to="/legal" className={linkClass}>Legal & Ethical Considerations</Link></li>
        <li><Link to="/terms" className={linkClass}>Terms of Use</Link></li>
        <li><Link to="/cookie-policy" className={linkClass}>Cookie Policy</Link></li>
        <li><Link to="/admin" className={linkClass}>Admin</Link></li>
      </ul>
    </div>
  </>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-darkGray text-white py-12">
      <div className="container mx-auto px-4">
        {/* Desktop: 7-column grid */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Get Social</h3>
            <div className="mb-6">
              <SocialIcons />
            </div>
            <h4 className={subHeadClass}>Contact Us</h4>
            <ContactBlock />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <QuickLinksContent />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{audienceNavGroupLabel}</h3>
            <WhoItsForContent />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Guides &amp; Resources</h3>
            <GuidesContent />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Documentation &amp; Claims</h3>
            <DocsClaimsContent />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <AboutContent />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support &amp; Contact</h3>
            <div className="mb-4">
              <h4 className={subHeadClass}>Chat Support</h4>
              <ChatSupportLine />
            </div>
            <h4 className={subHeadClass}>Contact Us</h4>
            <ContactBlock />
          </div>
        </div>

        {/* Mobile & tablet: accordion */}
        <div className="lg:hidden">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Get Social</h3>
            <SocialIcons />
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="quick-links" className="border-gray-700">
              <AccordionTrigger className="text-base font-semibold text-white hover:no-underline py-3">
                Quick Links
              </AccordionTrigger>
              <AccordionContent>
                <QuickLinksContent />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="who-its-for" className="border-gray-700">
              <AccordionTrigger className="text-base font-semibold text-white hover:no-underline py-3">
                {audienceNavGroupLabel}
              </AccordionTrigger>
              <AccordionContent>
                <WhoItsForContent />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="guides-resources" className="border-gray-700">
              <AccordionTrigger className="text-base font-semibold text-white hover:no-underline py-3">
                Guides &amp; Resources
              </AccordionTrigger>
              <AccordionContent>
                <GuidesContent />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="docs-claims" className="border-gray-700">
              <AccordionTrigger className="text-base font-semibold text-white hover:no-underline py-3">
                Documentation &amp; Claims
              </AccordionTrigger>
              <AccordionContent>
                <DocsClaimsContent />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="about" className="border-gray-700">
              <AccordionTrigger className="text-base font-semibold text-white hover:no-underline py-3">
                About
              </AccordionTrigger>
              <AccordionContent>
                <AboutContent />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support-contact" className="border-gray-700">
              <AccordionTrigger className="text-base font-semibold text-white hover:no-underline py-3">
                Support &amp; Contact
              </AccordionTrigger>
              <AccordionContent>
                <ContactBlock />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Asset Safe. A product of Ellidair LLC. Developed in Texas, USA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
