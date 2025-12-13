import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import ChatbotInterface from '@/components/ChatbotInterface';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const QA: React.FC = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about Asset Safe or chat with our AI assistant for specific inquiries.
          </p>
          
          <div className="mb-10">
            <Accordion type="single" collapsible className="mb-8">
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">How secure is my property documentation?</AccordionTrigger>
                <AccordionContent>
                  Asset Safe uses enterprise-grade encryption and secure cloud storage to protect your valuable 
                  documentation. All data is encrypted both in transit and at rest, and we implement strict access 
                  controls to ensure your information remains private and secure at all times. Our security protocols 
                  are regularly audited and updated to maintain the highest standards of data protection.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">Can I use Asset Safe for inventory management or business operations?</AccordionTrigger>
                <AccordionContent>
                  No, Asset Safe is specifically designed for property documentation and insurance protection, not 
                  inventory management or business operations. Our platform focuses on helping property owners 
                  create comprehensive documentation of their personal assets for insurance claims, estate planning, 
                  and financial records. For business inventory management, we recommend using dedicated inventory 
                  management software that is designed for tracking business assets and operations.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">Can I use Asset Safe for insurance claims?</AccordionTrigger>
                <AccordionContent>
                  Yes! Asset Safe is specifically designed to help with insurance claims. Our third-party verification 
                  process creates legally valid documentation of your assets that can expedite claims processing. 
                  You can generate detailed reports that include proof of ownership, condition documentation, and 
                  value assessments that most insurance companies accept as valid evidence during claims.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">Is my data backed up and what happens if I cancel?</AccordionTrigger>
                <AccordionContent>
                  Yes, all your data is automatically backed up across multiple secure data centers with 99.9% uptime. 
                  If you cancel your subscription, you'll have until the end of your billing cycle to download all your documentation and data.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">How does receipt integration work?</AccordionTrigger>
                <AccordionContent>
                  When you upload photos of your possessions, you can also upload associated receipts. Our system 
                  will automatically match receipts with the correct items in your inventory, creating a comprehensive 
                  record that includes both visual documentation and proof of purchase.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">What types of assets can I document?</AccordionTrigger>
                <AccordionContent>
                  Asset Safe supports documentation of virtually any physical asset, including electronics, furniture, 
                  artwork, jewelry, collectibles, appliances, vehicles, and real estate.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">How do I get started with Asset Safe?</AccordionTrigger>
                <AccordionContent>
                  Getting started is easy! Subscribe to a plan and start using our web platform. 
                  You can begin documenting your possessions right away by taking photos, videos, and uploading documents.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-medium">Can I share my documentation with others?</AccordionTrigger>
                <AccordionContent>
                  Yes, Asset Safe allows you to securely share selected documentation with specified parties, such as 
                  insurance agents, estate planners, or family members. You can control exactly what information is 
                  shared and for how long, and you can revoke access at any time. This feature is particularly useful 
                  when filing insurance claims or during estate planning.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9">
                <AccordionTrigger className="text-lg font-medium">If I have a drawer or shelf full of tools, kitchen goods, movies, etc. Do I need a photo of every item?</AccordionTrigger>
                <AccordionContent>
                  Apart from higher-priced or specialty items, it is not always necessary to document every individual item. 
                  For instance, a kitchen drawer full of forks and knives, a shelf of DVDs or CDs, or a shelf of garage 
                  tools and equipment, you'll likely only need a wide-angle photo showing the collection. You can then 
                  manually enter the estimated value of the items shown as a whole, making the documentation process 
                  more efficient while still maintaining adequate records for insurance purposes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10">
                <AccordionTrigger className="text-lg font-medium">What support options are available?</AccordionTrigger>
                <AccordionContent>
                  We offer comprehensive support including a 24/7 chat feature and email assistance. We also 
                  provide video tutorials and resource information under the References section in the footer, 
                  to help you get the most out of Asset Safe.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-11">
                <AccordionTrigger className="text-lg font-medium">Can I cancel my subscription at any time?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can cancel your subscription at any time. Your documentation will remain accessible until the end of your billing period.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-12">
                <AccordionTrigger className="text-lg font-medium">What is included in my subscription?</AccordionTrigger>
                <AccordionContent>
                  Your subscription includes full access to all features:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Photo and video uploads</li>
                    <li>Full web platform access</li>
                    <li>Voice notes for item details</li>
                    <li>Post damage documentation</li>
                    <li>Export detailed reports</li>
                    <li>Email support</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-14">
                <AccordionTrigger className="text-lg font-medium">Can I upgrade or downgrade my plan?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can change your plan at any time. When upgrading, you'll have immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-15">
                <AccordionTrigger className="text-lg font-medium">How much storage do I need?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">
                    Storage needs vary based on file types and usage. Here&apos;s a quick reference for our plans:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Storage</th>
                          <th className="text-left py-2">Photos (3MB)</th>
                          <th className="text-left py-2">1080p Video</th>
                          <th className="text-left py-2">4K Video</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600">
                        <tr className="border-b">
                          <td className="py-2 font-medium">25GB</td>
                          <td className="py-2">~8,300</td>
                          <td className="py-2">~0.42 hours (25 min)</td>
                          <td className="py-2">~6.5 minutes</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">100GB</td>
                          <td className="py-2">~33,300</td>
                          <td className="py-2">~1.67 hours (100 min)</td>
                          <td className="py-2">~26 minutes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Legacy Locker Section */}
              <AccordionItem value="item-16">
                <AccordionTrigger className="text-lg font-medium">What is the Legacy Locker?</AccordionTrigger>
                <AccordionContent>
                  The Legacy Locker is a secure, private vault inside Asset Safe where you can organize important personal information for loved ones—photos, videos, notes, access details, and other clarifying documents. It is designed to provide context and guidance alongside your official estate plans.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-17">
                <AccordionTrigger className="text-lg font-medium">Is the Legacy Locker a legal will?</AccordionTrigger>
                <AccordionContent>
                  No. The Legacy Locker is not a legally recognized will or e-will. Instead, it acts as supporting evidence—helping your executor, family, and trusted contacts better understand your wishes with added detail and documentation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-18">
                <AccordionTrigger className="text-lg font-medium">What kind of information can I store in the Legacy Locker?</AccordionTrigger>
                <AccordionContent>
                  You can store personal messages, executor and guardian details, asset notes, property information, wish statements, financial account summaries, passwords, voice notes, photos, videos, and uploaded documents. Anything that helps tell the story behind your intentions belongs here.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-19">
                <AccordionTrigger className="text-lg font-medium">Why is the Legacy Locker valuable?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Wills state what you want — your Legacy Locker shows why and how.</p>
                  <p>It removes guesswork, reduces stress on your family, and provides an organized record of your wishes with real-life documentation to support your estate plans.</p>
                </AccordionContent>
              </AccordionItem>
              
              {/* Legacy Locker Encryption & Recovery Section */}
              <AccordionItem value="item-19a">
                <AccordionTrigger className="text-lg font-medium">Legacy Locker Encryption & Recovery</AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="encrypt-1" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        What happens if I encrypt my Legacy Locker—can my spouse or executor still access it if something happens to me?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Yes. If you choose to encrypt your Legacy Locker, you can also assign a Recovery Delegate (such as a spouse, child, or executor). They cannot see your encrypted information while you're alive, but they can request access if you become unable to manage your account. After a short grace period, their access will be securely approved so they can unlock your encrypted vault.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encrypt-2" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        What is a Recovery Delegate?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        A Recovery Delegate is a trusted person you choose who can unlock your encrypted Legacy Locker only if you can't—such as due to illness, incapacity, or death. They do not have immediate access, and they cannot see your data unless a recovery request is approved.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encrypt-3" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        How does a Recovery Delegate request access?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        If your Legacy Locker is encrypted, your delegate will see a button labeled "Request Access." They'll submit a short request explaining why access is needed. You'll receive a notification, and if you don't respond within your chosen grace period (usually 7–30 days), access will be granted to them automatically.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encrypt-4" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        What happens if I'm still able to respond?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        If you're available and you reject the access request, your encrypted Legacy Locker stays private and locked. You remain in complete control as long as you're able to manage your account.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encrypt-5" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        What happens if I pass away?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        If you have already assigned a Recovery Delegate (such as your spouse), they simply submit an access request through Asset Safe. If the account owner does not respond during the grace period, the system will automatically approve access—allowing your delegate to unlock your encrypted Legacy Locker.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encrypt-6" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        Does Asset Safe ever see or store my encryption password?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        No. Asset Safe uses a zero-knowledge encryption architecture. That means we never see, store, or have access to your encryption keys or vault contents. Only you—and your approved Recovery Delegate when necessary—can decrypt your Legacy Locker.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encrypt-7" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        What if I don't assign a Recovery Delegate?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        If you don't choose a Recovery Delegate, nobody (including Asset Safe) will be able to access your encrypted Legacy Locker if you pass away. To prevent permanent lockout, we highly recommend adding at least one trusted delegate.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encrypt-8" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        Can I change my Recovery Delegate later?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Absolutely. You can update or remove your Recovery Delegate at any time from your Legacy Locker settings. If you remove a delegate, previously encrypted access keys are automatically invalidated.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encrypt-9" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        Does encryption affect other contributors on my account?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        No. Contributors and admins still have access to the standard areas of your Asset Safe account. Encryption applies only to your private Legacy Locker data—and only the owner or an approved Recovery Delegate can unlock it.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
              
              {/* Contributors Section */}
              <AccordionItem value="item-20">
                <AccordionTrigger className="text-lg font-medium">Who can I add as a contributor?</AccordionTrigger>
                <AccordionContent>
                  You can invite trusted individuals—family members, friends, financial professionals, or advisors—to collaborate on your Asset Safe account. You control exactly what each contributor can see or update.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-21">
                <AccordionTrigger className="text-lg font-medium">What are the access levels?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">Asset Safe offers tiered access options, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>View Only</strong> – Contributor can see selected items but cannot edit anything.</li>
                    <li><strong>Edit Access</strong> – Contributor can add, update, or organize information you allow them to manage.</li>
                    <li><strong>Administrator Access</strong> – Full access to all features and settings, including the ability to manage other contributors.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-22">
                <AccordionTrigger className="text-lg font-medium">Can contributors see my Legacy Locker?</AccordionTrigger>
                <AccordionContent>
                  Only if you authorize it. Your Legacy Locker is private by default, and you can choose whether contributors have full access, partial access, or no access at all.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-23">
                <AccordionTrigger className="text-lg font-medium">Can I revoke access at any time?</AccordionTrigger>
                <AccordionContent>
                  Yes. You can instantly remove or adjust a contributor&apos;s permissions from your dashboard with one click.
                </AccordionContent>
              </AccordionItem>
              
              {/* Password & Accounts Catalog Section */}
              <AccordionItem value="item-24">
                <AccordionTrigger className="text-lg font-medium">What is the Password and Accounts Catalog?</AccordionTrigger>
                <AccordionContent>
                  It&apos;s a secure, encrypted list where you can document login credentials, account numbers, PINs, digital subscriptions, financial accounts, and other access information your loved ones may need in the event of an emergency.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-25">
                <AccordionTrigger className="text-lg font-medium">Is my password information encrypted?</AccordionTrigger>
                <AccordionContent>
                  Yes. Everything in the Password and Accounts Catalog is encrypted at rest and in transit. Only you—and anyone you explicitly grant access—can view this information.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-26">
                <AccordionTrigger className="text-lg font-medium">Why should I store my passwords here instead of on paper or in a notes app?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Paper gets lost. Notes apps aren&apos;t secure.</p>
                  <p>Asset Safe gives you one organized, encrypted place to store digital access information to protect your family from getting locked out of essential accounts.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-27">
                <AccordionTrigger className="text-lg font-medium">Can contributors access my password list?</AccordionTrigger>
                <AccordionContent>
                  Only if you manually enable it. You decide who can view, edit, or be restricted from this section entirely.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-28">
                <AccordionTrigger className="text-lg font-medium">What types of accounts can I store?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">Anything you want loved ones or an executor to find easily:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Banking & investment accounts</li>
                    <li>Mortgage & insurance logins</li>
                    <li>Email & social accounts</li>
                    <li>Utilities & subscriptions</li>
                    <li>Medical portals</li>
                    <li>Cloud storage and photo accounts</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              {/* Trust Information Section */}
              <AccordionItem value="item-29">
                <AccordionTrigger className="text-lg font-medium">What is the Trust Information section?</AccordionTrigger>
                <AccordionContent>
                  The Trust Information section is a secure place to organize and store important details about your family trust, including trustees, beneficiaries, and supporting legal documents. It doesn&apos;t replace your legally executed trust—it keeps everything easy to access when your loved ones need it most.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-30">
                <AccordionTrigger className="text-lg font-medium">Does Trust Information replace my official trust document?</AccordionTrigger>
                <AccordionContent>
                  No. Your signed trust documents remain the official legal version. The information stored here provides a quick reference and ensures your trustees and family can easily locate and understand the important details in an emergency.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-31">
                <AccordionTrigger className="text-lg font-medium">What if my trust includes sensitive legal instructions?</AccordionTrigger>
                <AccordionContent>
                  You can choose to encrypt any or all information within this section. Encrypted details can only be unlocked using your personal master key or a trusted access process you designate.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-32">
                <AccordionTrigger className="text-lg font-medium">Who can access the Trust Information section?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">Only those you explicitly grant permission to. By default:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Only you can edit the information</li>
                    <li>Trustees and Executors (if invited by you) may have read-only access</li>
                    <li>Other Contributors do not see this section unless you allow it</li>
                  </ul>
                  <p className="mt-3">Your privacy settings are always in your control.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-33">
                <AccordionTrigger className="text-lg font-medium">What documents should I upload to Trust Information?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">Most families include:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>The signed trust document</li>
                    <li>Any amendments or attachments</li>
                    <li>Certification of trust</li>
                    <li>Property deeds assigned to the trust</li>
                    <li>Trustee instruction sheets</li>
                    <li>Contact and storage info for the original documents</li>
                  </ul>
                  <p className="mt-3">These uploads help ensure nothing is lost during stressful or emotional times.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-34">
                <AccordionTrigger className="text-lg font-medium">Do I need to list every asset in my trust?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">You can—but you don&apos;t have to. You can:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Link assets already documented in your Asset Safe inventory</li>
                    <li>Add new assets and mark whether they belong to the trust</li>
                    <li>Provide simple notes like &quot;All home contents distributed equally&quot;</li>
                  </ul>
                  <p className="mt-3">Completeness helps reduce confusion for your family.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-35">
                <AccordionTrigger className="text-lg font-medium">Can Asset Safe notify me if my trust information is incomplete?</AccordionTrigger>
                <AccordionContent>
                  Yes. If something important is missing—like beneficiary assignments or successor trustees—we&apos;ll display a gentle alert and offer guidance on what to update.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-36">
                <AccordionTrigger className="text-lg font-medium">What happens if I update my trust in the future?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">You can easily:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Upload new versions of documents</li>
                    <li>Update trustees or beneficiaries</li>
                    <li>Add or adjust assets</li>
                  </ul>
                  <p className="mt-3">We&apos;ll keep a record of changes so your information stays accurate over time.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-37">
                <AccordionTrigger className="text-lg font-medium">Do I still need an attorney for my trust?</AccordionTrigger>
                <AccordionContent>
                  Yes, we strongly recommend working with a qualified estate attorney to create or revise your trust. Legacy Locker helps you manage and organize your trust—your attorney ensures it&apos;s legally enforceable.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-38">
                <AccordionTrigger className="text-lg font-medium">What if I don&apos;t have a trust yet?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">No problem! This section can help you begin planning. You can:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Learn what information is involved</li>
                    <li>Record future intentions</li>
                    <li>Gather attorney contacts</li>
                    <li>Prepare for a trust when the time is right</li>
                  </ul>
                  <p className="mt-3">This way, you&apos;re a step ahead whenever you&apos;re ready.</p>
                </AccordionContent>
              </AccordionItem>
              
              {/* Two-Step Authentication Section */}
              <AccordionItem value="item-39">
                <AccordionTrigger className="text-lg font-medium">🔐 Why Does Asset Safe Require Two-Step Authentication?</AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="2fa-1" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        What type of two-factor authentication does Asset Safe use?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Asset Safe uses TOTP (Time-based One-Time Password) authentication via authenticator apps like Google Authenticator, Authy, or 1Password. This is more secure than SMS and works even without cell service.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="2fa-2" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        Will I have to enter a verification code every time I log in?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        No. After verifying your email during signup, you can browse your dashboard and most features without extra authentication. TOTP verification is only required for sensitive actions like accessing the Secure Vault.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="2fa-3" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        When will Asset Safe ask for an extra verification code?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        <p className="mb-4">Only when you&apos;re doing something that could impact your privacy, assets, or financial security:</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 pr-4">Action</th>
                                <th className="text-left py-2 pr-4">Authenticator Required?</th>
                                <th className="text-left py-2">Why</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2 pr-4">Creating an account / first login</td>
                                <td className="py-2 pr-4">❌</td>
                                <td className="py-2">Email verification is sufficient for signup</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 pr-4">Accessing general dashboard features</td>
                                <td className="py-2 pr-4">❌</td>
                                <td className="py-2">Keep experience fast and smooth</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 pr-4">Opening Secure Vault or Legacy Locker</td>
                                <td className="py-2 pr-4">✔️</td>
                                <td className="py-2">Protect sensitive data like documents, passwords, and personal notes</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 pr-4">Updating billing or subscriptions</td>
                                <td className="py-2 pr-4">✔️</td>
                                <td className="py-2">Prevent unauthorized purchases or changes</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 pr-4">Adding trusted contacts or contributors</td>
                                <td className="py-2 pr-4">✔️</td>
                                <td className="py-2">Ensure only approved people gain access</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-4">Changing your email or password</td>
                                <td className="py-2 pr-4">✔️</td>
                                <td className="py-2">Protect your account recovery options</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="2fa-4" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        What if I lose access to my authenticator app?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Your verified email and trusted contacts provide secure backup methods to help you regain access. You can also remove and re-setup your authenticator from the Security tab in Account Settings.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="2fa-5" className="border-b-0">
                      <AccordionTrigger className="text-base font-medium">
                        Why not require codes for everything?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Security shouldn&apos;t get in the way of usability. We combine strong protection with smart automation so you only verify for high-risk actions.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-base font-medium text-primary mb-2">✨ The Result</p>
                    <p className="text-muted-foreground">
                      You stay protected — without the annoyance of constant interruptions.<br />
                      <span className="font-medium">Strong where it matters. Seamless everywhere else.</span>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-10 text-center">
              <p className="text-lg mb-4">Don't see your question answered? Chat with our AI assistant!</p>
              <Button 
                onClick={() => setShowChat(!showChat)} 
                className="bg-brand-blue hover:bg-brand-lightBlue"
              >
                {showChat ? 'Close Chat' : 'Open Chat Assistant'}
              </Button>
            </div>
            
            {showChat && (
              <div className="mt-6">
                <ChatbotInterface />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default QA;
