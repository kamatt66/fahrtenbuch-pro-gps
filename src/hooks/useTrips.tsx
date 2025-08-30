import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Geolocation } from '@capacitor/geolocation';
import { toast } from 'sonner';

interface Trip {
  id: string;
  driver_name: string;
  start_location: string | null;
  end_location: string | null;
  start_latitude: number | null;
  start_longitude: number | null;
  end_latitude: number | null;
  end_longitude: number | null;
  start_time: string;
  end_time: string | null;
  distance_km: number | null;
  purpose: string;
  notes: string | null;
  bluetooth_device: string | null;
  is_active: boolean;
  vehicle_id: string | null;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);

  // Load trips from database
  const loadTrips = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;

      setTrips(data || []);
      
      // Check for active trip
      const active = data?.find(trip => trip.is_active);
      if (active) {
        setActiveTrip(active);
        setIsTracking(true);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Fehler beim Laden der Fahrten');
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationCoords | null> => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      setCurrentLocation(coords);
      return coords;
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Standort konnte nicht ermittelt werden');
      return null;
    }
  }, []);

  // Start a new trip
  const startTrip = useCallback(async (
    driverName: string,
    bluetoothDevice?: string,
    vehicleId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const location = await getCurrentLocation();
      if (!location) {
        throw new Error('Standort erforderlich');
      }

      const { data, error } = await supabase
        .from('trips')
        .insert({
          driver_name: driverName,
          start_latitude: location.latitude,
          start_longitude: location.longitude,
          bluetooth_device: bluetoothDevice,
          vehicle_id: vehicleId,
          is_active: true,
          purpose: 'Geschäftlich',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setActiveTrip(data);
      setIsTracking(true);
      toast.success('Fahrt gestartet');
      
      // Reload trips to update list
      loadTrips();
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error('Fehler beim Starten der Fahrt');
    }
  }, [getCurrentLocation, loadTrips]);

  // End the current trip
  const endTrip = useCallback(async (notes?: string) => {
    if (!activeTrip) return;

    try {
      const location = await getCurrentLocation();
      const endTime = new Date().toISOString();
      
      // Calculate distance if we have both start and end coordinates
      let distance = null;
      if (location && activeTrip.start_latitude && activeTrip.start_longitude) {
        distance = calculateDistance(
          activeTrip.start_latitude,
          activeTrip.start_longitude,
          location.latitude,
          location.longitude
        );
      }

      const { error } = await supabase
        .from('trips')
        .update({
          end_latitude: location?.latitude,
          end_longitude: location?.longitude,
          end_time: endTime,
          distance_km: distance,
          notes: notes,
          is_active: false
        })
        .eq('id', activeTrip.id);

      if (error) throw error;

      setActiveTrip(null);
      setIsTracking(false);
      toast.success(`Fahrt beendet${distance ? ` (${distance.toFixed(1)} km)` : ''}`);
      
      // Reload trips to update list
      loadTrips();
    } catch (error) {
      console.error('Error ending trip:', error);
      toast.error('Fehler beim Beenden der Fahrt');
    }
  }, [activeTrip, getCurrentLocation, loadTrips]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Update trip details
  const updateTrip = useCallback(async (tripId: string, updates: Partial<Trip>) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId);

      if (error) throw error;

      toast.success('Fahrt aktualisiert');
      loadTrips();
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Fehler beim Aktualisieren der Fahrt');
    }
  }, [loadTrips]);

  // Delete trip
  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      toast.success('Fahrt gelöscht');
      loadTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Fehler beim Löschen der Fahrt');
    }
  }, [loadTrips]);

  // Create manual trip
  const createManualTrip = useCallback(async (tripData: {
    driverName: string;
    startLocation: string;
    endLocation: string;
    distance: number;
    purpose: string;
    notes: string | null;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const { error } = await supabase
        .from('trips')
        .insert({
          driver_name: tripData.driverName,
          start_location: tripData.startLocation,
          end_location: tripData.endLocation,
          distance_km: tripData.distance,
          purpose: tripData.purpose,
          notes: tripData.notes,
          start_time: oneHourAgo.toISOString(),
          end_time: now.toISOString(),
          is_active: false,
          user_id: user.id
        });

      if (error) throw error;

      toast.success('Manuelle Fahrt erstellt');
      loadTrips();
    } catch (error) {
      console.error('Error creating manual trip:', error);
      toast.error('Fehler beim Erstellen der Fahrt');
    }
  }, [loadTrips]);

  // Create demo trips
  const createDemoTrips = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const demoTrips = [
        {
          driver_name: 'Max Mustermann',
          start_location: 'München Hauptbahnhof',
          end_location: 'Frankfurt Flughafen',
          distance_km: 385.2,
          purpose: 'Geschäftlich',
          notes: 'Kundentermin bei Lufthansa',
          start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          is_active: false,
          user_id: user.id
        },
        {
          driver_name: 'Anna Schmidt',
          start_location: 'Berlin Mitte',
          end_location: 'Hamburg HafenCity',
          distance_km: 289.7,
          purpose: 'Geschäftlich',
          notes: 'Projektmeeting',
          start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000).toISOString(),
          is_active: false,
          user_id: user.id
        },
        {
          driver_name: 'Thomas Weber',
          start_location: 'Köln Deutz',
          end_location: 'Düsseldorf Flughafen',
          distance_km: 42.1,
          purpose: 'Arbeitsweg',
          notes: 'Dienstreise nach London',
          start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
          is_active: false,
          user_id: user.id
        },
        {
          driver_name: 'Lisa Müller',
          start_location: 'Stuttgart Zentrum',
          end_location: 'Ulm Hauptbahnhof',
          distance_km: 94.3,
          purpose: 'Privat',
          notes: 'Familienbesuch',
          start_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 12 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
          is_active: false,
          user_id: user.id
        }
      ];

      const { error } = await supabase
        .from('trips')
        .insert(demoTrips);

      if (error) throw error;

      toast.success('Demo-Fahrten erstellt');
      loadTrips();
    } catch (error) {
      console.error('Error creating demo trips:', error);
      toast.error('Fehler beim Erstellen der Demo-Daten');
    }
  }, [loadTrips]);

  // Delete all trips
  const deleteAllTrips = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Alle Fahrten gelöscht');
      loadTrips();
    } catch (error) {
      console.error('Error deleting trips:', error);
      toast.error('Fehler beim Löschen der Fahrten');
    }
  }, [loadTrips]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Watch for location changes during active trip
  useEffect(() => {
    let watchId: string | null = null;

    if (isTracking && activeTrip) {
      const startWatching = async () => {
        try {
          watchId = await Geolocation.watchPosition(
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000
            },
            (position) => {
              if (position) {
                setCurrentLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                });
              }
            }
          );
        } catch (error) {
          console.error('Error starting location watch:', error);
        }
      };

      startWatching();
    }

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [isTracking, activeTrip]);

  return {
    trips,
    activeTrip,
    isTracking,
    currentLocation,
    startTrip,
    endTrip,
    updateTrip,
    deleteTrip,
    createManualTrip,
    createDemoTrips,
    deleteAllTrips,
    loadTrips,
    getCurrentLocation
  };
};