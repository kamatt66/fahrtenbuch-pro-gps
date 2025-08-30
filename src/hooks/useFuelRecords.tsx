import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FuelRecord {
  id: string;
  user_id: string | null;
  vehicle_id: string | null;
  date: string;
  odometer_reading: number | null;
  fuel_type: string;
  fuel_amount: number;
  price_per_liter: number;
  total_amount: number;
  gas_station: string;
  location: string | null;
  receipt_number: string | null;
  receipt_image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const FUEL_TYPES = [
  'Benzin',
  'Diesel',
  'Super',
  'Super Plus',
  'E10',
  'AdBlue'
] as const;

export const useFuelRecords = () => {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load fuel records from database
  const loadFuelRecords = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fuel_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setFuelRecords(data || []);
    } catch (error) {
      console.error('Error loading fuel records:', error);
      toast.error('Fehler beim Laden der Tankbelege');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new fuel record
  const addFuelRecord = useCallback(async (recordData: Omit<FuelRecord, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('fuel_records')
        .insert({
          ...recordData,
          fuel_amount: Number(recordData.fuel_amount),
          price_per_liter: Number(recordData.price_per_liter),
          total_amount: Number(recordData.total_amount),
          odometer_reading: recordData.odometer_reading ? Number(recordData.odometer_reading) : null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Tankbeleg erfolgreich hinzugefügt');
      loadFuelRecords();
      return data;
    } catch (error) {
      console.error('Error adding fuel record:', error);
      toast.error('Fehler beim Hinzufügen des Tankbelegs');
      throw error;
    }
  }, [loadFuelRecords]);

  // Update fuel record
  const updateFuelRecord = useCallback(async (recordId: string, updates: Partial<FuelRecord>) => {
    try {
      const { error } = await supabase
        .from('fuel_records')
        .update({
          ...updates,
          fuel_amount: updates.fuel_amount ? Number(updates.fuel_amount) : undefined,
          price_per_liter: updates.price_per_liter ? Number(updates.price_per_liter) : undefined,
          total_amount: updates.total_amount ? Number(updates.total_amount) : undefined,
          odometer_reading: updates.odometer_reading ? Number(updates.odometer_reading) : undefined
        })
        .eq('id', recordId);

      if (error) throw error;

      toast.success('Tankbeleg aktualisiert');
      loadFuelRecords();
    } catch (error) {
      console.error('Error updating fuel record:', error);
      toast.error('Fehler beim Aktualisieren des Tankbelegs');
    }
  }, [loadFuelRecords]);

  // Delete fuel record
  const deleteFuelRecord = useCallback(async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('fuel_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      toast.success('Tankbeleg gelöscht');
      loadFuelRecords();
    } catch (error) {
      console.error('Error deleting fuel record:', error);
      toast.error('Fehler beim Löschen des Tankbelegs');
    }
  }, [loadFuelRecords]);

  // Get fuel records by vehicle
  const getFuelRecordsByVehicle = useCallback((vehicleId?: string) => {
    return vehicleId ? fuelRecords.filter(record => record.vehicle_id === vehicleId) : fuelRecords;
  }, [fuelRecords]);

  // Get fuel records by date range
  const getFuelRecordsByDateRange = useCallback((startDate: string, endDate: string) => {
    return fuelRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return recordDate >= start && recordDate <= end;
    });
  }, [fuelRecords]);

  // Calculate total fuel costs
  const getTotalFuelCosts = useCallback((filteredRecords?: FuelRecord[]) => {
    const recordsToCalculate = filteredRecords || fuelRecords;
    return recordsToCalculate.reduce((total, record) => total + Number(record.total_amount), 0);
  }, [fuelRecords]);

  // Calculate fuel consumption statistics
  const getFuelStatistics = useCallback(() => {
    const currentMonth = new Date();
    const currentYear = currentMonth.getFullYear();
    const currentMonthNumber = currentMonth.getMonth();

    const thisMonth = fuelRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === currentYear && 
             recordDate.getMonth() === currentMonthNumber;
    });

    const thisYear = fuelRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === currentYear;
    });

    const totalLiters = fuelRecords.reduce((total, record) => total + Number(record.fuel_amount), 0);
    const averagePricePerLiter = fuelRecords.length > 0 
      ? fuelRecords.reduce((total, record) => total + Number(record.price_per_liter), 0) / fuelRecords.length
      : 0;

    return {
      totalCosts: getTotalFuelCosts(fuelRecords),
      thisMonthTotal: getTotalFuelCosts(thisMonth),
      thisYearTotal: getTotalFuelCosts(thisYear),
      recordCount: fuelRecords.length,
      totalLiters,
      averagePricePerLiter,
      thisMonthLiters: thisMonth.reduce((total, record) => total + Number(record.fuel_amount), 0)
    };
  }, [fuelRecords, getTotalFuelCosts]);

  useEffect(() => {
    loadFuelRecords();
  }, [loadFuelRecords]);

  return {
    fuelRecords,
    loading,
    loadFuelRecords,
    addFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
    getFuelRecordsByVehicle,
    getFuelRecordsByDateRange,
    getTotalFuelCosts,
    getFuelStatistics
  };
};