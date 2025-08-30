import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Plus, Edit, Trash2, Fuel, Calendar, Wrench } from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  plate: string;
  fuel: string;
  year: number;
  consumption: number;
  status: 'active' | 'maintenance' | 'inactive';
  totalKm: number;
  monthlyKm: number;
}

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "1",
      name: "BMW 320d",
      brand: "BMW",
      model: "320d",
      plate: "B-MW 1234",
      fuel: "Diesel",
      year: 2022,
      consumption: 5.8,
      status: 'active',
      totalKm: 45230,
      monthlyKm: 1247
    },
    {
      id: "2", 
      name: "VW Golf",
      brand: "Volkswagen",
      model: "Golf 8",
      plate: "HH-VW 567",
      fuel: "Benzin",
      year: 2021,
      consumption: 7.2,
      status: 'active',
      totalKm: 32150,
      monthlyKm: 1600
    },
    {
      id: "3",
      name: "Mercedes Sprinter",
      brand: "Mercedes-Benz", 
      model: "Sprinter",
      plate: "M-MB 890",
      fuel: "Diesel",
      year: 2020,
      consumption: 9.5,
      status: 'maintenance',
      totalKm: 87450,
      monthlyKm: 0
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    brand: "",
    model: "",
    plate: "",
    fuel: "",
    year: new Date().getFullYear(),
    consumption: 0
  });

  const handleAddVehicle = () => {
    if (!newVehicle.name || !newVehicle.plate) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      status: 'active',
      totalKm: 0,
      monthlyKm: 0
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({
      name: "",
      brand: "",
      model: "",
      plate: "",
      fuel: "",
      year: new Date().getFullYear(),
      consumption: 0
    });
    setIsAddDialogOpen(false);
    toast.success("Fahrzeug erfolgreich hinzugefügt");
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
              <Button onClick={handleAddVehicle} className="w-full">
                Fahrzeug hinzufügen
              </Button>
            </div>
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
              {vehicles.reduce((sum, v) => sum + v.totalKm, 0).toLocaleString()}
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
              {(vehicles.reduce((sum, v) => sum + v.consumption, 0) / vehicles.length).toFixed(1)}L
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
                  <span className="font-medium">{vehicle.totalKm.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diesen Monat:</span>
                  <span className="font-medium">{vehicle.monthlyKm.toLocaleString()} km</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
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