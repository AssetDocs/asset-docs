import { supabase } from '@/integrations/supabase/client';

export type FileType = 'photos' | 'videos' | 'documents' | 'floor-plans';

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
}