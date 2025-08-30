import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Driver {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  total_trips: number;
  total_km: number;
  monthly_km: number;
  created_at: string;
  updated_at: string;
}

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Load drivers from database
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDrivers(data as Driver[] || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast.error('Fehler beim Laden der Fahrer');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new driver
  const addDriver = useCallback(async (driverData: Omit<Driver, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'total_trips' | 'total_km' | 'monthly_km'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('drivers')
        .insert({
          ...driverData,
          user_id: user.id,
          total_trips: 0,
          total_km: 0,
          monthly_km: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Fahrer erfolgreich hinzugefügt');
      fetchDrivers();
      return data;
    } catch (error) {
      console.error('Error adding driver:', error);
      toast.error('Fehler beim Hinzufügen des Fahrers');
      throw error;
    }
  }, [fetchDrivers]);

  // Update driver
  const updateDriver = useCallback(async (driverId: string, updates: Partial<Driver>) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', driverId);

      if (error) throw error;

      toast.success('Fahrer aktualisiert');
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error('Fehler beim Aktualisieren des Fahrers');
    }
  }, [fetchDrivers]);

  // Delete driver
  const deleteDriver = useCallback(async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) throw error;

      toast.success('Fahrer gelöscht');
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Fehler beim Löschen des Fahrers');
    }
  }, [fetchDrivers]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return {
    drivers,
    loading,
    fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver
  };
};