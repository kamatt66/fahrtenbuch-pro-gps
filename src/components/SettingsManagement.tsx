import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  MapPin,
  Smartphone,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Globe,
  Palette,
  Database,
  Car,
  User,
  Fuel
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { FUEL_TYPES } from '@/hooks/useFuelRecords';
import { toast } from 'sonner';

const SettingsManagement = () => {
  const {
    settings,
    loading,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    getGPSPermissionStatus,
    requestGPSPermission
  } = useSettings();

  const [gpsPermissionStatus, setGpsPermissionStatus] = useState<string>('unknown');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkGPSPermission = async () => {
    const status = await getGPSPermissionStatus();
    setGpsPermissionStatus(status);
  };

  // Automatisch GPS-Berechtigung beim Laden prüfen
  useEffect(() => {
    checkGPSPermission();
  }, []);

  const handleRequestGPS = async () => {
    const granted = await requestGPSPermission();
    if (granted) {
      setGpsPermissionStatus('granted');
      toast.success('GPS-Berechtigung erfolgreich erteilt');
    } else {
      // Status nach fehlgeschlagener Anfrage erneut prüfen
      await checkGPSPermission();
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importSettings(file);
      event.target.value = ''; // Reset file input
    }
  };

  const getPermissionBadge = (status: string) => {
    switch (status) {
      case 'granted':
        return <Badge className="bg-success/20 text-success border-success/30">Erteilt</Badge>;
      case 'denied':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Verweigert</Badge>;
      case 'prompt':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Ausstehend</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground">Konfigurieren Sie Ihre Fahrtenbuch-App</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Importieren
          </Button>
          <Button variant="destructive" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Zurücksetzen
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />
      </div>

      {/* GPS & Tracking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-automotive-accent" />
            GPS & Fahrtaufzeichnung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">GPS-Tracking aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Ermöglicht automatische Standorterfassung für Fahrten
              </p>
            </div>
            <Switch
              checked={settings.gpsTracking}
              onCheckedChange={(checked) => updateSetting('gpsTracking', checked)}
            />
          </div>

          {settings.gpsTracking && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">GPS-Berechtigung</Label>
                    <p className="text-sm text-muted-foreground">Status der Standortberechtigung</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPermissionBadge(gpsPermissionStatus)}
                    <Button variant="outline" size="sm" onClick={checkGPSPermission}>
                      Prüfen
                    </Button>
                    {gpsPermissionStatus !== 'granted' && (
                      <Button size="sm" onClick={handleRequestGPS}>
                        Anfordern
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Automatisch starten</Label>
                    <p className="text-sm text-muted-foreground">
                      Fahrten automatisch bei Bewegung starten
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoStartTrips}
                    onCheckedChange={(checked) => updateSetting('autoStartTrips', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Automatisch stoppen</Label>
                    <p className="text-sm text-muted-foreground">
                      Fahrten automatisch bei Stillstand beenden
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoStopTrips}
                    onCheckedChange={(checked) => updateSetting('autoStopTrips', checked)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gps-accuracy">GPS-Genauigkeit</Label>
                    <Select 
                      value={settings.gpsAccuracy} 
                      onValueChange={(value: 'low' | 'medium' | 'high') => updateSetting('gpsAccuracy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Niedrig (Batterieschonend)</SelectItem>
                        <SelectItem value="medium">Mittel (Ausgewogen)</SelectItem>
                        <SelectItem value="high">Hoch (Präzise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tracking-interval">Tracking-Intervall (Sekunden)</Label>
                    <Input
                      id="tracking-interval"
                      type="number"
                      min="5"
                      max="300"
                      value={settings.trackingInterval}
                      onChange={(e) => updateSetting('trackingInterval', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-distance">Minimale Fahrstrecke (Meter)</Label>
                  <Input
                    id="min-distance"
                    type="number"
                    min="50"
                    max="5000"
                    value={settings.minimumTripDistance}
                    onChange={(e) => updateSetting('minimumTripDistance', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fahrten unter dieser Distanz werden nicht automatisch aufgezeichnet
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Default Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-automotive-accent" />
            Standardwerte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-driver" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Standard-Fahrer
              </Label>
              <Input
                id="default-driver"
                value={settings.defaultDriver}
                onChange={(e) => updateSetting('defaultDriver', e.target.value)}
                placeholder="z.B. Max Mustermann"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-vehicle" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Standard-Fahrzeug
              </Label>
              <Input
                id="default-vehicle"
                value={settings.defaultVehicle}
                onChange={(e) => updateSetting('defaultVehicle', e.target.value)}
                placeholder="z.B. BMW 320d"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-fuel" className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Standard-Kraftstoff
              </Label>
              <Select 
                value={settings.defaultFuelType} 
                onValueChange={(value) => updateSetting('defaultFuelType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Geschäftlich als Standard</Label>
                <p className="text-sm text-muted-foreground">
                  Neue Fahrten standardmäßig als geschäftlich markieren
                </p>
              </div>
              <Switch
                checked={settings.businessTripsDefault}
                onCheckedChange={(checked) => updateSetting('businessTripsDefault', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-automotive-accent" />
            App-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Benachrichtigungen
              </Label>
              <p className="text-sm text-muted-foreground">
                Push-Benachrichtigungen für wichtige Ereignisse
              </p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Dunkles Design
              </Label>
              <p className="text-sm text-muted-foreground">
                App-Oberfläche im dunklen Modus anzeigen
              </p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sprache
              </Label>
              <Select 
                value={settings.language} 
                onValueChange={(value: 'de' | 'en') => updateSetting('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export-Format
              </Label>
              <Select 
                value={settings.exportFormat} 
                onValueChange={(value: 'json' | 'csv' | 'excel') => updateSetting('exportFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel-kompatibel)</SelectItem>
                  <SelectItem value="json">JSON (Backup)</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-automotive-accent" />
            Daten & Datenschutz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data-retention" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Datenaufbewahrung (Tage)
            </Label>
            <Input
              id="data-retention"
              type="number"
              min="0"
              max="3650"
              value={settings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              0 = Unbegrenzt. Daten älter als diese Anzahl Tage werden automatisch gelöscht.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📍 GPS-Daten</h4>
            <p className="text-sm text-muted-foreground mb-2">
              GPS-Standortdaten werden nur lokal auf Ihrem Gerät gespeichert und nicht an externe Server übertragen.
            </p>
            <h4 className="font-medium mb-2">🔒 Datenschutz</h4>
            <p className="text-sm text-muted-foreground">
              Alle Fahrtenbuch-Daten bleiben privat und werden nur in Ihrer lokalen Datenbank gespeichert.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Fahrtenbuch Pro GPS</h3>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground">
              Entwickelt mit React, 2025 Karsten Matthies
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManagement;