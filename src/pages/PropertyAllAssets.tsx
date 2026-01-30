import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { ExportService } from '@/services/ExportService';
import { supabase } from '@/integrations/supabase/client';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import {
  ArrowLeft,
  Home,
  Camera,
  Video,
  FileText,
  Mic,
  Paintbrush,
  AlertTriangle,
  Wrench,
  FileDown,
  Download,
  Loader2,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface DamageReport {
  id: string;
  date_of_damage: string | null;
  incident_types: string[];
  areas_affected: string[];
  estimated_cost: string | null;
  created_at: string;
}

interface PaintCode {
  id: string;
  paint_name: string;
  paint_code: string;
  paint_brand: string;
  room_location: string | null;
  is_interior: boolean;
}

interface VoiceNote {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  created_at: string;
}

interface ManualEntry {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  estimated_value: number | null;
  created_at: string;
}

interface UpgradeRepair {
  id: string;
  title: string;
  repair_type: string | null;
  date_completed: string | null;
  total_cost: number;
  location: string | null;
}

// Simple signed image component
const SignedImage: React.FC<{ file: PropertyFile; className?: string }> = ({ file, className }) => {
  const { signedUrl, isLoading } = useSignedUrl(file.file_path, file.bucket_name);
  
  if (isLoading) {
    return <div className={`bg-muted animate-pulse ${className}`} />;
  }
  
  return (
    <img
      src={signedUrl || file.file_url}
      alt={file.file_name}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/placeholder.svg';
      }}
    />
  );
};

const PropertyAllAssets: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { properties } = useProperties();
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [photos, setPhotos] = useState<PropertyFile[]>([]);
  const [videos, setVideos] = useState<PropertyFile[]>([]);
  const [documents, setDocuments] = useState<PropertyFile[]>([]);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [paintCodes, setPaintCodes] = useState<PaintCode[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([]);
  const [upgradeRepairs, setUpgradeRepairs] = useState<UpgradeRepair[]>([]);

  const property = properties.find(p => p.id === propertyId);

  useEffect(() => {
    if (propertyId && user) {
      fetchAllAssets();
    }
  }, [propertyId, user]);

  const fetchAllAssets = async () => {
    if (!propertyId || !user) return;
    
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        photosData,
        videosData,
        documentsData,
        damageData,
        paintData,
        voiceData,
        manualData,
        upgradeData
      ] = await Promise.all([
        PropertyService.getPropertyFiles(propertyId, 'photo'),
        PropertyService.getPropertyFiles(propertyId, 'video'),
        PropertyService.getPropertyFiles(propertyId, 'document'),
        supabase.from('damage_reports').select('*').eq('property_id', propertyId).eq('user_id', user.id),
        supabase.from('paint_codes').select('*').eq('property_id', propertyId).eq('user_id', user.id),
        supabase.from('legacy_locker_voice_notes').select('*').eq('user_id', user.id),
        supabase.from('items').select('*').eq('property_id', propertyId).eq('user_id', user.id),
        supabase.from('upgrade_repairs').select('*').eq('property_id', propertyId).eq('user_id', user.id)
      ]);

      setPhotos(photosData || []);
      setVideos(videosData || []);
      setDocuments(documentsData || []);
      setDamageReports(damageData.data || []);
      setPaintCodes(paintData.data || []);
      setVoiceNotes(voiceData.data || []);
      setManualEntries(manualData.data || []);
      setUpgradeRepairs(upgradeData.data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error",
        description: "Failed to load property assets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    if (!user || !propertyId) return;
    
    setExporting(true);
    try {
      // For now, use the existing export service
      await ExportService.exportCompleteAssetSummary(user.id);
      toast({
        title: "Export Started",
        description: "Your property assets are being compiled for download."
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export assets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const totalAssets = photos.length + videos.length + documents.length + 
    damageReports.length + paintCodes.length + voiceNotes.length + 
    manualEntries.length + upgradeRepairs.length;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow py-8 px-4 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading property assets...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow py-8 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <Button onClick={() => navigate('/account/properties')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Properties
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/account/properties')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Properties
            </Button>
            
            <Card className="bg-gradient-to-r from-brand-blue to-brand-lightBlue text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-6 w-6" />
                      <h1 className="text-2xl font-bold">{property.name}</h1>
                    </div>
                    <p className="flex items-center gap-1 text-white/80">
                      <MapPin className="h-4 w-4" /> {property.address}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-white/70">
                      <span>{property.type}</span>
                      {property.square_footage && <span>{property.square_footage} sq ft</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      {totalAssets} Total Assets
                    </Badge>
                    <Button 
                      onClick={handleExportAll}
                      disabled={exporting}
                      className="bg-white text-brand-blue hover:bg-white/90"
                    >
                      {exporting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Exporting...</>
                      ) : (
                        <><FileDown className="h-4 w-4 mr-2" /> Export PDF + ZIP</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assets Accordion */}
          <Accordion type="multiple" defaultValue={['photos', 'videos', 'documents']} className="space-y-4">
            {/* Photos */}
            <AccordionItem value="photos" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-brand-blue" />
                  <span className="font-semibold">Photos</span>
                  <Badge variant="outline">{photos.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {photos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No photos uploaded for this property</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <SignedImage file={photo} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Videos */}
            <AccordionItem value="videos" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-brand-blue" />
                  <span className="font-semibold">Videos</span>
                  <Badge variant="outline">{videos.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {videos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No videos uploaded for this property</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {videos.map((video) => (
                      <Card key={video.id} className="p-3">
                        <div className="flex items-center gap-3">
                          <Video className="h-8 w-8 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{video.file_name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(video.created_at)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Documents */}
            <AccordionItem value="documents" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-blue" />
                  <span className="font-semibold">Documents</span>
                  <Badge variant="outline">{documents.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No documents uploaded for this property</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.file_name}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Damage Reports */}
            <AccordionItem value="damage" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">Damage Reports</span>
                  <Badge variant="outline">{damageReports.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {damageReports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No damage reports for this property</p>
                ) : (
                  <div className="space-y-2">
                    {damageReports.map((report) => (
                      <Card key={report.id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{report.incident_types?.join(', ') || 'Damage Report'}</p>
                            <p className="text-sm text-muted-foreground">
                              {report.areas_affected?.join(', ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {formatDate(report.date_of_damage || report.created_at)}
                            </p>
                          </div>
                          {report.estimated_cost && (
                            <Badge variant="secondary">{report.estimated_cost}</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Paint Codes */}
            <AccordionItem value="paint" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold">Paint Codes</span>
                  <Badge variant="outline">{paintCodes.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {paintCodes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No paint codes for this property</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paintCodes.map((paint) => (
                      <Card key={paint.id} className="p-3">
                        <p className="font-medium">{paint.paint_name}</p>
                        <p className="text-sm text-muted-foreground">{paint.paint_brand} - {paint.paint_code}</p>
                        {paint.room_location && (
                          <p className="text-xs text-muted-foreground mt-1">{paint.room_location}</p>
                        )}
                        <Badge variant="outline" className="mt-2">
                          {paint.is_interior ? 'Interior' : 'Exterior'}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Manual Entries / Inventory */}
            <AccordionItem value="inventory" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Inventory Items</span>
                  <Badge variant="outline">{manualEntries.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {manualEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No inventory items for this property</p>
                ) : (
                  <div className="space-y-2">
                    {manualEntries.map((item) => (
                      <Card key={item.id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                            {item.category && (
                              <Badge variant="outline" className="mt-1">{item.category}</Badge>
                            )}
                          </div>
                          {item.estimated_value && (
                            <span className="font-semibold">{formatCurrency(item.estimated_value)}</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Upgrades & Repairs */}
            <AccordionItem value="upgrades" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Upgrades & Repairs</span>
                  <Badge variant="outline">{upgradeRepairs.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {upgradeRepairs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No upgrades or repairs for this property</p>
                ) : (
                  <div className="space-y-2">
                    {upgradeRepairs.map((upgrade) => (
                      <Card key={upgrade.id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{upgrade.title}</p>
                            <div className="flex gap-2 mt-1">
                              {upgrade.repair_type && (
                                <Badge variant="outline">{upgrade.repair_type}</Badge>
                              )}
                              {upgrade.location && (
                                <span className="text-sm text-muted-foreground">{upgrade.location}</span>
                              )}
                            </div>
                            {upgrade.date_completed && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {formatDate(upgrade.date_completed)}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold">{formatCurrency(upgrade.total_cost)}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Voice Notes */}
            <AccordionItem value="voice" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Voice Notes</span>
                  <Badge variant="outline">{voiceNotes.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {voiceNotes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No voice notes recorded</p>
                ) : (
                  <div className="space-y-2">
                    {voiceNotes.map((note) => (
                      <Card key={note.id} className="p-3">
                        <div className="flex items-center gap-3">
                          <Mic className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{note.title}</p>
                            {note.description && (
                              <p className="text-sm text-muted-foreground">{note.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{formatDate(note.created_at)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PropertyAllAssets;
