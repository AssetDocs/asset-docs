import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQAccordion: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Security & Privacy Section */}
      <div>
        <h3 className="text-xl font-semibold text-brand-green mb-4 border-b border-brand-green/30 pb-2">Security & Privacy</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="security-1">
            <AccordionTrigger className="text-lg font-medium">How secure is my property documentation?</AccordionTrigger>
            <AccordionContent>
              Asset Safe is built with security as a core priority. Your data is protected using enterprise-grade encryption both in transit and at rest, and strict access controls ensure that only you (and anyone you authorize) can access your information. Our infrastructure and security practices are regularly reviewed and updated to meet modern data-protection standards.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="security-2">
            <AccordionTrigger className="text-lg font-medium">Is my data backed up, and what happens if I cancel?</AccordionTrigger>
            <AccordionContent>
              Yes. Your data is automatically backed up across multiple secure cloud systems designed for reliability and redundancy. If you choose to cancel your subscription, you'll retain full access to your account and data through the end of your current billing period, during which time you can download any documentation you wish to keep.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="security-3">
            <AccordionTrigger className="text-lg font-medium">Why does Asset Safe require two-step authentication?</AccordionTrigger>
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
          
          <AccordionItem value="security-4">
            <AccordionTrigger className="text-lg font-medium">Is my password information encrypted?</AccordionTrigger>
            <AccordionContent>
              Yes. All information stored in the Password & Accounts Catalog is encrypted both at rest and in transit. Asset Safe cannot view this information—only you, and anyone you explicitly grant access to, can see it.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="security-5">
            <AccordionTrigger className="text-lg font-medium">What support options are available?</AccordionTrigger>
            <AccordionContent>
              We offer step-by-step video tutorials and helpful resources in the References section of our website footer to guide you through the platform. You can also use "Ask Asset Safe" — our built-in chat assistant available 24/7 via the chat icon in the bottom-right corner of every page.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Using Asset Safe Section */}
      <div>
        <h3 className="text-xl font-semibold text-brand-green mb-4 border-b border-brand-green/30 pb-2">Using Asset Safe</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="using-1">
            <AccordionTrigger className="text-lg font-medium">Can I use Asset Safe for insurance claims?</AccordionTrigger>
            <AccordionContent>
              Yes. Asset Safe is designed to help you organize and document your property in a way that can support insurance claims. The platform allows you to create detailed records that may include photos, descriptions, dates, receipts, and user-entered values. While Asset Safe does not verify assets or validate claims, many users find this documentation helpful when working with insurance providers during the claims process.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="using-2">
            <AccordionTrigger className="text-lg font-medium">What types of assets can I document?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Asset Safe supports documentation for a wide range of assets, including both physical and non-physical items.</p>
              <p className="mb-1"><strong>Physical assets</strong> may include electronics, furniture, artwork, jewelry, collectibles, appliances, vehicles, and real estate.</p>
              <p><strong>Non-physical assets</strong> may include software licenses, digital subscriptions, intellectual property records, online accounts, and important business or personal documents.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="using-3">
            <AccordionTrigger className="text-lg font-medium">Do I need to photograph every single item?</AccordionTrigger>
            <AccordionContent>
              Not always. While high-value or specialty items should be documented individually, groups of lower-value items can often be captured together. For example, a drawer of kitchen utensils, a shelf of DVDs, or a collection of garage tools can typically be documented with a single wide-angle photo. You can then enter a combined description and estimated value, making the process more efficient while still maintaining useful records.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="using-4">
            <AccordionTrigger className="text-lg font-medium">How does receipt and document organization work?</AccordionTrigger>
            <AccordionContent>
              Asset Safe allows you to upload receipts and related documents alongside photos of your items. This creates a centralized record that combines visual documentation with proof of purchase or ownership, helping you keep everything organized in one secure place.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="using-5">
            <AccordionTrigger className="text-lg font-medium">Can I share my documentation with others?</AccordionTrigger>
            <AccordionContent>
              Yes. Asset Safe lets you securely share selected documentation with trusted parties such as insurance agents, estate planners, or family members. You control what is shared, who can access it, and for how long. Access can be modified or revoked at any time.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="using-6">
            <AccordionTrigger className="text-lg font-medium">How much storage do I need?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                Storage needs vary depending on how you use the platform and the types of files you upload. Below is a general reference based on common file sizes:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Storage</th>
                      <th className="text-left py-2">Photos (~3 MB)</th>
                      <th className="text-left py-2">1080p Video</th>
                      <th className="text-left py-2">4K Video</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2 font-medium">25 GB</td>
                      <td className="py-2">~8,300 photos</td>
                      <td className="py-2">~25 minutes</td>
                      <td className="py-2">~6.5 minutes</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">100 GB</td>
                      <td className="py-2">~33,300 photos</td>
                      <td className="py-2">~100 minutes</td>
                      <td className="py-2">~26 minutes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="using-7">
            <AccordionTrigger className="text-lg font-medium">Can I upgrade or downgrade my plan?</AccordionTrigger>
            <AccordionContent>
              Yes. You can change your subscription at any time. Upgrades take effect immediately, giving you access to additional storage or features right away. Downgrades apply at the end of your current billing cycle, so you won't lose access mid-period.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Legacy Locker Section */}
      <div>
        <h3 className="text-xl font-semibold text-brand-green mb-4 border-b border-brand-green/30 pb-2">Legacy Locker</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="legacy-1">
            <AccordionTrigger className="text-lg font-medium">What is the Legacy Locker?</AccordionTrigger>
            <AccordionContent>
              The Legacy Locker is a private, secure vault within Asset Safe where you can organize personal information intended for loved ones or trusted contacts. It's designed to store context-rich materials—such as notes, messages, media, and access details—that help explain your wishes and provide guidance alongside formal estate documents.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="legacy-2">
            <AccordionTrigger className="text-lg font-medium">Is the Legacy Locker a legal will?</AccordionTrigger>
            <AccordionContent>
              No. The Legacy Locker is not a legal will, e-will, or substitute for formal estate planning documents. Instead, it serves as supplemental information that can help executors, family members, and trusted contacts better understand your intentions when used alongside legally recognized documents.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="legacy-3">
            <AccordionTrigger className="text-lg font-medium">What kind of information can I store in the Legacy Locker?</AccordionTrigger>
            <AccordionContent>
              You can store a wide range of personal and informational content, including written messages, executor or guardian details, asset notes, property information, wish statements, financial account summaries, passwords, voice recordings, photos, videos, and uploaded documents—anything that adds clarity and context to your plans.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="legacy-4">
            <AccordionTrigger className="text-lg font-medium">Why is the Legacy Locker valuable?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Traditional estate documents state what should happen. The Legacy Locker helps explain why and how.</p>
              <p>By centralizing personal guidance and supporting materials, it reduces uncertainty, minimizes stress for loved ones, and provides a clearer roadmap during difficult or time-sensitive situations.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="legacy-5">
            <AccordionTrigger className="text-lg font-medium">Legacy Locker encryption and recovery</AccordionTrigger>
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
          
          <AccordionItem value="legacy-6">
            <AccordionTrigger className="text-lg font-medium">Can authorized users see my Legacy Locker?</AccordionTrigger>
            <AccordionContent>
              Only if you allow it. The Legacy Locker is private by default, and you control whether authorized users have full access, limited access, or no access at all.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="legacy-7">
            <AccordionTrigger className="text-lg font-medium">Can I revoke access at any time?</AccordionTrigger>
            <AccordionContent>
              Yes. You can update or revoke authorized user access instantly from your dashboard at any time.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Password & Account Security Section */}
      <div>
        <h3 className="text-xl font-semibold text-brand-green mb-4 border-b border-brand-green/30 pb-2">Password & Account Security</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="password-1">
            <AccordionTrigger className="text-lg font-medium">What is the Password & Accounts Catalog?</AccordionTrigger>
            <AccordionContent>
              The Password & Accounts Catalog is a secure, encrypted section of Asset Safe where you can record login credentials, account numbers, PINs, subscriptions, and other access information that trusted individuals may need during an emergency or transition.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="password-2">
            <AccordionTrigger className="text-lg font-medium">Why store this information here instead of on paper or in a notes app?</AccordionTrigger>
            <AccordionContent>
              Paper can be lost or damaged, and standard notes apps typically lack strong encryption and access controls. Asset Safe provides a centralized, encrypted location designed specifically to protect sensitive access information while keeping it organized and retrievable when needed.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="password-3">
            <AccordionTrigger className="text-lg font-medium">Can authorized users access my password list?</AccordionTrigger>
            <AccordionContent>
              Only if you explicitly allow it. Access to the Password & Accounts Catalog is disabled by default, and you control who can view, edit, or be restricted from this section entirely.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="password-4">
            <AccordionTrigger className="text-lg font-medium">What types of accounts can I store?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-3">You can store access details for virtually any account you want trusted individuals or an executor to locate easily, including:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Banking and investment accounts</li>
                <li>Mortgage and insurance portals</li>
                <li>Email and social media accounts</li>
                <li>Utilities and subscription services</li>
                <li>Medical and healthcare portals</li>
                <li>Cloud storage and photo accounts</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Trust & Estate Planning Section */}
      <div>
        <h3 className="text-xl font-semibold text-brand-green mb-4 border-b border-brand-green/30 pb-2">Trust & Estate Planning</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="trust-1">
            <AccordionTrigger className="text-lg font-medium">What is the Trust Information section?</AccordionTrigger>
            <AccordionContent>
              The Trust Information section is a secure place to organize and store important details about your family trust, including trustees, beneficiaries, and supporting legal documents. It doesn&apos;t replace your legally executed trust—it keeps everything easy to access when your loved ones need it most.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="trust-2">
            <AccordionTrigger className="text-lg font-medium">Does Trust Information replace my official trust documents?</AccordionTrigger>
            <AccordionContent>
              No. Your signed trust documents remain the official legal version. The information stored here provides a quick reference and ensures your trustees and family can easily locate and understand the important details in an emergency.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="trust-3">
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
          
          <AccordionItem value="trust-4">
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
          
          <AccordionItem value="trust-5">
            <AccordionTrigger className="text-lg font-medium">What if my trust includes sensitive legal instructions?</AccordionTrigger>
            <AccordionContent>
              You can choose to encrypt any or all information within this section. Encrypted details can only be unlocked using your personal master key or a trusted access process you designate.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="trust-6">
            <AccordionTrigger className="text-lg font-medium">Do I still need an attorney for my trust?</AccordionTrigger>
            <AccordionContent>
              Yes, we strongly recommend working with a qualified estate attorney to create or revise your trust. Legacy Locker helps you manage and organize your trust—your attorney ensures it&apos;s legally enforceable.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="trust-7">
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
          
          <AccordionItem value="trust-8">
            <AccordionTrigger className="text-lg font-medium">Can Asset Safe notify me if my trust information is incomplete?</AccordionTrigger>
            <AccordionContent>
              Yes. If something important is missing—like beneficiary assignments or successor trustees—we&apos;ll display a gentle alert and offer guidance on what to update.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="trust-9">
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
          
          <AccordionItem value="trust-10">
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
        </Accordion>
      </div>

      {/* Plans & Access Section */}
      <div>
        <h3 className="text-xl font-semibold text-brand-green mb-4 border-b border-brand-green/30 pb-2">Plans & Access</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="plans-1">
            <AccordionTrigger className="text-lg font-medium">Who should I add as an authorized user?</AccordionTrigger>
            <AccordionContent>
              You can invite trusted individuals such as family members, close friends, or professional advisors to collaborate on your Asset Safe account. Each authorized user's access is fully customizable, allowing you to decide exactly what they can view or manage.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="plans-2">
            <AccordionTrigger className="text-lg font-medium">What access levels are available?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-3">Asset Safe offers tiered access levels so you stay in control at all times:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Viewer</strong> – Can see selected items but cannot make changes.</li>
                <li><strong>Contributor</strong> – Can add, update, or organize information you choose to share with them.</li>
                <li><strong>Administrator</strong> – Full access to account features and settings, including the ability to manage authorized users.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="plans-3">
            <AccordionTrigger className="text-lg font-medium">Can I use Asset Safe for inventory management or business operations?</AccordionTrigger>
            <AccordionContent>
              Asset Safe is designed for documentation, protection, and long-term record-keeping—not for day-to-day inventory tracking or operational management. Many users rely on Asset Safe to document assets, preserve condition records, store receipts, and maintain organized records for insurance, compliance, or financial reference. For active inventory workflows or operational processes, dedicated inventory management software is typically a better fit.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Account Verification Section */}
      <div>
        <h3 className="text-xl font-semibold text-brand-green mb-4 border-b border-brand-green/30 pb-2">Account Verification</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="verification-1">
            <AccordionTrigger className="text-lg font-medium">What is the Verified Account badge?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-3">The Verified Account badge confirms that your Asset Safe profile is active, complete, and ready for secure documentation.</p>
              <p className="mb-2">It helps ensure your account is fully set up for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Organizing your home inventory</li>
                <li>Preparing for insurance claims</li>
                <li>Protecting important property records</li>
                <li>Building a trusted digital vault over time</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="verification-2">
            <AccordionTrigger className="text-lg font-medium">How do I earn Verified status?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">Your account becomes Verified once it meets a few simple setup milestones:</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="font-medium">Verified Email</p>
                    <p className="text-muted-foreground text-sm">You&apos;ve confirmed your email address.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">⏳</span>
                  <div>
                    <p className="font-medium">Account Age (2+ Weeks)</p>
                    <p className="text-muted-foreground text-sm">Your account has been active for at least 14 days.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📤</span>
                  <div>
                    <p className="font-medium">Upload Activity (10+ Uploads)</p>
                    <p className="text-muted-foreground text-sm">You&apos;ve added at least 10 uploads, such as photos, videos, voice notes, manuals, or documents.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">👤</span>
                  <div>
                    <p className="font-medium">Complete Profile</p>
                    <p className="text-muted-foreground text-sm">Your profile includes key details like your name and contact information.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🏠</span>
                  <div>
                    <p className="font-medium">At Least One Property Saved</p>
                    <p className="text-muted-foreground text-sm">You&apos;ve created at least one property inside Asset Safe.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="verification-3">
            <AccordionTrigger className="text-lg font-medium">Why does Asset Safe require this?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-3">Verification ensures your account is more than just a signup — it&apos;s a fully usable, claim-ready inventory system.</p>
              <p className="mb-2">It also helps Asset Safe maintain:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Higher trust</li>
                <li>Better organization</li>
                <li>Stronger documentation consistency</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="verification-4">
            <AccordionTrigger className="text-lg font-medium">Do I need Verified status to use Asset Safe?</AccordionTrigger>
            <AccordionContent>
              <p>Not at all. You can use Asset Safe immediately.</p>
              <p className="mt-2">Verification is simply a helpful milestone that shows your account is fully established.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="verification-5">
            <AccordionTrigger className="text-lg font-medium">How long does verification take?</AccordionTrigger>
            <AccordionContent>
              <p>Most users earn Verified status within the first couple of weeks by uploading and completing their setup.</p>
              <p className="mt-2">Once all requirements are met, your badge updates automatically.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default FAQAccordion;
