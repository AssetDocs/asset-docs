import { useState } from 'react';
import { StorageService, FileType } from '@/services/StorageService';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import RateLimiter from '@/utils/rateLimiter';

export interface UseFileUploadOptions {
  bucket: FileType;
  onSuccess?: (results: Array<{ file: File; url: string; path: string }>) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const { user } = useAuth();
  const { subscriptionTier } = useSubscription();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadFiles = async (files: File[]) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      return [];
    }

    // Check upload rate limiting
    const rateLimitResult = RateLimiter.recordAttempt(user.id, `bulk-upload-${options.bucket}`, 3, 5);
    if (rateLimitResult.blocked) {
      const resetTime = new Date(rateLimitResult.resetTime);
      toast({
        title: "Upload rate limit exceeded",
        description: `Too many upload attempts. Try again after ${resetTime.toLocaleTimeString()}`,
        variant: "destructive",
      });
      return [];
    }

    setIsUploading(true);
    const results = [];

    try {
      for (const [index, file] of files.entries()) {
        const fileKey = `${file.name}_${index}`;
        setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));

        try {
          const uploadResult = await StorageService.uploadFileWithValidation(
            file,
            options.bucket,
            user.id,
            subscriptionTier
          );

          setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
          results.push({
            file,
            url: uploadResult.url,
            path: uploadResult.path
          });
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [fileKey]: -1 })); // -1 indicates error
          
          // Sanitize error message for security
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          const sanitizedMessage = errorMessage.includes('rate limit') ? errorMessage : `Failed to upload ${file.name}`;
          
          toast({
            title: "Upload failed",
            description: sanitizedMessage,
            variant: "destructive",
          });
        }
      }

      if (results.length > 0) {
        options.onSuccess?.(results);
        toast({
          title: "Upload successful",
          description: `${results.length} file(s) uploaded successfully.`,
        });
      }

      return results;
    } catch (error) {
      const errorObj = error as Error;
      options.onError?.(errorObj);
      
      // Sanitize error message
      const sanitizedMessage = errorObj.message.includes('rate limit') ? errorObj.message : 'An error occurred during upload.';
      
      toast({
        title: "Upload failed",
        description: sanitizedMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const uploadSingleFile = async (file: File) => {
    const results = await uploadFiles([file]);
    return results[0] || null;
  };

  return {
    uploadFiles,
    uploadSingleFile,
    isUploading,
    uploadProgress
  };
};