import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Camera, Video, FileText, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ItemService } from '@/services/ItemService';

const AccountStats: React.FC = () => {
  const [stats, setStats] = useState({
    properties: 0,
    photos: 0,
    videos: 0,
    documents: 0,
    totalValue: 0,
    propertyValue: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get items count and total value
      const items = await ItemService.getUserItems(user.id);
      const totalItemValue = items.reduce((sum, item) => sum + (Number(item.estimated_value) || 0), 0);

      // Get photo count
      const { data: photoFiles } = await supabase.storage
        .from('photos')
        .list(user.id);
      const photoCount = photoFiles?.length || 0;

      // Get video count
      const { data: videoFiles } = await supabase.storage
        .from('videos')
        .list(user.id);
      const videoCount = videoFiles?.length || 0;

      // Get document count
      const { data: documentFiles } = await supabase.storage
        .from('documents')
        .list(user.id);
      const documentCount = documentFiles?.length || 0;

      setStats({
        properties: 0, // Will be loaded from items with property_id
        photos: photoCount,
        videos: videoCount,
        documents: documentCount,
        totalValue: totalItemValue,
        propertyValue: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold">{stats.properties}</p>
              {stats.propertyValue > 0 && (
                <p className="text-xs text-gray-500">{formatCurrency(stats.propertyValue)} total value</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Photos</p>
              <p className="text-2xl font-bold">{stats.photos}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Video className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-2xl font-bold">{stats.videos}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold">{stats.documents}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              {stats.propertyValue > 0 && (
                <p className="text-xs text-gray-500">Including real estate</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountStats;
