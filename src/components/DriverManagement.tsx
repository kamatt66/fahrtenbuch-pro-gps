import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Edit, Trash2, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useDrivers, type Driver } from "@/hooks/useDrivers";

const DriverManagement = () => {
  const { drivers, loading, addDriver, deleteDriver } = useDrivers();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newDriver, setNewDriver] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    license_expiry: "",
    status: 'active' as const
  });

  const handleAddDriver = async () => {
    if (!newDriver.first_name || !newDriver.last_name || !newDriver.email) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    try {
      await addDriver(newDriver);
      setNewDriver({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        license_number: "",
        license_expiry: "",
        status: 'active' as const
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusBadge = (status: Driver['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30">Aktiv</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inaktiv</Badge>;
      case 'suspended':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Gesperrt</Badge>;
      default:
        return null;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isLicenseExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const sixMonthsFromNow = new Date(now.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
    return expiry <= sixMonthsFromNow;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fahrerverwaltung</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Fahrer und deren Berechtigungen</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-accent text-accent-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Fahrer hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Fahrer hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname*</Label>
                  <Input
                    id="firstName"
                    value={newDriver.first_name}
                    onChange={(e) => setNewDriver({...newDriver, first_name: e.target.value})}
                    placeholder="Max"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname*</Label>
                  <Input
                    id="lastName"
                    value={newDriver.last_name}
                    onChange={(e) => setNewDriver({...newDriver, last_name: e.target.value})}
                    placeholder="Mustermann"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-Mail*</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                  placeholder="max@firma.de"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                  placeholder="+49 30 12345678"
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">Führerscheinnummer</Label>
                <Input
                  id="licenseNumber"
                  value={newDriver.license_number}
                  onChange={(e) => setNewDriver({...newDriver, license_number: e.target.value.toUpperCase()})}
                  placeholder="D123456789"
                />
              </div>
              <div>
                <Label htmlFor="licenseExpiry">Führerschein gültig bis</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={newDriver.license_expiry}
                  onChange={(e) => setNewDriver({...newDriver, license_expiry: e.target.value})}
                />
              </div>
              <Button onClick={handleAddDriver} className="w-full">
                Fahrer hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Fahrer</CardTitle>
            <Users className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              {drivers.filter(d => d.status === 'active').length} aktiv
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Fahrten</CardTitle>
            <MapPin className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.reduce((sum, d) => sum + d.total_trips, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Alle Fahrer</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Führerschein läuft ab</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {drivers.filter(d => isLicenseExpiringSoon(d.license_expiry)).length}
            </div>
            <p className="text-xs text-muted-foreground">In 6 Monaten</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø KM pro Fahrer</CardTitle>
            <MapPin className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.length > 0 ? Math.round(drivers.reduce((sum, d) => sum + d.total_km, 0) / drivers.length).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Kilometer</p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <Card key={driver.id} className="shadow-card hover:shadow-elegant transition-all">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={driver.avatar_url} alt={`${driver.first_name} ${driver.last_name}`} />
                  <AvatarFallback className="bg-primary/20 text-primary font-medium">
                    {getInitials(driver.first_name, driver.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{driver.first_name} {driver.last_name}</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{driver.license_number}</span>
                    {getStatusBadge(driver.status)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{driver.email}</span>
                </div>
                {driver.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{driver.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className={`${isLicenseExpiringSoon(driver.license_expiry) ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                    Gültig bis: {driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString('de-DE') : 'N/A'}
                  </span>
                </div>
                {isLicenseExpiringSoon(driver.license_expiry) && (
                  <div className="text-xs text-warning font-medium bg-warning/10 p-2 rounded">
                    ⚠️ Führerschein läuft bald ab!
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fahrten gesamt:</span>
                  <span className="font-medium">{driver.total_trips}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gesamt-KM:</span>
                  <span className="font-medium">{driver.total_km.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diesen Monat:</span>
                  <span className="font-medium">{driver.monthly_km.toLocaleString()} km</span>
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

export default DriverManagement;