import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  user_id: string;
  name: string;
  address: string;
  type: string;
  square_footage: number | null;
  year_built: number | null;
  estimated_value: number | null;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyFile {
  id: string;
  property_id: string;
  user_id: string;
  file_type: 'photo' | 'video' | 'document' | 'floor-plan';
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number | null;
  bucket_name: string;
  created_at: string;
}

export class PropertyService {
  // Properties CRUD
  static async createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'last_updated' | 'user_id'>): Promise<Property | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating property:', error);
      return null;
    }
  }

  static async getUserProperties(): Promise<Property[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  static async updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating property:', error);
      return null;
    }
  }

  static async deleteProperty(propertyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  // Property Files CRUD
  static async addPropertyFile(fileData: Omit<PropertyFile, 'id' | 'created_at' | 'user_id'>): Promise<PropertyFile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('property_files')
        .insert({
          ...fileData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PropertyFile | null;
    } catch (error) {
      console.error('Error adding property file:', error);
      return null;
    }
  }

  static async getPropertyFiles(propertyId: string, fileType?: 'photo' | 'video' | 'document' | 'floor-plan'): Promise<PropertyFile[]> {
    try {
      let query = supabase
        .from('property_files')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (fileType) {
        query = query.eq('file_type', fileType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PropertyFile[];
    } catch (error) {
      console.error('Error fetching property files:', error);
      return [];
    }
  }

  static async deletePropertyFile(fileId: string, filePath: string, bucketName: string): Promise<boolean> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('property_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
      return true;
    } catch (error) {
      console.error('Error deleting property file:', error);
      return false;
    }
  }

  static async getAllUserFiles(fileType?: 'photo' | 'video' | 'document' | 'floor-plan'): Promise<PropertyFile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('property_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fileType) {
        query = query.eq('file_type', fileType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PropertyFile[];
    } catch (error) {
      console.error('Error fetching user files:', error);
      return [];
    }
  }
}
