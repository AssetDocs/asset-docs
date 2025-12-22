import { useState, useEffect } from 'react';
import { Property, PropertyService } from '@/services/PropertyService';
import { PropertyNotificationService } from '@/services/PropertyNotificationService';
import { useToast } from '@/hooks/use-toast';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await PropertyService.getUserProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const addProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'last_updated' | 'user_id'>) => {
    const newProperty = await PropertyService.createProperty(propertyData);
    if (newProperty) {
      setProperties(prev => [newProperty, ...prev]);
      toast({
        title: 'Property Added',
        description: 'The new property has been successfully created.',
      });
      // Send notification (non-blocking)
      PropertyNotificationService.notifyPropertyCreated(newProperty.name, newProperty.address);
      return newProperty;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add property',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProperty = async (propertyId: string, updates: Partial<Property>) => {
    const existingProperty = properties.find(p => p.id === propertyId);
    const updatedProperty = await PropertyService.updateProperty(propertyId, updates);
    if (updatedProperty) {
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      toast({
        title: 'Property Updated',
        description: 'The property has been successfully updated.',
      });
      // Send notification with change details (non-blocking)
      const changedFields = Object.keys(updates).filter(key => key !== 'updated_at' && key !== 'last_updated');
      PropertyNotificationService.notifyPropertyUpdated(
        updatedProperty.name,
        updatedProperty.address,
        changedFields.length > 0 ? changedFields.join(', ') : undefined
      );
      return updatedProperty;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update property',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteProperty = async (propertyId: string) => {
    const propertyToDelete = properties.find(p => p.id === propertyId);
    const success = await PropertyService.deleteProperty(propertyId);
    if (success) {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: 'Property Deleted',
        description: 'The property has been successfully removed.',
      });
      // Send notification (non-blocking)
      if (propertyToDelete) {
        PropertyNotificationService.notifyPropertyDeleted(propertyToDelete.name);
      }
      return true;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    properties,
    isLoading,
    addProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties,
  };
};
