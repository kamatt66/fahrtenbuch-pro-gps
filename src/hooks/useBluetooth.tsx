import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

export const useBluetooth = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const checkBluetoothSupport = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      // On native platforms, we'll assume Bluetooth is supported
      setIsSupported(true);
    } else {
      // For web, check if Web Bluetooth API is available
      if ('bluetooth' in navigator) {
        setIsSupported(true);
      }
    }
  }, []);

  const scanForDevices = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // On native platforms, we would use a Bluetooth plugin
        // For now, we'll simulate car Bluetooth devices
        const mockDevices: BluetoothDevice[] = [
          { id: 'bmw-123', name: 'BMW 320d', connected: false },
          { id: 'vw-456', name: 'VW Golf', connected: false },
          { id: 'mercedes-789', name: 'Mercedes Sprinter', connected: false },
        ];
        setDevices(mockDevices);
      } else if ('bluetooth' in navigator) {
        // Web Bluetooth API (limited support)
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service']
        });
        
        const webDevice: BluetoothDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          connected: false
        };
        setDevices([webDevice]);
      }
    } catch (error) {
      console.error('Error scanning for Bluetooth devices:', error);
    }
  }, []);

  const connectToDevice = useCallback(async (deviceId: string) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        // Simulate connection
        const updatedDevice = { ...device, connected: true };
        setDevices(prev => prev.map(d => 
          d.id === deviceId ? updatedDevice : { ...d, connected: false }
        ));
        setConnectedDevice(updatedDevice);
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  }, [devices]);

  const disconnectDevice = useCallback(() => {
    setDevices(prev => prev.map(d => ({ ...d, connected: false })));
    setConnectedDevice(null);
  }, []);

  // Simulate periodic connection status checks
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectedDevice) {
        // Randomly simulate disconnection (5% chance every 5 seconds)
        if (Math.random() < 0.05) {
          disconnectDevice();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connectedDevice, disconnectDevice]);

  useEffect(() => {
    checkBluetoothSupport();
  }, [checkBluetoothSupport]);

  return {
    devices,
    connectedDevice,
    isSupported,
    scanForDevices,
    connectToDevice,
    disconnectDevice
  };
};