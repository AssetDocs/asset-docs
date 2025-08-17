import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertySelector from '@/components/PropertySelector';
import ManualDamageEntry from '@/components/ManualDamageEntry';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Camera, 
  Video, 
  Upload, 
  Eye, 
  Plus,
  Calendar,
  MapPin,
  FileText,
  Edit
} from 'lucide-react';

interface DamagePhoto {
  id: number;
  name: string;
  uploadDate: string;
  location: string;
  damageType: string;
  severity: 'minor' | 'moderate' | 'severe';
}

interface DamageVideo {
  id: number;
  name: string;
  duration: string;
  uploadDate: string;
  location: string;
  damageType: string;
  severity: 'minor' | 'moderate' | 'severe';
}

const PostDamageSection: React.FC = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const { toast } = useToast();
  
  // Mock data - in a real app, this would come from your backend
  const [damagePhotos] = useState<DamagePhoto[]>([
    {
      id: 1,
      name: "Water damage in basement",
      uploadDate: "2024-01-10",
      location: "Basement",
      damageType: "Water Damage",
      severity: "severe"
    },
    {
      id: 2,
      name: "Roof leak stains",
      uploadDate: "2024-01-08",
      location: "Master Bedroom",
      damageType: "Water Damage",
      severity: "moderate"
    }
  ]);

  const [damageVideos] = useState<DamageVideo[]>([
    {
      id: 1,
      name: "Flood damage walkthrough",
      duration: "3:45",
      uploadDate: "2024-01-10",
      location: "Basement",
      damageType: "Water Damage",
      severity: "severe"
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateDamageReport = () => {
    if (!selectedPropertyId) {
      toast({
        title: "Property Required",
        description: "Please select a property before generating a damage report.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('Property Damage Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      pdf.text(`Property ID: ${selectedPropertyId}`, 20, 40);
      
      let yPosition = 60;
      
      // Damage Photos Section
      if (damagePhotos.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Damage Photos', 20, yPosition);
        yPosition += 10;
        
        damagePhotos.forEach((photo, index) => {
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${photo.name}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Location: ${photo.location}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Damage Type: ${photo.damageType}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Severity: ${photo.severity}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Date: ${formatDate(photo.uploadDate)}`, 30, yPosition);
          yPosition += 10;
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Damage Videos Section
      if (damageVideos.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Damage Videos', 20, yPosition);
        yPosition += 10;
        
        damageVideos.forEach((video, index) => {
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${video.name}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Location: ${video.location}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Damage Type: ${video.damageType}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Severity: ${video.severity}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Duration: ${video.duration}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Date: ${formatDate(video.uploadDate)}`, 30, yPosition);
          yPosition += 10;
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Summary
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Summary', 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Total Damage Photos: ${damagePhotos.length}`, 30, 35);
      pdf.text(`Total Damage Videos: ${damageVideos.length}`, 30, 45);
      pdf.text(`Most Common Damage Type: Water Damage`, 30, 55);
      pdf.text(`Report Generated: ${new Date().toLocaleString()}`, 30, 65);
      
      pdf.save(`Damage_Report_${selectedPropertyId}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Report Generated",
        description: "Damage report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate damage report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
          Post Damage Documentation
        </CardTitle>
        <CardDescription>
          Document property damage with photos, videos, and manual entries for insurance claims and repairs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Property Selection */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Property Selection
              </CardTitle>
              <CardDescription>
                Select the property where damage documentation will be added
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertySelector
                value={selectedPropertyId}
                onChange={setSelectedPropertyId}
                placeholder="Select property for damage documentation"
              />
              {selectedPropertyId && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Property selected - all damage entries will be associated with this property
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Upload Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-16 bg-red-600 hover:bg-red-700" disabled={!selectedPropertyId}>
              <Link to={selectedPropertyId ? "/damage/photos/upload" : "#"}>
                <div className="flex flex-col items-center">
                  <Camera className="h-6 w-6 mb-1" />
                  <span>Upload Damage Photos</span>
                </div>
              </Link>
            </Button>
            <Button asChild className="h-16 bg-red-600 hover:bg-red-700" disabled={!selectedPropertyId}>
              <Link to={selectedPropertyId ? "/damage/videos/upload" : "#"}>
                <div className="flex flex-col items-center">
                  <Video className="h-6 w-6 mb-1" />
                  <span>Upload Damage Videos</span>
                </div>
              </Link>
            </Button>
          </div>

          {!selectedPropertyId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Please select a property above to enable damage documentation features.
              </p>
            </div>
          )}

          {/* Damage Documentation Tabs */}
          <Tabs defaultValue="photos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="photos" className="flex items-center">
                <Camera className="h-4 w-4 mr-1" />
                Photos ({damagePhotos.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center">
                <Video className="h-4 w-4 mr-1" />
                Videos ({damageVideos.length})
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center">
                <Edit className="h-4 w-4 mr-1" />
                Manual Entries
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="mt-4">
              {damagePhotos.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No damage photos yet</h3>
                  <p className="text-gray-500 mb-4">Start documenting property damage by uploading photos</p>
                  <Button asChild disabled={!selectedPropertyId}>
                    <Link to="/account/damage/photos/upload">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload First Photo
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Recent damage photos</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {damagePhotos.slice(0, 4).map((photo) => (
                      <Card key={photo.id} className="overflow-hidden">
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm mb-2">{photo.name}</h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(photo.uploadDate)}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {photo.location}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {photo.damageType}
                              </Badge>
                              <Badge className={`text-xs ${getSeverityColor(photo.severity)}`}>
                                {photo.severity}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="mt-4">
              {damageVideos.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No damage videos yet</h3>
                  <p className="text-gray-500 mb-4">Create video walkthroughs of property damage</p>
                  <Button asChild disabled={!selectedPropertyId}>
                    <Link to="/account/damage/videos/upload">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload First Video
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Recent damage videos</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {damageVideos.slice(0, 4).map((video) => (
                      <Card key={video.id} className="overflow-hidden">
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm mb-2">{video.name}</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(video.uploadDate)}
                              </div>
                              <span>{video.duration}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {video.location}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {video.damageType}
                              </Badge>
                              <Badge className={`text-xs ${getSeverityColor(video.severity)}`}>
                                {video.severity}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              {selectedPropertyId ? (
                <ManualDamageEntry />
              ) : (
                <div className="text-center py-8">
                  <Edit className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Select a property first</h3>
                  <p className="text-gray-500">Choose a property above to add manual damage entries</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Damage Reports</h3>
                <p className="text-gray-500 mb-4">Generate comprehensive damage reports for insurance claims</p>
                <Button onClick={generateDamageReport} disabled={!selectedPropertyId}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Damage Report
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" size="sm" onClick={generateDamageReport} disabled={!selectedPropertyId}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Damage Report
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostDamageSection;
