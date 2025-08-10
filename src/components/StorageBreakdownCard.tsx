import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileImage, FileVideo, FileText, Building, RefreshCw } from 'lucide-react';
import { StorageService, type StorageUsage } from '@/services/StorageService';
import { formatStorageSize } from '@/config/subscriptionFeatures';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StorageBreakdownCardProps {
  className?: string;
}

const StorageBreakdownCard: React.FC<StorageBreakdownCardProps> = ({ className }) => {
  const [usage, setUsage] = useState<StorageUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getBucketIcon = (bucketName: string) => {
    switch (bucketName) {
      case 'photos':
        return <FileImage className="h-4 w-4" />;
      case 'videos':
        return <FileVideo className="h-4 w-4" />;
      case 'documents':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getBucketDisplayName = (bucketName: string) => {
    switch (bucketName) {
      case 'photos':
        return 'Photos';
      case 'videos':
        return 'Videos';
      case 'documents':
        return 'Documents';
      default:
        return bucketName;
    }
  };

  const loadStorageBreakdown = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const storageUsage = await StorageService.getUserStorageUsage(user.id);
      setUsage(storageUsage);
    } catch (error) {
      console.error('Failed to load storage breakdown:', error);
      toast.error('Failed to load storage breakdown');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await StorageService.refreshStorageUsage(user.id);
      await loadStorageBreakdown();
      toast.success('Storage breakdown refreshed');
    } catch (error) {
      console.error('Failed to refresh storage breakdown:', error);
      toast.error('Failed to refresh storage breakdown');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStorageBreakdown();
  }, []);

  const totalFiles = usage.reduce((total, bucket) => total + bucket.file_count, 0);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Storage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
                <div className="h-6 w-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Storage Breakdown</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {usage.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No files uploaded yet
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>Total Files: {totalFiles}</span>
              <span>Total Size: {formatStorageSize(usage.reduce((total, bucket) => total + bucket.total_size_bytes, 0))}</span>
            </div>
            
            <div className="space-y-3">
              {usage.map((bucket) => (
                <div key={bucket.bucket_name} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    {getBucketIcon(bucket.bucket_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {getBucketDisplayName(bucket.bucket_name)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {bucket.file_count} files
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatStorageSize(bucket.total_size_bytes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageBreakdownCard;