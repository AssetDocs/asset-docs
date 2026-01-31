import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Users, Briefcase, PieChart } from 'lucide-react';

const AdminLegalAgreements = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Legal Agreements & Contracts</h2>
        <p className="text-muted-foreground">Confidentiality, IP Assignment, and Equity Agreements</p>
      </div>

      <Tabs defaultValue="confidentiality" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
          <TabsTrigger value="confidentiality" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Confidentiality + IP</span>
            <span className="sm:hidden">NDA</span>
          </TabsTrigger>
          <TabsTrigger value="offshore" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Offshore Addendum</span>
            <span className="sm:hidden">Offshore</span>
          </TabsTrigger>
          <TabsTrigger value="contractor" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Contractor Pack</span>
            <span className="sm:hidden">Contractor</span>
          </TabsTrigger>
          <TabsTrigger value="equity" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Equity Vesting</span>
            <span className="sm:hidden">Equity</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Confidentiality + IP Assignment */}
        <TabsContent value="confidentiality">
          <ScrollArea className="h-[70vh]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">✅ ASSET SAFE CONFIDENTIALITY + IP ASSIGNMENT AGREEMENT</CardTitle>
                <p className="text-muted-foreground">(Development Lead / Technical Contractor)</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <p>
                  This Confidentiality and Intellectual Property Assignment Agreement ("Agreement") is entered into as of [Date] ("Effective Date") by and between:
                </p>
                <p><strong>Michael Lewis</strong>, an individual acting on behalf of the Asset Safe business ("Company"),<br />
                and<br />
                <strong>Vinh Nguyen</strong> ("Developer" or "Recipient").</p>
                <p>The Parties agree as follows:</p>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">1. PURPOSE OF AGREEMENT</h3>
                  <p>Developer will provide software development, architecture, technical leadership, and related services for the Asset Safe platform ("Services").</p>
                  <p>Developer acknowledges that these Services involve access to highly confidential and proprietary business, technical, and product information.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">2. CONFIDENTIAL INFORMATION</h3>
                  <p>"Confidential Information" includes all non-public information relating to Asset Safe, including but not limited to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Source code, repositories, architecture, APIs</li>
                    <li>Secure Vault / Legacy Locker systems</li>
                    <li>AI valuation tools, workflows, automation</li>
                    <li>Product roadmap, pricing, partnerships</li>
                    <li>Customer data, business operations</li>
                    <li>UI/UX designs, prototypes, wireframes</li>
                    <li>Security procedures, infrastructure, credentials</li>
                    <li>Any information disclosed orally, visually, digitally, or in writing</li>
                  </ul>
                  <p>Confidential Information includes all derivative work or summaries created by Developer.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">3. CONFIDENTIALITY OBLIGATIONS</h3>
                  <p>Developer agrees to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Maintain Confidential Information in strict confidence</li>
                    <li>Use Confidential Information only for Company-authorized purposes</li>
                    <li>Not disclose Confidential Information to any third party without written consent</li>
                    <li>Protect Company information using reasonable and industry-standard safeguards</li>
                    <li>Restrict access to only approved individuals under written agreement</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">4. EXCLUSIONS</h3>
                  <p>Confidential Information does not include information that Developer can prove:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Becomes public through no fault of Developer</li>
                    <li>Was lawfully known before disclosure</li>
                    <li>Is independently developed without Company materials</li>
                    <li>Is received legally from a third party without restriction</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">5. WORK PRODUCT OWNERSHIP (IP ASSIGNMENT)</h3>
                  <p>Developer agrees that all work performed for Asset Safe, including:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Software code (front-end, back-end, edge functions)</li>
                    <li>Documentation, diagrams, schemas</li>
                    <li>Features, inventions, processes</li>
                    <li>Designs, UI logic, product improvements</li>
                  </ul>
                  <p>("Work Product") is the exclusive property of the Company.</p>
                  <p>Developer hereby irrevocably assigns all worldwide rights, title, and interest in all Work Product to the Company upon creation.</p>
                  <p>This applies whether Work Product is created alone or jointly with others.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">6. WORK MADE FOR HIRE</h3>
                  <p>To the fullest extent permitted by law, all Work Product shall be considered "Work Made for Hire."</p>
                  <p>If any Work Product is not deemed Work Made for Hire, Developer assigns all rights to the Company as stated above.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">7. INVENTIONS AND DISCLOSURE</h3>
                  <p>Developer agrees to promptly disclose any inventions, discoveries, improvements, or innovations developed during the engagement that relate to Asset Safe or its business.</p>
                  <p>All such inventions are assigned exclusively to the Company.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">8. NO LICENSE OR OWNERSHIP RIGHTS</h3>
                  <p>Developer receives no ownership, license, or rights in Company intellectual property except as necessary to perform authorized Services.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">9. RETURN AND DELETION OF MATERIALS</h3>
                  <p>Upon termination or Company request, Developer must immediately:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Return all Company materials</li>
                    <li>Delete all copies of Confidential Information</li>
                    <li>Remove credentials and access from personal devices</li>
                    <li>Confirm compliance in writing if requested</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">10. NO SUBCONTRACTING WITHOUT WRITTEN CONSENT</h3>
                  <p>Developer may not assign, outsource, subcontract, or delegate any work to any third party unless:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>The Company provides prior written approval, AND</li>
                    <li>The subcontractor signs the required NDA/IP Assignment Addendum</li>
                  </ul>
                  <p>Unauthorized subcontracting is a material breach of this Agreement.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">11. NON-SOLICITATION / NON-CIRCUMVENTION</h3>
                  <p>Developer agrees that during the engagement and for 24 months afterward, Developer will not:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use Company Confidential Information to compete directly</li>
                    <li>Solicit Company customers, partners, or contractors</li>
                    <li>Recruit Company team members away from Asset Safe</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">12. INJUNCTIVE RELIEF</h3>
                  <p>Developer acknowledges that breach would cause irreparable harm.</p>
                  <p>Company is entitled to immediate injunctive relief in addition to monetary damages.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">13. TERM</h3>
                  <p>This Agreement remains effective:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Throughout Developer's engagement</li>
                    <li>Confidentiality obligations survive for 5 years after termination</li>
                    <li>Trade secret protections survive indefinitely</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">14. FUTURE ENTITY TRANSFER</h3>
                  <p>Developer acknowledges that Asset Safe intends to form a legal entity (LLC or corporation).</p>
                  <p>Upon formation, all rights and obligations under this Agreement automatically transfer to that entity without further action.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">15. GOVERNING LAW AND VENUE</h3>
                  <p>This Agreement shall be governed by the laws of the State of Texas.</p>
                  <p>Exclusive jurisdiction shall be in Collin County, Texas.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">16. ELECTRONIC SIGNATURES</h3>
                  <p>The Parties agree that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Electronic signatures are legally binding</li>
                    <li>Execution through the Asset Safe platform constitutes full acceptance</li>
                    <li>Audit logs, timestamps, and verification records may serve as evidence of execution</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">17. ENTIRE AGREEMENT</h3>
                  <p>This Agreement constitutes the complete agreement between the Parties regarding confidentiality and intellectual property.</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">✅ SIGNATURE</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Company Representative:</p>
                      <p>Michael Lewis<br />Founder, Asset Safe</p>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Developer:</p>
                      <p>Vinh Nguyen<br />Development Lead / Contractor</p>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input type="date" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {/* Tab 2: Offshore NDA Addendum */}
        <TabsContent value="offshore">
          <ScrollArea className="h-[70vh]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">✅ OFFSHORE DEVELOPMENT TEAM NDA + IP ASSIGNMENT ADDENDUM</CardTitle>
                <p className="text-muted-foreground">(Required for Each Subcontractor)</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <p>This Addendum must be signed by each offshore developer or contractor granted access to Asset Safe systems ("Team Member").</p>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">1. CONFIDENTIALITY</h3>
                  <p>Team Member agrees to maintain strict confidentiality regarding all non-public Asset Safe information, including:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Code, designs, product plans</li>
                    <li>Credentials, infrastructure, customer data</li>
                    <li>Business workflows and proprietary methods</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">2. INTELLECTUAL PROPERTY ASSIGNMENT</h3>
                  <p>Team Member agrees that all work performed is owned exclusively by Asset Safe.</p>
                  <p>Team Member hereby assigns all rights, title, and interest in all Work Product to the Company immediately upon creation.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">3. NO REUSE OR OUTSIDE USE</h3>
                  <p>Team Member may not copy, reuse, repurpose, or distribute any Asset Safe work in any other project.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">4. NO FURTHER SUBCONTRACTING</h3>
                  <p>Team Member is strictly prohibited from subcontracting, outsourcing, or delegating any work to another party.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">5. SECURITY AND ACCESS RULES</h3>
                  <p>Team Member agrees to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use only Company-approved repositories</li>
                    <li>Never access production systems without written approval</li>
                    <li>Follow least-privilege access controls</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">6. ELECTRONIC SIGNATURE ENFORCEMENT</h3>
                  <p>Electronic execution through Asset Safe is binding and enforceable.</p>
                </div>

                <Separator />

                <div className="space-y-6">
                  <h3 className="font-semibold text-base">✅ SUBCONTRACTOR SIGNATURES</h3>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox id="offshore-understand" />
                    <Label htmlFor="offshore-understand" className="text-sm">
                      I understand this is a legally binding confidentiality and intellectual property assignment agreement.
                    </Label>
                  </div>

                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="p-4 border rounded-lg space-y-3">
                      <p className="font-medium">Subcontractor #{num}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name:</Label>
                          <Input placeholder="Enter full name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Country/Location:</Label>
                          <Input placeholder="Enter country/location" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email:</Label>
                          <Input type="email" placeholder="Enter email" />
                        </div>
                        <div className="space-y-2">
                          <Label>Date:</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Electronic Signature:</Label>
                        <Input placeholder="Type full name as signature" />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h3 className="font-semibold text-base">✅ WEBSITE IMPLEMENTATION TIP (Highly Recommended)</h3>
                  <p>When you paste this into Asset Safe for signing, add:</p>
                  <p><strong>Required checkbox before signing:</strong></p>
                  <p>☐ I understand this is a legally binding confidentiality and intellectual property assignment agreement.</p>
                  <p><strong>Store audit metadata:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Name</li>
                    <li>Email verification</li>
                    <li>Timestamp</li>
                    <li>IP address</li>
                    <li>Agreement version hash</li>
                  </ul>
                  <p>This makes it much stronger in enforcement.</p>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {/* Tab 3: Founder Technical Contractor Pack */}
        <TabsContent value="contractor">
          <ScrollArea className="h-[70vh]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">✅ ASSET SAFE — FOUNDER TECHNICAL CONTRACTOR PACK</CardTitle>
                <p className="text-muted-foreground">(Confidentiality + IP Assignment + Development Services Agreement)</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <p><strong>Prepared for:</strong> Asset Safe</p>
                  <p><strong>Founder:</strong> Michael Lewis</p>
                  <p><strong>Development Lead:</strong> Vinh Nguyen</p>
                  <p><strong>Offshore Team:</strong> Covered under Addendum</p>
                  <p><strong>Execution Method:</strong> Electronic Signature via Asset Safe Platform</p>
                </div>

                <Separator />

                {/* Agreement #1 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">✅ AGREEMENT #1: CONFIDENTIALITY + INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT</h3>
                  <p className="text-muted-foreground">(Development Lead / Technical Contractor)</p>
                  
                  <p>This Confidentiality and Intellectual Property Assignment Agreement ("Agreement") is entered into as of [Effective Date] ("Effective Date") by and between:</p>
                  <p><strong>Michael Lewis</strong>, an individual acting on behalf of the Asset Safe business ("Company"),<br />
                  and<br />
                  <strong>Vinh Nguyen</strong> ("Developer" or "Recipient").</p>

                  <div className="space-y-4 mt-4">
                    <h4 className="font-medium">1. PURPOSE</h4>
                    <p>Developer will provide software development, technical leadership, architecture, implementation, and related services for the Asset Safe platform ("Services").</p>
                    <p>Developer acknowledges that these Services involve access to proprietary and confidential business, product, and technical information.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">2. DEFINITION OF CONFIDENTIAL INFORMATION</h4>
                    <p>"Confidential Information" includes all non-public information relating to Asset Safe, including but not limited to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Source code, repositories, software architecture</li>
                      <li>Secure Vault / Legacy Locker features and workflows</li>
                      <li>AI valuation systems, logic, automation processes</li>
                      <li>Product roadmap, pricing strategy, business model</li>
                      <li>Customer data, user workflows, documentation</li>
                      <li>UI/UX designs, prototypes, wireframes</li>
                      <li>Security procedures, infrastructure, credentials</li>
                      <li>Partner discussions, marketing plans, internal operations</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">3-17. [Full Agreement Terms]</h4>
                    <p className="text-muted-foreground">See Confidentiality + IP tab for complete terms including: Confidentiality Obligations, Exclusions, Work Product Ownership, Work Made for Hire, Inventions, Return of Materials, Non-Solicitation, Injunctive Relief, Term, Future Entity Transfer, Governing Law, and Electronic Signatures.</p>
                  </div>
                </div>

                <Separator />

                {/* Agreement #2 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">✅ AGREEMENT #2: OFFSHORE SUBCONTRACTOR NDA + IP ASSIGNMENT ADDENDUM</h3>
                  <p className="text-muted-foreground">(Required for Each Offshore Team Member)</p>
                  
                  <p>This Addendum must be signed individually by each offshore developer, contractor, or agency worker granted access to Asset Safe systems ("Team Member").</p>

                  <div className="space-y-4 mt-4">
                    <h4 className="font-medium">1. CONFIDENTIALITY</h4>
                    <p>Team Member agrees to maintain strict confidentiality regarding all non-public Asset Safe information.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">2. INTELLECTUAL PROPERTY ASSIGNMENT</h4>
                    <p>Team Member agrees that all work performed is owned exclusively by Asset Safe.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">3-6. [Full Addendum Terms]</h4>
                    <p className="text-muted-foreground">See Offshore Addendum tab for complete terms including: No Reuse, No Subcontracting, Security Requirements, and Electronic Execution.</p>
                  </div>
                </div>

                <Separator />

                {/* Agreement #3 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">✅ AGREEMENT #3: DEVELOPMENT SERVICES AGREEMENT</h3>
                  <p className="text-muted-foreground">(Founder ↔ Technical Contractor)</p>
                  
                  <p>This Development Services Agreement ("Services Agreement") is entered into as of [Date], by and between:</p>
                  <p><strong>Michael Lewis</strong>, Founder of Asset Safe ("Company"),<br />
                  and<br />
                  <strong>Vinh Nguyen</strong> ("Developer").</p>

                  <div className="space-y-4 mt-4">
                    <h4 className="font-medium">1. SERVICES</h4>
                    <p>Developer agrees to provide software development and technical leadership services, which may include:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Backend/API development</li>
                      <li>Database architecture</li>
                      <li>Security and authentication systems</li>
                      <li>Subscription/payment integrations</li>
                      <li>Feature development and bug resolution</li>
                      <li>Technical documentation and deployment support</li>
                    </ul>
                    <p>All work must align with Company priorities and roadmap.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">2. TERM</h4>
                    <p>This Agreement begins on the Effective Date and continues until terminated under Section 6.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">3. COMPENSATION</h4>
                    <p>Developer shall be compensated as follows:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label>Rate (per hour):</Label>
                        <Input placeholder="$___" />
                      </div>
                      <div className="space-y-2">
                        <Label>OR Fixed Project Fee:</Label>
                        <Input placeholder="$___" />
                      </div>
                    </div>
                    <p className="mt-2">Payment Schedule: Weekly / Biweekly / Milestone-Based</p>
                    <p>Invoices must be submitted with clear work descriptions</p>
                    <p><strong>No equity is granted under this Agreement unless separately agreed in writing.</strong></p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">4. DELIVERABLES AND COMPANY CONTROL</h4>
                    <p>All deliverables must be committed to Company-controlled systems, including:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>GitHub repositories owned by Asset Safe</li>
                      <li>Documentation stored in Company workspace</li>
                    </ul>
                    <p>No work may be withheld or stored solely on Developer systems</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">5. INDEPENDENT CONTRACTOR STATUS</h4>
                    <p>Developer is an independent contractor, not an employee.</p>
                    <p>Developer is responsible for all taxes, insurance, and legal compliance.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">6. TERMINATION</h4>
                    <p>Either Party may terminate this Agreement:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>With 14 days written notice, or</li>
                      <li>Immediately upon material breach (including confidentiality violation)</li>
                    </ul>
                    <p>Upon termination, Developer must return all Company materials and access.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">7. CONFIDENTIALITY + IP INCORPORATION</h4>
                    <p>This Agreement incorporates and is governed by the NDA/IP Assignment Agreement above.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">8. LIMITATION OF AUTHORITY</h4>
                    <p>Developer has no authority to bind the Company legally or financially without written authorization.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">9. GOVERNING LAW</h4>
                    <p>This Agreement shall be governed by Texas law, with exclusive venue in Collin County, Texas.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">10. ELECTRONIC SIGNATURES</h4>
                    <p>Electronic execution through Asset Safe is binding and enforceable.</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">✅ SIGNATURES</h3>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox id="contractor-understand" />
                    <Label htmlFor="contractor-understand" className="text-sm">
                      I understand and agree to be legally bound by this Services Agreement.
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Company:</p>
                      <p>Michael Lewis</p>
                      <div className="space-y-2">
                        <Label>Signature:</Label>
                        <Input placeholder="Type full name as signature" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Developer:</p>
                      <p>Vinh Nguyen</p>
                      <div className="space-y-2">
                        <Label>Signature:</Label>
                        <Input placeholder="Type full name as signature" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input type="date" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-3 mt-6">
                  <h3 className="font-semibold text-base">✅ IMPLEMENTATION NOTES FOR ASSET SAFE (BEST PRACTICE)</h3>
                  <p>When adding this to your signing flow, include:</p>
                  <p><strong>Required checkbox:</strong></p>
                  <p>☐ I agree this is a legally binding contract and electronic signature is valid.</p>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {/* Tab 4: Equity Vesting */}
        <TabsContent value="equity">
          <ScrollArea className="h-[70vh]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">✅ ASSET SAFE — FOUNDER EQUITY VESTING AGREEMENT</CardTitle>
                <p className="text-muted-foreground">(20% Ownership — Hybrid Vesting: Time + Milestones)</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <p>This Founder Equity Vesting Agreement ("Agreement") is entered into as of [Effective Date], by and between:</p>
                <p><strong>Michael Lewis</strong>, Founder of Asset Safe ("Company"),<br />
                and<br />
                <strong>Vinh Nguyen</strong> ("Founder" or "Recipient").</p>
                <p>This Agreement governs the grant and vesting of equity ownership in Asset Safe.</p>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">1. PURPOSE</h3>
                  <p>The Company desires to grant equity to Recipient in recognition of Recipient's long-term contributions as a technical founder, subject to vesting requirements tied to both:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Continued service over time, and</li>
                    <li>Delivery of key platform milestones critical to Asset Safe's success</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">2. EQUITY GRANT</h3>
                  <p>Subject to the terms of this Agreement, the Company grants Recipient:</p>
                  <div className="p-4 bg-muted rounded-lg mt-2">
                    <p><strong>Equity Amount:</strong> Twenty Percent (20%) ownership interest<br />
                    (or equivalent units/shares upon entity formation)</p>
                    <p><strong>Grant Date:</strong> [Date of Grant]</p>
                    <p><strong>Equity Type:</strong> Restricted Founder Units / Common Stock<br />
                    (to be finalized upon formation of a Texas LLC or corporation)</p>
                  </div>
                  <p className="font-medium text-destructive">No equity is earned unless and until vested under this Agreement.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">3. HYBRID VESTING STRUCTURE (TIME + MILESTONES)</h3>
                  <p>Recipient's 20% equity interest shall vest in four equal tranches of 5% each, as follows:</p>

                  <div className="space-y-4 mt-4">
                    <div className="p-4 border rounded-lg border-l-4 border-l-primary">
                      <h4 className="font-semibold">✅ Tranche 1 — Time-Based Cliff Vesting</h4>
                      <p className="text-lg font-medium text-primary">5% vested after 12 months of continuous service</p>
                      <p className="mt-2">No equity vests until Recipient completes one (1) full year of continuous service.</p>
                      <p>On the 12-month anniversary: 5% ownership vests immediately</p>
                    </div>

                    <div className="p-4 border rounded-lg border-l-4 border-l-primary">
                      <h4 className="font-semibold">✅ Tranche 2 — Product Milestone Vesting</h4>
                      <p className="text-lg font-medium text-primary">5% vested upon Secure Vault / Legacy Locker Launch</p>
                      <p className="mt-2">Recipient earns this tranche only upon delivery of:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Secure Vault feature implementation</li>
                        <li>Encrypted storage workflows</li>
                        <li>Role-based access enforcement</li>
                        <li>Successful internal production deployment</li>
                      </ul>
                      <p className="mt-2 text-muted-foreground">Milestone must be confirmed in writing by Company.</p>
                    </div>

                    <div className="p-4 border rounded-lg border-l-4 border-l-primary">
                      <h4 className="font-semibold">✅ Tranche 3 — Business-Critical Infrastructure Vesting</h4>
                      <p className="text-lg font-medium text-primary">5% vested upon Subscription + Payments Stability</p>
                      <p className="mt-2">Recipient earns this tranche only upon completion of:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Stripe billing system live in production</li>
                        <li>Subscription lifecycle functioning (upgrade/downgrade/cancel)</li>
                        <li>Webhook reliability and payment reconciliation</li>
                        <li>No critical billing defects for 60 consecutive days</li>
                      </ul>
                      <p className="mt-2 text-muted-foreground">Milestone must be confirmed in writing by Company.</p>
                    </div>

                    <div className="p-4 border rounded-lg border-l-4 border-l-primary">
                      <h4 className="font-semibold">✅ Tranche 4 — Platform Expansion Vesting</h4>
                      <p className="text-lg font-medium text-primary">5% vested upon Mobile App / Homeowner Expansion Release</p>
                      <p className="mt-2">Recipient earns this tranche only upon delivery of:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Mobile-ready platform release (PWA or native)</li>
                        <li>Core homeowner onboarding experience complete</li>
                        <li>Verified Account + Upload workflows stable</li>
                        <li>Public launch readiness as defined by Company</li>
                      </ul>
                      <p className="mt-2 text-muted-foreground">Milestone must be confirmed in writing by Company.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">4. MILESTONE APPROVAL REQUIREMENT</h3>
                  <p>All milestone-based vesting requires:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Completion of milestone deliverables, AND</li>
                    <li>Written confirmation by the Company that the milestone is satisfied</li>
                  </ul>
                  <p className="font-medium">Partial completion does not trigger vesting.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">5. CONTINUOUS SERVICE REQUIREMENT</h3>
                  <p>All vesting is conditioned upon Recipient's continuous service to the Company.</p>
                  <p>If service ends for any reason: <strong>All unvested equity is forfeited immediately.</strong></p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">6. TERMINATION OR DEPARTURE</h3>
                  <p>If Recipient resigns or is terminated prior to full vesting:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Unvested equity returns automatically to the Company</li>
                    <li>Recipient retains only vested equity as of termination date</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">7. COMPANY REPURCHASE RIGHT</h3>
                  <p>In the event Recipient ceases service, the Company retains the right to repurchase vested equity at the lower of:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Fair Market Value, or</li>
                    <li>Original issuance price (if applicable)</li>
                  </ul>
                  <p>This protects the cap table from inactive founders.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">8. ACCELERATION (OPTIONAL)</h3>
                  <p>Acceleration is not automatic unless selected:</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="no-acceleration" />
                      <Label htmlFor="no-acceleration">No acceleration (standard)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="double-trigger" />
                      <Label htmlFor="double-trigger">Double-trigger acceleration (recommended)</Label>
                    </div>
                  </div>
                  <p className="mt-2 text-muted-foreground">Acceleration occurs only if BOTH: Company is acquired, AND Recipient is terminated without cause within 12 months</p>
                  <div className="space-y-2 mt-2">
                    <Label>Acceleration amount:</Label>
                    <Input placeholder="___%" className="w-32" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">9. CONFIDENTIALITY + IP COMPLIANCE REQUIRED</h3>
                  <p>Equity vesting is contingent upon full compliance with:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>NDA Agreement</li>
                    <li>IP Assignment Agreement</li>
                    <li>Development Services Agreement</li>
                  </ul>
                  <p className="font-medium text-destructive">Any breach may result in forfeiture of vested or unvested equity.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">10. TRANSFER RESTRICTIONS</h3>
                  <p>Recipient may not sell, assign, transfer, or pledge equity without written Company consent.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">11. FUTURE ENTITY CONVERSION</h3>
                  <p>Recipient acknowledges Asset Safe intends to form a Texas LLC or corporation.</p>
                  <p>Upon formation, this Agreement shall automatically convert into the equivalent equity structure (membership units or shares).</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">12. TAX ACKNOWLEDGMENT (83(b))</h3>
                  <p>Recipient may be required to file an IRS 83(b) election within 30 days of issuance.</p>
                  <p>Recipient is responsible for consulting a tax advisor.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">13. GOVERNING LAW</h3>
                  <p>This Agreement shall be governed by Texas law.</p>
                  <p>Exclusive venue shall be Collin County, Texas.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">14. ELECTRONIC SIGNATURES</h3>
                  <p>Electronic execution through the Asset Safe platform is binding and enforceable.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">15. ENTIRE AGREEMENT</h3>
                  <p>This Agreement represents the complete understanding between the Parties regarding founder equity vesting.</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">✅ SIGNATURES</h3>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox id="equity-understand" />
                    <Label htmlFor="equity-understand" className="text-sm">
                      I understand equity is earned only through time and milestone completion, and unvested equity is forfeited upon departure.
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Company Representative:</p>
                      <p>Michael Lewis<br />Founder, Asset Safe</p>
                      <div className="space-y-2">
                        <Label>Signature:</Label>
                        <Input placeholder="Type full name as signature" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Recipient:</p>
                      <p>Vinh Nguyen<br />Technical Founder (Subject to Vesting)</p>
                      <div className="space-y-2">
                        <Label>Signature:</Label>
                        <Input placeholder="Type full name as signature" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input type="date" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLegalAgreements;
