 import React from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Separator } from '@/components/ui/separator';
 import { ScrollArea } from '@/components/ui/scroll-area';
 
 interface SignatureData {
   signer_name?: string;
   signer_email?: string;
   signer_location?: string;
   signature_text?: string;
   signature_date?: string;
   acknowledgments?: Record<string, boolean>;
 }
 
 interface AgreementSignatures {
   [signerRole: string]: SignatureData;
 }
 
 interface NDAMutualAgreementProps {
   ndaData: AgreementSignatures;
   updateNDA: (role: string, field: keyof SignatureData, value: string | boolean | Record<string, boolean>) => void;
 }
 
 const NDAMutualAgreement: React.FC<NDAMutualAgreementProps> = ({ ndaData, updateNDA }) => {
   return (
     <ScrollArea className="h-[70vh]">
       <Card>
         <CardHeader>
           <CardTitle className="text-xl">NON-DISCLOSURE AGREEMENT (NDA)</CardTitle>
           <p className="text-muted-foreground">(Mutual – Confidential Information & Intellectual Property Protection)</p>
         </CardHeader>
         <CardContent className="space-y-6 text-sm">
           <p>
             This Non-Disclosure Agreement ("Agreement") is entered into as of [Date], by and between:
           </p>
           
           <div className="space-y-2">
             <p><strong>Disclosing Party:</strong><br />
             Michael Lewis, Founder of Asset Safe<br />
             ("Disclosing Party")</p>
             
             <p className="mt-4"><strong>and</strong></p>
             
             <p><strong>Receiving Party:</strong><br />
             Vinh Nguyen<br />
             ("Receiving Party")</p>
             
             <p className="mt-4">Collectively referred to as the "Parties."</p>
           </div>
 
           <Separator />
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">1. Purpose</h3>
             <p>The purpose of this Agreement is to protect confidential, proprietary, and trade-secret information disclosed by the Disclosing Party to the Receiving Party in connection with discussions related to Asset Safe, including but not limited to software development, SaaS architecture, business strategy, insurance-related workflows, valuation systems, and future commercialization.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">2. Definition of Confidential Information</h3>
             <p>"Confidential Information" includes, but is not limited to:</p>
             <ul className="list-disc pl-6 space-y-1">
               <li>Software architecture, source code, APIs, schemas, edge functions, and technical documentation</li>
               <li>Product features, roadmaps, pricing models, and subscription structures</li>
               <li>Insurance claim workflows, documentation standards, and valuation methodologies</li>
               <li>User data structures, security practices, encryption methods, and compliance strategies</li>
               <li>Business plans, pitch materials, financial projections, and go-to-market strategies</li>
               <li>Third-party integrations (current or planned)</li>
               <li>Any information marked or reasonably understood to be confidential</li>
             </ul>
             <p className="mt-2">Confidential Information may be disclosed orally, visually, electronically, or in writing.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">3. Exclusions</h3>
             <p>Confidential Information does not include information that:</p>
             <ul className="list-disc pl-6 space-y-1">
               <li>Is or becomes publicly available without breach of this Agreement</li>
               <li>Was lawfully known by the Receiving Party prior to disclosure</li>
               <li>Is independently developed without use of Confidential Information</li>
               <li>Is disclosed pursuant to legal requirement (with prompt notice to Disclosing Party)</li>
             </ul>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">4. Obligations of the Receiving Party</h3>
             <p>The Receiving Party agrees to:</p>
             <ul className="list-disc pl-6 space-y-1">
               <li>Use Confidential Information solely for evaluating or supporting Asset Safe</li>
               <li>Not disclose Confidential Information to any third party without prior written consent</li>
               <li>Protect Confidential Information with at least the same care used for their own sensitive data</li>
               <li>Restrict access strictly to individuals approved in writing by the Disclosing Party</li>
             </ul>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">5. Offshore Teams & Subcontractors</h3>
             <p>The Receiving Party may not disclose Confidential Information to offshore developers, subcontractors, or third parties unless:</p>
             <ul className="list-disc pl-6 space-y-1">
               <li>Explicit written authorization is provided by the Disclosing Party, and</li>
               <li>Such parties execute a written NDA and IP Assignment agreement approved by the Disclosing Party</li>
             </ul>
             <p className="mt-2">The Receiving Party is fully responsible for any breach by authorized third parties.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">6. Intellectual Property</h3>
             <p>All Confidential Information, inventions, discoveries, designs, workflows, and derivative works—whether created before or after disclosure—remain the exclusive property of Asset Safe.</p>
             <p className="font-medium mt-2">This Agreement does not grant any license, ownership interest, or equity—express or implied.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">7. No Reverse Engineering / Competitive Use</h3>
             <p>The Receiving Party shall not:</p>
             <ul className="list-disc pl-6 space-y-1">
               <li>Reverse engineer, replicate, or re-create any aspect of Asset Safe</li>
               <li>Use Confidential Information to build or assist any competing product or service</li>
               <li>Solicit Asset Safe users, partners, or vendors using Confidential Information</li>
             </ul>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">8. Term</h3>
             <p>This Agreement begins on the Effective Date and remains in effect for <strong>5 years</strong>.</p>
             <p>Confidentiality obligations survive termination.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">9. Return or Destruction of Materials</h3>
             <p>Upon request or termination, the Receiving Party must promptly return or permanently delete all Confidential Information, including copies and backups.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">10. No Obligation</h3>
             <p>This Agreement does not obligate either Party to enter into any business relationship, partnership, or compensation arrangement.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">11. Remedies</h3>
             <p>The Receiving Party acknowledges that breach may cause irreparable harm.</p>
             <p>The Disclosing Party is entitled to injunctive relief, damages, and legal fees.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">12. Governing Law</h3>
             <p>This Agreement shall be governed by the laws of the <strong>State of Texas</strong>, without regard to conflict-of-law principles.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">13. Entire Agreement</h3>
             <p>This Agreement constitutes the entire understanding between the Parties and supersedes all prior agreements relating to confidentiality.</p>
           </div>
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">14. Electronic Signatures</h3>
             <p>This Agreement may be executed electronically and shall be legally binding.</p>
           </div>
 
           <Separator />
 
           <div className="space-y-4">
             <h3 className="font-semibold text-base">✅ SIGNATURES</h3>
             
             <div className="flex items-start space-x-2 mb-4">
               <Checkbox 
                 id="nda-understand" 
                 className="mt-0.5"
                 checked={ndaData.acknowledgment?.acknowledgments?.understand || false}
                 onCheckedChange={(checked) => updateNDA('acknowledgment', 'acknowledgments', { 
                   ...ndaData.acknowledgment?.acknowledgments, 
                   understand: checked as boolean 
                 })}
               />
               <Label htmlFor="nda-understand" className="text-sm">
                 I acknowledge that I have read, understand, and agree to all terms of this NDA.
               </Label>
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3 p-4 border rounded-lg">
                 <p className="font-medium">Disclosing Party:</p>
                 <p>Michael Lewis<br />Founder, Asset Safe</p>
                 <div className="space-y-2">
                   <Label>Signature:</Label>
                   <Input 
                     placeholder="Type full name as signature" 
                     value={ndaData.discloser?.signature_text || ''}
                     onChange={(e) => updateNDA('discloser', 'signature_text', e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Date:</Label>
                   <Input 
                     type="date" 
                     value={ndaData.discloser?.signature_date || ''}
                     onChange={(e) => updateNDA('discloser', 'signature_date', e.target.value)}
                   />
                 </div>
               </div>
               
               <div className="space-y-3 p-4 border rounded-lg">
                 <p className="font-medium">Receiving Party:</p>
                 <p>Vinh Nguyen</p>
                 <div className="space-y-2">
                   <Label>Signature:</Label>
                   <Input 
                     placeholder="Type full name as signature" 
                     value={ndaData.receiver?.signature_text || ''}
                     onChange={(e) => updateNDA('receiver', 'signature_text', e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Date:</Label>
                   <Input 
                     type="date" 
                     value={ndaData.receiver?.signature_date || ''}
                     onChange={(e) => updateNDA('receiver', 'signature_date', e.target.value)}
                   />
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     </ScrollArea>
   );
 };
 
 export default NDAMutualAgreement;