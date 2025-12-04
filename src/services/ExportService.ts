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
    pdf.text('Asset Documentation Summary', 20, yPosition);
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
    checkPageSpace(50);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Summary Statistics', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Total Photos: ${assets.photos.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total Videos: ${assets.videos.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total Documents: ${assets.documents.length}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total Floor Plans: ${assets.floorPlans.length}`, 30, yPosition);
    yPosition += 20;

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
        pdf.text(`   Category: ${photo.category || 'Uncategorized'}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Upload Date: ${new Date(photo.uploadDate).toLocaleDateString()}`, 30, yPosition);
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
        if (video.duration) {
          pdf.text(`   Duration: ${video.duration}`, 30, yPosition);
          yPosition += lineHeight;
        }
        pdf.text(`   Upload Date: ${new Date(video.uploadDate).toLocaleDateString()}`, 30, yPosition);
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
        pdf.text(`   Type: ${doc.type}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`   Upload Date: ${new Date(doc.uploadDate).toLocaleDateString()}`, 30, yPosition);
        yPosition += lineHeight + 2;
      });
      yPosition += 10;
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

    // Save the PDF
    const fileName = `asset-summary-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Create and download a zip file with all asset files
   */
  static async downloadAssetsZip(assets: AssetSummary): Promise<void> {
    const zip = new JSZip();
    let downloadedCount = 0;
    const totalFiles = assets.photos.length + assets.videos.length + assets.documents.length + assets.floorPlans.length;

    if (totalFiles === 0) {
      toast({
        title: "No Assets Found",
        description: "There are no assets to download.",
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

    try {
      // Wait for all downloads to complete
      await Promise.allSettled(downloadPromises);

      // Generate and save the zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = `assets-backup-${new Date().toISOString().split('T')[0]}.zip`;
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
      floorPlans: []
    };

    try {
      // Fetch property files (photos, videos, documents, floor-plans)
      const { data: propertyFiles, error: propertyFilesError } = await supabase
        .from('property_files')
        .select('*')
        .eq('user_id', userId);

      if (propertyFilesError) {
        console.error('Error fetching property files:', propertyFilesError);
      } else if (propertyFiles) {
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

      if (legacyFilesError) {
        console.error('Error fetching legacy locker files:', legacyFilesError);
      } else if (legacyFiles) {
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

      // Fetch item photos from items table
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, name, photo_url, created_at, category')
        .eq('user_id', userId)
        .not('photo_url', 'is', null);

      if (itemsError) {
        console.error('Error fetching items:', itemsError);
      } else if (items) {
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

      if (receiptsError) {
        console.error('Error fetching receipts:', receiptsError);
      } else if (receipts) {
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