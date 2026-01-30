import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import jsPDF from 'jspdf';
import { 
  Edit2, 
  Calendar, 
  Droplets,
  Wind,
  Flame,
  Zap,
  Construction,
  CircleAlert,
  HelpCircle,
  Loader2,
  FileText,
  MapPin,
  DollarSign,
  Clock,
  Trash2
} from 'lucide-react';

// Map incident types to icons and labels
const INCIDENT_TYPE_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  water: { label: 'Water / Flood', icon: Droplets, color: 'bg-blue-100 text-blue-700' },
  storm: { label: 'Storm / Wind / Hail', icon: Wind, color: 'bg-gray-100 text-gray-700' },
  fire: { label: 'Fire', icon: Flame, color: 'bg-orange-100 text-orange-700' },
  electrical: { label: 'Electrical', icon: Zap, color: 'bg-yellow-100 text-yellow-700' },
  accidental: { label: 'Accidental', icon: Construction, color: 'bg-amber-100 text-amber-700' },
  theft: { label: 'Theft / Vandalism', icon: CircleAlert, color: 'bg-red-100 text-red-700' },
  other: { label: 'Other', icon: HelpCircle, color: 'bg-gray-100 text-gray-500' },
};

const AREA_LABELS: Record<string, string> = {
  kitchen: 'Kitchen',
  living_room: 'Living Room',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  garage: 'Garage',
  basement: 'Basement',
  exterior: 'Exterior',
  roof: 'Roof',
  other: 'Other',
};

const COST_LABELS: Record<string, string> = {
  under_500: 'Under $500',
  '500_1000': '$500 – $1,000',
  '1000_5000': '$1,000 – $5,000',
  over_5000: '$5,000+',
  not_sure: 'Not sure',
};

const VISIBLE_DAMAGE_LABELS: Record<string, string> = {
  water_visible: 'Water visible',
  smoke_soot: 'Smoke or soot',
  broken_missing: 'Broken or missing items',
  staining: 'Staining or discoloration',
  not_working: "Something isn't working anymore",
  not_sure: 'Not sure',
};

const SAFETY_LABELS: Record<string, string> = {
  wiring: 'Exposed wiring',
  water: 'Standing water',
  structural: 'Structural concerns',
  odors: 'Strong odors',
  none: 'No immediate safety concerns',
};

const ACTIONS_LABELS: Record<string, string> = {
  water_off: 'Turned off water',
  cleaned: 'Cleaned up temporarily',
  covered: 'Covered area',
  power_off: 'Turned off power',
  none: 'No action yet',
};

interface DamageReport {
  id: string;
  property_id: string;
  incident_types: string[];
  date_of_damage: string | null;
  approximate_time: string | null;
  areas_affected: string[];
  other_area: string | null;
  impact_buckets: string[];
  belongings_items: string[];
  other_belongings: string | null;
  visible_damage: string[];
  damage_ongoing: string | null;
  safety_concerns: string[];
  actions_taken: string[];
  estimated_cost: string | null;
  contacted_someone: string | null;
  professionals_contacted: string[];
  claim_number: string | null;
  company_names: string | null;
  additional_observations: string | null;
  other_incident_type: string | null;
  created_at: string;
  updated_at: string;
}

interface SavedDamageReportsProps {
  onEditReport: (reportId: string, propertyId: string) => void;
  refreshTrigger?: number;
}

const SavedDamageReports: React.FC<SavedDamageReportsProps> = ({ onEditReport, refreshTrigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<DamageReport | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, refreshTrigger]);

  const fetchReports = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('damage_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching damage reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (report: DamageReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete || !user) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('damage_reports')
        .delete()
        .eq('id', reportToDelete.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      toast({
        title: "Report Deleted",
        description: "The damage report has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSimpleDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateReportPDF = (report: DamageReport) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;

      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.4) + 4;
      };

      const addSection = (title: string, content: string | string[] | null | undefined) => {
        if (!content || (Array.isArray(content) && content.length === 0)) return;
        addText(title, 12, true);
        if (Array.isArray(content)) {
          content.forEach(item => addText(`• ${item}`, 10));
        } else {
          addText(content, 10);
        }
        yPosition += 4;
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Damage Report', margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Report ID: ${report.id.slice(0, 8)}`, margin, yPosition);
      yPosition += 15;

      // Incident Information
      addText('INCIDENT INFORMATION', 14, true);
      yPosition += 4;

      // Incident Types
      if (report.incident_types && report.incident_types.length > 0) {
        const typeLabels = report.incident_types.map(t => INCIDENT_TYPE_MAP[t]?.label || t);
        addSection('Incident Type(s):', typeLabels.join(', '));
      }
      if (report.other_incident_type) {
        addSection('Other Incident Type:', report.other_incident_type);
      }

      // Date and Time
      if (report.date_of_damage) {
        addSection('Date of Incident:', formatSimpleDate(report.date_of_damage));
      }
      if (report.approximate_time) {
        addSection('Approximate Time:', report.approximate_time);
      }

      // Location
      yPosition += 6;
      addText('LOCATION & IMPACT', 14, true);
      yPosition += 4;

      if (report.areas_affected && report.areas_affected.length > 0) {
        const areaLabels = report.areas_affected.map(a => AREA_LABELS[a] || a);
        addSection('Areas Affected:', areaLabels.join(', '));
      }
      if (report.other_area) {
        addSection('Other Area:', report.other_area);
      }
      if (report.impact_buckets && report.impact_buckets.length > 0) {
        addSection('What Was Impacted:', report.impact_buckets.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', '));
      }
      if (report.belongings_items && report.belongings_items.length > 0) {
        addSection('Belongings Affected:', report.belongings_items.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', '));
      }
      if (report.other_belongings) {
        addSection('Other Belongings:', report.other_belongings);
      }

      // Damage Details
      yPosition += 6;
      addText('DAMAGE DETAILS', 14, true);
      yPosition += 4;

      if (report.visible_damage && report.visible_damage.length > 0) {
        const damageLabels = report.visible_damage.map(d => VISIBLE_DAMAGE_LABELS[d] || d);
        addSection('Visible Damage:', damageLabels.join(', '));
      }
      if (report.damage_ongoing) {
        addSection('Is Damage Ongoing:', report.damage_ongoing === 'yes' ? 'Yes' : report.damage_ongoing === 'no' ? 'No' : 'Not sure');
      }

      // Safety & Actions
      yPosition += 6;
      addText('SAFETY & ACTIONS TAKEN', 14, true);
      yPosition += 4;

      if (report.safety_concerns && report.safety_concerns.length > 0) {
        const safetyLabels = report.safety_concerns.map(s => SAFETY_LABELS[s] || s);
        addSection('Safety Concerns:', safetyLabels.join(', '));
      }
      if (report.actions_taken && report.actions_taken.length > 0) {
        const actionLabels = report.actions_taken.map(a => ACTIONS_LABELS[a] || a);
        addSection('Actions Taken:', actionLabels.join(', '));
      }
      if (report.estimated_cost) {
        addSection('Estimated Cost:', COST_LABELS[report.estimated_cost] || report.estimated_cost);
      }

      // Contact Information
      if (report.contacted_someone === 'yes' || (report.professionals_contacted && report.professionals_contacted.length > 0) || report.claim_number || report.company_names) {
        yPosition += 6;
        addText('CONTACT INFORMATION', 14, true);
        yPosition += 4;

        if (report.contacted_someone) {
          addSection('Has Contacted Someone:', report.contacted_someone === 'yes' ? 'Yes' : 'No');
        }
        if (report.professionals_contacted && report.professionals_contacted.length > 0) {
          addSection('Professionals Contacted:', report.professionals_contacted.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('_', ' ')).join(', '));
        }
        if (report.company_names) {
          addSection('Company Names:', report.company_names);
        }
        if (report.claim_number) {
          addSection('Claim Number:', report.claim_number);
        }
      }

      // Additional Observations
      if (report.additional_observations) {
        yPosition += 6;
        addText('ADDITIONAL OBSERVATIONS', 14, true);
        yPosition += 4;
        addText(report.additional_observations, 10);
      }

      // Footer
      pdf.addPage();
      pdf.setFontSize(10);
      pdf.text('--- End of Report ---', margin, 20);
      pdf.text(`Created: ${formatDate(report.created_at)}`, margin, 30);
      pdf.text(`Last Updated: ${formatDate(report.updated_at)}`, margin, 40);

      // Generate title from incident types
      const reportTitle = report.incident_types && report.incident_types.length > 0
        ? report.incident_types.map(t => INCIDENT_TYPE_MAP[t]?.label || t).join('_').replace(/[^a-zA-Z0-9_]/g, '')
        : 'Damage';
      
      pdf.save(`${reportTitle}_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Report Generated",
        description: "Your damage report PDF has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (reports.length === 0) {
    return null;
  }

  const ReportCard = ({ report }: { report: DamageReport }) => {
    const incidentTypes = report.incident_types || [];

    // Create a display title based on incident types
    const reportTitle = incidentTypes.length > 0
      ? incidentTypes.map(t => INCIDENT_TYPE_MAP[t]?.label || t).join(', ')
      : 'Damage Report';

    return (
      <Card className="border border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Report Title */}
            <h4 className="font-semibold text-gray-900">{reportTitle}</h4>
            
            {/* Incident Types Badges */}
            <div className="flex flex-wrap gap-1.5">
              {incidentTypes.length > 0 ? (
                incidentTypes.map((type) => {
                  const info = INCIDENT_TYPE_MAP[type];
                  if (!info) return null;
                  const TypeIcon = info.icon;
                  return (
                    <Badge key={type} variant="secondary" className={`${info.color} text-xs`}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {info.label}
                    </Badge>
                  );
                })
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Unspecified
                </Badge>
              )}
            </div>

            {/* Details Row */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              {report.date_of_damage && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatSimpleDate(report.date_of_damage)}
                </span>
              )}
              {report.areas_affected && report.areas_affected.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {report.areas_affected.map(a => AREA_LABELS[a] || a).join(', ')}
                </span>
              )}
              {report.estimated_cost && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {COST_LABELS[report.estimated_cost] || report.estimated_cost}
                </span>
              )}
            </div>

            {/* Additional observations preview */}
            {report.additional_observations && (
              <p className="text-xs text-gray-500 line-clamp-2 italic">
                "{report.additional_observations}"
              </p>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated: {formatDate(report.updated_at)}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-amber-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditReport(report.id, report.property_id)}
                className="flex-1 text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateReportPDF(report)}
                className="flex-1 text-xs bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border-brand-green/30"
              >
                <FileText className="h-3 w-3 mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(report)}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const deleteReportTitle = reportToDelete?.incident_types?.length 
    ? reportToDelete.incident_types.map(t => INCIDENT_TYPE_MAP[t]?.label || t).join(', ')
    : 'this damage report';

  return (
    <>
      <div className="mt-8 space-y-4">
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Your Saved Damage Reports
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            All your damage reports are saved here. Click to edit or download as PDF.
          </p>

          <div className="space-y-3">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setReportToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Damage Report?"
        description={`Are you sure you want to permanently delete "${deleteReportTitle}"? This action cannot be undone.`}
      />
    </>
  );
};

export default SavedDamageReports;
