import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Geolocation } from '@capacitor/geolocation';

export interface AppSettings {
  gpsTracking: boolean;
  autoStartTrips: boolean;
  autoStopTrips: boolean;
  gpsAccuracy: 'low' | 'medium' | 'high';
  trackingInterval: number; // in seconds
  minimumTripDistance: number; // in meters
  defaultDriver: string;
  defaultVehicle: string;
  defaultFuelType: string;
  businessTripsDefault: boolean;
  enableNotifications: boolean;
  dataRetention: number; // in days, 0 = forever
  exportFormat: 'json' | 'csv' | 'excel';
  darkMode: boolean;
  language: 'de' | 'en';
}

const DEFAULT_SETTINGS: AppSettings = {
  gpsTracking: true,
  autoStartTrips: false,
  autoStopTrips: false,
  gpsAccuracy: 'high',
  trackingInterval: 30,
  minimumTripDistance: 100,
  defaultDriver: '',
  defaultVehicle: '',
  defaultFuelType: 'Benzin',
  businessTripsDefault: true,
  enableNotifications: true,
  dataRetention: 0,
  exportFormat: 'csv',
  darkMode: false,
  language: 'de'
};

const STORAGE_KEY = 'fahrtenbuch_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Fehler beim Laden der Einstellungen');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      toast.success('Einstellungen gespeichert');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    }
  }, [settings]);

  // Update specific setting
  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    saveSettings({ [key]: value });
  }, [saveSettings]);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    try {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      toast.success('Einstellungen zurückgesetzt');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Fehler beim Zurücksetzen der Einstellungen');
    }
  }, []);

  // Export settings
  const exportSettings = useCallback(() => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fahrtenbuch-einstellungen.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Einstellungen exportiert');
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Fehler beim Exportieren der Einstellungen');
    }
  }, [settings]);

  // Import settings
  const importSettings = useCallback((file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          const validatedSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
          setSettings(validatedSettings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedSettings));
          toast.success('Einstellungen importiert');
        } catch (error) {
          console.error('Error parsing imported settings:', error);
          toast.error('Ungültige Einstellungsdatei');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing settings:', error);
      toast.error('Fehler beim Importieren der Einstellungen');
    }
  }, []);

  // Get GPS permission status (Capacitor-aware)
  const getGPSPermissionStatus = useCallback(async () => {
    try {
      const perm = await Geolocation.checkPermissions();
      const states = Object.values(perm) as Array<string>;
      if (states.includes('granted')) return 'granted';
      if (states.includes('denied')) return 'denied';
      return 'prompt';
    } catch (error) {
      console.error('Error checking GPS permission:', error);
      return 'prompt';
    }
  }, []);

  // Request GPS permission (Capacitor-aware)
  const requestGPSPermission = useCallback(async () => {
    try {
      const current = await Geolocation.checkPermissions();
      const currentStates = Object.values(current) as Array<string>;
      if (!currentStates.includes('granted')) {
        const requested = await Geolocation.requestPermissions();
        const reqStates = Object.values(requested) as Array<string>;
        if (!reqStates.includes('granted')) {
          toast.error('GPS-Berechtigung verweigert');
          return false;
        }
      }

      await Geolocation.getCurrentPosition({
        enableHighAccuracy: settings.gpsAccuracy === 'high',
        timeout: 10000,
        maximumAge: 60000
      });

      toast.success('GPS-Berechtigung erteilt');
      return true;
    } catch (error) {
      console.error('GPS permission denied:', error);
      toast.error('GPS-Berechtigung verweigert');
      return false;
    }
  }, [settings.gpsAccuracy]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    updateSetting,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    getGPSPermissionStatus,
    requestGPSPermission
  };
};