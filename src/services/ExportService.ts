import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ArchiveFile {
  id: string;
  name: string;
  url: string;
  folder: string;
  uploadDate?: string;
  type?: string;
}

interface ExportFileRow {
  id: string;
  file_path?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  created_at?: string | null;
  bucket_name?: string | null;
  storage_bucket?: string | null;
}

interface ExportUserProfile {
  account_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

interface ExportVerificationData {
  is_verified?: boolean | null;
  is_verified_plus?: boolean | null;
}

interface AssetValueEntry {
  id: string;
  name: string;
  value: number;
  source: 'property' | 'item' | 'file_value';
  category: string;
  parentName?: string;
  date?: string | null;
}

const EXPORT_SIGNED_URL_TTL_SECONDS = 15 * 60;
const ACCOUNT_EXPORT_DOWNLOAD_LIMIT = 5;

type ExtraZipFile = {
  path: string;
  blob: Blob;
};

type ZipBuildResult = {
  blob: Blob;
  downloadedCount: number;
  totalFiles: number;
};

type AccountExportAuditRpcClient = {
  rpc: (
    fn: 'log_account_export_audit',
    args: {
      p_export_type?: string;
      p_status?: 'started' | 'succeeded' | 'failed';
      p_file_count?: number | null;
      p_signed_url_ttl_seconds?: number | null;
      p_error_message?: string | null;
      p_metadata?: Record<string, unknown>;
    }
  ) => Promise<{ error: { message: string } | null }>;
};

type AccountExportBundleRequest = {
  audit_id: string;
  storage_bucket: string;
  storage_path: string;
  expires_at: string;
  download_limit: number;
};

type AccountExportBundleRpcClient = {
  rpc: {
    (
      fn: 'create_account_export_bundle_request',
      args: {
        p_export_type?: string;
        p_file_count?: number | null;
        p_signed_url_ttl_seconds?: number;
        p_download_limit?: number;
        p_metadata?: Record<string, unknown>;
      }
    ): Promise<{ data: AccountExportBundleRequest[] | null; error: { message: string } | null }>;
    (
      fn: 'mark_account_export_bundle_ready',
      args: {
        p_audit_id: string;
        p_storage_bucket: string;
        p_storage_path: string;
        p_bundle_file_name: string;
        p_bundle_size_bytes?: number | null;
        p_bundle_sha256?: string | null;
        p_error_message?: string | null;
      }
    ): Promise<{ data: string | null; error: { message: string } | null }>;
  };
};

type DownloadAccountExportBundleResponse = {
  signed_url?: string;
  signed_url_ttl_seconds?: number;
  download_count?: number;
  download_limit?: number;
  error?: string;
};

export interface AssetSummary {
  photos: Array<{
    id: string;
    name: string;
    url: string;
    uploadDate: string;
    category?: string;
  }>;
  videos: Array<{
    id: string;
    name: string;
    url: string;
    duration?: string;
    uploadDate: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadDate: string;
  }>;
  properties: Array<{
    id: string;
    name: string;
    address: string;
    type: string;
    estimatedValue: number;
    squareFootage?: number;
    yearBuilt?: number;
  }>;
  voiceNotes: Array<{
    id: string;
    title: string;
    description?: string;
    audioUrl?: string;
    audioFileName?: string;
    duration?: number;
    createdAt: string;
  }>;
  assetValueEntries: AssetValueEntry[];
  archiveFiles: ArchiveFile[];
  paintCodes: Array<{
    id: string;
    brand: string;
    name: string;
    code: string;
    roomLocation?: string;
    isInterior: boolean;
    propertyName?: string;
  }>;
  sourceWebsites: Array<{
    id: string;
    websiteName: string;
    websiteUrl: string;
    description?: string;
    category?: string;
  }>;
  items: Array<{
    id: string;
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    estimatedValue?: number;
    location?: string;
    condition?: string;
    createdAt: string;
  }>;
  vipContacts: Array<{
    id: string;
    name: string;
    relationship?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    notes?: string;
    priority: number;
    isEmergencyContact?: boolean;
    attachments: Array<{
      fileName: string;
      fileType: string;
      attachmentType: string;
      description?: string;
    }>;
  }>;
  damageReports: Array<{
    id: string;
    propertyName?: string;
    dateOfDamage?: string;
    incidentTypes: string[];
    areasAffected: string[];
    impactBuckets: string[];
    visibleDamage: string[];
    safetyConcerns: string[];
    actionsTaken: string[];
    estimatedCost?: string;
    contactedSomeone?: string;
    claimNumber?: string;
    additionalObservations?: string;
    createdAt: string;
  }>;
  insurancePolicies: Array<{
    id: string;
    policyType: string;
    insuranceCompany: string;
    policyNumber: string;
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
    policyStartDate?: string;
    policyEndDate?: string;
    premiumAmount?: number;
    deductible?: number;
    coverageAmount?: number;
    coverageDetails?: string;
    status: string;
  }>;
  familyRecipes: Array<{
    id: string;
    recipeName: string;
    createdByPerson?: string;
    details?: string;
    fileName?: string;
    fileUrl?: string;
    createdAt: string;
  }>;
  contributors: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
    acceptedAt?: string;
  }>;
}

export class ExportService {
  private static async logAccountExportAudit(
    status: 'started' | 'succeeded' | 'failed',
    fileCount: number | null = null,
    errorMessage: string | null = null,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      const auditClient = supabase as unknown as AccountExportAuditRpcClient;
      const { error } = await auditClient.rpc('log_account_export_audit', {
        p_export_type: 'complete_asset_summary',
        p_status: status,
        p_file_count: fileCount,
        p_signed_url_ttl_seconds: EXPORT_SIGNED_URL_TTL_SECONDS,
        p_error_message: errorMessage,
        p_metadata: metadata,
      });

      if (error) {
        console.error('Failed to log account export audit:', error.message);
      }
    } catch (auditError) {
      console.error('Failed to log account export audit:', auditError);
    }
  }

  private static countExportFiles(assets: AssetSummary): number {
    return assets.photos.length
      + assets.videos.length
      + assets.documents.length
      + assets.voiceNotes.filter(note => note.audioUrl).length
      + assets.archiveFiles.length
      + assets.familyRecipes.filter(recipe => recipe.fileUrl).length
      + (assets.assetValueEntries.length > 0 ? 2 : 0);
  }

  private static csvEscape(value: string | number | null | undefined): string {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  private static assetValueSourceLabel(source: AssetValueEntry['source']): string {
    switch (source) {
      case 'property':
        return 'Real Estate';
      case 'item':
        return 'Inventory Item';
      case 'file_value':
        return 'Documented File Value';
    }
  }

  private static buildAssetValuesSummaryCsv(entries: AssetValueEntry[]): string {
    const summary = new Map<string, { count: number; total: number }>();
    const grandTotal = entries.reduce((sum, entry) => sum + entry.value, 0);

    for (const entry of entries) {
      const existing = summary.get(entry.category) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += entry.value;
      summary.set(entry.category, existing);
    }

    const rows = [
      ['Category', 'Entries', 'Total Value', 'Percent of Total'],
      ...Array.from(summary.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .map(([category, data]) => [
          category,
          data.count,
          data.total.toFixed(2),
          grandTotal > 0 ? `${((data.total / grandTotal) * 100).toFixed(1)}%` : '0%'
        ]),
      ['Grand Total', entries.length, grandTotal.toFixed(2), '100%']
    ];

    return rows
      .map(row => row.map(value => this.csvEscape(value)).join(','))
      .join('\n');
  }

  private static buildAssetValuesItemizedCsv(entries: AssetValueEntry[]): string {
    const rows = [
      ['Asset Name', 'Parent', 'Category', 'Source', 'Value', 'Date'],
      ...[...entries]
        .sort((a, b) => b.value - a.value)
        .map(entry => [
          entry.name,
          entry.parentName || '',
          entry.category,
          this.assetValueSourceLabel(entry.source),
          entry.value.toFixed(2),
          entry.date ? new Date(entry.date).toLocaleDateString() : ''
        ])
    ];

    return rows
      .map(row => row.map(value => this.csvEscape(value)).join(','))
      .join('\n');
  }

  /**
   * Generate a comprehensive PDF summary of all assets
   */
  static async generateAssetSummaryPDF(
    assets: AssetSummary,
    userProfile?: ExportUserProfile | null,
    verificationData?: ExportVerificationData | null,
    saveFile = true
  ): Promise<Blob> {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const lineHeight = 7;

    // Helper function to add new page if needed
    const checkPageSpace = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // Header
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('Asset Safe - Complete Asset Summary', 20, yPosition);
    yPosition += 15;

    // User info
    if (userProfile) {
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Account: ${userProfile.account_number || 'N/A'}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Name: ${userProfile.first_name || ''} ${userProfile.last_name || ''}`, 20, yPosition);
      yPosition += lineHeight;

      // Account verification status
      let accountStatus = 'User';
      if (verificationData?.is_verified_plus) {
        accountStatus = 'Verified+';
      } else if (verificationData?.is_verified) {
        accountStatus = 'Verified';
      }
      pdf.setFont(undefined, 'bold');
      pdf.text(`Account Status: ${accountStatus}`, 20, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += lineHeight;
    }

    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    // Summary statistics
    checkPageSpace(80);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Summary Statistics', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Properties: ${assets.properties.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Photos: ${assets.photos.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Videos: ${assets.videos.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Documents: ${assets.documents.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Inventory Items: ${assets.items.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Voice Notes: ${assets.voiceNotes.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Paint Codes: ${assets.paintCodes.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Source Websites: ${assets.sourceWebsites.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`VIP Contacts: ${assets.vipContacts.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Damage Reports: ${assets.damageReports.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Insurance Policies: ${assets.insurancePolicies.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Family Recipes: ${assets.familyRecipes.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Contributors: ${assets.contributors.length}`, 30, yPosition);
    yPosition += 20;

    // Properties section
    if (assets.properties.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Properties', 20, yPosition);
      yPosition += 10;

      assets.properties.forEach((property, index) => {
        checkPageSpace(25);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${property.name}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.setFont(undefined, 'normal');
        pdf.text(`   Address: ${property.address}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Type: ${property.type} | Value: $${property.estimatedValue?.toLocaleString() || 'N/A'}`, 30, yPosition);
        yPosition += lineHeight;
        if (property.squareFootage) {
          pdf.text(`   Square Footage: ${property.squareFootage.toLocaleString()} sq ft`, 30, yPosition);
          yPosition += lineHeight;
        }
        yPosition += 3;
      });
      yPosition += 10;
    }

    // Inventory Items section
    if (assets.items.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Inventory Items', 20, yPosition);
      yPosition += 10;

      assets.items.forEach((item, index) => {
        checkPageSpace(25);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${index + 1}. ${item.name}`, 30, yPosition);
        yPosition += lineHeight;
        const details = [
          item.category && `Category: ${item.category}`,
          item.brand && `Brand: ${item.brand}`,
          item.estimatedValue && `Value: $${item.estimatedValue.toLocaleString()}`
        ].filter(Boolean).join(' | ');
        if (details) {
          pdf.text(`   ${details}`, 30, yPosition);
          yPosition += lineHeight;
        }
        pdf.text(`   Added: ${new Date(item.createdAt).toLocaleDateString()}`, 30, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 10;
    }

    // Photos section
    if (assets.photos.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Photos', 20, yPosition);
      yPosition += 10;

      assets.photos.forEach((photo, index) => {
        checkPageSpace(15);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${index + 1}. ${photo.name}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Category: ${photo.category || 'Uncategorized'} | Date: ${new Date(photo.uploadDate).toLocaleDateString()}`, 30, yPosition);
        yPosition += lineHeight + 2;
      });
      yPosition += 10;
    }

    // Videos section
    if (assets.videos.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Videos', 20, yPosition);
      yPosition += 10;

      assets.videos.forEach((video, index) => {
        checkPageSpace(15);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${index + 1}. ${video.name}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Date: ${new Date(video.uploadDate).toLocaleDateString()}`, 30, yPosition);
        yPosition += lineHeight + 2;
      });
      yPosition += 10;
    }

    // Documents section
    if (assets.documents.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Documents', 20, yPosition);
      yPosition += 10;

      assets.documents.forEach((doc, index) => {
        checkPageSpace(15);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${index + 1}. ${doc.name}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Type: ${doc.type} | Date: ${new Date(doc.uploadDate).toLocaleDateString()}`, 30, yPosition);
        yPosition += lineHeight + 2;
      });
      yPosition += 10;
    }

    // Voice Notes section
    if (assets.voiceNotes.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Voice Notes', 20, yPosition);
      yPosition += 10;

      assets.voiceNotes.forEach((note, index) => {
        checkPageSpace(20);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${note.title}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.setFont(undefined, 'normal');
        if (note.description) {
          const maxWidth = 150;
          const lines = pdf.splitTextToSize(`   ${note.description}`, maxWidth);
          lines.forEach((line: string) => {
            checkPageSpace(lineHeight);
            pdf.text(line, 30, yPosition);
            yPosition += lineHeight;
          });
        }
        pdf.text(`   Date: ${new Date(note.createdAt).toLocaleDateString()}${note.duration ? ` | Duration: ${Math.round(note.duration)}s` : ''}`, 30, yPosition);
        yPosition += lineHeight + 3;
      });
      yPosition += 10;
    }

    // Paint Codes section
    if (assets.paintCodes.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Paint Codes', 20, yPosition);
      yPosition += 10;

      assets.paintCodes.forEach((paint, index) => {
        checkPageSpace(20);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${index + 1}. ${paint.brand} - ${paint.name} (${paint.code})`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Location: ${paint.roomLocation || 'N/A'} | ${paint.isInterior ? 'Interior' : 'Exterior'}${paint.propertyName ? ` | Property: ${paint.propertyName}` : ''}`, 30, yPosition);
        yPosition += lineHeight + 2;
      });
      yPosition += 10;
    }

    // Source Websites section
    if (assets.sourceWebsites.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Source Websites', 20, yPosition);
      yPosition += 10;

      assets.sourceWebsites.forEach((site, index) => {
        checkPageSpace(20);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${index + 1}. ${site.websiteName}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   URL: ${site.websiteUrl}`, 30, yPosition);
        yPosition += lineHeight;
        if (site.description) {
          pdf.text(`   ${site.description}`, 30, yPosition);
          yPosition += lineHeight;
        }
        yPosition += 2;
      });
    }

    // VIP Contacts section
    if (assets.vipContacts.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('VIP Contacts', 20, yPosition);
      yPosition += 10;

      assets.vipContacts.forEach((contact, index) => {
        checkPageSpace(40);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        const priorityStars = '★'.repeat(contact.priority) + '☆'.repeat(5 - contact.priority);
        const emergencyLabel = contact.isEmergencyContact ? ' [EMERGENCY CONTACT]' : '';
        pdf.text(`${index + 1}. ${contact.name} ${priorityStars}${emergencyLabel}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.setFont(undefined, 'normal');
        
        if (contact.relationship) {
          pdf.text(`   Relationship: ${contact.relationship}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (contact.phone) {
          pdf.text(`   Phone: ${contact.phone}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (contact.email) {
          pdf.text(`   Email: ${contact.email}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (contact.address || contact.city || contact.state) {
          const addressParts = [contact.address, contact.city, contact.state, contact.zipCode].filter(Boolean);
          pdf.text(`   Address: ${addressParts.join(', ')}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (contact.notes) {
          const maxWidth = 150;
          const lines = pdf.splitTextToSize(`   Notes: ${contact.notes}`, maxWidth);
          lines.forEach((line: string) => {
            checkPageSpace(lineHeight);
            pdf.text(line, 30, yPosition);
            yPosition += lineHeight;
          });
        }
        if (contact.attachments.length > 0) {
          pdf.text(`   Attachments: ${contact.attachments.length} file(s)`, 30, yPosition);
          yPosition += lineHeight;
          contact.attachments.forEach((att) => {
            checkPageSpace(lineHeight);
            pdf.text(`      - ${att.fileName} (${att.attachmentType})`, 35, yPosition);
            yPosition += lineHeight;
          });
        }
        yPosition += 3;
      });
    }

    // Damage Reports section
    if (assets.damageReports.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Damage Reports', 20, yPosition);
      yPosition += 10;

      assets.damageReports.forEach((report, index) => {
        checkPageSpace(60);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        const title = report.propertyName 
          ? `${index + 1}. ${report.propertyName} - ${report.dateOfDamage || 'Date not specified'}`
          : `${index + 1}. Damage Report - ${report.dateOfDamage || 'Date not specified'}`;
        pdf.text(title, 30, yPosition);
        yPosition += lineHeight;
        pdf.setFont(undefined, 'normal');
        
        if (report.incidentTypes.length > 0) {
          pdf.text(`   Incident Types: ${report.incidentTypes.join(', ')}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (report.areasAffected.length > 0) {
          pdf.text(`   Areas Affected: ${report.areasAffected.join(', ')}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (report.impactBuckets.length > 0) {
          pdf.text(`   Impact: ${report.impactBuckets.join(', ')}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (report.visibleDamage.length > 0) {
          pdf.text(`   Visible Damage: ${report.visibleDamage.join(', ')}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (report.safetyConcerns.length > 0) {
          pdf.text(`   Safety Concerns: ${report.safetyConcerns.join(', ')}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (report.actionsTaken.length > 0) {
          pdf.text(`   Actions Taken: ${report.actionsTaken.join(', ')}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (report.estimatedCost) {
          pdf.text(`   Estimated Cost: ${report.estimatedCost}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (report.claimNumber) {
          pdf.text(`   Claim Number: ${report.claimNumber}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (report.additionalObservations) {
          const maxWidth = 150;
          const lines = pdf.splitTextToSize(`   Notes: ${report.additionalObservations}`, maxWidth);
          lines.forEach((line: string) => {
            checkPageSpace(lineHeight);
            pdf.text(line, 30, yPosition);
            yPosition += lineHeight;
          });
        }
        pdf.text(`   Created: ${new Date(report.createdAt).toLocaleDateString()}`, 30, yPosition);
        yPosition += lineHeight + 5;
      });
    }

    // Insurance Policies section
    if (assets.insurancePolicies.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Insurance Policies', 20, yPosition);
      yPosition += 10;

      assets.insurancePolicies.forEach((policy, index) => {
        checkPageSpace(50);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${policy.insuranceCompany} - ${policy.policyType}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.setFont(undefined, 'normal');
        pdf.text(`   Policy #: ${policy.policyNumber} | Status: ${policy.status}`, 30, yPosition);
        yPosition += lineHeight;
        if (policy.coverageAmount) {
          pdf.text(`   Coverage: $${policy.coverageAmount.toLocaleString()}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (policy.deductible) {
          pdf.text(`   Deductible: $${policy.deductible.toLocaleString()}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (policy.premiumAmount) {
          pdf.text(`   Premium: $${policy.premiumAmount.toLocaleString()}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (policy.policyStartDate || policy.policyEndDate) {
          const dates = [
            policy.policyStartDate && `Start: ${new Date(policy.policyStartDate).toLocaleDateString()}`,
            policy.policyEndDate && `End: ${new Date(policy.policyEndDate).toLocaleDateString()}`
          ].filter(Boolean).join(' | ');
          pdf.text(`   ${dates}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (policy.agentName) {
          const agentInfo = [
            policy.agentName,
            policy.agentPhone,
            policy.agentEmail
          ].filter(Boolean).join(' | ');
          pdf.text(`   Agent: ${agentInfo}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (policy.coverageDetails) {
          const maxWidth = 150;
          const lines = pdf.splitTextToSize(`   Details: ${policy.coverageDetails}`, maxWidth);
          lines.forEach((line: string) => {
            checkPageSpace(lineHeight);
            pdf.text(line, 30, yPosition);
            yPosition += lineHeight;
          });
        }
        yPosition += 3;
      });
      yPosition += 10;
    }

    // Family Recipes section
    if (assets.familyRecipes.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Family Recipes', 20, yPosition);
      yPosition += 10;

      assets.familyRecipes.forEach((recipe, index) => {
        checkPageSpace(25);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${recipe.recipeName}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.setFont(undefined, 'normal');
        if (recipe.createdByPerson) {
          pdf.text(`   Created by: ${recipe.createdByPerson}`, 30, yPosition);
          yPosition += lineHeight;
        }
        if (recipe.details) {
          const maxWidth = 150;
          const lines = pdf.splitTextToSize(`   ${recipe.details}`, maxWidth);
          lines.forEach((line: string) => {
            checkPageSpace(lineHeight);
            pdf.text(line, 30, yPosition);
            yPosition += lineHeight;
          });
        }
        if (recipe.fileName) {
          pdf.text(`   Attachment: ${recipe.fileName}`, 30, yPosition);
          yPosition += lineHeight;
        }
        pdf.text(`   Added: ${new Date(recipe.createdAt).toLocaleDateString()}`, 30, yPosition);
        yPosition += lineHeight + 3;
      });
      yPosition += 10;
    }

    // Contributors section
    if (assets.contributors.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Contributors', 20, yPosition);
      yPosition += 10;

      assets.contributors.forEach((contributor, index) => {
        checkPageSpace(20);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const name = [contributor.firstName, contributor.lastName].filter(Boolean).join(' ') || contributor.email;
        pdf.text(`${index + 1}. ${name}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Email: ${contributor.email} | Role: ${contributor.role}`, 30, yPosition);
        yPosition += lineHeight;
        if (contributor.acceptedAt) {
          pdf.text(`   Accepted: ${new Date(contributor.acceptedAt).toLocaleDateString()}`, 30, yPosition);
          yPosition += lineHeight;
        }
        yPosition += 2;
      });
    }

    const fileName = `asset-safe-summary-${new Date().toISOString().split('T')[0]}.pdf`;
    const pdfBlob = pdf.output('blob');
    if (saveFile) {
      pdf.save(fileName);
    }
    return pdfBlob;
  }

  /**
   * Create and download a zip file with all asset files
   */
  static async downloadAssetsZip(
    assets: AssetSummary,
    saveFile = true,
    extraFiles: ExtraZipFile[] = []
  ): Promise<ZipBuildResult | null> {
    const zip = new JSZip();
    let downloadedCount = 0;
    const recipeFiles = assets.familyRecipes.filter(r => r.fileUrl);
    const assetValueFileCount = assets.assetValueEntries.length > 0 ? 2 : 0;
    const extraFileCount = extraFiles.length;
    const totalFiles =
      assets.photos.length +
      assets.videos.length +
      assets.documents.length +
      assets.voiceNotes.filter(n => n.audioUrl).length +
      recipeFiles.length +
      assets.archiveFiles.length +
      assetValueFileCount +
      extraFileCount;

    if (totalFiles === 0) {
      toast({
        title: "No Files Found",
        description: "There are no files to download.",
        variant: "destructive"
      });
      return null;
    }

    const downloadFile = async (url: string, folder: JSZip, fileName: string) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          folder.file(fileName, blob);
          downloadedCount++;
        } else {
          console.warn(`Failed to download: ${fileName}`);
        }
      } catch (error) {
        console.error(`Error downloading ${fileName}:`, error);
      }
    };

    // Create folders and download files
    const photosFolder = zip.folder('photos');
    const videosFolder = zip.folder('videos');
    const documentsFolder = zip.folder('documents');
    const voiceNotesFolder = zip.folder('voice-notes');
    const recipesFolder = zip.folder('family-recipes');
    const assetValuesFolder = zip.folder('asset-values');
    const archiveFolders: Record<string, JSZip> = {};

    const sanitizeFolderName = (folder: string) =>
      folder.replace(/[^a-zA-Z0-9/_-]/g, '-').replace(/\/+/g, '/').replace(/^\/|\/$/g, '') || 'other-files';

    const sanitizeFileName = (fileName: string) =>
      Array.from(fileName.replace(/[<>:"/\\|?*]/g, '_'))
        .map(char => char.charCodeAt(0) < 32 ? '_' : char)
        .join('')
        .trim() || 'file';

    const getArchiveFolder = (folder: string) => {
      const cleanFolder = sanitizeFolderName(folder);
      if (!archiveFolders[cleanFolder]) {
        archiveFolders[cleanFolder] = zip.folder(cleanFolder) || zip;
      }
      return archiveFolders[cleanFolder];
    };

    const downloadPromises: Promise<void>[] = [];

    extraFiles.forEach((file) => {
      zip.file(sanitizeFolderName(file.path), file.blob);
      downloadedCount++;
    });

    // Download photos
    assets.photos.forEach((photo) => {
      if (photosFolder) {
        downloadPromises.push(downloadFile(photo.url, photosFolder, sanitizeFileName(photo.name)));
      }
    });

    // Download videos
    assets.videos.forEach((video) => {
      if (videosFolder) {
        downloadPromises.push(downloadFile(video.url, videosFolder, sanitizeFileName(video.name)));
      }
    });

    // Download documents
    assets.documents.forEach((doc) => {
      if (documentsFolder) {
        downloadPromises.push(downloadFile(doc.url, documentsFolder, sanitizeFileName(doc.name)));
      }
    });

    // Download voice notes
    assets.voiceNotes.forEach((note) => {
      if (voiceNotesFolder && note.audioUrl) {
        const fileName = note.audioFileName || `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
        downloadPromises.push(downloadFile(note.audioUrl, voiceNotesFolder, sanitizeFileName(fileName)));
      }
    });

    // Download family recipe attachments
    recipeFiles.forEach((recipe) => {
      if (recipesFolder && recipe.fileUrl) {
        const fileName = recipe.fileName || `${recipe.recipeName.replace(/[^a-zA-Z0-9]/g, '_')}`;
        downloadPromises.push(downloadFile(recipe.fileUrl, recipesFolder, sanitizeFileName(fileName)));
      }
    });

    // Include read-only Asset Values rollups as generated CSV files.
    if (assetValuesFolder && assets.assetValueEntries.length > 0) {
      assetValuesFolder.file('asset-values-summary.csv', this.buildAssetValuesSummaryCsv(assets.assetValueEntries));
      assetValuesFolder.file('asset-values-itemized.csv', this.buildAssetValuesItemizedCsv(assets.assetValueEntries));
      downloadedCount += assetValueFileCount;
    }

    // Download dashboard attachment tables that are not represented by the
    // core photo/video/document arrays.
    assets.archiveFiles.forEach((file) => {
      const folder = getArchiveFolder(file.folder);
      downloadPromises.push(downloadFile(file.url, folder, sanitizeFileName(file.name)));
    });

    try {
      // Wait for all downloads to complete
      await Promise.allSettled(downloadPromises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = `asset-safe-backup-${new Date().toISOString().split('T')[0]}.zip`;
      if (saveFile) {
        saveAs(zipBlob, fileName);
      }

      toast({
        title: saveFile ? "Assets Downloaded" : "Archive Prepared",
        description: `Successfully prepared ${downloadedCount} of ${totalFiles} files.`,
      });
      return { blob: zipBlob, downloadedCount, totalFiles };
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast({
        title: "Download Failed",
        description: "There was an error creating the backup file.",
        variant: "destructive"
      });
      return null;
    }
  }

  /**
   * Get real asset data from the database
   */
  static async getUserAssets(userId: string): Promise<AssetSummary> {
    const assets: AssetSummary = {
      photos: [],
      videos: [],
      documents: [],
      properties: [],
      voiceNotes: [],
      assetValueEntries: [],
      archiveFiles: [],
      paintCodes: [],
      sourceWebsites: [],
      items: [],
      vipContacts: [],
      damageReports: [],
      insurancePolicies: [],
      familyRecipes: [],
      contributors: []
    };

    try {
      const fileNameFromPath = (path?: string | null) => {
        if (!path) return null;
        const cleanPath = path.split('?')[0];
        return cleanPath.split('/').filter(Boolean).pop() || null;
      };

      const archiveFileName = (name?: string | null, path?: string | null, fallback = 'file') =>
        name || fileNameFromPath(path) || fallback;

      const addAssetValueEntry = (entry: AssetValueEntry) => {
        if (entry.value > 0) {
          assets.assetValueEntries.push(entry);
        }
      };

      const fileValueDedupeKeys = new Set<string>();

      const getFileItemValues = (itemValues: unknown): Array<{ name?: unknown; value?: unknown }> => {
        if (!Array.isArray(itemValues)) return [];
        return itemValues.filter(value => value && typeof value === 'object') as Array<{ name?: unknown; value?: unknown }>;
      };

      const getUploadMinute = (createdAt?: string | null) => {
        const date = createdAt ? new Date(createdAt) : null;
        if (!date || Number.isNaN(date.getTime())) return 'unknown-minute';
        date.setSeconds(0, 0);
        return date.toISOString();
      };

      const signStoragePaths = async (bucket: string, paths: string[]) => {
        const uniquePaths = Array.from(new Set(paths.filter(Boolean)));
        const signedMap: Record<string, string> = {};
        if (uniquePaths.length === 0) return signedMap;

        try {
          const { data: signedUrls } = await supabase.storage
            .from(bucket)
            .createSignedUrls(uniquePaths, EXPORT_SIGNED_URL_TTL_SECONDS);

          if (signedUrls) {
            for (const signed of signedUrls) {
              if (signed.signedUrl && signed.path) {
                signedMap[signed.path] = signed.signedUrl;
              }
            }
          }
        } catch (err) {
          console.error(`Error signing archive URLs for bucket ${bucket}:`, err);
        }

        return signedMap;
      };

      const addStorageRowsToArchive = async <T extends ExportFileRow>(
        rows: T[] | null | undefined,
        options: {
          folder: string;
          fallbackName: string;
          bucketForRow: (row: T) => string;
          nameForRow?: (row: T) => string;
          typeForRow?: (row: T) => string | undefined;
        }
      ) => {
        const fileRows = (rows || []).filter(row => row.file_path || row.file_url);
        if (fileRows.length === 0) return;

        const bucketGroups: Record<string, string[]> = {};
        for (const row of fileRows) {
          if (!row.file_path) continue;
          const bucket = options.bucketForRow(row);
          if (!bucketGroups[bucket]) bucketGroups[bucket] = [];
          bucketGroups[bucket].push(row.file_path);
        }

        const signedUrlMap: Record<string, string> = {};
        for (const [bucket, paths] of Object.entries(bucketGroups)) {
          const signedPaths = await signStoragePaths(bucket, paths);
          for (const [path, signedUrl] of Object.entries(signedPaths)) {
            signedUrlMap[`${bucket}:${path}`] = signedUrl;
          }
        }

        for (const row of fileRows) {
          const bucket = options.bucketForRow(row);
          const signedUrl = row.file_path ? signedUrlMap[`${bucket}:${row.file_path}`] : null;
          const url = signedUrl || row.file_url;
          if (!url) continue;

          assets.archiveFiles.push({
            id: row.id,
            name: options.nameForRow?.(row) || archiveFileName(row.file_name, row.file_path, `${options.fallbackName}-${row.id}`),
            url,
            folder: options.folder,
            uploadDate: row.created_at || new Date().toISOString(),
            type: options.typeForRow?.(row) || row.file_type || undefined
          });
        }
      };

      // Fetch properties
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', userId);

      if (!propertiesError && properties) {
        assets.properties = properties.map(p => ({
          id: p.id,
          name: p.name,
          address: p.address,
          type: p.type,
          estimatedValue: p.estimated_value || 0,
          squareFootage: p.square_footage || undefined,
          yearBuilt: p.year_built || undefined
        }));

        properties.forEach(property => {
          addAssetValueEntry({
            id: `prop-${property.id}`,
            name: property.name || property.address || 'Unnamed Property',
            value: Number(property.estimated_value) || 0,
            source: 'property',
            category: 'Real Estate',
            date: property.created_at
          });
        });
      }

      // Fetch property files (photos, videos, documents, floor-plans)
      const { data: propertyFiles, error: propertyFilesError } = await supabase
        .from('property_files')
        .select('*')
        .eq('user_id', userId);

      if (!propertyFilesError && propertyFiles) {
        // Group files by bucket to batch-sign URLs
        const bucketGroups: Record<string, typeof propertyFiles> = {};
        for (const file of propertyFiles) {
          const bucket = file.bucket_name || 'documents';
          if (!bucketGroups[bucket]) bucketGroups[bucket] = [];
          bucketGroups[bucket].push(file);
        }

        // Generate fresh signed URLs for all files (private buckets)
        const signedUrlMap: Record<string, string> = {};
        for (const [bucket, files] of Object.entries(bucketGroups)) {
          const paths = files.map(f => f.file_path);
          try {
            const { data: signedUrls } = await supabase.storage
              .from(bucket)
              .createSignedUrls(paths, EXPORT_SIGNED_URL_TTL_SECONDS);
            if (signedUrls) {
              for (const s of signedUrls) {
                if (s.signedUrl && s.path) {
                  signedUrlMap[`${bucket}:${s.path}`] = s.signedUrl;
                }
              }
            }
          } catch (err) {
            console.error(`Error signing URLs for bucket ${bucket}:`, err);
          }
        }

        propertyFiles.forEach(file => {
          const bucket = file.bucket_name || 'documents';
          const freshUrl = signedUrlMap[`${bucket}:${file.file_path}`] || file.file_url;
          const fileData = {
            id: file.id,
            name: file.file_name,
            url: freshUrl,
            uploadDate: file.created_at || new Date().toISOString()
          };

          switch (bucket) {
            case 'photos':
              assets.photos.push({
                ...fileData,
                category: file.file_type || 'Uncategorized'
              });
              break;
            case 'videos':
              assets.videos.push(fileData);
              break;
            case 'documents':
              assets.documents.push({
                ...fileData,
                type: file.file_type || 'Document'
              });
              break;
            case 'memory-safe':
              assets.documents.push({
                ...fileData,
                type: 'Memory Safe'
              });
              break;
          }

          getFileItemValues(file.item_values).forEach((itemValue, index) => {
            const value = Number(itemValue.value) || 0;
            const name = typeof itemValue.name === 'string' && itemValue.name.trim()
              ? itemValue.name.trim()
              : 'Unnamed Value';
            const dedupeKey = [
              file.property_id || 'no-property',
              file.file_type || 'unknown-type',
              file.folder_id || 'no-folder',
              getUploadMinute(file.created_at),
              index,
              name.toLowerCase(),
              value,
            ].join('|');

            if (fileValueDedupeKeys.has(dedupeKey)) return;
            fileValueDedupeKeys.add(dedupeKey);

            addAssetValueEntry({
              id: `fv-${file.id}-${index + 1}`,
              name,
              value,
              source: 'file_value',
              category: 'File Documented Values',
              parentName: file.file_name,
              date: file.created_at
            });
          });
        });
      }

      // Fetch legacy locker files
      const { data: legacyFiles, error: legacyFilesError } = await supabase
        .from('legacy_locker_files')
        .select('*')
        .eq('user_id', userId);

      if (!legacyFilesError && legacyFiles && legacyFiles.length > 0) {
        // Sign URLs for legacy locker files grouped by bucket
        const legacyBucketGroups: Record<string, typeof legacyFiles> = {};
        for (const file of legacyFiles) {
          const bucket = file.bucket_name || 'documents';
          if (!legacyBucketGroups[bucket]) legacyBucketGroups[bucket] = [];
          legacyBucketGroups[bucket].push(file);
        }

        const legacySignedMap: Record<string, string> = {};
        for (const [bucket, files] of Object.entries(legacyBucketGroups)) {
          const paths = files.map(f => f.file_path).filter(Boolean) as string[];
          if (paths.length === 0) continue;
          try {
            const { data: signedUrls } = await supabase.storage
              .from(bucket)
              .createSignedUrls(paths, EXPORT_SIGNED_URL_TTL_SECONDS);
            if (signedUrls) {
              for (const s of signedUrls) {
                if (s.signedUrl && s.path) legacySignedMap[`${bucket}:${s.path}`] = s.signedUrl;
              }
            }
          } catch (err) {
            console.error(`Error signing legacy file URLs:`, err);
          }
        }

        legacyFiles.forEach(file => {
          const bucket = file.bucket_name || 'documents';
          const freshUrl = (file.file_path ? legacySignedMap[`${bucket}:${file.file_path}`] : null) || file.file_url;
          const fileData = {
            id: file.id,
            name: file.file_name,
            url: freshUrl,
            uploadDate: file.created_at || new Date().toISOString()
          };

          const ext = file.file_name.toLowerCase().split('.').pop();
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            assets.photos.push({ ...fileData, category: 'Legacy Locker' });
          } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
            assets.videos.push(fileData);
          } else {
            assets.documents.push({ ...fileData, type: file.file_type || 'Document' });
          }
        });
      }

      // Fetch inventory items
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId);

      if (!itemsError && items) {
        assets.items = items.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category || undefined,
          brand: item.brand || undefined,
          model: item.model || undefined,
          estimatedValue: item.estimated_value || undefined,
          location: item.location || undefined,
          condition: item.condition || undefined,
          createdAt: item.created_at || new Date().toISOString()
        }));

        items.forEach(item => {
          addAssetValueEntry({
            id: `item-${item.id}`,
            name: item.name || 'Unnamed Item',
            value: Number(item.estimated_value) || 0,
            source: 'item',
            category: item.category || 'Other',
            date: item.created_at
          });
        });

        // Also add item photos with fresh signed URLs
        const itemsWithPhotos = items.filter(item => item.photo_path);
        if (itemsWithPhotos.length > 0) {
          const photoPaths = itemsWithPhotos.map(i => i.photo_path!);
          try {
            const { data: signedUrls } = await supabase.storage
              .from('photos')
              .createSignedUrls(photoPaths, EXPORT_SIGNED_URL_TTL_SECONDS);
            const itemPhotoMap: Record<string, string> = {};
            if (signedUrls) {
              for (const s of signedUrls) {
                if (s.signedUrl && s.path) itemPhotoMap[s.path] = s.signedUrl;
              }
            }
            itemsWithPhotos.forEach(item => {
              const freshUrl = itemPhotoMap[item.photo_path!] || item.photo_url;
              if (freshUrl) {
                assets.photos.push({
                  id: item.id,
                  name: item.name || 'Item Photo',
                  url: freshUrl,
                  uploadDate: item.created_at || new Date().toISOString(),
                  category: item.category || 'Inventory'
                });
              }
            });
          } catch (err) {
            console.error('Error signing item photo URLs:', err);
          }
        }
      }

      // Fetch receipts
      const { data: receipts, error: receiptsError } = await supabase
        .from('receipts')
        .select('id, receipt_name, receipt_url, receipt_path, created_at')
        .eq('user_id', userId);

      if (!receiptsError && receipts && receipts.length > 0) {
        const receiptPaths = receipts.map(r => r.receipt_path).filter(Boolean) as string[];
        const receiptSignedMap: Record<string, string> = {};
        if (receiptPaths.length > 0) {
          try {
            const { data: signedUrls } = await supabase.storage
              .from('documents')
              .createSignedUrls(receiptPaths, EXPORT_SIGNED_URL_TTL_SECONDS);
            if (signedUrls) {
              for (const s of signedUrls) {
                if (s.signedUrl && s.path) receiptSignedMap[s.path] = s.signedUrl;
              }
            }
          } catch (err) {
            console.error('Error signing receipt URLs:', err);
          }
        }

        receipts.forEach(receipt => {
          const freshUrl = (receipt.receipt_path ? receiptSignedMap[receipt.receipt_path] : null) || receipt.receipt_url;
          assets.documents.push({
            id: receipt.id,
            name: receipt.receipt_name,
            url: freshUrl,
            type: 'Receipt',
            uploadDate: receipt.created_at || new Date().toISOString()
          });
        });
      }

      // Fetch user_documents (standalone documents not in property_files)
      const { data: userDocs, error: userDocsError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId);

      if (!userDocsError && userDocs && userDocs.length > 0) {
        const docPaths = userDocs.map(d => d.file_path).filter(Boolean) as string[];
        const docSignedMap: Record<string, string> = {};
        if (docPaths.length > 0) {
          try {
            const { data: signedUrls } = await supabase.storage
              .from('documents')
              .createSignedUrls(docPaths, EXPORT_SIGNED_URL_TTL_SECONDS);
            if (signedUrls) {
              for (const s of signedUrls) {
                if (s.signedUrl && s.path) docSignedMap[s.path] = s.signedUrl;
              }
            }
          } catch (err) {
            console.error('Error signing user document URLs:', err);
          }
        }

        userDocs.forEach(doc => {
          const freshUrl = (doc.file_path ? docSignedMap[doc.file_path] : null) || doc.file_url;
          assets.documents.push({
            id: doc.id,
            name: doc.file_name || doc.document_name || 'Document',
            url: freshUrl,
            type: doc.document_type || doc.category || 'Document',
            uploadDate: doc.created_at || new Date().toISOString()
          });
        });
      }

      // Fetch Quick Notes attachments
      const { data: quickNotes, error: quickNotesError } = await supabase
        .from('user_notes')
        .select('id, title, file_name, file_path, bucket_name, created_at')
        .eq('user_id', userId);

      if (!quickNotesError && quickNotes) {
        await addStorageRowsToArchive(quickNotes, {
          folder: 'quick-notes',
          fallbackName: 'quick-note',
          bucketForRow: row => row.bucket_name || 'documents',
          nameForRow: row => archiveFileName(row.file_name, row.file_path, `${row.title || 'quick-note'}-${row.id}`)
        });
      }

      // Fetch Notes & Traditions attachments
      const { data: notesTraditions, error: notesTraditionsError } = await supabase
        .from('notes_traditions')
        .select('id, title, file_name, file_path, file_url, bucket_name, created_at')
        .eq('user_id', userId);

      if (!notesTraditionsError && notesTraditions) {
        await addStorageRowsToArchive(notesTraditions, {
          folder: 'notes-traditions',
          fallbackName: 'note-tradition',
          bucketForRow: row => row.bucket_name || 'documents',
          nameForRow: row => archiveFileName(row.file_name, row.file_path, `${row.title || 'note-tradition'}-${row.id}`)
        });
      }

      // Fetch Memory Safe files
      const { data: memorySafeItems, error: memorySafeError } = await supabase
        .from('memory_safe_items')
        .select('id, title, file_name, file_path, file_url, file_type, created_at')
        .eq('user_id', userId);

      if (!memorySafeError && memorySafeItems) {
        await addStorageRowsToArchive(memorySafeItems, {
          folder: 'memory-safe',
          fallbackName: 'memory',
          bucketForRow: () => 'memory-safe',
          nameForRow: row => archiveFileName(row.file_name, row.file_path, `${row.title || 'memory'}-${row.id}`),
          typeForRow: row => row.file_type || undefined
        });
      }

      // Fetch Calendar attachment rows if any exist in production
      const { data: calendarAttachments, error: calendarAttachmentsError } = await supabase
        .from('calendar_event_attachments')
        .select('id, file_name, file_path, file_type, created_at')
        .eq('user_id', userId);

      if (!calendarAttachmentsError && calendarAttachments) {
        await addStorageRowsToArchive(calendarAttachments, {
          folder: 'calendar-attachments',
          fallbackName: 'calendar-attachment',
          bucketForRow: () => 'documents',
          typeForRow: row => row.file_type || undefined
        });
      }

      // Fetch voice notes
      const { data: voiceNotes, error: voiceNotesError } = await supabase
        .from('legacy_locker_voice_notes')
        .select('*')
        .eq('user_id', userId);

      if (!voiceNotesError && voiceNotes && voiceNotes.length > 0) {
        // Sign voice note audio URLs
        const notesWithPaths = voiceNotes.filter(n => n.audio_path);
        const voiceSignedMap: Record<string, string> = {};
        if (notesWithPaths.length > 0) {
          const paths = notesWithPaths.map(n => n.audio_path!);
          try {
            const { data: signedUrls } = await supabase.storage
              .from('documents')
              .createSignedUrls(paths, EXPORT_SIGNED_URL_TTL_SECONDS);
            if (signedUrls) {
              for (const s of signedUrls) {
                if (s.signedUrl && s.path) voiceSignedMap[s.path] = s.signedUrl;
              }
            }
          } catch (err) {
            console.error('Error signing voice note URLs:', err);
          }
        }

        assets.voiceNotes = voiceNotes.map(note => ({
          id: note.id,
          title: note.title,
          description: note.description || undefined,
          audioUrl: (note.audio_path ? voiceSignedMap[note.audio_path] : null) || note.audio_url || undefined,
          audioFileName: archiveFileName(null, note.audio_path, `${note.title || 'voice-note'}-${note.id}.webm`),
          duration: note.duration || undefined,
          createdAt: note.created_at || new Date().toISOString()
        }));
      }

      // Fetch files attached to voice notes
      const { data: voiceNoteAttachments, error: voiceNoteAttachmentsError } = await supabase
        .from('voice_note_attachments')
        .select('id, file_name, file_path, file_url, file_type, storage_bucket, created_at')
        .eq('user_id', userId);

      if (!voiceNoteAttachmentsError && voiceNoteAttachments) {
        await addStorageRowsToArchive(voiceNoteAttachments, {
          folder: 'voice-note-attachments',
          fallbackName: 'voice-note-attachment',
          bucketForRow: row => row.storage_bucket || 'documents',
          typeForRow: row => row.file_type || undefined
        });
      }

      // Fetch paint codes with property names
      const { data: paintCodes, error: paintCodesError } = await supabase
        .from('paint_codes')
        .select('*, properties(name)')
        .eq('user_id', userId);

      if (!paintCodesError && paintCodes) {
        assets.paintCodes = paintCodes.map(paint => ({
          id: paint.id,
          brand: paint.paint_brand,
          name: paint.paint_name,
          code: paint.paint_code,
          roomLocation: paint.room_location || undefined,
          isInterior: paint.is_interior,
          propertyName: (paint.properties as { name?: string | null } | null)?.name || undefined
        }));

        const paintSwatches = paintCodes
          .filter(paint => paint.swatch_image_path || paint.swatch_image_url)
          .map(paint => ({
            id: paint.id,
            file_path: paint.swatch_image_path,
            file_url: paint.swatch_image_url,
            file_name: archiveFileName(
              null,
              paint.swatch_image_path,
              `${paint.paint_name || paint.paint_brand || 'paint'}-swatch`
            ),
            created_at: paint.created_at,
            file_type: 'image'
          }));

        await addStorageRowsToArchive(paintSwatches, {
          folder: 'paint-swatches',
          fallbackName: 'paint-swatch',
          bucketForRow: () => 'photos',
          typeForRow: row => row.file_type || undefined
        });
      }

      // Fetch source websites
      const { data: sourceWebsites, error: sourceWebsitesError } = await supabase
        .from('source_websites')
        .select('*')
        .eq('user_id', userId);

      if (!sourceWebsitesError && sourceWebsites) {
        assets.sourceWebsites = sourceWebsites.map(site => ({
          id: site.id,
          websiteName: site.website_name,
          websiteUrl: site.website_url,
          description: site.description || undefined,
          category: site.category || undefined
        }));
      }

      // Fetch VIP contacts with attachments
      const { data: vipContacts, error: vipContactsError } = await supabase
        .from('vip_contacts')
        .select('*')
        .eq('user_id', userId);

      if (!vipContactsError && vipContacts) {
        // Fetch attachments for all contacts
        const { data: allAttachments } = await supabase
          .from('vip_contact_attachments')
          .select('*')
          .eq('user_id', userId);

        await addStorageRowsToArchive(allAttachments, {
          folder: 'vip-contact-attachments',
          fallbackName: 'vip-contact-attachment',
          bucketForRow: () => 'contact-attachments',
          typeForRow: row => row.file_type || undefined
        });

        assets.vipContacts = vipContacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          relationship: contact.relationship || undefined,
          email: contact.email || undefined,
          phone: contact.phone || undefined,
          address: contact.address || undefined,
          city: contact.city || undefined,
          state: contact.state || undefined,
          zipCode: contact.zip_code || undefined,
          notes: contact.notes || undefined,
          priority: contact.priority,
          isEmergencyContact: contact.is_emergency_contact || false,
          attachments: (allAttachments || [])
            .filter(att => att.contact_id === contact.id)
            .map(att => ({
              fileName: att.file_name,
              fileType: att.file_type,
              attachmentType: att.attachment_type,
              description: att.description || undefined
            }))
        }));
      }

      // Fetch damage reports
      const { data: damageReports, error: damageReportsError } = await supabase
        .from('damage_reports')
        .select('*, properties(name)')
        .eq('user_id', userId);

      if (!damageReportsError && damageReports) {
        assets.damageReports = damageReports.map(report => ({
          id: report.id,
          propertyName: (report.properties as { name?: string | null } | null)?.name || undefined,
          dateOfDamage: report.date_of_damage || undefined,
          incidentTypes: report.incident_types || [],
          areasAffected: report.areas_affected || [],
          impactBuckets: report.impact_buckets || [],
          visibleDamage: report.visible_damage || [],
          safetyConcerns: report.safety_concerns || [],
          actionsTaken: report.actions_taken || [],
          estimatedCost: report.estimated_cost || undefined,
          contactedSomeone: report.contacted_someone || undefined,
          claimNumber: report.claim_number || undefined,
          additionalObservations: report.additional_observations || undefined,
          createdAt: report.created_at || new Date().toISOString()
        }));
      }

      // Fetch insurance policies
      const { data: insurancePolicies, error: insuranceError } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('user_id', userId);

      if (!insuranceError && insurancePolicies) {
        assets.insurancePolicies = insurancePolicies.map(policy => ({
          id: policy.id,
          policyType: policy.policy_type,
          insuranceCompany: policy.insurance_company,
          policyNumber: policy.policy_number,
          agentName: policy.agent_name || undefined,
          agentPhone: policy.agent_phone || undefined,
          agentEmail: policy.agent_email || undefined,
          policyStartDate: policy.policy_start_date || undefined,
          policyEndDate: policy.policy_end_date || undefined,
          premiumAmount: policy.premium_amount || undefined,
          deductible: policy.deductible || undefined,
          coverageAmount: policy.coverage_amount || undefined,
          coverageDetails: policy.coverage_details || undefined,
          status: policy.status
        }));
      }

      // Fetch family recipes
      const { data: familyRecipes, error: recipesError } = await supabase
        .from('family_recipes')
        .select('*')
        .eq('user_id', userId);

      if (!recipesError && familyRecipes && familyRecipes.length > 0) {
        // Sign recipe file URLs
        const recipesWithFiles = familyRecipes.filter(r => r.file_path);
        const recipeSignedMap: Record<string, string> = {};
        if (recipesWithFiles.length > 0) {
          const paths = recipesWithFiles.map(r => r.file_path!);
          const bucket = recipesWithFiles[0].bucket_name || 'documents';
          try {
            const { data: signedUrls } = await supabase.storage
              .from(bucket)
              .createSignedUrls(paths, EXPORT_SIGNED_URL_TTL_SECONDS);
            if (signedUrls) {
              for (const s of signedUrls) {
                if (s.signedUrl && s.path) recipeSignedMap[s.path] = s.signedUrl;
              }
            }
          } catch (err) {
            console.error('Error signing recipe file URLs:', err);
          }
        }

        assets.familyRecipes = familyRecipes.map(recipe => ({
          id: recipe.id,
          recipeName: recipe.recipe_name,
          createdByPerson: recipe.created_by_person || undefined,
          details: recipe.details || undefined,
          fileName: recipe.file_name || undefined,
          fileUrl: (recipe.file_path ? recipeSignedMap[recipe.file_path] : null) || recipe.file_url || undefined,
          createdAt: recipe.created_at || new Date().toISOString()
        }));
      }

      // Fetch contributors (accepted only)
      const { data: contributors, error: contributorsError } = await supabase
        .from('contributors')
        .select('*')
        .eq('account_owner_id', userId)
        .eq('status', 'accepted');

      if (!contributorsError && contributors) {
        assets.contributors = contributors.map(c => ({
          id: c.id,
          firstName: c.first_name || undefined,
          lastName: c.last_name || undefined,
          email: c.contributor_email,
          role: c.role,
          acceptedAt: c.accepted_at || undefined
        }));
      }

    } catch (error) {
      console.error('Error fetching user assets:', error);
    }

    return assets;
  }

  private static async sha256Hex(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private static async createManagedBundleRequest(fileCount: number): Promise<AccountExportBundleRequest> {
    const bundleClient = supabase as unknown as AccountExportBundleRpcClient;
    const { data, error } = await bundleClient.rpc('create_account_export_bundle_request', {
      p_export_type: 'server_bundle',
      p_file_count: fileCount,
      p_signed_url_ttl_seconds: EXPORT_SIGNED_URL_TTL_SECONDS,
      p_download_limit: ACCOUNT_EXPORT_DOWNLOAD_LIMIT,
      p_metadata: {
        mode: 'managed_browser_assembled',
        bundle_retention: 'exports_bucket_7_days',
        generated_files: ['asset_summary_pdf', 'asset_zip'],
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const request = data?.[0];
    if (!request?.audit_id || !request.storage_bucket || !request.storage_path) {
      throw new Error('managed_export_request_missing');
    }

    return request;
  }

  private static async markManagedBundleReady(
    request: AccountExportBundleRequest,
    fileName: string,
    zipBlob: Blob,
    sha256: string
  ): Promise<void> {
    const bundleClient = supabase as unknown as AccountExportBundleRpcClient;
    const { error } = await bundleClient.rpc('mark_account_export_bundle_ready', {
      p_audit_id: request.audit_id,
      p_storage_bucket: request.storage_bucket,
      p_storage_path: request.storage_path,
      p_bundle_file_name: fileName,
      p_bundle_size_bytes: zipBlob.size,
      p_bundle_sha256: sha256,
      p_error_message: null,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  private static async markManagedBundleFailed(
    request: AccountExportBundleRequest | null,
    message: string
  ): Promise<void> {
    if (!request) return;

    try {
      const bundleClient = supabase as unknown as AccountExportBundleRpcClient;
      await bundleClient.rpc('mark_account_export_bundle_ready', {
        p_audit_id: request.audit_id,
        p_storage_bucket: request.storage_bucket,
        p_storage_path: request.storage_path,
        p_bundle_file_name: request.storage_path.split('/').pop() || 'asset-safe-export.zip',
        p_bundle_size_bytes: null,
        p_bundle_sha256: null,
        p_error_message: message,
      });
    } catch (error) {
      console.error('Failed to mark managed export failed:', error);
    }
  }

  private static async downloadManagedBundle(request: AccountExportBundleRequest, fileName: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke<DownloadAccountExportBundleResponse>(
      'download-account-export-bundle',
      { body: { audit_id: request.audit_id } }
    );

    if (error) {
      let message = error.message;
      const context = (error as { context?: unknown }).context;
      if (context instanceof Response) {
        const details = await context.clone().text().catch(() => '');
        if (details) {
          message = `${message}: ${details.slice(0, 500)}`;
        }
      }
      throw new Error(message);
    }

    if (!data?.signed_url) {
      throw new Error(data?.error || 'managed_export_signed_url_missing');
    }

    saveAs(data.signed_url, fileName);
  }

  /**
   * Export complete asset summary (PDF + ZIP)
   */
  static async exportCompleteAssetSummary(userId: string): Promise<void> {
    let bundleRequest: AccountExportBundleRequest | null = null;
    try {
      toast({
        title: "Preparing Export",
        description: "Gathering your account archive for export...",
      });

      // Get user profile and verification status in parallel
      const [profileResult, verificationResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('account_verification').select('is_verified, is_verified_plus').eq('user_id', userId).maybeSingle()
      ]);

      const profile = profileResult.data;
      const verificationData = verificationResult.data;

      // Get user assets
      const assets = await this.getUserAssets(userId);
      const fileCount = this.countExportFiles(assets);

      bundleRequest = await this.createManagedBundleRequest(fileCount + 1);

      const exportDate = new Date().toISOString().split('T')[0];
      const pdfFileName = `asset-safe-summary-${exportDate}.pdf`;
      const zipFileName = `asset-safe-backup-${exportDate}.zip`;

      const pdfBlob = await this.generateAssetSummaryPDF(assets, profile, verificationData, false);
      const zipResult = await this.downloadAssetsZip(assets, false, [
        { path: pdfFileName, blob: pdfBlob },
      ]);

      if (!zipResult) {
        throw new Error('managed_export_zip_empty');
      }

      toast({
        title: "Securing Export",
        description: "Uploading your archive to the managed export vault...",
      });

      const { error: uploadError } = await supabase.storage
        .from(bundleRequest.storage_bucket)
        .upload(bundleRequest.storage_path, zipResult.blob, {
          cacheControl: '3600',
          contentType: 'application/zip',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const sha256 = await this.sha256Hex(zipResult.blob);
      await this.markManagedBundleReady(bundleRequest, zipFileName, zipResult.blob, sha256);
      await this.downloadManagedBundle(bundleRequest, zipFileName);

      toast({
        title: "Export Complete",
        description: "Your managed account archive has been downloaded.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      const message = error instanceof Error ? error.message : 'unknown_export_error';
      await this.markManagedBundleFailed(bundleRequest, message);
      if (!bundleRequest) {
        await this.logAccountExportAudit('failed', null, message, { mode: 'managed_browser_assembled' });
      }
      toast({
        title: "Export Failed",
        description: "There was an error exporting your assets. Please try again.",
        variant: "destructive"
      });
    }
  }
}
