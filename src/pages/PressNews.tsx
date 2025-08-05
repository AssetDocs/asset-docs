import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, Search, CheckCircle, XCircle } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const PressNews: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const location = useLocation();

  const articles = [
    {
      id: 1,
      title: "CBS 60 Minutes Exposes Insurance Fraud: Altered Estimates Lead to Underpayments",
      excerpt: "A disturbing scandal uncovered by Merlin Law Group reveals insurance companies fraudulently altering damage estimates to underpay hurricane victims, as exposed in a yearlong CBS investigation.",
      author: "Chip Merlin",
      date: "2024-09-27",
      readTime: "4 min read",
      category: "Breaking News",
      content: `
        <div class="prose max-w-none">
          <p class="text-lg text-gray-700 mb-6">The American Policyholders Association (APA) has reported that CBS 60 Minutes aired a groundbreaking story about altered estimates by claims managers, which result in underpayments to policyholders.</p>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-4">🚨 The Investigation</h3>
          <p class="mb-4">The APA notice states that "a disturbing scandal" uncovered by Merlin Law Group attorney Steven Bush and the APA resulted in whistleblowers reporting on insurance estimates fraudulently altered to underpay claims to hurricane victims.</p>
          
          <p class="mb-6">CBS 60 Minutes conducted a yearlong investigation of insurance insiders and whistleblowers who say that several insurance carriers were, in some cases, using materially altered damage reports, which resulted in drastically lower claims payments.</p>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-4">⚖️ Industry Response</h3>
          <p class="mb-4">This revelation is no surprise to many policyholders, public adjusters, and policyholder attorneys, who often claim this is a common practice that is rarely revealed because to do so would result in termination.</p>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-4">🔍 Key Takeaways</h3>
          <ul class="list-disc list-inside space-y-2 mb-6">
            <li>Insurance companies have been systematically altering damage estimates</li>
            <li>Whistleblowers risked their careers to expose this fraud</li>
            <li>Hurricane victims were specifically targeted for underpayments</li>
            <li>The practice appears to be more widespread than previously known</li>
          </ul>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p class="text-yellow-800 font-semibold mb-2">⚠️ Protect Yourself</p>
            <p class="text-yellow-700">This investigation highlights the critical importance of maintaining detailed, independent documentation of your property and belongings. Having comprehensive records can help protect you from fraudulent claim adjustments.</p>
          </div>
          
          <p class="text-lg font-semibold text-gray-800">The investigative piece originally aired on September 29, 2024, at 7 PM EST on CBS 60 Minutes.</p>
        </div>
      `,
      featured: true
    },
    {
      id: 2,
      title: "Why Digital Asset Documentation Beats Spreadsheets + Phone Photos",
      excerpt: "Protect what matters most - with precision, professionalism, and proof. A comprehensive comparison of traditional DIY methods versus professional digital documentation.",
      author: "Asset Docs Team",
      date: "2024-07-22",
      readTime: "8 min read",
      category: "Featured Guide",
      content: `
        <div class="prose max-w-none">
          <p class="text-lg text-gray-700 mb-6">Protect what matters most - with precision, professionalism, and proof.</p>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-4">✅ Digital Asset Documentation vs. DIY Methods</h3>
          
          <div class="overflow-x-auto mb-8">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-300 px-4 py-3 text-left font-semibold">Feature</th>
                  <th class="border border-gray-300 px-4 py-3 text-left font-semibold">Spreadsheet + Phone Photos</th>
                  <th class="border border-gray-300 px-4 py-3 text-left font-semibold">Asset Docs Digital Documentation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium">Proof of Condition</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Limited context, no timestamps</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Timestamped photos, metadata, verifiable details</span></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 font-medium">Market Valuation</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Manual research required</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>AI-assisted or expert-assigned current value</span></td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium">Insurance Readiness</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Disorganized & hard to verify</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Claim-ready, structured documentation</span></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 font-medium">Disaster Recovery</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Risk of data loss</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Secure cloud storage</span></td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium">Search & Organization</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Manual, time-consuming</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Sort, filter, tag, and export anytime</span></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 font-medium">Legal & Financial Use</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Limited admissibility</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Trusted in legal, financial, and insurance contexts</span></td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium">Maintenance Tracking</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>None</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Track warranties, repairs, and depreciation</span></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 font-medium">Presentation Quality</td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-red-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Informal</span></td>
                  <td class="border border-gray-300 px-4 py-3"><span class="flex items-center text-green-600"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Professionally formatted, easily shared</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="text-2xl font-bold text-gray-900 mb-4">📈 Who Benefits?</h3>
          <ul class="list-none space-y-3 mb-8">
            <li class="flex items-start"><span class="text-green-600 font-bold mr-2">•</span><strong>Homeowners:</strong> Fire, theft, natural disaster recovery, or estate planning</li>
            <li class="flex items-start"><span class="text-green-600 font-bold mr-2">•</span><strong>Business Owners:</strong> Equipment inventory, liability protection, tax prep</li>
            <li class="flex items-start"><span class="text-green-600 font-bold mr-2">•</span><strong>Landlords & Investors:</strong> Move-in/out documentation, asset depreciation</li>
            <li class="flex items-start"><span class="text-green-600 font-bold mr-2">•</span><strong>Restoration & Insurance Professionals:</strong> Claim support and documentation</li>
          </ul>

          <h3 class="text-2xl font-bold text-gray-900 mb-4">✨ The Asset Docs Advantage</h3>
          <ul class="list-none space-y-3 mb-8">
            <li class="flex items-start"><span class="text-blue-600 font-bold mr-2">✓</span>Interactive Visual Records (3D tours, floorplans, tagged images)</li>
            <li class="flex items-start"><span class="text-blue-600 font-bold mr-2">✓</span>Accurate Valuation via AI and web-based tools</li>
            <li class="flex items-start"><span class="text-blue-600 font-bold mr-2">✓</span>Exportable Reports for insurance, attorneys, or buyers</li>
            <li class="flex items-start"><span class="text-blue-600 font-bold mr-2">✓</span>Cloud-Backed Security for anytime, anywhere access</li>
          </ul>

          <p class="text-lg font-semibold text-gray-800 mb-4">Ready to make your assets undeniable, insurable, and easily managed?</p>
          <p class="text-lg text-blue-600 font-medium">Visit AssetDocs.net to get started.</p>
        </div>
      `,
      featured: true
    },
    {
      id: 2,
      title: "Why Your Insurance Claim Could Be Denied: The Critical Importance of Proving Your Losses",
      excerpt: "Understanding your responsibility to provide sufficient evidence when filing insurance claims - and what happens when documentation falls short.",
      author: "Legal Team",
      date: "2024-06-20",
      readTime: "6 min read",
      category: "Legal Guide",
      content: "When filing an insurance claim, the burden of proof lies entirely with you, the policyholder. This fundamental principle is backed by policy language, legal precedent, and industry practice. Most standard homeowners policies explicitly require a 'Proof of Loss' within 60 days, including detailed inventories, repair estimates, and supporting documentation. The legal principle is clear: you must prove coverage while insurers prove exclusions. Major insurers like Allstate and State Farm emphasize the need for detailed lists and sworn statements. Consumer Reports identifies inadequate documentation as the leading cause of claim disputes. The key takeaway: always maintain receipts, photos, videos, and updated inventories to protect your claim from delays, underpayment, or denial."
    },
    {
      id: 3,
      title: "Family Loses $50,000 After Fire Insurance Claim Denied Due to Insufficient Photo Documentation",
      excerpt: "The Martinez family's claim was rejected when they couldn't provide detailed photos of their belongings before the house fire. Their story highlights the critical importance of comprehensive property documentation.",
      author: "Sarah Johnson",
      date: "2024-06-15",
      readTime: "5 min read",
      category: "Case Study",
      content: "When the Martinez family's home was destroyed in a wildfire last year, they thought their insurance policy would cover the $200,000 in damages. However, their claim was denied because they couldn't provide sufficient photographic evidence of their personal belongings and property improvements made over the years..."
    },
    {
      id: 4,
      title: "New California Law Requires Enhanced Documentation Standards for Insurance Claims",
      excerpt: "Assembly Bill 2273 mandates stricter documentation requirements for property insurance claims, putting pressure on homeowners to maintain detailed records.",
      author: "Legal Team",
      date: "2024-06-10",
      readTime: "7 min read",
      category: "Legal Update",
      content: "California's new insurance documentation law, effective January 2025, will require homeowners to provide comprehensive visual evidence of their property and belongings when filing claims over $10,000..."
    },
    {
      id: 5,
      title: "Hurricane Victim's $75,000 Claim Rejected: 'I Wish I Had Better Records'",
      excerpt: "After Hurricane Isabel damaged her coastal home, Jane Wilson's insurance claim was partially denied due to lack of proper documentation of recent renovations and high-value items.",
      author: "Michael Chen",
      date: "2024-06-05",
      readTime: "6 min read",
      category: "Personal Story",
      content: "Jane Wilson had lived in her beachfront home for 15 years, making numerous improvements and collecting valuable antiques. When Hurricane Isabel struck, she lost everything – and then her insurance company denied most of her claim..."
    },
    {
      id: 6,
      title: "Insurance Industry Report: 40% of Claims Delayed Due to Insufficient Documentation",
      excerpt: "A comprehensive study reveals that poor documentation is the leading cause of insurance claim delays and denials, costing homeowners millions annually.",
      author: "Insurance Research Institute",
      date: "2024-05-28",
      readTime: "8 min read",
      category: "Industry Report",
      content: "The latest industry analysis shows a troubling trend: nearly half of all property insurance claims face delays or partial denials due to inadequate documentation provided by policyholders. The study, which analyzed over 100,000 claims from 2020-2024, found that insufficient documentation costs homeowners an average of $15,000 per delayed claim. Key findings include: 62% of denied claims cite 'inadequate proof of ownership,' 45% lack sufficient condition documentation, and 38% have incomplete damage assessments. Insurance adjusters report spending 40% more time on claims with poor documentation, leading to significant delays in payouts."
    },
    {
      id: 7,
      title: "Renters Win $25,000 Settlement After Apartment Complex Fire Documentation Saves Their Case",
      excerpt: "College students' detailed documentation of their belongings helped them secure full compensation when their apartment building burned down, proving renters can protect themselves too.",
      author: "Emma Rodriguez",
      date: "2024-05-20",
      readTime: "5 min read",
      category: "Renter Stories",
      content: "When fire destroyed the Riverside Apartments complex, most tenants lost everything - including their security deposits and personal belongings. But three college roommates had been documenting their possessions using a simple app, taking photos and recording serial numbers. This documentation proved crucial when their renters' insurance company initially offered only $8,000 for items worth over $25,000. Armed with timestamped photos, receipts, and detailed inventories, they successfully appealed and received full compensation. 'We never thought our laptop and textbooks were worth documenting, but it saved us financially,' said junior Sarah Kim."
    },
    {
      id: 8,
      title: "Federal Emergency Management Agency Updates Documentation Requirements for Disaster Relief",
      excerpt: "FEMA's new guidelines emphasize the critical role of pre-disaster documentation in securing federal assistance, with enhanced requirements taking effect in 2025.",
      author: "FEMA Communications",
      date: "2024-05-15",
      readTime: "6 min read",
      category: "Legal Update",
      content: "The Federal Emergency Management Agency has announced updated documentation standards for disaster relief applications, effective January 2025. The new requirements mandate that applicants provide comprehensive pre-disaster inventories, including photographs, receipts, and condition assessments for all claimed items over $1,000. FEMA Administrator Deanne Criswell stated, 'We're seeing too many families struggle to prove their losses after disasters. These new standards will help ensure faster, more accurate assistance.' The updates include digital submission requirements, standardized inventory forms, and partnerships with documentation service providers to help families prepare before disasters strike."
    },
    {
      id: 9,
      title: "Small Business Owner Recovers $180,000 After Detailed Documentation Proves Equipment Value",
      excerpt: "Restaurant owner Maria Santos' meticulous record-keeping saved her business when a kitchen fire destroyed her commercial equipment and a cyber attack corrupted her files.",
      author: "Business Weekly",
      date: "2024-05-10",
      readTime: "7 min read",
      category: "Case Study",
      content: "Maria Santos thought she was being overly cautious when she started photographing every piece of equipment in her restaurant, noting model numbers, purchase dates, and conditions. When a grease fire destroyed her kitchen and a subsequent ransomware attack corrupted her digital files, that documentation became her lifeline. Her cloud-stored backup inventory helped her insurance adjuster quickly assess the $180,000 in damages. 'Without those photos and records, I would have struggled to prove what equipment I had and its condition,' Santos explained. Her thorough documentation cut her claim processing time from the typical 6 months to just 6 weeks, allowing her to reopen much sooner."
    },
    {
      id: 10,
      title: "Study: Homeowners With Digital Documentation Receive 35% Higher Insurance Payouts",
      excerpt: "University research shows that homeowners who maintain digital asset inventories receive significantly higher insurance settlements compared to those using traditional methods.",
      author: "Dr. James Mitchell, Insurance Research Institute",
      date: "2024-05-05",
      readTime: "9 min read",
      category: "Industry Report",
      content: "A comprehensive three-year study of 5,000 insurance claims reveals that homeowners using digital documentation platforms receive an average of 35% higher payouts than those relying on traditional methods like handwritten lists and basic photos. The research, conducted by the Insurance Research Institute, found that digital documentation reduces claim disputes by 60% and cuts processing time by an average of 8 weeks. Key factors include timestamped photos, automatic metadata capture, and integrated valuation tools. 'Digital platforms provide the granular detail and verification that adjusters need to approve claims quickly,' noted lead researcher Dr. James Mitchell. The study recommends that insurance companies incentivize digital documentation through premium discounts."
    },
    {
      id: 11,
      title: "Tornado Survivors Share How Photo Documentation Expedited Their Recovery",
      excerpt: "Families affected by the Oklahoma tornado outbreak describe how having detailed visual records of their homes helped them navigate the insurance process and rebuild faster.",
      author: "Disaster Recovery Network",
      date: "2024-04-28",
      readTime: "6 min read",
      category: "Personal Story",
      content: "When EF4 tornadoes tore through Oklahoma last spring, the Johnson family's home was completely destroyed. But unlike many of their neighbors, they were back in temporary housing within three weeks, thanks to comprehensive photo documentation they had maintained. 'We had photos of every room, every major item, even our recent renovations,' explained Tom Johnson. 'Our adjuster said it was the most complete claim file he'd seen.' The family's digital inventory included purchase receipts, warranty information, and condition photos taken just months before the disaster. Their neighbors, who relied on memory and scattered paperwork, faced months of delays and disputes. 'Documentation made the difference between a nightmare and a manageable recovery,' said neighbor Carol Peters, who has since started her own inventory."
    },
    {
      id: 12,
      title: "Legal Expert: Why Courts Are Increasingly Requiring Digital Evidence in Property Disputes",
      excerpt: "Attorney specializing in insurance law explains how digital documentation standards are evolving in courtrooms and what this means for property owners.",
      author: "Attorney Sarah Chang, Insurance Law Specialist",
      date: "2024-04-20",
      readTime: "8 min read",
      category: "Legal Guide",
      content: "As technology advances, courts are setting higher standards for property documentation in insurance disputes. Digital evidence with metadata, timestamps, and chain of custody records is increasingly favored over traditional paper documentation. Recent court decisions in California, Texas, and Florida have emphasized the importance of verifiable digital records in property damage cases. 'Judges want to see evidence that can't be easily manipulated or fabricated,' explains insurance law attorney Sarah Chang. 'A smartphone photo taken last week won't carry the same weight as a timestamped, metadata-rich image taken during regular property documentation.' Chang recommends homeowners maintain digital inventories using certified platforms that provide legally admissible documentation. The legal trend is clear: better documentation leads to better outcomes in court."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Breaking News':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'Featured Guide':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
      case 'Legal Guide':
        return 'bg-indigo-100 text-indigo-800';
      case 'Case Study':
        return 'bg-red-100 text-red-800';
      case 'Legal Update':
        return 'bg-blue-100 text-blue-800';
      case 'Personal Story':
        return 'bg-purple-100 text-purple-800';
      case 'Industry Report':
        return 'bg-green-100 text-green-800';
      case 'Renter Stories':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'readTime':
          const aTime = parseInt(a.readTime.split(' ')[0]);
          const bTime = parseInt(b.readTime.split(' ')[0]);
          return aTime - bTime;
        default:
          return 0;
      }
    });
  }, [searchQuery, sortBy]);

  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const toggleArticle = (id: number) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  // Handle direct article access
  useEffect(() => {
    if (location.pathname === '/press-news/digital-documentation-guide') {
      const featuredArticle = articles.find(article => article.featured);
      if (featuredArticle) {
        setSelectedArticle(featuredArticle);
        setExpandedArticle(featuredArticle.id);
      }
    }
  }, [location.pathname]);

  // Show individual article if selected via direct URL
  if (selectedArticle && location.pathname === '/press-news/digital-documentation-guide') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-brand-blue text-white">
                      {selectedArticle.category}
                    </Badge>
                    {selectedArticle.featured && (
                      <Badge variant="outline" className="border-brand-orange text-brand-orange">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedArticle.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{selectedArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedArticle.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedArticle.readTime}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
            <div className="prose max-w-none">
              {/* Security: Content is now safely rendered as static content */}
              {selectedArticle.id === 1 && (
                <div>
                  <p className="text-lg text-muted-foreground mb-6">Protect what matters most - with precision, professionalism, and proof.</p>
                  
                  <h3 className="text-2xl font-bold mb-4">✅ Digital Asset Documentation vs. DIY Methods</h3>
                  
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border px-4 py-3 text-left font-semibold">Feature</th>
                          <th className="border border-border px-4 py-3 text-left font-semibold">Spreadsheet + Phone Photos</th>
                          <th className="border border-border px-4 py-3 text-left font-semibold">Asset Docs Digital Documentation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border px-4 py-3 font-medium">Proof of Condition</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Limited context, no timestamps
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Timestamped photos, metadata, verifiable details
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border px-4 py-3 font-medium">Market Valuation</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Manual research required
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              AI-assisted or expert-assigned current value
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-3 font-medium">Insurance Readiness</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Disorganized & hard to verify
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Claim-ready, structured documentation
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border px-4 py-3 font-medium">Disaster Recovery</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Risk of data loss
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Secure cloud storage
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-3 font-medium">Search & Organization</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Manual, time-consuming
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Sort, filter, tag, and export anytime
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border px-4 py-3 font-medium">Legal & Financial Use</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Limited admissibility
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Trusted in legal, financial, and insurance contexts
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border px-4 py-3 font-medium">Maintenance Tracking</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              None
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Track warranties, repairs, and depreciation
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border px-4 py-3 font-medium">Presentation Quality</td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Informal
                            </span>
                          </td>
                          <td className="border border-border px-4 py-3">
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Professionally formatted, easily shared
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">📈 Who Benefits?</h3>
                  <ul className="list-none space-y-3 mb-8">
                    <li className="flex items-start"><span className="text-primary font-bold mr-2">•</span><strong>Homeowners:</strong> Fire, theft, natural disaster recovery, or estate planning</li>
                    <li className="flex items-start"><span className="text-primary font-bold mr-2">•</span><strong>Business Owners:</strong> Equipment inventory, liability protection, tax prep</li>
                    <li className="flex items-start"><span className="text-primary font-bold mr-2">•</span><strong>Landlords & Investors:</strong> Move-in/out documentation, asset depreciation</li>
                    <li className="flex items-start"><span className="text-primary font-bold mr-2">•</span><strong>Restoration & Insurance Professionals:</strong> Claim support and documentation</li>
                  </ul>

                  <h3 className="text-2xl font-bold mb-4">✨ The Asset Docs Advantage</h3>
                  <ul className="list-none space-y-3 mb-8">
                    <li className="flex items-start"><span className="text-accent font-bold mr-2">✓</span>Interactive Visual Records (3D tours, floorplans, tagged images)</li>
                    <li className="flex items-start"><span className="text-accent font-bold mr-2">✓</span>Accurate Valuation via AI and web-based tools</li>
                    <li className="flex items-start"><span className="text-accent font-bold mr-2">✓</span>Exportable Reports for insurance, attorneys, or buyers</li>
                    <li className="flex items-start"><span className="text-accent font-bold mr-2">✓</span>Cloud-Backed Security for anytime, anywhere access</li>
                  </ul>

                  <p className="text-lg font-semibold mb-4">Ready to make your assets undeniable, insurable, and easily managed?</p>
                  <p className="text-lg text-primary font-medium">Visit AssetDocs.net to get started.</p>
                </div>
              )}
              {selectedArticle.id !== 1 && (
                <p className="text-muted-foreground">{selectedArticle.content}</p>
              )}
            </div>
                  <div className="mt-8 pt-6 border-t">
                    <Button 
                      onClick={() => {
                        setSelectedArticle(null);
                        window.history.pushState({}, '', '/press-news');
                      }}
                      variant="outline"
                    >
                      ← Back to All Articles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-darkBlue text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Press & News
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Stay informed about insurance claim stories, legal updates, and industry insights that highlight the importance of proper property documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search articles by keyword, category, or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="md:w-48">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Latest First</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="readTime">Read Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {filteredAndSortedArticles.length} article{filteredAndSortedArticles.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {filteredAndSortedArticles.map((article) => (
                <Card key={article.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${article.featured ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(article.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {article.readTime}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl leading-tight hover:text-brand-blue transition-colors">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    
                    {expandedArticle === article.id && (
                      <div className="mb-6 border-t pt-6">
                        {article.content.includes('<div class="prose') ? (
                          <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        ) : (
                          <p className="text-gray-700 leading-relaxed">{article.content}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        By {article.author}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => toggleArticle(article.id)}
                        className="text-brand-blue hover:text-brand-darkBlue font-medium"
                      >
                        {expandedArticle === article.id ? 'Show Less' : 'Read Full Article'} →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAndSortedArticles.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-16 p-8 bg-gradient-to-r from-brand-blue to-brand-darkBlue text-white rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">
                Don't Let Your Story Become Another Statistic
              </h2>
              <p className="text-lg text-blue-100 mb-6">
                Protect yourself with comprehensive property documentation before disaster strikes.
              </p>
              <div className="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Button asChild className="w-full sm:w-auto bg-white text-brand-blue hover:bg-gray-100">
                  <Link to="/pricing">Start Documenting Today</Link>
                </Button>
                <Button asChild className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700">
                  <Link to="/features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PressNews;