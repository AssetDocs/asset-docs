// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { logActivity } from '@/hooks/useActivityLog';
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

    // Log activity
    logActivity({
      action_type: 'upload',
      action_category: 'upload',
      resource_type: 'item',
      resource_id: data.id,
      resource_name: data.name,
      details: { category: data.category, item_type: data.item_type }
    });

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

    // Log activity
    logActivity({
      action_type: 'edit',
      action_category: 'upload',
      resource_type: 'item',
      resource_id: data.id,
      resource_name: data.name,
      details: { updated_fields: Object.keys(updates) }
    });

    return data;
  }

  static async deleteItem(itemId: string): Promise<boolean> {
    // Get item name before deletion for logging
    const { data: item } = await supabase
      .from('items')
      .select('name')
      .eq('id', itemId)
      .single();

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      return false;
    }

    // Log activity
    logActivity({
      action_type: 'delete',
      action_category: 'upload',
      resource_type: 'item',
      resource_id: itemId,
      resource_name: item?.name || 'Unknown item'
    });

    return true;
  }

  /**
   * Upload a receipt for an item.
   *
   * Receipts are SHARED workspace content (receipts.user_id is the account
   * OWNER; RLS allows owner + full_access). Callers MUST pass an explicit
   * upload context object derived from the active AccountContext rather than
   * relying on the signed-in user's id. Read-only members will be rejected by
   * RLS on both the table and storage policies.
   *
   * New path: accounts/{accountId}/items/{itemId}/receipts/{rand}.ext
   * Legacy receipts continue to resolve via _storage_path_owner.
   */
  static async uploadReceiptForItem(
    ctx: { accountId: string; ownerUserId: string; itemId: string },
    file: File,
    receiptData: {
      purchase_date?: string;
      purchase_amount?: number;
      merchant_name?: string;
      notes?: string;
    }
  ): Promise<Receipt | null> {
    const { accountId, ownerUserId, itemId } = ctx;

    if (!accountId || !ownerUserId || !itemId) {
      throw new Error('Receipt upload requires accountId, ownerUserId, and itemId.');
    }

    // Membership check: confirm the item actually belongs to the selected
    // account's owner. This stops a stale itemId from a previous workspace
    // from getting attached to the wrong account.
    const { data: itemRow, error: itemErr } = await supabase
      .from('items')
      .select('id, user_id')
      .eq('id', itemId)
      .maybeSingle();

    if (itemErr) {
      throw new Error(`Item lookup failed: ${itemErr.message}`);
    }
    if (!itemRow || itemRow.user_id !== ownerUserId) {
      throw new Error('Item does not belong to the active account.');
    }

    const rand = StorageService.randomizedFilename(file.name);
    const fullPath = `accounts/${accountId}/items/${itemId}/receipts/${rand}`;

    // Owner quota check (not the uploader's quota — AUs use the owner's quota).
    const uploadResult = await StorageService.uploadFileToPath(
      file,
      'documents',
      fullPath,
      ownerUserId
    );

    let receiptInserted = false;
    try {
      const { data, error } = await supabase
        .from('receipts')
        .insert([{
          item_id: itemId,
          user_id: ownerUserId, // owner-scoped row; RLS shares via has_account_access
          receipt_name: file.name, // original name preserved only in DB metadata
          receipt_url: uploadResult.url,
          receipt_path: uploadResult.path,
          file_size: file.size,
          ...receiptData,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      receiptInserted = true;

      logActivity({
        action_type: 'upload',
        action_category: 'upload',
        resource_type: 'receipt',
        resource_id: data.id,
        resource_name: file.name,
        details: {
          item_id: itemId,
          account_id: accountId,
          merchant_name: receiptData.merchant_name,
          purchase_amount: receiptData.purchase_amount,
        },
      });

      return data;
    } finally {
      if (!receiptInserted) {
        await StorageService.tryCleanupObject('documents', uploadResult.path);
      }
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