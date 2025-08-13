import { supabase } from '@/integrations/supabase/client';
import { StorageService } from './StorageService';

export interface Item {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  estimated_value?: number;
  category?: string;
  item_type?: string;
  property_upgrade?: string;
  property_id?: string;
  location?: string;
  condition?: string;
  brand?: string;
  model?: string;
  ai_generated?: boolean;
  confidence?: number;
  is_manual_entry?: boolean;
  photo_url?: string;
  photo_path?: string;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string;
  item_id: string;
  user_id: string;
  receipt_name: string;
  receipt_url: string;
  receipt_path: string;
  file_size?: number;
  purchase_date?: string;
  purchase_amount?: number;
  merchant_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class ItemService {
  static async createItem(itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Item, 'description' | 'estimated_value' | 'category' | 'item_type' | 'property_upgrade' | 'property_id' | 'location' | 'condition' | 'brand' | 'model' | 'ai_generated' | 'confidence' | 'is_manual_entry' | 'photo_url' | 'photo_path'>>): Promise<Item | null> {
    const { data, error } = await supabase
      .from('items')
      .insert(itemData)
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      throw new Error(error.message);
    }

    return data;
  }

  static async getUserItems(userId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }

    return data || [];
  }

  static async updateItem(itemId: string, updates: Partial<Item>): Promise<Item | null> {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      throw new Error(error.message);
    }

    return data;
  }

  static async deleteItem(itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      return false;
    }

    return true;
  }

  static async uploadReceiptForItem(
    itemId: string,
    userId: string,
    file: File,
    receiptData: {
      purchase_date?: string;
      purchase_amount?: number;
      merchant_name?: string;
      notes?: string;
    }
  ): Promise<Receipt | null> {
    try {
      // Upload file to storage
      const uploadResult = await StorageService.uploadFile(file, 'documents', userId);

      // Create receipt record
      const { data, error } = await supabase
        .from('receipts')
        .insert([{
          item_id: itemId,
          user_id: userId,
          receipt_name: file.name,
          receipt_url: uploadResult.url,
          receipt_path: uploadResult.path,
          file_size: file.size,
          ...receiptData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating receipt:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  }

  static async getItemReceipts(itemId: string): Promise<Receipt[]> {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching receipts:', error);
      return [];
    }

    return data || [];
  }

  static async deleteReceipt(receiptId: string): Promise<boolean> {
    try {
      // Get receipt details first to delete file
      const { data: receipt } = await supabase
        .from('receipts')
        .select('receipt_path')
        .eq('id', receiptId)
        .single();

      if (receipt?.receipt_path) {
        await StorageService.deleteFile('documents', receipt.receipt_path);
      }

      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (error) {
        console.error('Error deleting receipt:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return false;
    }
  }
}