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

interface InvestmentRepaymentAgreementProps {
  investmentData: AgreementSignatures;
  updateInvestment: (role: string, field: keyof SignatureData, value: string | boolean | Record<string, boolean>) => void;
}

const InvestmentRepaymentAgreement: React.FC<InvestmentRepaymentAgreementProps> = ({ investmentData, updateInvestment }) => {
  return (
    <ScrollArea className="h-[70vh]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">AMENDMENT: INVESTMENT REPAYMENT & REVENUE PRIORITY</CardTitle>
          <p className="text-muted-foreground">(Developer Investment Recognition & Repayment)</p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <p>
            This Amendment ("Amendment") is entered into as of [Date], by and between:
          </p>
          
          <div className="space-y-2">
            <p><strong>Company:</strong><br />
            Asset Safe<br />
            Represented by: Michael Lewis, Founder<br />
            ("Company")</p>
            
            <p className="mt-4"><strong>and</strong></p>
            
            <p><strong>Technical Co-Founder:</strong><br />
            Vinh Nguyen<br />
            ("Developer")</p>
            
            <p className="mt-4">Collectively referred to as the "Parties."</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-base">1. Developer Investment Recognition</h3>
            <p>
              The Company acknowledges that the Technical Co-Founder ("Developer") may personally fund or advance capital in the form of development services and/or payments to third-party developers ("Developer Investment").
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">2. Definition of Developer Investment</h3>
            <p>
              The total Developer Investment shall be defined as the actual, documented cost of development work performed, inclusive of contractor fees and related expenses, as mutually agreed and recorded by both parties.
            </p>
            <p className="text-muted-foreground italic">
              Note: The specific Developer Investment amount shall be documented in writing once development costs are finalized.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">3. Revenue Allocation for Repayment</h3>
            <p>
              Upon the Company generating revenue, a percentage of initial gross revenue (to be determined prior to revenue commencement) shall be allocated toward repayment of the Developer Investment.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>These repayments shall be expedited and prioritized</li>
              <li>The express intent is that the Developer Investment is recovered as early as reasonably possible</li>
              <li>Repayment shall continue until the full Developer Investment has been satisfied</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">4. Nature of Repayment</h3>
            <p>
              This repayment structure is intended solely as investment recovery and does not constitute:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Salary or wages</li>
              <li>Guaranteed compensation</li>
              <li>Employment benefits</li>
              <li>Any form of employee classification</li>
            </ul>
            <p className="mt-2">
              The Developer remains an independent contractor or equity holder as defined in other agreements between the Parties.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">5. Documentation Requirements</h3>
            <p>
              The following items shall be documented in writing once development costs are finalized:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Specific repayment percentages of gross revenue</li>
              <li>Reporting cadence and format</li>
              <li>Confirmation of the total Developer Investment amount</li>
              <li>Payment schedule and method</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">6. Priority of Repayment</h3>
            <p>
              Developer Investment repayment shall be treated as a priority obligation of the Company, taking precedence over:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Discretionary business expenses</li>
              <li>Founder compensation beyond reasonable operating needs</li>
              <li>Non-essential capital expenditures</li>
            </ul>
            <p className="mt-2 font-medium">
              This priority is subject to the Company maintaining sufficient operating capital for continued business operations.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">7. Relationship to Other Agreements</h3>
            <p>
              This Amendment supplements and does not replace any existing agreements between the Parties, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Non-Disclosure Agreement (NDA)</li>
              <li>Confidentiality + IP Assignment Agreement</li>
              <li>Development Services Agreement</li>
              <li>Founder Equity Vesting Agreement</li>
            </ul>
            <p className="mt-2">
              In the event of conflict between this Amendment and other agreements, the Parties agree to negotiate in good faith to resolve such conflicts.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">8. Good Faith Obligation</h3>
            <p>
              Both Parties agree to act in good faith regarding:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Accurate documentation of Developer Investment amounts</li>
              <li>Timely reporting of Company revenue</li>
              <li>Prompt payment of repayment amounts when due</li>
              <li>Resolution of any disputes regarding investment calculations</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">9. Governing Law</h3>
            <p>This Amendment shall be governed by the laws of the <strong>State of Texas</strong>, without regard to conflict-of-law principles.</p>
            <p>Exclusive venue shall be Collin County, Texas.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">10. Electronic Signatures</h3>
            <p>This Amendment may be executed electronically through the Asset Safe platform and shall be legally binding and enforceable.</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-base">✅ SIGNATURES</h3>
            
            <div className="flex items-start space-x-2 mb-4">
              <Checkbox 
                id="investment-understand" 
                className="mt-0.5"
                checked={investmentData.acknowledgment?.acknowledgments?.understand || false}
                onCheckedChange={(checked) => updateInvestment('acknowledgment', 'acknowledgments', { 
                  ...investmentData.acknowledgment?.acknowledgments, 
                  understand: checked as boolean 
                })}
              />
              <Label htmlFor="investment-understand" className="text-sm">
                I acknowledge that I have read, understand, and agree to all terms of this Investment Repayment Amendment.
              </Label>
            </div>

            <div className="flex items-start space-x-2 mb-4">
              <Checkbox 
                id="investment-documentation" 
                className="mt-0.5"
                checked={investmentData.acknowledgment?.acknowledgments?.documentation || false}
                onCheckedChange={(checked) => updateInvestment('acknowledgment', 'acknowledgments', { 
                  ...investmentData.acknowledgment?.acknowledgments, 
                  documentation: checked as boolean 
                })}
              />
              <Label htmlFor="investment-documentation" className="text-sm">
                I understand that specific repayment percentages and investment amounts will be documented separately once finalized.
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 border rounded-lg">
                <p className="font-medium">Company Representative:</p>
                <p>Michael Lewis<br />Founder, Asset Safe</p>
                <div className="space-y-2">
                  <Label>Signature:</Label>
                  <Input 
                    placeholder="Type full name as signature" 
                    value={investmentData.company?.signature_text || ''}
                    onChange={(e) => updateInvestment('company', 'signature_text', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date:</Label>
                  <Input 
                    type="date" 
                    value={investmentData.company?.signature_date || ''}
                    onChange={(e) => updateInvestment('company', 'signature_date', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3 p-4 border rounded-lg">
                <p className="font-medium">Developer:</p>
                <p>Vinh Nguyen<br />Technical Co-Founder</p>
                <div className="space-y-2">
                  <Label>Signature:</Label>
                  <Input 
                    placeholder="Type full name as signature" 
                    value={investmentData.developer?.signature_text || ''}
                    onChange={(e) => updateInvestment('developer', 'signature_text', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date:</Label>
                  <Input 
                    type="date" 
                    value={investmentData.developer?.signature_date || ''}
                    onChange={(e) => updateInvestment('developer', 'signature_date', e.target.value)}
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

export default InvestmentRepaymentAgreement;
