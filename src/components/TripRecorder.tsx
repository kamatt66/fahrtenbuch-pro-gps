import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  Car,
  Plus,
  Trash2
} from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { useVehicles } from '@/hooks/useVehicles';
import { useAutoTracking } from '@/hooks/useAutoTracking';

const TripRecorder = () => {
  const {
    activeTrip,
    isTracking,
    currentLocation,
    currentDistance,
    startTrip,
    endTrip,
    createManualTrip,
    deleteAllTrips
  } = useTrips();

  const { vehicles } = useVehicles();

  const { settings } = useSettings();

  const { 
    isMonitoring, 
    currentSpeed, 
    averageSpeed 
  } = useAutoTracking();

  const [driverName, setDriverName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [endTripNotes, setEndTripNotes] = useState('');
  const [isEndTripDialogOpen, setIsEndTripDialogOpen] = useState(false);
  const [isManualTripDialogOpen, setIsManualTripDialogOpen] = useState(false);
  const [manualTrip, setManualTrip] = useState({
    driver: '',
    startLocation: '',
    endLocation: '',
    distance: '',
    purpose: 'Geschäftlich',
    notes: ''
  });

  // Load default driver from settings
  useEffect(() => {
    if (settings.defaultDriver && !driverName) {
      setDriverName(settings.defaultDriver);
    }
  }, [settings.defaultDriver, driverName]);

  // Standard-Fahrzeug vorauswählen
  useEffect(() => {
    const firstActive = vehicles.find(v => v.status === 'active');
    if (!selectedVehicleId && firstActive) setSelectedVehicleId(firstActive.id);
  }, [vehicles, selectedVehicleId]);

  const handleStartTrip = async () => {
    if (!driverName.trim()) {
      toast.error('Bitte geben Sie einen Fahrernamen ein');
      return;
    }
    if (!selectedVehicleId) {
      toast.error('Bitte wählen Sie ein Fahrzeug aus');
      return;
    }
    await startTrip(driverName, selectedVehicleId);
  };

  const handleEndTrip = async () => {
    await endTrip(endTripNotes);
    setEndTripNotes('');
    setIsEndTripDialogOpen(false);
  };

  const handleManualTrip = async () => {
    if (!manualTrip.driver.trim() || !manualTrip.startLocation.trim() || !manualTrip.endLocation.trim() || !manualTrip.distance.trim()) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    await createManualTrip({
      driverName: manualTrip.driver,
      startLocation: manualTrip.startLocation,
      endLocation: manualTrip.endLocation,
      distance: parseFloat(manualTrip.distance),
      purpose: manualTrip.purpose,
      notes: manualTrip.notes || null
    });

    setManualTrip({
      driver: '',
      startLocation: '',
      endLocation: '',
      distance: '',
      purpose: 'Geschäftlich',
      notes: ''
    });
    setIsManualTripDialogOpen(false);
  };

  const handleDeleteAllTrips = async () => {
    if (window.confirm('Sind Sie sicher, dass Sie alle Fahrten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      await deleteAllTrips();
    }
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
              <div>
                <Label htmlFor="vehicle">Fahrzeug</Label>
                <Select value={selectedVehicleId} onValueChange={(value) => setSelectedVehicleId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrzeug auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.filter(v => v.status === 'active').map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} • {v.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleStartTrip}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  disabled={!driverName.trim() || !selectedVehicleId}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Fahrt starten (GPS)
                </Button>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => setIsManualTripDialogOpen(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Manuelle Fahrt
                  </Button>
                  
                  <Button
                    onClick={handleDeleteAllTrips}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Alle Fahrten löschen
                  </Button>
                </div>
              </div>
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
                    {vehicles.find(v => v.id === activeTrip?.vehicle_id)?.name ?? 'Unbekannt'}
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
                    Gefahren
                  </Label>
                  <div className="font-medium text-lg text-success">
                    {currentDistance.toFixed(1)} km
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Label className="text-sm text-muted-foreground">Aktuelle Position</Label>
                <div className="text-sm">
                  {currentLocation 
                    ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                    : 'Wird ermittelt...'
                  }
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

      {/* Auto-Tracking Status */}
      {(settings.autoStartTrips || settings.autoStopTrips) && (
        <Card className={`border-2 transition-all ${
          isMonitoring 
            ? 'border-info bg-info/5 shadow-glow' 
            : 'border-muted bg-muted/20'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-info animate-pulse' : 'bg-muted'}`} />
              Automatische Erkennung
              {isMonitoring && <Badge className="bg-info/20 text-info border-info/30">Überwacht</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Aktuelle Geschwindigkeit</Label>
                <div className="font-medium text-lg">
                  {currentSpeed.toFixed(1)} km/h
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Durchschnitt (2 Min)</Label>
                <div className="font-medium text-lg">
                  {averageSpeed.toFixed(1)} km/h
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
              {settings.autoStartTrips && settings.autoStopTrips ? (
                <p>Automatisches Starten ({'>'}10 km/h) und Stoppen ({'<'}5 km/h) aktiv</p>
              ) : settings.autoStartTrips ? (
                <p>Nur automatisches Starten ({'>'}10 km/h) aktiv</p>
              ) : settings.autoStopTrips ? (
                <p>Nur automatisches Stoppen ({'<'}5 km/h) aktiv</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}


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
            <div className="text-sm text-muted-foreground bg-info/10 p-3 rounded-md">
              <p><strong>Tatsächliche Route:</strong> Die App zeichnet kontinuierlich GPS-Punkte auf und berechnet die tatsächlich gefahrene Strecke. Bei Bedarf können Sie die Kilometer später in der Fahrtenliste noch korrigieren.</p>
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

      {/* Manual Trip Dialog */}
      <Dialog open={isManualTripDialogOpen} onOpenChange={setIsManualTripDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manuelle Fahrt erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="manual-driver">Fahrer *</Label>
              <Input
                id="manual-driver"
                value={manualTrip.driver}
                onChange={(e) => setManualTrip(prev => ({ ...prev, driver: e.target.value }))}
                placeholder="Fahrername"
              />
            </div>
            
            <div>
              <Label htmlFor="start-location">Startort *</Label>
              <Input
                id="start-location"
                value={manualTrip.startLocation}
                onChange={(e) => setManualTrip(prev => ({ ...prev, startLocation: e.target.value }))}
                placeholder="z.B. München Büro"
              />
            </div>
            
            <div>
              <Label htmlFor="end-location">Zielort *</Label>
              <Input
                id="end-location"
                value={manualTrip.endLocation}
                onChange={(e) => setManualTrip(prev => ({ ...prev, endLocation: e.target.value }))}
                placeholder="z.B. Frankfurt Kunde"
              />
            </div>
            
            <div>
              <Label htmlFor="distance">Distanz (km) *</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={manualTrip.distance}
                onChange={(e) => setManualTrip(prev => ({ ...prev, distance: e.target.value }))}
                placeholder="42.5"
              />
            </div>
            
            <div>
              <Label htmlFor="purpose">Zweck</Label>
              <Select value={manualTrip.purpose} onValueChange={(value) => setManualTrip(prev => ({ ...prev, purpose: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geschäftlich">Geschäftlich</SelectItem>
                  <SelectItem value="Privat">Privat</SelectItem>
                  <SelectItem value="Arbeitsweg">Arbeitsweg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="manual-notes">Notizen</Label>
              <Textarea
                id="manual-notes"
                value={manualTrip.notes}
                onChange={(e) => setManualTrip(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Zusätzliche Informationen..."
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsManualTripDialogOpen(false)} className="flex-1">
                Abbrechen
              </Button>
              <Button onClick={handleManualTrip} className="flex-1">
                Fahrt erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripRecorder;