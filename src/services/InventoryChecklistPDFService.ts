import jsPDF from 'jspdf';

export class InventoryChecklistPDFService {
  static async generateInventoryChecklistPDF(): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Load the images
      const page1Url = '/lovable-uploads/407a9ede-6542-41ef-84af-11b6320aec2c.png';
      const page2Url = '/lovable-uploads/88feb117-aadd-4c22-9fc7-06bc4df66fdc.png';
      
      // Function to load image as base64
      const loadImageAsBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataURL = canvas.toDataURL('image/png');
              resolve(dataURL);
            } else {
              reject(new Error('Could not get canvas context'));
            }
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = url;
        });
      };

      // Load both images
      const [page1Base64, page2Base64] = await Promise.all([
        loadImageAsBase64(page1Url),
        loadImageAsBase64(page2Url)
      ]);

      // Add first page
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calculate dimensions to fit the page while maintaining aspect ratio
      const img1 = new Image();
      img1.src = page1Base64;
      await new Promise(resolve => {
        img1.onload = resolve;
      });
      
      const aspectRatio1 = img1.width / img1.height;
      let width1 = pageWidth - 20; // 10mm margin on each side
      let height1 = width1 / aspectRatio1;
      
      if (height1 > pageHeight - 20) {
        height1 = pageHeight - 20;
        width1 = height1 * aspectRatio1;
      }
      
      const x1 = (pageWidth - width1) / 2;
      const y1 = (pageHeight - height1) / 2;
      
      pdf.addImage(page1Base64, 'PNG', x1, y1, width1, height1);

      // Add second page
      pdf.addPage();
      
      const img2 = new Image();
      img2.src = page2Base64;
      await new Promise(resolve => {
        img2.onload = resolve;
      });
      
      const aspectRatio2 = img2.width / img2.height;
      let width2 = pageWidth - 20;
      let height2 = width2 / aspectRatio2;
      
      if (height2 > pageHeight - 20) {
        height2 = pageHeight - 20;
        width2 = height2 * aspectRatio2;
      }
      
      const x2 = (pageWidth - width2) / 2;
      const y2 = (pageHeight - height2) / 2;
      
      pdf.addImage(page2Base64, 'PNG', x2, y2, width2, height2);

      // Save the PDF
      pdf.save('Free-Inventory-Checklist-Asset-Docs.pdf');
      
    } catch (error) {
      console.error('Error generating inventory checklist PDF:', error);
      throw error;
    }
  }
}