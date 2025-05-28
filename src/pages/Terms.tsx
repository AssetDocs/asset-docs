import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold text-brand-blue mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Terms</h2>
            <p>
              By accessing this web site, you are agreeing to be bound by these web site Terms and Conditions of Use, 
              all applicable laws and regulations, and agree that you are responsible for compliance with any 
              applicable local laws. If you do not agree with any of these terms, you are prohibited from using or 
              accessing this site. The materials contained in this web site are protected by applicable copyright 
              and trademark law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Copyright Notice</h2>
            <p>
              All content, materials, software, source code, algorithms, proprietary information, designs, graphics, 
              text, images, videos, audio files, data, databases, third-party integrations, APIs, and other intellectual 
              property contained within this website and application are the exclusive property of AssetDocs (AD) and 
              are protected by United States federal copyright laws, international copyright treaties, and other applicable 
              intellectual property laws.
            </p>
            <p className="mt-4">
              The unauthorized reproduction, distribution, modification, public display, public performance, preparation 
              of derivative works, or any other use of copyrighted material without the express written consent of 
              AssetDocs (AD) is strictly prohibited and may result in severe civil and criminal penalties. This includes, 
              but is not limited to, any disclosure, distribution, reverse engineering, decompilation, or extraction of 
              ideas, concepts, methodologies, source code, or proprietary algorithms contained within this application.
            </p>
            <p className="mt-4">
              All rights reserved. No part of this website, application, or its underlying technology may be used, 
              copied, or distributed in any form or by any means without prior written permission from AssetDocs (AD). 
              Violation of these copyright protections may subject the violator to legal action and monetary damages.
            </p>
            <p className="mt-4">
              © 2025 AssetDocs (AD). All rights reserved under U.S. and international copyright law.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
            <p>
              The materials on AssetDocs (AD) web site are provided "as is". (AD) makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties, including without 
              limitation, implied warranties or conditions of merchantability for a particular purpose, or 
              non-infringement of intellectual property or other violation of rights. Further, (AD) does not 
              warrant or make any representations concerning the accuracy, likely results, or reliability of 
              the use of the materials on its Internet web site or otherwise relating to such materials or on 
              any sites linked to this site.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
            <p>
              In no event shall (AD) or its representatives be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption), arising out 
              of the use or inability to use the materials on (AD) Internet site, even if (AD) or an (AD) 
              representative has been notified orally or in writing of the possibility of such damage. Because 
              some jurisdictions do not allow limitations on implied warranties, or limitations of liability 
              for consequential or incidental damages, these limitations may not apply to you.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Revisions and Errata</h2>
            <p>
              The materials appearing on (AD) website could include technical, typographical, or photographic 
              errors. (AD) does not warrant that any of the materials on its web site are accurate, complete, 
              or current. (AD) may make changes to the materials contained on its website at any time without 
              notice. (AD) does not, however, make any commitment to update the materials.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Links</h2>
            <p>
              (AD) has not reviewed all of the sites linked to its Internet web site and is not responsible 
              for the contents of any such linked site. The inclusion of any link does not imply endorsement 
              by (AD) of the site. Use of any such linked web site is at the user's own risk.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Site Terms of Use Modifications</h2>
            <p>
              (AD) may revise these terms of use for its web site at any time without notice. By using this 
              web site you are agreeing to be bound by the then current version of these Terms and Conditions 
              of Use.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
            <p>
              Any claim relating to (AD) web site shall be governed by the laws of the State of Texas without 
              regard to its conflict of law provisions. General Terms and Conditions applicable to Use of a 
              Web Site.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Privacy Policy</h2>
            <p>
              Your privacy is very important to us. Accordingly, we have developed this Policy in order for 
              you to understand how we collect, use, communicate and disclose and make use of personal information. 
              The following outlines our privacy policy:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                Before or at the time of collecting personal information, we will identify the purposes for 
                which information is being collected.
              </li>
              <li>
                We will collect and use personal information solely with the objective of fulfilling those 
                purposes specified by us and for other compatible purposes, unless we obtain the consent of 
                the individual concerned or as required by law.
              </li>
              <li>
                We will only retain personal information as long as necessary for the fulfillment of those purposes.
              </li>
              <li>
                We will collect personal information by lawful and fair means and, where appropriate, with the 
                knowledge or consent of the individual concerned.
              </li>
              <li>
                Personal data should be relevant to the purposes for which it is to be used, and, to the extent 
                necessary for those purposes, should be accurate, complete, and up-to-date.
              </li>
              <li>
                We will protect personal information by reasonable security safeguards against loss or theft, 
                as well as unauthorized access, disclosure, copying, use or modification.
              </li>
              <li>
                We will make readily available to customers information about our policies and practices 
                relating to the management of personal information.
              </li>
            </ul>
            <p className="mt-4">
              We are committed to conducting our business in accordance with these principles in order to ensure 
              that the confidentiality of personal information is protected and maintained.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
