import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  plate: string;
  fuel: string;
  year: number;
  consumption: number;
  status: 'active' | 'maintenance' | 'inactive';
  initial_km: number;
  total_km: number;
  monthly_km: number;
  created_at?: string;
  updated_at?: string;
  user_id: string;
}

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setVehicles([]);
        return;
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        toast.error('Fehler beim Laden der Fahrzeuge');
        return;
      }

      setVehicles(data?.map(v => ({
        ...v,
        status: v.status as Vehicle['status']
      })) || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Fehler beim Laden der Fahrzeuge');
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      console.log('Attempting to add vehicle:', vehicle);
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          ...vehicle,
          total_km: vehicle.initial_km,
          user_id: user.id
        }])
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error adding vehicle:', error);
        toast.error('Fehler beim Hinzufügen des Fahrzeugs: ' + error.message);
        return null;
      }

      setVehicles(prev => [{
        ...data,
        status: data.status as Vehicle['status']
      }, ...prev]);
      toast.success('Fahrzeug erfolgreich hinzugefügt');
      return data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Fehler beim Hinzufügen des Fahrzeugs');
      return null;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating vehicle:', error);
        toast.error('Fehler beim Aktualisieren des Fahrzeugs');
        return null;
      }

      if (!data) {
        toast.error('Fahrzeug nicht gefunden oder keine Berechtigung');
        return null;
      }

      setVehicles(prev => prev.map(v => v.id === id ? {
        ...data,
        status: data.status as Vehicle['status']
      } : v));
      toast.success('Fahrzeug erfolgreich aktualisiert');
      return data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Fehler beim Aktualisieren des Fahrzeugs');
      return null;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Fehler beim Löschen des Fahrzeugs');
        return false;
      }

      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Fahrzeug erfolgreich gelöscht');
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Fehler beim Löschen des Fahrzeugs');
      return false;
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    loading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: fetchVehicles
  };
};