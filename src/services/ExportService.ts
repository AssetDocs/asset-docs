import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { StorageService, FileType } from './StorageService';
import { toast } from '@/hooks/use-toast';

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
  floorPlans: Array<{
    id: string;
    name: string;
    url: string;
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
    duration?: number;
    createdAt: string;
  }>;
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
}

export class ExportService {
  /**
   * Generate a comprehensive PDF summary of all assets
   */
  static async generateAssetSummaryPDF(assets: AssetSummary, userProfile?: any): Promise<void> {
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
    pdf.text(`Floor Plans: ${assets.floorPlans.length}`, 30, yPosition);
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
          // Wrap long descriptions
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

    // Floor Plans section
    if (assets.floorPlans.length > 0) {
      checkPageSpace(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Floor Plans', 20, yPosition);
      yPosition += 10;

      assets.floorPlans.forEach((plan, index) => {
        checkPageSpace(10);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${index + 1}. ${plan.name}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Upload Date: ${new Date(plan.uploadDate).toLocaleDateString()}`, 30, yPosition);
        yPosition += lineHeight + 2;
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
        pdf.text(`${index + 1}. ${contact.name} ${priorityStars}`, 30, yPosition);
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

    // Save the PDF
    const fileName = `asset-safe-summary-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Create and download a zip file with all asset files
   */
  static async downloadAssetsZip(assets: AssetSummary): Promise<void> {
    const zip = new JSZip();
    let downloadedCount = 0;
    const totalFiles = assets.photos.length + assets.videos.length + assets.documents.length + assets.floorPlans.length + assets.voiceNotes.filter(n => n.audioUrl).length;

    if (totalFiles === 0) {
      toast({
        title: "No Files Found",
        description: "There are no files to download.",
        variant: "destructive"
      });
      return;
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
    const floorPlansFolder = zip.folder('floor-plans');
    const voiceNotesFolder = zip.folder('voice-notes');

    const downloadPromises: Promise<void>[] = [];

    // Download photos
    assets.photos.forEach((photo) => {
      if (photosFolder) {
        downloadPromises.push(downloadFile(photo.url, photosFolder, photo.name));
      }
    });

    // Download videos
    assets.videos.forEach((video) => {
      if (videosFolder) {
        downloadPromises.push(downloadFile(video.url, videosFolder, video.name));
      }
    });

    // Download documents
    assets.documents.forEach((doc) => {
      if (documentsFolder) {
        downloadPromises.push(downloadFile(doc.url, documentsFolder, doc.name));
      }
    });

    // Download floor plans
    assets.floorPlans.forEach((plan) => {
      if (floorPlansFolder) {
        downloadPromises.push(downloadFile(plan.url, floorPlansFolder, plan.name));
      }
    });

    // Download voice notes
    assets.voiceNotes.forEach((note) => {
      if (voiceNotesFolder && note.audioUrl) {
        const fileName = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
        downloadPromises.push(downloadFile(note.audioUrl, voiceNotesFolder, fileName));
      }
    });

    try {
      // Wait for all downloads to complete
      await Promise.allSettled(downloadPromises);

      // Generate and save the zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = `asset-safe-backup-${new Date().toISOString().split('T')[0]}.zip`;
      saveAs(zipBlob, fileName);

      toast({
        title: "Assets Downloaded",
        description: `Successfully downloaded ${downloadedCount} of ${totalFiles} files.`,
      });
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast({
        title: "Download Failed",
        description: "There was an error creating the backup file.",
        variant: "destructive"
      });
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
      floorPlans: [],
      properties: [],
      voiceNotes: [],
      paintCodes: [],
      sourceWebsites: [],
      items: [],
      vipContacts: [],
      damageReports: []
    };

    try {
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
      }

      // Fetch property files (photos, videos, documents, floor-plans)
      const { data: propertyFiles, error: propertyFilesError } = await supabase
        .from('property_files')
        .select('*')
        .eq('user_id', userId);

      if (!propertyFilesError && propertyFiles) {
        propertyFiles.forEach(file => {
          const fileData = {
            id: file.id,
            name: file.file_name,
            url: file.file_url,
            uploadDate: file.created_at || new Date().toISOString()
          };

          switch (file.bucket_name) {
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
            case 'floor-plans':
              assets.floorPlans.push(fileData);
              break;
          }
        });
      }

      // Fetch legacy locker files
      const { data: legacyFiles, error: legacyFilesError } = await supabase
        .from('legacy_locker_files')
        .select('*')
        .eq('user_id', userId);

      if (!legacyFilesError && legacyFiles) {
        legacyFiles.forEach(file => {
          const fileData = {
            id: file.id,
            name: file.file_name,
            url: file.file_url,
            uploadDate: file.created_at || new Date().toISOString()
          };

          // Categorize based on file type
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

        // Also add item photos
        items.forEach(item => {
          if (item.photo_url) {
            assets.photos.push({
              id: item.id,
              name: item.name || 'Item Photo',
              url: item.photo_url,
              uploadDate: item.created_at || new Date().toISOString(),
              category: item.category || 'Inventory'
            });
          }
        });
      }

      // Fetch receipts
      const { data: receipts, error: receiptsError } = await supabase
        .from('receipts')
        .select('id, receipt_name, receipt_url, created_at')
        .eq('user_id', userId);

      if (!receiptsError && receipts) {
        receipts.forEach(receipt => {
          assets.documents.push({
            id: receipt.id,
            name: receipt.receipt_name,
            url: receipt.receipt_url,
            type: 'Receipt',
            uploadDate: receipt.created_at || new Date().toISOString()
          });
        });
      }

      // Fetch voice notes
      const { data: voiceNotes, error: voiceNotesError } = await supabase
        .from('legacy_locker_voice_notes')
        .select('*')
        .eq('user_id', userId);

      if (!voiceNotesError && voiceNotes) {
        assets.voiceNotes = voiceNotes.map(note => ({
          id: note.id,
          title: note.title,
          description: note.description || undefined,
          audioUrl: note.audio_url || undefined,
          duration: note.duration || undefined,
          createdAt: note.created_at || new Date().toISOString()
        }));
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
          propertyName: (paint.properties as any)?.name || undefined
        }));
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
          propertyName: (report.properties as any)?.name || undefined,
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

    } catch (error) {
      console.error('Error fetching user assets:', error);
    }

    return assets;
  }

  /**
   * Export complete asset summary (PDF + ZIP)
   */
  static async exportCompleteAssetSummary(userId: string): Promise<void> {
    try {
      toast({
        title: "Preparing Export",
        description: "Gathering your assets for export...",
      });

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get user assets
      const assets = await this.getUserAssets(userId);

      // Generate PDF summary
      await this.generateAssetSummaryPDF(assets, profile);
      
      // Create and download assets zip
      await this.downloadAssetsZip(assets);

      toast({
        title: "Export Complete",
        description: "Your asset summary and backup files have been downloaded.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your assets. Please try again.",
        variant: "destructive"
      });
    }
  }
}
