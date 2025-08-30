import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Cost {
  id: string;
  user_id: string | null;
  vehicle_id: string | null;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor: string | null;
  receipt_number: string | null;
  notes: string | null;
  is_recurring: boolean;
  recurring_interval: string | null;
  created_at: string;
  updated_at: string;
}

export const COST_CATEGORIES = [
  'Wartung',
  'Reparatur', 
  'Versicherung',
  'TÜV/HU',
  'Reifen',
  'Autowäsche',
  'Parkgebühren',
  'Maut',
  'Leasing',
  'Finanzierung',
  'Zubehör',
  'Sonstiges'
] as const;

export const RECURRING_INTERVALS = [
  'monatlich',
  'vierteljährlich', 
  'halbjährlich',
  'jährlich'
] as const;

export const useCosts = () => {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);

  // Load costs from database
  const loadCosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('costs')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setCosts(data || []);
    } catch (error) {
      console.error('Error loading costs:', error);
      toast.error('Fehler beim Laden der Kosten');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new cost
  const addCost = useCallback(async (costData: Omit<Cost, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('costs')
        .insert({
          ...costData,
          amount: Number(costData.amount)
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Kosten erfolgreich hinzugefügt');
      loadCosts();
      return data;
    } catch (error) {
      console.error('Error adding cost:', error);
      toast.error('Fehler beim Hinzufügen der Kosten');
      throw error;
    }
  }, [loadCosts]);

  // Update cost
  const updateCost = useCallback(async (costId: string, updates: Partial<Cost>) => {
    try {
      const { error } = await supabase
        .from('costs')
        .update({
          ...updates,
          amount: updates.amount ? Number(updates.amount) : undefined
        })
        .eq('id', costId);

      if (error) throw error;

      toast.success('Kosten aktualisiert');
      loadCosts();
    } catch (error) {
      console.error('Error updating cost:', error);
      toast.error('Fehler beim Aktualisieren der Kosten');
    }
  }, [loadCosts]);

  // Delete cost
  const deleteCost = useCallback(async (costId: string) => {
    try {
      const { error } = await supabase
        .from('costs')
        .delete()
        .eq('id', costId);

      if (error) throw error;

      toast.success('Kosten gelöscht');
      loadCosts();
    } catch (error) {
      console.error('Error deleting cost:', error);
      toast.error('Fehler beim Löschen der Kosten');
    }
  }, [loadCosts]);

  // Get costs by category
  const getCostsByCategory = useCallback((category?: string) => {
    return category ? costs.filter(cost => cost.category === category) : costs;
  }, [costs]);

  // Get costs by vehicle
  const getCostsByVehicle = useCallback((vehicleId?: string) => {
    return vehicleId ? costs.filter(cost => cost.vehicle_id === vehicleId) : costs;
  }, [costs]);

  // Get costs by date range
  const getCostsByDateRange = useCallback((startDate: string, endDate: string) => {
    return costs.filter(cost => {
      const costDate = new Date(cost.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return costDate >= start && costDate <= end;
    });
  }, [costs]);

  // Calculate total costs
  const getTotalCosts = useCallback((filteredCosts?: Cost[]) => {
    const costsToCalculate = filteredCosts || costs;
    return costsToCalculate.reduce((total, cost) => total + Number(cost.amount), 0);
  }, [costs]);

  // Get costs statistics
  const getCostStatistics = useCallback(() => {
    const currentMonth = new Date();
    const currentYear = currentMonth.getFullYear();
    const currentMonthNumber = currentMonth.getMonth();

    const thisMonth = costs.filter(cost => {
      const costDate = new Date(cost.date);
      return costDate.getFullYear() === currentYear && 
             costDate.getMonth() === currentMonthNumber;
    });

    const thisYear = costs.filter(cost => {
      const costDate = new Date(cost.date);
      return costDate.getFullYear() === currentYear;
    });

    const categoryTotals = COST_CATEGORIES.map(category => ({
      category,
      total: getTotalCosts(costs.filter(cost => cost.category === category)),
      count: costs.filter(cost => cost.category === category).length
    })).filter(item => item.count > 0);

    return {
      totalCosts: getTotalCosts(costs),
      thisMonthTotal: getTotalCosts(thisMonth),
      thisYearTotal: getTotalCosts(thisYear),
      costCount: costs.length,
      categoryTotals,
      recurringCosts: costs.filter(cost => cost.is_recurring)
    };
  }, [costs, getTotalCosts]);

  useEffect(() => {
    loadCosts();
  }, [loadCosts]);

  return {
    costs,
    loading,
    loadCosts,
    addCost,
    updateCost,
    deleteCost,
    getCostsByCategory,
    getCostsByVehicle,
    getCostsByDateRange,
    getTotalCosts,
    getCostStatistics
  };
};