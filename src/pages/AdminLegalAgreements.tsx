import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileText, Users, Briefcase, PieChart, Save, Loader2, CheckCircle, Download, Shield, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NDAMutualAgreement from '@/components/admin/legal/NDAMutualAgreement';
import InvestmentRepaymentAgreement from '@/components/admin/legal/InvestmentRepaymentAgreement';
import { useLegalPDFExport } from '@/hooks/useLegalPDFExport';

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

const AdminLegalAgreements = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
   
   // PDF Export hook
   const { exportToPDF } = useLegalPDFExport();
  
  // Confidentiality agreement signatures
  const [confidentialityData, setConfidentialityData] = useState<AgreementSignatures>({
    company: { signature_date: '' },
    developer: { signature_date: '' }
  });

  // Offshore addendum signatures
  const [offshoreData, setOffshoreData] = useState<AgreementSignatures>({
    acknowledgment: { acknowledgments: { understand: false } },
    subcontractor_1: { signer_name: '', signer_location: '', signer_email: '', signature_date: '', signature_text: '' },
    subcontractor_2: { signer_name: '', signer_location: '', signer_email: '', signature_date: '', signature_text: '' },
    subcontractor_3: { signer_name: '', signer_location: '', signer_email: '', signature_date: '', signature_text: '' },
    subcontractor_4: { signer_name: '', signer_location: '', signer_email: '', signature_date: '', signature_text: '' }
  });

  // Contractor pack signatures
  const [contractorData, setContractorData] = useState<AgreementSignatures>({
    acknowledgment: { acknowledgments: { understand: false } },
    company: { signature_text: '', signature_date: '' },
    developer: { signature_text: '', signature_date: '' },
    compensation: { signer_name: '', signer_email: '' } // Using for rate/fee fields
  });

  // Equity vesting signatures
  const [equityData, setEquityData] = useState<AgreementSignatures>({
    acknowledgment: { acknowledgments: { understand: false, conversion: false, no_acceleration: false, double_trigger: false } },
    company: { signature_text: '', signature_date: '' },
    developer: { signature_text: '', signature_date: '' },
    acceleration: { signer_name: '' } // Using for acceleration percentage
  });

  // NDA (Mutual) signatures
  const [ndaData, setNdaData] = useState<AgreementSignatures>({
    acknowledgment: { acknowledgments: { understand: false } },
    discloser: { signature_text: '', signature_date: '' },
    receiver: { signature_text: '', signature_date: '' }
  });

  // Investment Repayment signatures
  const [investmentData, setInvestmentData] = useState<AgreementSignatures>({
    acknowledgment: { acknowledgments: { understand: false, documentation: false } },
    company: { signature_text: '', signature_date: '' },
    developer: { signature_text: '', signature_date: '' }
  });
 
  // Load existing signatures from database
  useEffect(() => {
    const loadSignatures = async () => {
      try {
        const { data, error } = await supabase
          .from('legal_agreement_signatures')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const confidentiality: AgreementSignatures = { company: {}, developer: {} };
          const offshore: AgreementSignatures = { 
            acknowledgment: { acknowledgments: {} },
            subcontractor_1: {}, subcontractor_2: {}, subcontractor_3: {}, subcontractor_4: {}
          };
          const contractor: AgreementSignatures = {
            acknowledgment: { acknowledgments: {} },
            company: {}, developer: {}, compensation: {}
          };
          const equity: AgreementSignatures = {
            acknowledgment: { acknowledgments: {} },
            company: {}, developer: {}, acceleration: {}
          };
           const nda: AgreementSignatures = {
             acknowledgment: { acknowledgments: {} },
             discloser: {}, receiver: {}
           };
           const investment: AgreementSignatures = {
             acknowledgment: { acknowledgments: {} },
             company: {}, developer: {}
           };

          data.forEach((sig) => {
            const sigData: SignatureData = {
              signer_name: sig.signer_name || '',
              signer_email: sig.signer_email || '',
              signer_location: sig.signer_location || '',
              signature_text: sig.signature_text || '',
              signature_date: sig.signature_date || '',
              acknowledgments: (sig.acknowledgments as Record<string, boolean>) || {}
            };

            switch (sig.agreement_type) {
              case 'confidentiality':
                confidentiality[sig.signer_role] = sigData;
                break;
              case 'offshore':
                offshore[sig.signer_role] = sigData;
                break;
              case 'contractor':
                contractor[sig.signer_role] = sigData;
                break;
              case 'equity':
                equity[sig.signer_role] = sigData;
                break;
              case 'nda':
                nda[sig.signer_role] = sigData;
                break;
              case 'investment':
                investment[sig.signer_role] = sigData;
                break;
            }
          });

          setConfidentialityData(prev => ({ ...prev, ...confidentiality }));
          setOffshoreData(prev => ({ ...prev, ...offshore }));
          setContractorData(prev => ({ ...prev, ...contractor }));
          setEquityData(prev => ({ ...prev, ...equity }));
          setNdaData(prev => ({ ...prev, ...nda }));
          setInvestmentData(prev => ({ ...prev, ...investment }));
        }
      } catch (error) {
        console.error('Error loading signatures:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSignatures();
  }, []);

  // Save signature to database
  const saveSignature = useCallback(async (
    agreementType: string,
    signerRole: string,
    data: SignatureData
  ) => {
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('legal_agreement_signatures')
        .select('id')
        .eq('agreement_type', agreementType)
        .eq('signer_role', signerRole)
        .single();

      const payload = {
        agreement_type: agreementType,
        signer_role: signerRole,
        signer_name: data.signer_name || null,
        signer_email: data.signer_email || null,
        signer_location: data.signer_location || null,
        signature_text: data.signature_text || null,
        signature_date: data.signature_date || null,
        acknowledgments: data.acknowledgments || {},
        ip_address: null, // Could capture this client-side
        user_agent: navigator.userAgent,
        signed_at: data.signature_text ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        await supabase
          .from('legal_agreement_signatures')
          .update(payload)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('legal_agreement_signatures')
          .insert(payload);
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      throw error;
    }
  }, []);

  // Save all signatures
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Save confidentiality signatures
      for (const [role, data] of Object.entries(confidentialityData)) {
        await saveSignature('confidentiality', role, data);
      }

      // Save offshore signatures
      for (const [role, data] of Object.entries(offshoreData)) {
        await saveSignature('offshore', role, data);
      }

      // Save contractor signatures
      for (const [role, data] of Object.entries(contractorData)) {
        await saveSignature('contractor', role, data);
      }

      // Save equity signatures
      for (const [role, data] of Object.entries(equityData)) {
        await saveSignature('equity', role, data);
      }
 
       // Save NDA signatures
       for (const [role, data] of Object.entries(ndaData)) {
         await saveSignature('nda', role, data);
       }

      // Save Investment Repayment signatures
      for (const [role, data] of Object.entries(investmentData)) {
        await saveSignature('investment', role, data);
      }

      setLastSaved(new Date());
      toast.success('All signatures and agreements saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save signatures');
    } finally {
      setSaving(false);
    }
  };

  // Helper to update nested state
  const updateConfidentiality = (role: string, field: keyof SignatureData, value: string) => {
    setConfidentialityData(prev => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };

  const updateOffshore = (role: string, field: keyof SignatureData, value: string | boolean | Record<string, boolean>) => {
    setOffshoreData(prev => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };

  const updateContractor = (role: string, field: keyof SignatureData, value: string | boolean | Record<string, boolean>) => {
    setContractorData(prev => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };

  const updateEquity = (role: string, field: keyof SignatureData, value: string | boolean | Record<string, boolean>) => {
    setEquityData(prev => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };

   const updateNDA = (role: string, field: keyof SignatureData, value: string | boolean | Record<string, boolean>) => {
     setNdaData(prev => ({
       ...prev,
       [role]: { ...prev[role], [field]: value }
     }));
   };

  const updateInvestment = (role: string, field: keyof SignatureData, value: string | boolean | Record<string, boolean>) => {
    setInvestmentData(prev => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading agreements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Legal Agreements & Contracts</h2>
          <p className="text-muted-foreground">Confidentiality, IP Assignment, and Equity Agreements</p>
          {lastSaved && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Last saved: {lastSaved.toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Signatures
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="confidentiality" className="space-y-6">
         <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 h-auto p-1">
           <TabsTrigger value="nda" className="flex items-center gap-2">
             <Shield className="w-4 h-4" />
             <span className="hidden sm:inline">Mutual NDA</span>
             <span className="sm:hidden">NDA</span>
           </TabsTrigger>
          <TabsTrigger value="confidentiality" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
             <span className="hidden sm:inline">Confidentiality</span>
             <span className="sm:hidden">Conf.</span>
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
          <TabsTrigger value="investment" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Investment</span>
            <span className="sm:hidden">Invest</span>
          </TabsTrigger>
        </TabsList>

         {/* Tab: Mutual NDA */}
         <TabsContent value="nda">
           <div className="flex justify-end mb-4 gap-2">
             <Button variant="outline" onClick={() => exportToPDF('nda', ndaData)}>
               <Download className="w-4 h-4 mr-2" />
               Export as PDF
             </Button>
           </div>
           <NDAMutualAgreement ndaData={ndaData} updateNDA={updateNDA} />
         </TabsContent>
 
        {/* Tab 1: Confidentiality + IP Assignment */}
        <TabsContent value="confidentiality">
           <div className="flex justify-end mb-4 gap-2">
             <Button variant="outline" onClick={() => exportToPDF('confidentiality', confidentialityData)}>
               <Download className="w-4 h-4 mr-2" />
               Export as PDF
             </Button>
           </div>
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
                <p><strong>Michael Lewis</strong>, an individual acting on behalf of Ellidair LLC, doing business as Asset Safe ("Company"),<br />
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
                       <p>Michael Lewis<br />Founder, Ellidair LLC d/b/a Asset Safe</p>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input 
                          type="date" 
                          value={confidentialityData.company?.signature_date || ''}
                          onChange={(e) => updateConfidentiality('company', 'signature_date', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Developer:</p>
                      <p>Vinh Nguyen<br />Development Lead / Contractor</p>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input 
                          type="date" 
                          value={confidentialityData.developer?.signature_date || ''}
                          onChange={(e) => updateConfidentiality('developer', 'signature_date', e.target.value)}
                        />
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
           <div className="flex justify-end mb-4 gap-2">
             <Button variant="outline" onClick={() => exportToPDF('offshore', offshoreData)}>
               <Download className="w-4 h-4 mr-2" />
               Export as PDF
             </Button>
           </div>
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
                    <Checkbox 
                      id="offshore-understand" 
                      checked={offshoreData.acknowledgment?.acknowledgments?.understand || false}
                      onCheckedChange={(checked) => updateOffshore('acknowledgment', 'acknowledgments', { 
                        ...offshoreData.acknowledgment?.acknowledgments, 
                        understand: checked as boolean 
                      })}
                    />
                    <Label htmlFor="offshore-understand" className="text-sm">
                      I understand this is a legally binding confidentiality and intellectual property assignment agreement.
                    </Label>
                  </div>

                  {[1, 2, 3, 4].map((num) => {
                    const role = `subcontractor_${num}`;
                    return (
                      <div key={num} className="p-4 border rounded-lg space-y-3">
                        <p className="font-medium">Subcontractor #{num}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name:</Label>
                            <Input 
                              placeholder="Enter full name" 
                              value={offshoreData[role]?.signer_name || ''}
                              onChange={(e) => updateOffshore(role, 'signer_name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Country/Location:</Label>
                            <Input 
                              placeholder="Enter country/location" 
                              value={offshoreData[role]?.signer_location || ''}
                              onChange={(e) => updateOffshore(role, 'signer_location', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email:</Label>
                            <Input 
                              type="email" 
                              placeholder="Enter email" 
                              value={offshoreData[role]?.signer_email || ''}
                              onChange={(e) => updateOffshore(role, 'signer_email', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Date:</Label>
                            <Input 
                              type="date" 
                              value={offshoreData[role]?.signature_date || ''}
                              onChange={(e) => updateOffshore(role, 'signature_date', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Electronic Signature:</Label>
                          <Input 
                            placeholder="Type full name as signature" 
                            value={offshoreData[role]?.signature_text || ''}
                            onChange={(e) => updateOffshore(role, 'signature_text', e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
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
           <div className="flex justify-end mb-4 gap-2">
             <Button variant="outline" onClick={() => exportToPDF('contractor', contractorData)}>
               <Download className="w-4 h-4 mr-2" />
               Export as PDF
             </Button>
           </div>
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
                        <Input 
                          placeholder="$___" 
                          value={contractorData.compensation?.signer_name || ''}
                          onChange={(e) => updateContractor('compensation', 'signer_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>OR Fixed Project Fee:</Label>
                        <Input 
                          placeholder="$___" 
                          value={contractorData.compensation?.signer_email || ''}
                          onChange={(e) => updateContractor('compensation', 'signer_email', e.target.value)}
                        />
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
                    <Checkbox 
                      id="contractor-understand" 
                      checked={contractorData.acknowledgment?.acknowledgments?.understand || false}
                      onCheckedChange={(checked) => updateContractor('acknowledgment', 'acknowledgments', {
                        ...contractorData.acknowledgment?.acknowledgments,
                        understand: checked as boolean
                      })}
                    />
                    <Label htmlFor="contractor-understand" className="text-sm">
                      I understand and agree to be legally bound by this Services Agreement.
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Company:</p>
                      <p>Michael Lewis<br />Ellidair LLC d/b/a Asset Safe</p>
                      <div className="space-y-2">
                        <Label>Signature:</Label>
                        <Input 
                          placeholder="Type full name as signature" 
                          value={contractorData.company?.signature_text || ''}
                          onChange={(e) => updateContractor('company', 'signature_text', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input 
                          type="date" 
                          value={contractorData.company?.signature_date || ''}
                          onChange={(e) => updateContractor('company', 'signature_date', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Developer:</p>
                      <p>Vinh Nguyen</p>
                      <div className="space-y-2">
                        <Label>Signature:</Label>
                        <Input 
                          placeholder="Type full name as signature" 
                          value={contractorData.developer?.signature_text || ''}
                          onChange={(e) => updateContractor('developer', 'signature_text', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input 
                          type="date" 
                          value={contractorData.developer?.signature_date || ''}
                          onChange={(e) => updateContractor('developer', 'signature_date', e.target.value)}
                        />
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
           <div className="flex justify-end mb-4 gap-2">
             <Button variant="outline" onClick={() => exportToPDF('equity', equityData)}>
               <Download className="w-4 h-4 mr-2" />
               Export as PDF
             </Button>
           </div>
          <ScrollArea className="h-[70vh]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">✅ ASSET SAFE — FOUNDER EQUITY VESTING AGREEMENT</CardTitle>
                <p className="text-muted-foreground">(20% Ownership — Hybrid Vesting: Time + Milestones)</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <p>This Founder Equity Vesting Agreement ("Agreement") is entered into as of [Effective Date], by and between:</p>
                <p><strong>Michael Lewis</strong>, Founder of Ellidair LLC, doing business as Asset Safe ("Company"),<br />
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
                  <h3 className="font-semibold text-base">2.1 CONTRACTOR-TO-FOUNDER CONVERSION CONDITION</h3>
                  <p>Recipient acknowledges and agrees that:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Recipient is initially engaged as an independent contractor and development lead</strong>, and no founder equity is earned, issued, or vested solely by virtue of providing contractor services.</li>
                    <li>The 20% equity grant described in this Agreement shall <strong>become effective only upon a formal written conversion</strong> of Recipient's role from contractor to founder or executive-level partner.</li>
                    <li>Such conversion must be documented by the Company through one of the following:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>A signed Founder Amendment</li>
                        <li>A written Equity Grant Approval</li>
                        <li>A formal Operating Agreement or Stock Issuance Agreement</li>
                        <li>Another written instrument executed by the Company</li>
                      </ul>
                    </li>
                  </ul>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg mt-4">
                    <p className="font-semibold text-amber-800 dark:text-amber-200">Until such written conversion occurs:</p>
                    <ul className="list-disc pl-6 space-y-1 mt-2 text-amber-700 dark:text-amber-300">
                      <li>Recipient has no ownership interest in Asset Safe</li>
                      <li>Recipient has no voting rights or governance rights</li>
                      <li>Recipient's compensation is governed solely by the Development Services Agreement</li>
                      <li>This Agreement represents only a conditional future equity framework</li>
                    </ul>
                  </div>
                  
                  <p className="mt-4"><strong>Upon conversion</strong> and execution of the required equity issuance documents, the vesting schedule in Section 3 shall begin as of the agreed Equity Grant Start Date.</p>
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
                      <Checkbox 
                        id="no-acceleration" 
                        checked={equityData.acknowledgment?.acknowledgments?.no_acceleration || false}
                        onCheckedChange={(checked) => updateEquity('acknowledgment', 'acknowledgments', {
                          ...equityData.acknowledgment?.acknowledgments,
                          no_acceleration: checked as boolean
                        })}
                      />
                      <Label htmlFor="no-acceleration">No acceleration (standard)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="double-trigger" 
                        checked={equityData.acknowledgment?.acknowledgments?.double_trigger || false}
                        onCheckedChange={(checked) => updateEquity('acknowledgment', 'acknowledgments', {
                          ...equityData.acknowledgment?.acknowledgments,
                          double_trigger: checked as boolean
                        })}
                      />
                      <Label htmlFor="double-trigger">Double-trigger acceleration (recommended)</Label>
                    </div>
                  </div>
                  <p className="mt-2 text-muted-foreground">Acceleration occurs only if BOTH: Company is acquired, AND Recipient is terminated without cause within 12 months</p>
                  <div className="space-y-2 mt-2">
                    <Label>Acceleration amount:</Label>
                    <Input 
                      placeholder="___%" 
                      className="w-32" 
                      value={equityData.acceleration?.signer_name || ''}
                      onChange={(e) => updateEquity('acceleration', 'signer_name', e.target.value)}
                    />
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
                  <p>Recipient acknowledges Ellidair LLC, doing business as Asset Safe, intends to form a Texas LLC or corporation.</p>
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
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="equity-understand" 
                        className="mt-0.5" 
                        checked={equityData.acknowledgment?.acknowledgments?.understand || false}
                        onCheckedChange={(checked) => updateEquity('acknowledgment', 'acknowledgments', {
                          ...equityData.acknowledgment?.acknowledgments,
                          understand: checked as boolean
                        })}
                      />
                      <Label htmlFor="equity-understand" className="text-sm">
                        I understand equity is earned only through time and milestone completion, and unvested equity is forfeited upon departure.
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="equity-conversion" 
                        className="mt-0.5" 
                        checked={equityData.acknowledgment?.acknowledgments?.conversion || false}
                        onCheckedChange={(checked) => updateEquity('acknowledgment', 'acknowledgments', {
                          ...equityData.acknowledgment?.acknowledgments,
                          conversion: checked as boolean
                        })}
                      />
                      <Label htmlFor="equity-conversion" className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        I understand that this equity grant is not active unless and until a written contractor-to-founder conversion is executed by Ellidair LLC d/b/a Asset Safe.
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Company Representative:</p>
                      <p>Michael Lewis<br />Founder, Ellidair LLC d/b/a Asset Safe</p>
                      <div className="space-y-2">
                        <Label>Signature:</Label>
                        <Input 
                          placeholder="Type full name as signature" 
                          value={equityData.company?.signature_text || ''}
                          onChange={(e) => updateEquity('company', 'signature_text', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input 
                          type="date" 
                          value={equityData.company?.signature_date || ''}
                          onChange={(e) => updateEquity('company', 'signature_date', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium">Recipient:</p>
                      <p>Vinh Nguyen<br />Technical Founder (Subject to Vesting)</p>
                      <div className="space-y-2">
                        <Label>Signature:</Label>
                        <Input 
                          placeholder="Type full name as signature" 
                          value={equityData.developer?.signature_text || ''}
                          onChange={(e) => updateEquity('developer', 'signature_text', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date:</Label>
                        <Input 
                          type="date" 
                          value={equityData.developer?.signature_date || ''}
                          onChange={(e) => updateEquity('developer', 'signature_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {/* Tab: Investment Repayment */}
        <TabsContent value="investment">
          <div className="flex justify-end mb-4 gap-2">
            <Button variant="outline" onClick={() => exportToPDF('investment', investmentData)}>
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
          </div>
          <InvestmentRepaymentAgreement investmentData={investmentData} updateInvestment={updateInvestment} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLegalAgreements;
