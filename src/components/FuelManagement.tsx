import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Camera, 
  Upload,
  Edit, 
  Trash2, 
  Fuel,
  Calendar,
  MapPin,
  TrendingUp,
  Receipt,
  FileText
} from 'lucide-react';
import { useFuelRecords, FUEL_TYPES, FuelRecord } from '@/hooks/useFuelRecords';
import { ReceiptOCR, ExtractedReceiptData } from '@/utils/receiptOCR';
import { toast } from 'sonner';

const FuelManagement = () => {
  const { 
    fuelRecords, 
    loading, 
    addFuelRecord, 
    updateFuelRecord, 
    deleteFuelRecord,
    getFuelStatistics 
  } = useFuelRecords();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FuelRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer_reading: '',
    fuel_type: '',
    fuel_amount: '',
    price_per_liter: '',
    total_amount: '',
    gas_station: '',
    location: '',
    receipt_number: '',
    notes: '',
    vehicle_id: ''
  });

  const statistics = getFuelStatistics();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const extractedData = await ReceiptOCR.extractReceiptData(file);
      fillFormFromOCR(extractedData);
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Fehler beim Verarbeiten des Belegs');
    } finally {
      setIsScanning(false);
    }
  };

  const fillFormFromOCR = (data: ExtractedReceiptData) => {
    setNewRecord(prev => ({
      ...prev,
      gas_station: data.gasStation || prev.gas_station,
      location: data.location || prev.location,
      date: data.date || prev.date,
      fuel_type: data.fuelType || prev.fuel_type,
      fuel_amount: data.fuelAmount?.toString() || prev.fuel_amount,
      price_per_liter: data.pricePerLiter?.toString() || prev.price_per_liter,
      total_amount: data.totalAmount?.toString() || prev.total_amount,
      receipt_number: data.receiptNumber || prev.receipt_number
    }));

    if (data.gasStation) {
      toast.success(`Tankstelle erkannt: ${data.gasStation}`);
    }
  };

  const calculateMissingValue = () => {
    const amount = parseFloat(newRecord.fuel_amount);
    const price = parseFloat(newRecord.price_per_liter);
    const total = parseFloat(newRecord.total_amount);

    if (amount && price && !newRecord.total_amount) {
      setNewRecord(prev => ({
        ...prev,
        total_amount: (amount * price).toFixed(2)
      }));
    } else if (total && amount && !newRecord.price_per_liter) {
      setNewRecord(prev => ({
        ...prev,
        price_per_liter: (total / amount).toFixed(3)
      }));
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.fuel_type || !newRecord.fuel_amount || !newRecord.gas_station) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      await addFuelRecord({
        date: newRecord.date,
        odometer_reading: newRecord.odometer_reading ? parseInt(newRecord.odometer_reading) : null,
        fuel_type: newRecord.fuel_type,
        fuel_amount: parseFloat(newRecord.fuel_amount),
        price_per_liter: parseFloat(newRecord.price_per_liter),
        total_amount: parseFloat(newRecord.total_amount),
        gas_station: newRecord.gas_station,
        location: newRecord.location || null,
        receipt_number: newRecord.receipt_number || null,
        notes: newRecord.notes || null,
        vehicle_id: newRecord.vehicle_id || null,
        receipt_image_url: null
      });

      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        odometer_reading: '',
        fuel_type: '',
        fuel_amount: '',
        price_per_liter: '',
        total_amount: '',
        gas_station: '',
        location: '',
        receipt_number: '',
        notes: '',
        vehicle_id: ''
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditRecord = (record: FuelRecord) => {
    setEditingRecord({
      ...record,
      date: record.date.split('T')[0] // Format date for input
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    try {
      await updateFuelRecord(editingRecord.id, {
        date: editingRecord.date,
        odometer_reading: editingRecord.odometer_reading,
        fuel_type: editingRecord.fuel_type,
        fuel_amount: parseFloat(editingRecord.fuel_amount.toString()),
        price_per_liter: parseFloat(editingRecord.price_per_liter.toString()),
        total_amount: parseFloat(editingRecord.total_amount.toString()),
        gas_station: editingRecord.gas_station,
        location: editingRecord.location,
        receipt_number: editingRecord.receipt_number,
        notes: editingRecord.notes,
        vehicle_id: editingRecord.vehicle_id
      });

      setEditingRecord(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Tankbeleg löschen möchten?')) {
      await deleteFuelRecord(recordId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getFuelTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'Benzin': '⛽',
      'Diesel': '🚛',
      'Super': '🏎️',
      'Super Plus': '🏁',
      'E10': '🌱',
      'AdBlue': '💧'
    };
    return iconMap[type] || '⛽';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tankbelege</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Tankbelege mit automatischem Scanner</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-accent text-accent-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Tankbeleg hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neuen Tankbeleg hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* OCR Scanner */}
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <div className="space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Tankbeleg automatisch scannen</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isScanning}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Foto aufnehmen
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Datei wählen
                    </Button>
                  </div>
                  {isScanning && <p className="text-sm text-automotive-accent">Beleg wird gescannt...</p>}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Manual Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fuel_type">Kraftstoffart*</Label>
                  <Select value={newRecord.fuel_type} onValueChange={(value) => setNewRecord({...newRecord, fuel_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {getFuelTypeIcon(type)} {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gas_station">Tankstelle*</Label>
                <Input
                  id="gas_station"
                  value={newRecord.gas_station}
                  onChange={(e) => setNewRecord({...newRecord, gas_station: e.target.value})}
                  placeholder="z.B. Shell, Aral, BP"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fuel_amount">Menge (L)*</Label>
                  <Input
                    id="fuel_amount"
                    type="number"
                    step="0.001"
                    value={newRecord.fuel_amount}
                    onChange={(e) => setNewRecord({...newRecord, fuel_amount: e.target.value})}
                    onBlur={calculateMissingValue}
                    placeholder="50.000"
                  />
                </div>
                <div>
                  <Label htmlFor="price_per_liter">Preis/L (€)</Label>
                  <Input
                    id="price_per_liter"
                    type="number"
                    step="0.001"
                    value={newRecord.price_per_liter}
                    onChange={(e) => setNewRecord({...newRecord, price_per_liter: e.target.value})}
                    onBlur={calculateMissingValue}
                    placeholder="1.459"
                  />
                </div>
                <div>
                  <Label htmlFor="total_amount">Gesamt (€)*</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    value={newRecord.total_amount}
                    onChange={(e) => setNewRecord({...newRecord, total_amount: e.target.value})}
                    placeholder="72.95"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="odometer">Kilometerstand</Label>
                  <Input
                    id="odometer"
                    type="number"
                    value={newRecord.odometer_reading}
                    onChange={(e) => setNewRecord({...newRecord, odometer_reading: e.target.value})}
                    placeholder="150000"
                  />
                </div>
                <div>
                  <Label htmlFor="receipt_number">Belegnummer</Label>
                  <Input
                    id="receipt_number"
                    value={newRecord.receipt_number}
                    onChange={(e) => setNewRecord({...newRecord, receipt_number: e.target.value})}
                    placeholder="R-2024-001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Standort</Label>
                <Input
                  id="location"
                  value={newRecord.location}
                  onChange={(e) => setNewRecord({...newRecord, location: e.target.value})}
                  placeholder="z.B. 10117 Berlin"
                />
              </div>

              <div>
                <Label htmlFor="vehicle">Fahrzeug</Label>
                <Input
                  id="vehicle"
                  value={newRecord.vehicle_id}
                  onChange={(e) => setNewRecord({...newRecord, vehicle_id: e.target.value})}
                  placeholder="z.B. BMW 320d (B-MW 1234)"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  placeholder="Zusätzliche Informationen..."
                  rows={3}
                />
              </div>

              <Button onClick={handleAddRecord} className="w-full">
                Tankbeleg hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtkosten</CardTitle>
            <Fuel className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.totalCosts)}</div>
            <p className="text-xs text-muted-foreground">{statistics.recordCount} Tankungen</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diesen Monat</CardTitle>
            <Calendar className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.thisMonthTotal)}</div>
            <p className="text-xs text-muted-foreground">{statistics.thisMonthLiters.toFixed(1)} Liter</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Literpreis</CardTitle>
            <TrendingUp className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.averagePricePerLiter)}</div>
            <p className="text-xs text-muted-foreground">Durchschnitt</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtmenge</CardTitle>
            <Receipt className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalLiters.toFixed(0)}L</div>
            <p className="text-xs text-muted-foreground">Gesamt getankt</p>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Records List */}
      <div className="space-y-4">
        {fuelRecords.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Fuel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Noch keine Tankbelege</h3>
                <p className="text-muted-foreground">
                  Fügen Sie Ihren ersten Tankbeleg hinzu oder scannen Sie einen Beleg
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          fuelRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-card transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getFuelTypeIcon(record.fuel_type)}</span>
                      <Badge variant="outline">{record.fuel_type}</Badge>
                      <Badge className="bg-automotive-accent/20 text-automotive-accent">
                        {record.fuel_amount}L
                      </Badge>
                    </div>
                    
                    <h3 className="font-medium text-lg">{record.gas_station}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.date)}
                      </div>
                      {record.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {record.location}
                        </div>
                      )}
                      {record.receipt_number && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {record.receipt_number}
                        </div>
                      )}
                      {record.odometer_reading && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">🛣️</span>
                          {record.odometer_reading.toLocaleString()} km
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Preis: </span>
                      <span className="font-medium">{formatCurrency(Number(record.price_per_liter))}/L</span>
                    </div>
                    
                    {record.notes && (
                      <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-2 rounded">
                        {record.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-automotive-accent">
                      {formatCurrency(Number(record.total_amount))}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRecord(record)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tankbeleg bearbeiten</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fuel_type">Kraftstoffart*</Label>
                  <Select 
                    value={editingRecord.fuel_type} 
                    onValueChange={(value) => setEditingRecord({...editingRecord, fuel_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {getFuelTypeIcon(type)} {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-date">Datum</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingRecord.date}
                    onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-gas_station">Tankstelle*</Label>
                <Input
                  id="edit-gas_station"
                  value={editingRecord.gas_station}
                  onChange={(e) => setEditingRecord({...editingRecord, gas_station: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-fuel_amount">Menge (L)*</Label>
                  <Input
                    id="edit-fuel_amount"
                    type="number"
                    step="0.001"
                    value={editingRecord.fuel_amount}
                    onChange={(e) => setEditingRecord({...editingRecord, fuel_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price_per_liter">Preis/L (€)</Label>
                  <Input
                    id="edit-price_per_liter"
                    type="number"
                    step="0.001"
                    value={editingRecord.price_per_liter}
                    onChange={(e) => setEditingRecord({...editingRecord, price_per_liter: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-total_amount">Gesamt (€)*</Label>
                  <Input
                    id="edit-total_amount"
                    type="number"
                    step="0.01"
                    value={editingRecord.total_amount}
                    onChange={(e) => setEditingRecord({...editingRecord, total_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-odometer">Kilometerstand</Label>
                  <Input
                    id="edit-odometer"
                    type="number"
                    value={editingRecord.odometer_reading || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, odometer_reading: e.target.value ? parseInt(e.target.value) : null})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-receipt_number">Belegnummer</Label>
                  <Input
                    id="edit-receipt_number"
                    value={editingRecord.receipt_number || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, receipt_number: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-location">Standort</Label>
                <Input
                  id="edit-location"
                  value={editingRecord.location || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, location: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Notizen</Label>
                <Textarea
                  id="edit-notes"
                  value={editingRecord.notes || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, notes: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Abbrechen
                </Button>
                <Button onClick={handleUpdateRecord} className="flex-1">
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

export default FuelManagement;