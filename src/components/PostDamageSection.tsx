
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Camera, 
  Video, 
  Upload, 
  Eye, 
  Plus,
  Calendar,
  MapPin,
  FileText
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
          Post Damage Documentation
        </CardTitle>
        <CardDescription>
          Document property damage with photos and videos for insurance claims and repairs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quick Upload Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-16 bg-red-600 hover:bg-red-700">
              <Link to="/account/damage/photos/upload">
                <div className="flex flex-col items-center">
                  <Camera className="h-6 w-6 mb-1" />
                  <span>Upload Damage Photos</span>
                </div>
              </Link>
            </Button>
            <Button asChild className="h-16 bg-red-600 hover:bg-red-700">
              <Link to="/account/damage/videos/upload">
                <div className="flex flex-col items-center">
                  <Video className="h-6 w-6 mb-1" />
                  <span>Upload Damage Videos</span>
                </div>
              </Link>
            </Button>
          </div>

          {/* Damage Documentation Tabs */}
          <Tabs defaultValue="photos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photos" className="flex items-center">
                <Camera className="h-4 w-4 mr-1" />
                Damage Photos ({damagePhotos.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center">
                <Video className="h-4 w-4 mr-1" />
                Damage Videos ({damageVideos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="mt-4">
              {damagePhotos.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No damage photos yet</h3>
                  <p className="text-gray-500 mb-4">Start documenting property damage by uploading photos</p>
                  <Button asChild>
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
                    <Button asChild variant="outline" size="sm">
                      <Link to="/account/damage/photos">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Photos
                      </Link>
                    </Button>
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
                  <Button asChild>
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
                    <Button asChild variant="outline" size="sm">
                      <Link to="/account/damage/videos">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Videos
                      </Link>
                    </Button>
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
          </Tabs>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/account/damage/report">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Damage Report
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/account/damage/photos">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Damage Photos
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/account/damage/videos">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Damage Videos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostDamageSection;
