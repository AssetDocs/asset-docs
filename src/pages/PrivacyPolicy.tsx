import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

/**
 * Public Asset Safe Privacy Policy.
 *
 * Content is grounded in existing, documented Asset Safe practices (Terms and
 * Conditions, Cookie Policy, retention/DSAR runbooks, and the services already
 * used in production). It intentionally avoids new legal commitments.
 */
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Privacy Policy | Asset Safe"
        description="How Asset Safe collects, uses, shares, and protects personal information, including email addresses collected for product updates, and how to exercise privacy rights."
        canonicalUrl="https://getassetsafe.com/privacy-policy"
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12 flex-grow max-w-4xl">
        <h1 className="text-3xl font-bold text-brand-blue mb-2">Asset Safe Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: September 7, 2026</p>

        <div className="prose prose-lg max-w-none
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-10 [&_h2]:mb-4
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3
          [&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-4
          [&_ul]:pl-8 [&_ul]:mb-4 [&_li]:text-foreground [&_li]:mb-1
        ">
          <p>
            This Privacy Policy explains how Ellidair LLC, doing business as Asset Safe ("Asset Safe," "we," "us," or "our"),
            collects, uses, shares, retains, and protects personal information in connection with the Asset Safe website,
            account dashboard, subscription services, storage services, and related communications and support
            (collectively, the "Service"). Asset Safe is operated by Ellidair LLC, a Texas limited liability company, and the
            Service is offered to users in the United States.
          </p>
          <p>
            This Privacy Policy is incorporated into the Asset Safe{' '}
            <Link to="/terms">Terms and Conditions</Link>. Cookie practices are described in our{' '}
            <Link to="/cookie-policy">Cookie Policy</Link>.
          </p>

          <h2>1. Information We Collect</h2>
          <h3>1.1 Information you provide</h3>
          <ul>
            <li>
              <strong>Email address for updates.</strong> If you ask to receive Asset Safe updates — including through the
              email signup form on our website — we collect the email address you submit so we can send you the updates you
              requested.
            </li>
            <li>
              <strong>Account information.</strong> When you create an account, we collect information such as your name,
              email address, password credentials, and account and authorized-user settings.
            </li>
            <li>
              <strong>Content you upload.</strong> Documents, photos, videos, records, notes, and other information you add
              to your account ("User Content").
            </li>
            <li>
              <strong>Billing information.</strong> Subscription, gift, and payment details. Card numbers are entered with
              and handled by our payment processor; Asset Safe does not store full payment card numbers.
            </li>
            <li>
              <strong>Support and inquiry information.</strong> Messages, feedback, and privacy or legal requests you send
              us.
            </li>
          </ul>

          <h3>1.2 Information collected automatically</h3>
          <ul>
            <li>Technical and device information such as IP address, browser type, and general usage and access records.</li>
            <li>Security, authentication, and activity records used to protect accounts and detect abuse.</li>
            <li>Cookie and similar technology data, as described in the <Link to="/cookie-policy">Cookie Policy</Link>.</li>
          </ul>

          <h2>2. How We Use Information</h2>
          <ul>
            <li>Provide, operate, secure, and improve the Service.</li>
            <li>
              Send the Asset Safe updates, early-access announcements, and relaunch or availability information you
              requested when you submitted your email address.
            </li>
            <li>
              Send operational and transactional messages relating to account creation, verification, security,
              subscriptions, renewals, billing, gifts, authorized-user invitations, account changes, cancellation, closure,
              deletion, privacy matters, legal notices, and service interruptions.
            </li>
            <li>Process payments, subscriptions, and gift purchases.</li>
            <li>Respond to support, privacy, legal, and content complaints.</li>
            <li>Detect, investigate, and prevent fraud, abuse, unauthorized access, and other security incidents.</li>
            <li>Comply with legal, tax, accounting, and recordkeeping obligations.</li>
          </ul>
          <p>Asset Safe does not sell private User Content.</p>

          <h2>3. Marketing And Update Emails</h2>
          <p>
            You can unsubscribe from Asset Safe marketing and update emails at any time using the unsubscribe link in those
            emails, or by emailing{' '}
            <a href="mailto:privacy@assetsafe.net">privacy@assetsafe.net</a>. Unsubscribing from marketing and update
            emails does not stop operational or transactional messages that are necessary to administer an existing account,
            subscription, or legal notice.
          </p>

          <h2>4. Service Providers</h2>
          <p>
            We use a limited number of service providers to operate the Service. They may process personal information on our
            behalf only to provide their services to us:
          </p>
          <ul>
            <li><strong>Supabase</strong> — application database, authentication, and file storage infrastructure.</li>
            <li><strong>Lovable</strong> — website and application hosting.</li>
            <li><strong>Stripe</strong> — payment, subscription, and gift processing.</li>
            <li><strong>Resend</strong> — transactional and operational email delivery.</li>
            <li><strong>ActiveCampaign</strong> — contact management and update or marketing email delivery.</li>
          </ul>
          <p>
            We may also disclose information when required by law or valid legal process, to protect rights, safety, or the
            security of the Service, or in connection with a business transaction, subject to the protections described in
            this Policy.
          </p>

          <h2>5. Security</h2>
          <p>
            Asset Safe uses access controls, authentication, encryption in transit and at rest, role-based permissions, audit
            logging, and SOC 2–aligned practices to protect information. No method of transmission or storage is completely
            secure, so we cannot guarantee absolute security.
          </p>

          <h2>6. Retention</h2>
          <p>
            We retain personal information only as long as reasonably necessary for the purposes described in this Policy and
            the <Link to="/terms">Terms and Conditions</Link>, subject to legal, security, tax, operational, backup, dispute,
            and litigation-hold requirements. Email addresses collected for updates are retained until you unsubscribe or ask
            us to delete them, and then only as needed to honor that request.
          </p>

          <h2>7. Your Privacy Choices And Rights</h2>
          <p>
            Depending on your state of residence and applicable law, you may have the right to request access to, correction
            of, a copy of, deletion of, or limits on the use of your personal information, and to appeal a decision on your
            request.
          </p>
          <p>
            To submit a request, email <a href="mailto:privacy@assetsafe.net">privacy@assetsafe.net</a>. We verify identity
            and authority before disclosing, exporting, correcting, or deleting information, and we may apply legally
            permitted exceptions such as legal holds or retention obligations. Asset Safe's operational policy is to complete
            a verified privacy erasure request within 30 days of receipt, subject to verification and those exceptions.
          </p>

          <h2>8. Children</h2>
          <p>
            The Service is not directed to children under 13, and we do not knowingly collect personal information from
            them. Account holders must meet the eligibility requirements in the Terms and Conditions.
          </p>

          <h2>9. Changes To This Policy</h2>
          <p>
            We may update this Privacy Policy. When we make a material change, we will update the "Last Updated" date above
            and, where appropriate or required, provide additional notice.
          </p>

          <h2>10. Contact Us</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200">
              <tbody>
                <tr className="border-b"><th className="text-left p-2 bg-gray-50 w-1/3">Company</th><td className="p-2">Ellidair LLC d/b/a Asset Safe</td></tr>
                <tr className="border-b"><th className="text-left p-2 bg-gray-50">Mailing address</th><td className="p-2">5900 Balcones Drive, Suite 30142, Austin, Texas 78731, United States</td></tr>
                <tr className="border-b"><th className="text-left p-2 bg-gray-50">Privacy inquiries</th><td className="p-2"><a href="mailto:privacy@assetsafe.net">privacy@assetsafe.net</a></td></tr>
                <tr><th className="text-left p-2 bg-gray-50">General support</th><td className="p-2"><a href="mailto:support@assetsafe.net">support@assetsafe.net</a></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
