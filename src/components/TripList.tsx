import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Clock, 
  Edit, 
  Trash2, 
  Car,
  Bluetooth,
  Navigation as NavigationIcon,
  Calendar
} from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
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

const TripList = () => {
  const { trips, updateTrip, deleteTrip } = useTrips();
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'Aktiv';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip({ ...trip });
    setIsEditDialogOpen(true);
  };

  const handleSaveTrip = async () => {
    if (!editingTrip) return;

    await updateTrip(editingTrip.id, {
      driver_name: editingTrip.driver_name,
      purpose: editingTrip.purpose,
      notes: editingTrip.notes,
      start_location: editingTrip.start_location,
      end_location: editingTrip.end_location
    });

    setEditingTrip(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Fahrt löschen möchten?')) {
      await deleteTrip(tripId);
    }
  };

  const getStatusBadge = (trip: Trip) => {
    if (trip.is_active) {
      return <Badge className="bg-success/20 text-success border-success/30">Aktiv</Badge>;
    }
    return <Badge variant="outline">Abgeschlossen</Badge>;
  };

  const getPurposeBadge = (purpose: string) => {
    const variant = purpose === 'Geschäftlich' ? 'default' : 'secondary';
    return <Badge variant={variant}>{purpose}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fahrtenverlauf</h2>
        <div className="text-sm text-muted-foreground">
          {trips.length} Fahrten insgesamt
        </div>
      </div>

      <div className="grid gap-4">
        {trips.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Noch keine Fahrten</h3>
                <p className="text-muted-foreground">
                  Starten Sie Ihre erste Fahrt über die Fahrtaufzeichnung
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          trips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-card transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="w-5 h-5 text-automotive-accent" />
                    {trip.driver_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(trip)}
                    {getPurposeBadge(trip.purpose)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trip Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(trip.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDuration(trip.start_time, trip.end_time)}</span>
                  </div>
                  {trip.distance_km && (
                    <div className="flex items-center gap-2">
                      <NavigationIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{trip.distance_km.toFixed(1)} km</span>
                    </div>
                  )}
                </div>

                {/* Location Info */}
                {(trip.start_location || trip.end_location) && (
                  <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {trip.start_location || 'Unbekannt'} → {trip.end_location || (trip.is_active ? 'Aktuelle Position' : 'Unbekannt')}
                    </span>
                  </div>
                )}

                {/* Bluetooth Device */}
                {trip.bluetooth_device && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bluetooth className="w-4 h-4 text-automotive-accent" />
                    <span>Verbunden mit: {trip.bluetooth_device}</span>
                  </div>
                )}

                {/* Notes */}
                {trip.notes && (
                  <div className="text-sm bg-muted/30 p-3 rounded-lg">
                    <strong>Notizen:</strong> {trip.notes}
                  </div>
                )}

                {/* Coordinates */}
                {trip.start_latitude && trip.start_longitude && (
                  <div className="text-xs text-muted-foreground">
                    Start: {trip.start_latitude.toFixed(4)}, {trip.start_longitude.toFixed(4)}
                    {trip.end_latitude && trip.end_longitude && (
                      <> · Ende: {trip.end_latitude.toFixed(4)}, {trip.end_longitude.toFixed(4)}</>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTrip(trip)}
                    disabled={trip.is_active}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-destructive hover:text-destructive"
                    disabled={trip.is_active}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Löschen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Trip Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fahrt bearbeiten</DialogTitle>
          </DialogHeader>
          {editingTrip && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-driver">Fahrer</Label>
                <Input
                  id="edit-driver"
                  value={editingTrip.driver_name}
                  onChange={(e) => setEditingTrip({
                    ...editingTrip,
                    driver_name: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="edit-purpose">Zweck</Label>
                <Select 
                  value={editingTrip.purpose} 
                  onValueChange={(value) => setEditingTrip({
                    ...editingTrip,
                    purpose: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Geschäftlich">Geschäftlich</SelectItem>
                    <SelectItem value="Privat">Privat</SelectItem>
                    <SelectItem value="Fahrt zur Arbeit">Fahrt zur Arbeit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-start-location">Startort</Label>
                <Input
                  id="edit-start-location"
                  value={editingTrip.start_location || ''}
                  onChange={(e) => setEditingTrip({
                    ...editingTrip,
                    start_location: e.target.value
                  })}
                  placeholder="z.B. Berlin"
                />
              </div>

              <div>
                <Label htmlFor="edit-end-location">Zielort</Label>
                <Input
                  id="edit-end-location"
                  value={editingTrip.end_location || ''}
                  onChange={(e) => setEditingTrip({
                    ...editingTrip,
                    end_location: e.target.value
                  })}
                  placeholder="z.B. Hamburg"
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Notizen</Label>
                <Textarea
                  id="edit-notes"
                  value={editingTrip.notes || ''}
                  onChange={(e) => setEditingTrip({
                    ...editingTrip,
                    notes: e.target.value
                  })}
                  placeholder="Zusätzliche Informationen..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Abbrechen
                </Button>
                <Button onClick={handleSaveTrip} className="flex-1">
                  Speichern
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripList;