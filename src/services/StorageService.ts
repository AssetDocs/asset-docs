import { supabase } from '@/integrations/supabase/client';
import { getStorageLimit, formatStorageSize } from '@/config/subscriptionFeatures';
import type { SubscriptionTier } from '@/config/subscriptionFeatures';

export type FileType = 'photos' | 'videos' | 'documents' | 'floor-plans';

export interface StorageUsage {
  bucket_name: string;
  file_count: number;
  total_size_bytes: number;
}

export interface StorageQuota {
  used: number;
  limit: number | null;
  percentage: number;
  isUnlimited: boolean;
  isNearLimit: boolean;
  isOverLimit: boolean;
}

export interface UploadResult {
  url: string;
  path: string;
  fullPath: string;
}

export class StorageService {
  /**
   * Upload a file to a specific bucket
   */
  static async uploadFile(
    file: File,
    bucket: FileType,
    userId: string,
    fileName?: string
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const finalFileName = fileName || `${timestamp}-${file.name}`;
    const path = `${userId}/${finalFileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      fullPath: data.fullPath
    };
  }

  /**
   * Upload multiple files to a specific bucket
   */
  static async uploadMultipleFiles(
    files: File[],
    bucket: FileType,
    userId: string
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, bucket, userId)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(bucket: FileType, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get signed URL for private files (documents)
   */
  static async getSignedUrl(
    bucket: FileType,
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * List files in a user's folder
   */
  static async listUserFiles(bucket: FileType, userId: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(userId);

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(bucket: FileType, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Get user's storage usage across all buckets
   */
  static async getUserStorageUsage(userId: string): Promise<StorageUsage[]> {
    const { data, error } = await supabase
      .from('storage_usage')
      .select('bucket_name, file_count, total_size_bytes')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get storage usage: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get total storage usage for a user
   */
  static async getTotalStorageUsage(userId: string): Promise<number> {
    const usage = await this.getUserStorageUsage(userId);
    return usage.reduce((total, bucket) => total + bucket.total_size_bytes, 0);
  }

  /**
   * Check storage quota for a user
   */
  static async getStorageQuota(userId: string, subscriptionTier: SubscriptionTier | null): Promise<StorageQuota> {
    const totalUsed = await this.getTotalStorageUsage(userId);
    const limit = getStorageLimit(subscriptionTier);
    const isUnlimited = false; // No more unlimited storage
    const percentage = limit ? Math.min((totalUsed / limit) * 100, 100) : 0;
    const isNearLimit = limit ? percentage >= 80 : false;
    const isOverLimit = limit ? totalUsed > limit : false;

    return {
      used: totalUsed,
      limit,
      percentage,
      isUnlimited,
      isNearLimit,
      isOverLimit
    };
  }

  /**
   * Check if user can upload a file of given size
   */
  static async canUploadFile(
    userId: string, 
    fileSize: number, 
    subscriptionTier: SubscriptionTier | null
  ): Promise<{ canUpload: boolean; reason?: string }> {
    const quota = await this.getStorageQuota(userId, subscriptionTier);
    
    if (!quota.limit) {
      return { 
        canUpload: false, 
        reason: 'No subscription tier found. Please subscribe to upload files.' 
      };
    }

    if ((quota.used + fileSize) > quota.limit) {
      return { 
        canUpload: false, 
        reason: `Upload would exceed storage limit. Current usage: ${formatStorageSize(quota.used)}, Limit: ${formatStorageSize(quota.limit)}` 
      };
    }

    return { canUpload: true };
  }

  /**
   * Upload file with storage limit validation
   */
  static async uploadFileWithValidation(
    file: File,
    bucket: FileType,
    userId: string,
    subscriptionTier: SubscriptionTier | null,
    fileName?: string
  ): Promise<UploadResult> {
    const validation = await this.canUploadFile(userId, file.size, subscriptionTier);
    
    if (!validation.canUpload) {
      throw new Error(validation.reason || 'Upload not allowed');
    }

    return this.uploadFile(file, bucket, userId, fileName);
  }

  /**
   * Refresh storage usage calculations for a user
   */
  static async refreshStorageUsage(userId: string): Promise<void> {
    const { error } = await supabase.rpc('update_user_storage_usage', {
      target_user_id: userId
    });

    if (error) {
      throw new Error(`Failed to refresh storage usage: ${error.message}`);
    }
  }
}