import { supabase } from '@/integrations/supabase/client';

export interface InsurancePolicy {
  id: string;
  user_id: string;
  policy_type: string;
  insurance_company: string;
  policy_number: string;
  agent_name?: string;
  agent_phone?: string;
  agent_email?: string;
  policy_start_date?: string;
  policy_end_date?: string;
  premium_amount?: number;
  deductible?: number;
  coverage_amount?: number;
  coverage_details?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class InsuranceService {
  static async getUserPolicies(userId: string): Promise<InsurancePolicy[]> {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching insurance policies:', error);
      throw error;
    }

    return data || [];
  }

  static async createPolicy(policyData: Omit<InsurancePolicy, 'id' | 'created_at' | 'updated_at'>): Promise<InsurancePolicy | null> {
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert(policyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating insurance policy:', error);
      throw error;
    }

    return data;
  }

  static async updatePolicy(policyId: string, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy | null> {
    const { data, error } = await supabase
      .from('insurance_policies')
      .update(updates)
      .eq('id', policyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating insurance policy:', error);
      throw error;
    }

    return data;
  }

  static async deletePolicy(policyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', policyId);

    if (error) {
      console.error('Error deleting insurance policy:', error);
      throw error;
    }

    return true;
  }
}
