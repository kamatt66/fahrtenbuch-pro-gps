import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Square, 
  Bluetooth, 
  MapPin, 
  Clock, 
  Car,
  Settings
} from 'lucide-react';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useTrips } from '@/hooks/useTrips';
import { toast } from 'sonner';

const TripRecorder = () => {
  const {
    devices,
    connectedDevice,
    isSupported,
    scanForDevices,
    connectToDevice,
    disconnectDevice
  } = useBluetooth();

  const {
    activeTrip,
    isTracking,
    currentLocation,
    startTrip,
    endTrip
  } = useTrips();

  const [driverName, setDriverName] = useState('Max Mustermann');
  const [isBluetoothDialogOpen, setIsBluetoothDialogOpen] = useState(false);
  const [endTripNotes, setEndTripNotes] = useState('');
  const [isEndTripDialogOpen, setIsEndTripDialogOpen] = useState(false);
  const [autoStart, setAutoStart] = useState(true);

  // Auto-start trip when Bluetooth device connects
  useEffect(() => {
    if (autoStart && connectedDevice && !isTracking) {
      const startAutoTrip = async () => {
        await startTrip(driverName, connectedDevice.name, connectedDevice.id);
        toast.success(`Automatische Fahrt gestartet (${connectedDevice.name})`);
      };
      startAutoTrip();
    }
  }, [connectedDevice, isTracking, autoStart, driverName, startTrip]);

  // Auto-end trip when Bluetooth device disconnects
  useEffect(() => {
    if (autoStart && !connectedDevice && isTracking && activeTrip?.bluetooth_device) {
      const endAutoTrip = async () => {
        await endTrip('Automatisch beendet (Bluetooth getrennt)');
        toast.info('Fahrt automatisch beendet');
      };
      endAutoTrip();
    }
  }, [connectedDevice, isTracking, activeTrip, autoStart, endTrip]);

  const handleStartTrip = async () => {
    if (!driverName.trim()) {
      toast.error('Bitte geben Sie einen Fahrernamen ein');
      return;
    }
    
    await startTrip(
      driverName,
      connectedDevice?.name,
      connectedDevice?.id
    );
  };

  const handleEndTrip = async () => {
    await endTrip(endTripNotes);
    setEndTripNotes('');
    setIsEndTripDialogOpen(false);
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Bluetooth Status */}
      <Card className="border-automotive-light bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="w-5 h-5 text-automotive-accent" />
            Bluetooth Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported && (
            <div className="text-warning bg-warning/10 p-3 rounded-lg">
              Bluetooth wird auf diesem Gerät nicht unterstützt
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connectedDevice ? (
                <>
                  <Badge className="bg-success/20 text-success">Verbunden</Badge>
                  <span className="font-medium">{connectedDevice.name}</span>
                </>
              ) : (
                <Badge variant="outline">Nicht verbunden</Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsBluetoothDialogOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Verwalten
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              id="autoStart"
              className="rounded"
            />
            <Label htmlFor="autoStart" className="text-sm">
              Automatisch starten/stoppen bei Bluetooth-Verbindung
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Trip Recording */}
      <Card className={`border-2 transition-all ${
        isTracking 
          ? 'border-success bg-success/5 shadow-glow' 
          : 'border-automotive-light bg-gradient-card'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-automotive-accent" />
            Fahrtaufzeichnung
            {isTracking && <Badge className="bg-success text-success-foreground">Aktiv</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isTracking ? (
            <>
              <div>
                <Label htmlFor="driver">Fahrer</Label>
                <Input
                  id="driver"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Fahrername eingeben"
                />
              </div>
              
              <Button
                onClick={handleStartTrip}
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
                disabled={!driverName.trim()}
              >
                <Play className="w-4 h-4 mr-2" />
                Fahrt starten
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Fahrer</Label>
                  <div className="font-medium">{activeTrip?.driver_name}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Fahrzeug</Label>
                  <div className="font-medium">
                    {activeTrip?.bluetooth_device || 'Manuell'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Dauer
                  </Label>
                  <div className="font-medium text-lg">
                    {activeTrip && formatDuration(activeTrip.start_time)}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Position
                  </Label>
                  <div className="text-sm">
                    {currentLocation 
                      ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                      : 'Wird ermittelt...'
                    }
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsEndTripDialogOpen(true)}
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                variant="destructive"
              >
                <Square className="w-4 h-4 mr-2" />
                Fahrt beenden
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bluetooth Management Dialog */}
      <Dialog open={isBluetoothDialogOpen} onOpenChange={setIsBluetoothDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bluetooth Geräte verwalten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={scanForDevices} className="w-full">
              Nach Geräten suchen
            </Button>
            
            <div className="space-y-2">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-muted-foreground">{device.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.connected && (
                      <Badge className="bg-success/20 text-success">Verbunden</Badge>
                    )}
                    <Button
                      size="sm"
                      variant={device.connected ? "outline" : "default"}
                      onClick={() => device.connected 
                        ? disconnectDevice() 
                        : connectToDevice(device.id)
                      }
                    >
                      {device.connected ? 'Trennen' : 'Verbinden'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {devices.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                Keine Geräte gefunden. Stellen Sie sicher, dass Bluetooth aktiviert ist.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* End Trip Dialog */}
      <Dialog open={isEndTripDialogOpen} onOpenChange={setIsEndTripDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fahrt beenden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                value={endTripNotes}
                onChange={(e) => setEndTripNotes(e.target.value)}
                placeholder="Zusätzliche Informationen zur Fahrt..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEndTripDialogOpen(false)} className="flex-1">
                Abbrechen
              </Button>
              <Button onClick={handleEndTrip} variant="destructive" className="flex-1">
                Fahrt beenden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripRecorder;