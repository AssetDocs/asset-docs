import { supabase } from "@/integrations/supabase/client";

type PropertyUpdateType = 'created' | 'updated' | 'deleted' | 'file_added' | 'file_deleted';

interface PropertyNotificationParams {
  propertyName: string;
  propertyAddress?: string;
  details?: string;
}

export const PropertyNotificationService = {
  async notifyPropertyUpdate(
    updateType: PropertyUpdateType,
    params: PropertyNotificationParams
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.log('No authenticated user for property notification');
        return;
      }

      const { error } = await supabase.functions.invoke('send-property-update', {
        body: {
          userId: user.id,
          email: user.email,
          updateType,
          propertyName: params.propertyName,
          propertyAddress: params.propertyAddress,
          details: params.details,
        },
      });

      if (error) {
        console.error('Failed to send property update notification:', error);
      }
    } catch (error) {
      console.error('Error in property notification service:', error);
    }
  },

  notifyPropertyCreated(propertyName: string, propertyAddress?: string) {
    return this.notifyPropertyUpdate('created', { propertyName, propertyAddress });
  },

  notifyPropertyUpdated(propertyName: string, propertyAddress?: string, details?: string) {
    return this.notifyPropertyUpdate('updated', { propertyName, propertyAddress, details });
  },

  notifyPropertyDeleted(propertyName: string) {
    return this.notifyPropertyUpdate('deleted', { propertyName });
  },

  notifyFileAdded(propertyName: string, fileName: string) {
    return this.notifyPropertyUpdate('file_added', { propertyName, details: fileName });
  },

  notifyFileDeleted(propertyName: string, fileName: string) {
    return this.notifyPropertyUpdate('file_deleted', { propertyName, details: fileName });
  },
};
