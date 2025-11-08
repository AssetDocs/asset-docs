import { useState, useEffect } from 'react';
import { PropertyFile, PropertyService } from '@/services/PropertyService';
import { StorageService } from '@/services/StorageService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export const usePropertyFiles = (propertyId: string | null, fileType?: 'photo' | 'video' | 'document' | 'floor-plan') => {
  const [files, setFiles] = useState<PropertyFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionTier } = useSubscription();

  const fetchFiles = async () => {
    if (!propertyId) {
      setFiles([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await PropertyService.getPropertyFiles(propertyId, fileType);
      setFiles(data);
    } catch (error) {
      console.error('Error fetching property files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [propertyId, fileType]);

  const uploadFiles = async (filesToUpload: File[]) => {
    if (!propertyId || !user) {
      toast({
        title: 'Error',
        description: 'Property or user not found',
        variant: 'destructive',
      });
      return [];
    }

    setIsUploading(true);
    const uploadedFiles: PropertyFile[] = [];

    try {
      // Determine bucket based on file type
      const bucketMap = {
        'photo': 'photos' as const,
        'video': 'videos' as const,
        'document': 'documents' as const,
        'floor-plan': 'floor-plans' as const,
      };
      const bucket = fileType ? bucketMap[fileType] : 'documents' as const;

      // Upload files to storage
      for (const file of filesToUpload) {
        try {
          const result = await StorageService.uploadFileWithValidation(
            file,
            bucket,
            user.id,
            subscriptionTier,
            `${user.id}/${propertyId}/${Date.now()}-${file.name}`
          );

          // Add to property_files table
          const propertyFile = await PropertyService.addPropertyFile({
            property_id: propertyId,
            file_type: fileType || 'document',
            file_name: file.name,
            file_path: result.path,
            file_url: result.url,
            file_size: file.size,
            bucket_name: bucket,
          });

          if (propertyFile) {
            uploadedFiles.push(propertyFile);
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast({
            title: 'Upload Failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
        }
      }

      if (uploadedFiles.length > 0) {
        setFiles(prev => [...uploadedFiles, ...prev]);
        toast({
          title: 'Upload Successful',
          description: `${uploadedFiles.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }

    return uploadedFiles;
  };

  const deleteFile = async (fileId: string, filePath: string, bucketName: string) => {
    const success = await PropertyService.deletePropertyFile(fileId, filePath, bucketName);
    if (success) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: 'File Deleted',
        description: 'The file has been successfully removed.',
      });
      return true;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    files,
    isLoading,
    isUploading,
    uploadFiles,
    deleteFile,
    refetch: fetchFiles,
  };
};
