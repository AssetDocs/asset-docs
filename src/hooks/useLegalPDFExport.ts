 import { useCallback } from 'react';
 import { jsPDF } from 'jspdf';
 import { toast } from 'sonner';
 
 type AgreementType = 'confidentiality' | 'offshore' | 'contractor' | 'equity' | 'nda';
 
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
 
 export const useLegalPDFExport = () => {
   const formatDate = (dateStr?: string) => {
     if (!dateStr) return '[Not signed]';
     return new Date(dateStr).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'long',
       day: 'numeric'
     });
   };
 
   const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5) => {
     const lines = doc.splitTextToSize(text, maxWidth);
     lines.forEach((line: string, index: number) => {
       doc.text(line, x, y + (index * lineHeight));
     });
     return y + (lines.length * lineHeight);
   };
 
   const exportToPDF = useCallback(async (
     agreementType: AgreementType,
     data: AgreementSignatures
   ) => {
     try {
       const doc = new jsPDF();
       const pageWidth = doc.internal.pageSize.getWidth();
       const margin = 20;
       const contentWidth = pageWidth - (margin * 2);
       let y = 20;
 
       // Header
       doc.setFontSize(10);
       doc.setTextColor(100);
       doc.text('ASSET SAFE - LEGAL DOCUMENT', margin, y);
       doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, y);
       y += 15;
 
       switch (agreementType) {
         case 'nda':
           doc.setFontSize(16);
           doc.setTextColor(0);
           doc.text('NON-DISCLOSURE AGREEMENT (NDA)', margin, y);
           y += 8;
           doc.setFontSize(11);
           doc.setTextColor(100);
           doc.text('(Mutual – Confidential Information & Intellectual Property Protection)', margin, y);
           y += 15;
 
           doc.setFontSize(10);
           doc.setTextColor(0);
           y = addWrappedText(doc, 'This Non-Disclosure Agreement ("Agreement") is entered into by and between:', margin, y, contentWidth);
           y += 5;
 
           doc.setFontSize(10);
           y = addWrappedText(doc, 'Disclosing Party: Michael Lewis, Founder of Asset Safe', margin, y, contentWidth);
           y += 3;
           y = addWrappedText(doc, 'Receiving Party: Vinh Nguyen', margin, y, contentWidth);
           y += 10;
 
           // Sections
           const ndaSections = [
             { title: '1. Purpose', text: 'The purpose of this Agreement is to protect confidential, proprietary, and trade-secret information disclosed by the Disclosing Party to the Receiving Party in connection with discussions related to Asset Safe, including but not limited to software development, SaaS architecture, business strategy, insurance-related workflows, valuation systems, and future commercialization.' },
             { title: '2. Confidential Information', text: '"Confidential Information" includes software architecture, source code, APIs, schemas, product features, roadmaps, pricing models, insurance claim workflows, user data structures, security practices, business plans, and any information marked or reasonably understood to be confidential.' },
             { title: '3. Exclusions', text: 'Confidential Information does not include information that is publicly available, was lawfully known prior to disclosure, is independently developed, or is disclosed pursuant to legal requirement.' },
             { title: '4. Obligations', text: 'The Receiving Party agrees to use Confidential Information solely for evaluating or supporting Asset Safe, not disclose to any third party without written consent, and protect it with appropriate care.' },
             { title: '5. Offshore Teams', text: 'The Receiving Party may not disclose Confidential Information to offshore developers or subcontractors without explicit written authorization and execution of approved NDA/IP agreements.' },
             { title: '6. Intellectual Property', text: 'All Confidential Information remains the exclusive property of Asset Safe. This Agreement does not grant any license, ownership interest, or equity.' },
             { title: '7. No Competitive Use', text: 'The Receiving Party shall not reverse engineer, replicate, or use Confidential Information to build competing products or solicit Asset Safe users, partners, or vendors.' },
             { title: '8. Term', text: 'This Agreement remains in effect for 5 years. Confidentiality obligations survive termination.' },
             { title: '9. Return of Materials', text: 'Upon request or termination, the Receiving Party must return or permanently delete all Confidential Information.' },
             { title: '10. No Obligation', text: 'This Agreement does not obligate either Party to enter into any business relationship or compensation arrangement.' },
             { title: '11. Remedies', text: 'The Disclosing Party is entitled to injunctive relief, damages, and legal fees for breach.' },
             { title: '12. Governing Law', text: 'This Agreement shall be governed by the laws of the State of Texas.' },
           ];
 
           ndaSections.forEach((section) => {
             if (y > 260) {
               doc.addPage();
               y = 20;
             }
             doc.setFontSize(11);
             doc.setFont('helvetica', 'bold');
             doc.text(section.title, margin, y);
             y += 6;
             doc.setFont('helvetica', 'normal');
             doc.setFontSize(9);
             y = addWrappedText(doc, section.text, margin, y, contentWidth, 4);
             y += 6;
           });
 
           // Signatures
           if (y > 200) {
             doc.addPage();
             y = 20;
           }
           y += 10;
           doc.setFontSize(12);
           doc.setFont('helvetica', 'bold');
           doc.text('SIGNATURES', margin, y);
           y += 10;
 
           doc.setFontSize(10);
           doc.setFont('helvetica', 'normal');
           
           // Acknowledgment
           const acknowledged = data.acknowledgment?.acknowledgments?.understand ? '☑' : '☐';
           doc.text(`${acknowledged} I acknowledge that I have read, understand, and agree to all terms of this NDA.`, margin, y);
           y += 15;
 
           // Discloser signature
           doc.setFont('helvetica', 'bold');
           doc.text('Disclosing Party:', margin, y);
           y += 5;
           doc.setFont('helvetica', 'normal');
           doc.text('Michael Lewis, Founder, Asset Safe', margin, y);
           y += 5;
           doc.text(`Signature: ${data.discloser?.signature_text || '_________________________'}`, margin, y);
           y += 5;
           doc.text(`Date: ${formatDate(data.discloser?.signature_date)}`, margin, y);
           y += 15;
 
           // Receiver signature
           doc.setFont('helvetica', 'bold');
           doc.text('Receiving Party:', margin, y);
           y += 5;
           doc.setFont('helvetica', 'normal');
           doc.text('Vinh Nguyen', margin, y);
           y += 5;
           doc.text(`Signature: ${data.receiver?.signature_text || '_________________________'}`, margin, y);
           y += 5;
           doc.text(`Date: ${formatDate(data.receiver?.signature_date)}`, margin, y);
           break;
 
         case 'confidentiality':
           doc.setFontSize(14);
           doc.setTextColor(0);
           doc.text('CONFIDENTIALITY + IP ASSIGNMENT AGREEMENT', margin, y);
           y += 8;
           doc.setFontSize(10);
           doc.setTextColor(100);
           doc.text('(Development Lead / Technical Contractor)', margin, y);
           y += 15;
 
           doc.setFontSize(10);
           doc.setTextColor(0);
           y = addWrappedText(doc, 'This Agreement is entered into by and between Michael Lewis (Company) and Vinh Nguyen (Developer).', margin, y, contentWidth);
           y += 10;
 
           const confSections = [
             { title: '1. Purpose', text: 'Developer provides software development, architecture, technical leadership, and related services for the Asset Safe platform.' },
             { title: '2. Confidential Information', text: 'Includes source code, repositories, APIs, Secure Vault/Legacy Locker systems, AI valuation tools, product roadmap, customer data, UI/UX designs, and security procedures.' },
             { title: '3. Obligations', text: 'Developer agrees to maintain strict confidentiality, use information only for authorized purposes, and not disclose to third parties.' },
             { title: '5. Work Product Ownership', text: 'All work performed including software code, documentation, features, and designs is the exclusive property of the Company.' },
             { title: '10. No Subcontracting', text: 'Developer may not subcontract work without prior written Company approval and signed NDA/IP addendum.' },
             { title: '13. Term', text: 'Confidentiality obligations survive for 5 years after termination. Trade secret protections survive indefinitely.' },
             { title: '15. Governing Law', text: 'Governed by Texas law with exclusive jurisdiction in Collin County, Texas.' },
           ];
 
           confSections.forEach((section) => {
             if (y > 260) {
               doc.addPage();
               y = 20;
             }
             doc.setFontSize(11);
             doc.setFont('helvetica', 'bold');
             doc.text(section.title, margin, y);
             y += 6;
             doc.setFont('helvetica', 'normal');
             doc.setFontSize(9);
             y = addWrappedText(doc, section.text, margin, y, contentWidth, 4);
             y += 6;
           });
 
           // Signatures
           if (y > 220) {
             doc.addPage();
             y = 20;
           }
           y += 10;
           doc.setFontSize(12);
           doc.setFont('helvetica', 'bold');
           doc.text('SIGNATURES', margin, y);
           y += 15;
 
           doc.setFontSize(10);
           doc.setFont('helvetica', 'bold');
           doc.text('Company Representative:', margin, y);
           y += 5;
           doc.setFont('helvetica', 'normal');
           doc.text('Michael Lewis, Founder, Asset Safe', margin, y);
           y += 5;
           doc.text(`Date: ${formatDate(data.company?.signature_date)}`, margin, y);
           y += 15;
 
           doc.setFont('helvetica', 'bold');
           doc.text('Developer:', margin, y);
           y += 5;
           doc.setFont('helvetica', 'normal');
           doc.text('Vinh Nguyen, Development Lead', margin, y);
           y += 5;
           doc.text(`Date: ${formatDate(data.developer?.signature_date)}`, margin, y);
           break;
 
         case 'offshore':
           doc.setFontSize(14);
           doc.text('OFFSHORE NDA + IP ASSIGNMENT ADDENDUM', margin, y);
           y += 8;
           doc.setFontSize(10);
           doc.setTextColor(100);
           doc.text('(Required for Each Subcontractor)', margin, y);
           y += 15;
 
           doc.setFontSize(10);
           doc.setTextColor(0);
           y = addWrappedText(doc, 'This Addendum must be signed by each offshore developer or contractor granted access to Asset Safe systems.', margin, y, contentWidth);
           y += 10;
 
           const offshoreSections = [
             { title: '1. Confidentiality', text: 'Team Member agrees to maintain strict confidentiality regarding all non-public Asset Safe information.' },
             { title: '2. IP Assignment', text: 'All work performed is owned exclusively by Asset Safe. All rights assigned immediately upon creation.' },
             { title: '3. No Reuse', text: 'Team Member may not copy, reuse, repurpose, or distribute any Asset Safe work in any other project.' },
             { title: '4. No Subcontracting', text: 'Strictly prohibited from subcontracting, outsourcing, or delegating any work to another party.' },
             { title: '5. Security Rules', text: 'Must use only Company-approved repositories and follow least-privilege access controls.' },
           ];
 
           offshoreSections.forEach((section) => {
             doc.setFontSize(11);
             doc.setFont('helvetica', 'bold');
             doc.text(section.title, margin, y);
             y += 6;
             doc.setFont('helvetica', 'normal');
             doc.setFontSize(9);
             y = addWrappedText(doc, section.text, margin, y, contentWidth, 4);
             y += 6;
           });
 
           // Subcontractor signatures
           y += 10;
           doc.setFontSize(12);
           doc.setFont('helvetica', 'bold');
           doc.text('SUBCONTRACTOR SIGNATURES', margin, y);
           y += 10;
 
           [1, 2, 3, 4].forEach((num) => {
             if (y > 240) {
               doc.addPage();
               y = 20;
             }
             const role = `subcontractor_${num}`;
             const subData = data[role] || {};
             
             doc.setFontSize(10);
             doc.setFont('helvetica', 'bold');
             doc.text(`Subcontractor #${num}`, margin, y);
             y += 5;
             doc.setFont('helvetica', 'normal');
             doc.text(`Name: ${subData.signer_name || '_________________________'}`, margin, y);
             y += 5;
             doc.text(`Location: ${subData.signer_location || '_________________________'}`, margin, y);
             y += 5;
             doc.text(`Email: ${subData.signer_email || '_________________________'}`, margin, y);
             y += 5;
             doc.text(`Signature: ${subData.signature_text || '_________________________'}`, margin, y);
             y += 5;
             doc.text(`Date: ${formatDate(subData.signature_date)}`, margin, y);
             y += 12;
           });
           break;
 
         case 'contractor':
           doc.setFontSize(14);
           doc.text('FOUNDER TECHNICAL CONTRACTOR PACK', margin, y);
           y += 8;
           doc.setFontSize(10);
           doc.setTextColor(100);
           doc.text('(Confidentiality + IP Assignment + Development Services)', margin, y);
           y += 15;
 
           doc.setTextColor(0);
           doc.setFontSize(10);
           y = addWrappedText(doc, 'Prepared for Asset Safe. Founder: Michael Lewis. Development Lead: Vinh Nguyen.', margin, y, contentWidth);
           y += 10;
 
           y = addWrappedText(doc, 'This pack incorporates Confidentiality + IP Assignment Agreement, Offshore NDA Addendum, and Development Services Agreement. See individual tabs for complete terms.', margin, y, contentWidth);
           y += 15;
 
           // Signatures
           doc.setFontSize(12);
           doc.setFont('helvetica', 'bold');
           doc.text('SIGNATURES', margin, y);
           y += 10;
 
           const contractorAck = data.acknowledgment?.acknowledgments?.understand ? '☑' : '☐';
           doc.setFontSize(10);
           doc.setFont('helvetica', 'normal');
           doc.text(`${contractorAck} I understand and agree to be legally bound by this Services Agreement.`, margin, y);
           y += 15;
 
           doc.setFont('helvetica', 'bold');
           doc.text('Company:', margin, y);
           y += 5;
           doc.setFont('helvetica', 'normal');
           doc.text('Michael Lewis', margin, y);
           y += 5;
           doc.text(`Signature: ${data.company?.signature_text || '_________________________'}`, margin, y);
           y += 5;
           doc.text(`Date: ${formatDate(data.company?.signature_date)}`, margin, y);
           y += 15;
 
           doc.setFont('helvetica', 'bold');
           doc.text('Developer:', margin, y);
           y += 5;
           doc.setFont('helvetica', 'normal');
           doc.text('Vinh Nguyen', margin, y);
           y += 5;
           doc.text(`Signature: ${data.developer?.signature_text || '_________________________'}`, margin, y);
           y += 5;
           doc.text(`Date: ${formatDate(data.developer?.signature_date)}`, margin, y);
           break;
 
         case 'equity':
           doc.setFontSize(14);
           doc.text('FOUNDER EQUITY VESTING AGREEMENT', margin, y);
           y += 8;
           doc.setFontSize(10);
           doc.setTextColor(100);
           doc.text('(20% Ownership — Hybrid Vesting: Time + Milestones)', margin, y);
           y += 15;
 
           doc.setTextColor(0);
           y = addWrappedText(doc, 'This Agreement is entered into by Michael Lewis (Company) and Vinh Nguyen (Recipient) governing the grant and vesting of equity ownership in Asset Safe.', margin, y, contentWidth);
           y += 10;
 
           const equitySections = [
             { title: 'Equity Grant', text: '20% ownership interest (or equivalent units upon entity formation). No equity is earned unless and until vested.' },
             { title: 'Contractor Conversion', text: 'Equity becomes effective only upon formal written conversion from contractor to founder. Until conversion, Recipient has no ownership or voting rights.' },
             { title: 'Vesting Structure', text: 'Four 5% tranches: (1) 12-month service cliff, (2) Secure Vault launch, (3) Payments stability, (4) Mobile/Expansion release.' },
             { title: 'Service Requirement', text: 'All vesting conditioned upon continuous service. Unvested equity forfeited upon departure.' },
             { title: 'Repurchase Right', text: 'Company may repurchase vested equity at Fair Market Value or original issuance price.' },
             { title: 'Governing Law', text: 'Governed by Texas law with exclusive venue in Collin County, Texas.' },
           ];
 
           equitySections.forEach((section) => {
             if (y > 260) {
               doc.addPage();
               y = 20;
             }
             doc.setFontSize(11);
             doc.setFont('helvetica', 'bold');
             doc.text(section.title, margin, y);
             y += 6;
             doc.setFont('helvetica', 'normal');
             doc.setFontSize(9);
             y = addWrappedText(doc, section.text, margin, y, contentWidth, 4);
             y += 6;
           });
 
           // Signatures
           if (y > 200) {
             doc.addPage();
             y = 20;
           }
           y += 10;
           doc.setFontSize(12);
           doc.setFont('helvetica', 'bold');
           doc.text('SIGNATURES', margin, y);
           y += 10;
 
           doc.setFontSize(10);
           doc.setFont('helvetica', 'normal');
           const eqUnderstand = data.acknowledgment?.acknowledgments?.understand ? '☑' : '☐';
           const eqConversion = data.acknowledgment?.acknowledgments?.conversion ? '☑' : '☐';
           doc.text(`${eqUnderstand} I understand equity is earned only through time and milestone completion.`, margin, y);
           y += 5;
           doc.text(`${eqConversion} I understand this grant requires written contractor-to-founder conversion.`, margin, y);
           y += 15;
 
           doc.setFont('helvetica', 'bold');
           doc.text('Company Representative:', margin, y);
           y += 5;
           doc.setFont('helvetica', 'normal');
           doc.text('Michael Lewis, Founder, Asset Safe', margin, y);
           y += 5;
           doc.text(`Signature: ${data.company?.signature_text || '_________________________'}`, margin, y);
           y += 5;
           doc.text(`Date: ${formatDate(data.company?.signature_date)}`, margin, y);
           y += 15;
 
           doc.setFont('helvetica', 'bold');
           doc.text('Recipient:', margin, y);
           y += 5;
           doc.setFont('helvetica', 'normal');
           doc.text('Vinh Nguyen, Technical Founder (Subject to Vesting)', margin, y);
           y += 5;
           doc.text(`Signature: ${data.developer?.signature_text || '_________________________'}`, margin, y);
           y += 5;
           doc.text(`Date: ${formatDate(data.developer?.signature_date)}`, margin, y);
           break;
       }
 
       // Footer
       const pageCount = doc.getNumberOfPages();
       for (let i = 1; i <= pageCount; i++) {
         doc.setPage(i);
         doc.setFontSize(8);
         doc.setTextColor(150);
         doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
         doc.text('Asset Safe Legal Document - Confidential', pageWidth / 2, 295, { align: 'center' });
       }
 
       const fileName = `asset-safe-${agreementType}-agreement-${new Date().toISOString().split('T')[0]}.pdf`;
       doc.save(fileName);
       toast.success(`${agreementType.charAt(0).toUpperCase() + agreementType.slice(1)} Agreement exported to PDF`);
     } catch (error) {
       console.error('PDF export error:', error);
       toast.error('Failed to export PDF');
     }
   }, []);
 
   return { exportToPDF };
 };