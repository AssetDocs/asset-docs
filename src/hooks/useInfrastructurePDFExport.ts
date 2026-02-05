import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface EdgeFunction {
  name: string;
  category: string;
  purpose: string;
  status: string;
  verifyJwt: boolean;
}

interface Secret {
  name: string;
  category: string;
  purpose: string;
  status: string;
}

interface StorageBucket {
  name: string;
  isPublic: boolean;
  purpose: string;
}

interface EmailType {
  type: string;
  function: string;
  status: string;
  template: string;
}

interface InfrastructureGap {
  area: string;
  issue: string;
  severity: string;
  suggestion: string;
}

interface InfrastructureData {
  edgeFunctions: EdgeFunction[];
  configuredSecrets: Secret[];
  storageBuckets: StorageBucket[];
  emailTypes: EmailType[];
  infrastructureGaps: InfrastructureGap[];
  projectId: string;
}

export const useInfrastructurePDFExport = () => {
  const { toast } = useToast();

  const exportInfrastructureToPDF = (data: InfrastructureData) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 25;

      const checkPageBreak = (requiredSpace: number) => {
        if (y + requiredSpace > pageHeight - 30) {
          doc.addPage();
          y = 25;
          return true;
        }
        return false;
      };

      const addSectionHeader = (title: string, icon?: string) => {
        checkPageBreak(20);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text(title, margin, y);
        y += 8;
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      // Header
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Asset Safe Infrastructure', margin, 25);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 35);
      doc.text(`Project ID: ${data.projectId}`, pageWidth - margin - 50, 35);
      y = 55;

      // Summary Stats
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Infrastructure Summary', margin, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const stats = [
        `Edge Functions: ${data.edgeFunctions.length}`,
        `API Keys/Secrets: ${data.configuredSecrets.length}`,
        `Storage Buckets: ${data.storageBuckets.length}`,
        `Email Types: ${data.emailTypes.length}`,
        `Infrastructure Gaps: ${data.infrastructureGaps.filter(g => g.severity !== 'none').length}`,
      ];
      
      const colWidth = contentWidth / 3;
      stats.forEach((stat, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        doc.text(stat, margin + col * colWidth, y + row * 6);
      });
      y += 20;

      // Edge Functions by Category
      addSectionHeader('Edge Functions');
      
      const functionsByCategory = data.edgeFunctions.reduce((acc, fn) => {
        if (!acc[fn.category]) acc[fn.category] = [];
        acc[fn.category].push(fn);
        return acc;
      }, {} as Record<string, EdgeFunction[]>);

      Object.entries(functionsByCategory).forEach(([category, functions]) => {
        checkPageBreak(15 + functions.length * 6);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(`${category} (${functions.length})`, margin, y);
        y += 6;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        functions.forEach(fn => {
          checkPageBreak(6);
          const jwtIndicator = fn.verifyJwt ? ' [JWT]' : '';
          doc.text(`• ${fn.name}${jwtIndicator}: ${fn.purpose}`, margin + 4, y);
          y += 5;
        });
        y += 4;
      });

      // API Keys & Secrets
      addSectionHeader('API Keys & Secrets');
      
      const secretsByCategory = data.configuredSecrets.reduce((acc, secret) => {
        if (!acc[secret.category]) acc[secret.category] = [];
        acc[secret.category].push(secret);
        return acc;
      }, {} as Record<string, Secret[]>);

      Object.entries(secretsByCategory).forEach(([category, secrets]) => {
        checkPageBreak(10 + secrets.length * 5);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(`${category}`, margin, y);
        y += 6;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        secrets.forEach(secret => {
          checkPageBreak(5);
          doc.text(`• ${secret.name}: ${secret.purpose}`, margin + 4, y);
          y += 5;
        });
        y += 4;
      });

      // Storage Buckets
      addSectionHeader('Storage Buckets');
      
      data.storageBuckets.forEach(bucket => {
        checkPageBreak(10);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        const publicLabel = bucket.isPublic ? ' (Public)' : ' (Private)';
        doc.text(`• ${bucket.name}${publicLabel}`, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`  ${bucket.purpose}`, margin + 4, y);
        y += 6;
      });

      // Email Types
      addSectionHeader('Email Deployments');
      
      checkPageBreak(10 + data.emailTypes.length * 5);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Table header
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text('Type', margin, y);
      doc.text('Function', margin + 45, y);
      doc.text('Template', margin + 110, y);
      y += 5;
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      data.emailTypes.forEach(email => {
        checkPageBreak(5);
        doc.text(email.type, margin, y);
        doc.text(email.function, margin + 45, y);
        doc.text(email.template, margin + 110, y);
        y += 5;
      });
      y += 6;

      // Infrastructure Gaps
      const gaps = data.infrastructureGaps.filter(g => g.severity !== 'none');
      if (gaps.length > 0) {
        addSectionHeader('Infrastructure Gaps & Recommendations');
        
        gaps.forEach(gap => {
          checkPageBreak(20);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const severityColor = gap.severity === 'medium' ? [234, 179, 8] : [156, 163, 175];
          doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
          doc.text(`[${gap.severity.toUpperCase()}] ${gap.area}`, margin, y);
          y += 5;
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          doc.text(`Issue: ${gap.issue}`, margin + 4, y);
          y += 5;
          doc.setTextColor(34, 139, 34);
          doc.text(`Suggestion: ${gap.suggestion}`, margin + 4, y);
          y += 8;
        });
      }

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('Asset Safe Infrastructure Documentation - Confidential', pageWidth / 2, pageHeight - 15, { align: 'center' });
      }

      doc.save(`asset-safe-infrastructure-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Infrastructure documentation has been exported.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { exportInfrastructureToPDF };
};
