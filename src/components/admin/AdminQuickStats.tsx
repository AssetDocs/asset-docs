import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, Home, Image, Video, FileText, HardDrive, Gift, CreditCard, RefreshCw } from 'lucide-react';

interface QuickStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalProperties: number;
  totalItems: number;
  totalPhotos: number;
  totalVideos: number;
  totalDocuments: number;
  totalStorageBytes: number;
  giftSubscriptions: number;
  redeemedGifts: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

const AdminQuickStats = () => {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeSubscriptions } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('plan_status', 'active');

      // Get property and item counts
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      const { count: totalItems } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true });

      // Get file counts by type from property_files
      const { data: fileData } = await supabase
        .from('property_files')
        .select('file_type');

      const photos = fileData?.filter(f => f.file_type?.startsWith('image')).length || 0;
      const videos = fileData?.filter(f => f.file_type?.startsWith('video')).length || 0;
      const documents = fileData?.filter(f => 
        f.file_type?.includes('pdf') || 
        f.file_type?.includes('document') ||
        f.file_type?.includes('text')
      ).length || 0;

      // Get storage usage
      const { data: storageData } = await supabase
        .from('storage_usage')
        .select('total_size_bytes');

      const totalStorageBytes = storageData?.reduce((sum, s) => sum + s.total_size_bytes, 0) || 0;

      // Get gift subscription counts
      const { count: giftSubscriptions } = await supabase
        .from('gift_subscriptions')
        .select('*', { count: 'exact', head: true });

      const { count: redeemedGifts } = await supabase
        .from('gift_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('redeemed', true);

      // Get new users this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Get new users this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalProperties: totalProperties || 0,
        totalItems: totalItems || 0,
        totalPhotos: photos,
        totalVideos: videos,
        totalDocuments: documents,
        totalStorageBytes,
        giftSubscriptions: giftSubscriptions || 0,
        redeemedGifts: redeemedGifts || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
      });

    } catch (error) {
      console.error('Error loading quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    iconColor = 'text-primary',
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    iconColor?: string;
    subtitle?: string;
  }) => (
    <div className="text-center p-4 bg-muted rounded-lg">
      <div className="flex justify-center mb-2">
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold">{loading ? '-' : value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Real-time metrics and statistics</CardDescription>
          </div>
          <Button onClick={loadStats} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers || 0} 
            icon={Users}
            iconColor="text-blue-500"
          />
          <StatCard 
            title="Active Subscriptions" 
            value={stats?.activeSubscriptions || 0} 
            icon={CreditCard}
            iconColor="text-green-500"
          />
          <StatCard 
            title="New This Week" 
            value={stats?.newUsersThisWeek || 0} 
            icon={Users}
            iconColor="text-purple-500"
          />
          <StatCard 
            title="New This Month" 
            value={stats?.newUsersThisMonth || 0} 
            icon={Users}
            iconColor="text-indigo-500"
          />
          <StatCard 
            title="Properties" 
            value={stats?.totalProperties || 0} 
            icon={Home}
            iconColor="text-orange-500"
          />
          <StatCard 
            title="Inventory Items" 
            value={stats?.totalItems || 0} 
            icon={FileText}
            iconColor="text-cyan-500"
          />
          <StatCard 
            title="Photos" 
            value={stats?.totalPhotos || 0} 
            icon={Image}
            iconColor="text-pink-500"
          />
          <StatCard 
            title="Videos" 
            value={stats?.totalVideos || 0} 
            icon={Video}
            iconColor="text-red-500"
          />
          <StatCard 
            title="Documents" 
            value={stats?.totalDocuments || 0} 
            icon={FileText}
            iconColor="text-amber-500"
          />
          <StatCard 
            title="Storage Used" 
            value={formatBytes(stats?.totalStorageBytes || 0)} 
            icon={HardDrive}
            iconColor="text-teal-500"
          />
          <StatCard 
            title="Gift Subscriptions" 
            value={stats?.giftSubscriptions || 0} 
            icon={Gift}
            iconColor="text-yellow-500"
            subtitle={`${stats?.redeemedGifts || 0} redeemed`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickStats;
