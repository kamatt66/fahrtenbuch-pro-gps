import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { useSettings } from './useSettings';
import { useTrips } from './useTrips';
import { useVehicles } from './useVehicles';

interface SpeedReading {
  speed: number; // km/h
  timestamp: number;
  accuracy?: number;
}

export const useAutoTracking = () => {
  const { settings } = useSettings();
  const { startTrip, endTrip, activeTrip } = useTrips();
  const { vehicles } = useVehicles();
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [speedHistory, setSpeedHistory] = useState<SpeedReading[]>([]);
  
  const watchIdRef = useRef<string | number | null>(null);
  const startTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Konfiguration für automatische Erkennung
  const AUTO_START_SPEED_THRESHOLD = 10; // km/h
  const AUTO_STOP_SPEED_THRESHOLD = 5; // km/h
  const START_TRIGGER_DELAY = 2 * 60 * 1000; // 2 Minuten
  const STOP_TRIGGER_DELAY = 5 * 60 * 1000; // 5 Minuten
  const SPEED_HISTORY_LIMIT = 10; // Anzahl der letzten Geschwindigkeitsmessungen

  // Geschwindigkeit aus Position berechnen (falls direkte Geschwindigkeit nicht verfügbar)
  const calculateSpeedFromPosition = useCallback((
    currentPos: GeolocationPosition,
    previousPos: GeolocationPosition | null
  ): number => {
    if (!previousPos) return 0;

    const timeDiff = (currentPos.timestamp - previousPos.timestamp) / 1000; // Sekunden
    if (timeDiff <= 0) return 0;

    // Distanz berechnen (Haversine Formel)
    const R = 6371000; // Erdradius in Metern
    const lat1 = previousPos.coords.latitude * Math.PI / 180;
    const lat2 = currentPos.coords.latitude * Math.PI / 180;
    const deltaLat = (currentPos.coords.latitude - previousPos.coords.latitude) * Math.PI / 180;
    const deltaLon = (currentPos.coords.longitude - previousPos.coords.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Meter

    const speedMs = distance / timeDiff; // m/s
    return speedMs * 3.6; // km/h
  }, []);

  // Durchschnittsgeschwindigkeit der letzten Messungen
  const getAverageSpeed = useCallback((readings: SpeedReading[], minutes: number = 2): number => {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    const recentReadings = readings.filter(r => r.timestamp > cutoffTime);
    
    if (recentReadings.length === 0) return 0;
    
    const sum = recentReadings.reduce((acc, reading) => acc + reading.speed, 0);
    return sum / recentReadings.length;
  }, []);

  // Automatische Fahrt starten
  const triggerAutoStart = useCallback(async () => {
    if (!settings.autoStartTrips || activeTrip) return;

    const defaultDriver = settings.defaultDriver || 'Auto-Erkennung';
    const defaultVehicle = vehicles.find(v => v.id === settings.defaultVehicle)?.id || 
                          vehicles.find(v => v.status === 'active')?.id;

    if (!defaultVehicle) {
      toast.error('Kein Fahrzeug für automatische Aufzeichnung verfügbar');
      return;
    }

    try {
      await startTrip(defaultDriver, defaultVehicle);
      toast.success('Fahrt automatisch gestartet');
    } catch (error) {
      console.error('Auto-start failed:', error);
      toast.error('Automatischer Fahrtstart fehlgeschlagen');
    }
  }, [settings.autoStartTrips, settings.defaultDriver, settings.defaultVehicle, activeTrip, startTrip, vehicles]);

  // Automatische Fahrt beenden
  const triggerAutoStop = useCallback(async () => {
    if (!settings.autoStopTrips || !activeTrip) return;

    try {
      await endTrip('Automatisch beendet');
      toast.success('Fahrt automatisch beendet');
    } catch (error) {
      console.error('Auto-stop failed:', error);
      toast.error('Automatisches Fahrtende fehlgeschlagen');
    }
  }, [settings.autoStopTrips, activeTrip, endTrip]);

  // Position und Geschwindigkeit verarbeiten
  const processPosition = useCallback((position: GeolocationPosition, previousPosition: GeolocationPosition | null) => {
    // Geschwindigkeit ermitteln
    let speed = 0;
    if (position.coords.speed !== null && position.coords.speed !== undefined && position.coords.speed >= 0) {
      speed = position.coords.speed * 3.6; // m/s zu km/h
    } else {
      speed = calculateSpeedFromPosition(position, previousPosition);
    }

    // Geschwindigkeit aktualisieren
    setCurrentSpeed(speed);
    
    // Geschwindigkeitsverlauf aktualisieren
    const newReading: SpeedReading = {
      speed,
      timestamp: Date.now(),
      accuracy: position.coords.accuracy || undefined
    };

    setSpeedHistory(prev => {
      const updated = [...prev, newReading].slice(-SPEED_HISTORY_LIMIT);
      
      // Automatische Erkennung prüfen
      const avgSpeed = getAverageSpeed(updated, 2);
      
      // Auto-Start prüfen
      if (settings.autoStartTrips && !activeTrip && avgSpeed > AUTO_START_SPEED_THRESHOLD) {
        if (!startTriggerTimeoutRef.current) {
          console.log(`🚗 Auto-Start Trigger: ${avgSpeed.toFixed(1)} km/h (Schwelle: ${AUTO_START_SPEED_THRESHOLD} km/h)`);
          startTriggerTimeoutRef.current = setTimeout(() => {
            const currentAvgSpeed = getAverageSpeed(speedHistory, 2);
            if (currentAvgSpeed > AUTO_START_SPEED_THRESHOLD) {
              triggerAutoStart();
            }
            startTriggerTimeoutRef.current = null;
          }, START_TRIGGER_DELAY);
        }
      } else if (startTriggerTimeoutRef.current && avgSpeed <= AUTO_START_SPEED_THRESHOLD) {
        // Auto-Start abbrechen wenn Geschwindigkeit wieder unter Schwelle fällt
        clearTimeout(startTriggerTimeoutRef.current);
        startTriggerTimeoutRef.current = null;
      }

      // Auto-Stop prüfen
      if (settings.autoStopTrips && activeTrip && avgSpeed < AUTO_STOP_SPEED_THRESHOLD) {
        if (!stopTriggerTimeoutRef.current) {
          console.log(`🛑 Auto-Stop Trigger: ${avgSpeed.toFixed(1)} km/h (Schwelle: ${AUTO_STOP_SPEED_THRESHOLD} km/h)`);
          stopTriggerTimeoutRef.current = setTimeout(() => {
            const currentAvgSpeed = getAverageSpeed(speedHistory, 5);
            if (currentAvgSpeed < AUTO_STOP_SPEED_THRESHOLD) {
              triggerAutoStop();
            }
            stopTriggerTimeoutRef.current = null;
          }, STOP_TRIGGER_DELAY);
        }
      } else if (stopTriggerTimeoutRef.current && avgSpeed >= AUTO_STOP_SPEED_THRESHOLD) {
        // Auto-Stop abbrechen wenn Geschwindigkeit wieder über Schwelle steigt
        clearTimeout(stopTriggerTimeoutRef.current);
        stopTriggerTimeoutRef.current = null;
      }

      return updated;
    });
  }, [calculateSpeedFromPosition, getAverageSpeed, settings.autoStartTrips, settings.autoStopTrips, activeTrip, triggerAutoStart, triggerAutoStop, speedHistory]);

  // Monitoring starten
  const startMonitoring = useCallback(async () => {
    if (isMonitoring || (!settings.autoStartTrips && !settings.autoStopTrips)) return;

    try {
      // GPS-Berechtigung prüfen
      let hasPermission = false;
      if (Capacitor.getPlatform() === 'web') {
        try {
          await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          hasPermission = true;
        } catch {
          hasPermission = false;
        }
      } else {
        const perm: any = await Geolocation.checkPermissions();
        const state = perm?.location ?? (Object.values(perm)[0] as string);
        hasPermission = state === 'granted';
      }

      if (!hasPermission) {
        toast.error('GPS-Berechtigung für automatische Aufzeichnung erforderlich');
        return;
      }

      console.log('🔄 Auto-Tracking gestartet');
      setIsMonitoring(true);
      
      let previousPosition: GeolocationPosition | null = null;
      const options = {
        enableHighAccuracy: settings.gpsAccuracy === 'high',
        timeout: 10000,
        maximumAge: 5000 // 5 Sekunden alte Position akzeptieren
      };

      if (Capacitor.getPlatform() === 'web') {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            processPosition(position, previousPosition);
            previousPosition = position;
          },
          (error) => {
            console.error('Auto-tracking position error:', error);
          },
          options
        );
      } else {
        watchIdRef.current = await Geolocation.watchPosition(
          options,
          (position) => {
            if (position) {
              const pos = position as any as GeolocationPosition;
              processPosition(pos, previousPosition);
              previousPosition = pos;
            }
          }
        );
      }

      toast.success('Automatische Fahrtaufzeichnung aktiviert');
    } catch (error) {
      console.error('Error starting auto-tracking:', error);
      toast.error('Automatische Aufzeichnung konnte nicht gestartet werden');
      setIsMonitoring(false);
    }
  }, [isMonitoring, settings.autoStartTrips, settings.autoStopTrips, settings.gpsAccuracy, processPosition]);

  // Monitoring stoppen
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    console.log('⏹️ Auto-Tracking gestoppt');
    setIsMonitoring(false);
    
    // Watch stoppen
    if (watchIdRef.current !== null) {
      if (Capacitor.getPlatform() === 'web') {
        navigator.geolocation.clearWatch(watchIdRef.current as number);
      } else {
        Geolocation.clearWatch({ id: watchIdRef.current as string });
      }
      watchIdRef.current = null;
    }

    // Timeouts löschen
    if (startTriggerTimeoutRef.current) {
      clearTimeout(startTriggerTimeoutRef.current);
      startTriggerTimeoutRef.current = null;
    }
    if (stopTriggerTimeoutRef.current) {
      clearTimeout(stopTriggerTimeoutRef.current);
      stopTriggerTimeoutRef.current = null;
    }

    // Zustand zurücksetzen
    setCurrentSpeed(0);
    setSpeedHistory([]);
    
    toast.success('Automatische Fahrtaufzeichnung deaktiviert');
  }, [isMonitoring]);

  // Auto-Tracking basierend auf Einstellungen starten/stoppen
  useEffect(() => {
    if (settings.autoStartTrips || settings.autoStopTrips) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [settings.autoStartTrips, settings.autoStopTrips, startMonitoring, stopMonitoring]);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    isMonitoring,
    currentSpeed,
    speedHistory,
    startMonitoring,
    stopMonitoring,
    averageSpeed: getAverageSpeed(speedHistory, 2)
  };
};