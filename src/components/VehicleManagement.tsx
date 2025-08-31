import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Plus, Edit, Trash2, Fuel, Calendar, Wrench } from "lucide-react";
import { useVehicles, type Vehicle } from "@/hooks/useVehicles";
import { toast } from "sonner";

const VehicleManagement = () => {
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } = useVehicles();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    brand: "",
    model: "",
    plate: "",
    fuel: "",
    year: new Date().getFullYear(),
    consumption: 0,
    initialKm: 0
  });

  const handleAddVehicle = async () => {
    if (!newVehicle.name || !newVehicle.plate) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    const vehicleData = {
      name: newVehicle.name,
      brand: newVehicle.brand,
      model: newVehicle.model,
      plate: newVehicle.plate,
      fuel: newVehicle.fuel,
      year: newVehicle.year,
      consumption: newVehicle.consumption,
      status: 'active' as const,
      initial_km: newVehicle.initialKm,
      total_km: newVehicle.initialKm,
      monthly_km: 0,
    };
    const result = await addVehicle(vehicleData);
    
    if (result) {
      setNewVehicle({
        name: "",
        brand: "",
        model: "",
        plate: "",
        fuel: "",
        year: new Date().getFullYear(),
        consumption: 0,
        initialKm: 0
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;
    
    if (!editingVehicle.name || !editingVehicle.plate) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    const updates = {
      name: editingVehicle.name,
      brand: editingVehicle.brand,
      model: editingVehicle.model,
      plate: editingVehicle.plate,
      fuel: editingVehicle.fuel,
      year: editingVehicle.year,
      consumption: editingVehicle.consumption,
      status: editingVehicle.status,
    };

    const result = await updateVehicle(editingVehicle.id, updates);
    
    if (result) {
      setEditingVehicle(null);
      setIsEditDialogOpen(false);
    }
  };

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30">Aktiv</Badge>;
      case 'maintenance':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Wartung</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inaktiv</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fahrzeugverwaltung</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Firmen- und Privatfahrzeuge</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-accent text-accent-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Fahrzeug hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neues Fahrzeug hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Fahrzeugname*</Label>
                <Input
                  id="name"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                  placeholder="z.B. BMW 320d"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marke</Label>
                  <Input
                    id="brand"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                    placeholder="BMW"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Modell</Label>
                  <Input
                    id="model"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    placeholder="320d"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="plate">Kennzeichen*</Label>
                <Input
                  id="plate"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})}
                  placeholder="B-MW 1234"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kraftstoff</Label>
                  <Select value={newVehicle.fuel} onValueChange={(value) => setNewVehicle({...newVehicle, fuel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Benzin">Benzin</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Elektro">Elektro</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Baujahr</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consumption">Verbrauch (L/100km)</Label>
                  <Input
                    id="consumption"
                    type="number"
                    step="0.1"
                    value={newVehicle.consumption}
                    onChange={(e) => setNewVehicle({...newVehicle, consumption: parseFloat(e.target.value)})}
                    placeholder="6.5"
                  />
                </div>
                <div>
                  <Label htmlFor="initialKm">Anfangskilometer*</Label>
                  <Input
                    id="initialKm"
                    type="number"
                    value={newVehicle.initialKm}
                    onChange={(e) => setNewVehicle({...newVehicle, initialKm: parseInt(e.target.value) || 0})}
                    placeholder="12500"
                  />
                </div>
              </div>
              <Button onClick={handleAddVehicle} className="w-full">
                Fahrzeug hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Vehicle Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Fahrzeug bearbeiten</DialogTitle>
            </DialogHeader>
            {editingVehicle && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Fahrzeugname*</Label>
                  <Input
                    id="edit-name"
                    value={editingVehicle.name}
                    onChange={(e) => setEditingVehicle({...editingVehicle, name: e.target.value})}
                    placeholder="z.B. BMW 320d"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-brand">Marke</Label>
                    <Input
                      id="edit-brand"
                      value={editingVehicle.brand}
                      onChange={(e) => setEditingVehicle({...editingVehicle, brand: e.target.value})}
                      placeholder="BMW"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-model">Modell</Label>
                    <Input
                      id="edit-model"
                      value={editingVehicle.model}
                      onChange={(e) => setEditingVehicle({...editingVehicle, model: e.target.value})}
                      placeholder="320d"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-plate">Kennzeichen*</Label>
                  <Input
                    id="edit-plate"
                    value={editingVehicle.plate}
                    onChange={(e) => setEditingVehicle({...editingVehicle, plate: e.target.value.toUpperCase()})}
                    placeholder="B-MW 1234"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kraftstoff</Label>
                    <Select value={editingVehicle.fuel} onValueChange={(value) => setEditingVehicle({...editingVehicle, fuel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Benzin">Benzin</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Elektro">Elektro</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-year">Baujahr</Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={editingVehicle.year}
                      onChange={(e) => setEditingVehicle({...editingVehicle, year: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-consumption">Verbrauch (L/100km)</Label>
                    <Input
                      id="edit-consumption"
                      type="number"
                      step="0.1"
                      value={editingVehicle.consumption}
                      onChange={(e) => setEditingVehicle({...editingVehicle, consumption: parseFloat(e.target.value)})}
                      placeholder="6.5"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={editingVehicle.status} onValueChange={(value: Vehicle['status']) => setEditingVehicle({...editingVehicle, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="maintenance">Wartung</SelectItem>
                        <SelectItem value="inactive">Inaktiv</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleUpdateVehicle} className="w-full">
                  Fahrzeug aktualisieren
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Fahrzeuge</CardTitle>
            <Car className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.filter(v => v.status === 'active').length} aktiv
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Kilometer</CardTitle>
            <Calendar className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.reduce((sum, v) => sum + v.total_km, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Alle Fahrzeuge</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartung erforderlich</CardTitle>
            <Wrench className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {vehicles.filter(v => v.status === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">Fahrzeuge</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Verbrauch</CardTitle>
            <Fuel className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.length > 0 ? (vehicles.reduce((sum, v) => sum + v.consumption, 0) / vehicles.length).toFixed(1) : '0.0'}L
            </div>
            <p className="text-xs text-muted-foreground">Pro 100km</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="shadow-card hover:shadow-elegant transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                {getStatusBadge(vehicle.status)}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Car className="w-4 h-4 mr-2" />
                {vehicle.plate}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Marke:</span>
                  <div className="font-medium">{vehicle.brand}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Modell:</span>
                  <div className="font-medium">{vehicle.model}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Kraftstoff:</span>
                  <div className="font-medium">{vehicle.fuel}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Baujahr:</span>
                  <div className="font-medium">{vehicle.year}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Verbrauch:</span>
                  <span className="font-medium">{vehicle.consumption} L/100km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gesamt-KM:</span>
                  <span className="font-medium">{vehicle.total_km.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diesen Monat:</span>
                  <span className="font-medium">{vehicle.monthly_km.toLocaleString()} km</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditVehicle(vehicle)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteVehicle(vehicle.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehicleManagement;