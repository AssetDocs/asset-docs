import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Archive, 
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
  Eye,
  ArchiveRestore,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface DamageReport {
  id: string;
  property_id: string;
  incident_types: string[];
  date_of_damage: string | null;
  areas_affected: string[];
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

interface SavedDamageReportsProps {
  onEditReport: (reportId: string, propertyId: string) => void;
}

const SavedDamageReports: React.FC<SavedDamageReportsProps> = ({ onEditReport }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('damage_reports')
        .select('id, property_id, incident_types, date_of_damage, areas_affected, created_at, updated_at, is_archived')
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

  const handleArchiveToggle = async (reportId: string, currentArchived: boolean) => {
    setArchivingId(reportId);
    try {
      const { error } = await supabase
        .from('damage_reports')
        .update({ is_archived: !currentArchived })
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => 
        prev.map(r => r.id === reportId ? { ...r, is_archived: !currentArchived } : r)
      );

      toast({
        title: currentArchived ? "Report Restored" : "Report Archived",
        description: currentArchived 
          ? "The report has been restored to your active reports." 
          : "The report has been archived. You can still access it anytime.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setArchivingId(null);
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

  const activeReports = reports.filter(r => !r.is_archived);
  const archivedReports = reports.filter(r => r.is_archived);

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
    const primaryType = incidentTypes[0];
    const typeInfo = primaryType ? INCIDENT_TYPE_MAP[primaryType] : null;
    const Icon = typeInfo?.icon || HelpCircle;

    return (
      <Card className={`border ${report.is_archived ? 'bg-gray-50 border-gray-200' : 'border-amber-200 bg-amber-50/30'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Incident Types */}
              <div className="flex flex-wrap gap-1.5 mb-2">
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

              {/* Areas affected */}
              {report.areas_affected && report.areas_affected.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Areas: {report.areas_affected.map(a => a.replace('_', ' ')).join(', ')}
                </p>
              )}

              {/* Dates */}
              <div className="text-xs text-gray-500 space-y-0.5">
                <p className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Incident: {formatSimpleDate(report.date_of_damage)}
                </p>
                <p>Last updated: {formatDate(report.updated_at)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditReport(report.id, report.property_id)}
                className="text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleArchiveToggle(report.id, report.is_archived)}
                disabled={archivingId === report.id}
                className={`text-xs ${report.is_archived ? 'text-green-600 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {archivingId === report.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : report.is_archived ? (
                  <>
                    <ArchiveRestore className="h-3 w-3 mr-1" />
                    Restore
                  </>
                ) : (
                  <>
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Your Saved Damage Reports
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          All reports are preserved and can be edited or archived at any time.
        </p>

        {/* Active Reports */}
        {activeReports.length > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-sm font-medium text-gray-700">
              Active Reports ({activeReports.length})
            </p>
            {activeReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}

        {/* Archived Reports - Collapsible */}
        {archivedReports.length > 0 && (
          <Collapsible open={showArchived} onOpenChange={setShowArchived}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer py-2">
              {showArchived ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <Archive className="h-4 w-4" />
              Archived Reports ({archivedReports.length})
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-2">
              <p className="text-xs text-gray-400 italic">
                Archived reports are not deleted. You can restore them at any time.
              </p>
              {archivedReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {activeReports.length === 0 && archivedReports.length > 0 && (
          <p className="text-sm text-gray-500 italic">
            No active reports. Check your archived reports below.
          </p>
        )}
      </div>
    </div>
  );
};

export default SavedDamageReports;
