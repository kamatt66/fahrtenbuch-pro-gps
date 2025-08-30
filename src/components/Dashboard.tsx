import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, MapPin, Fuel, BarChart3, Plus } from "lucide-react";

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, description, trend }: StatCardProps) => (
  <Card className="bg-gradient-card shadow-elegant border-0 hover:shadow-glow transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="text-automotive-accent">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      {trend && <p className="text-xs text-success mt-1">{trend}</p>}
    </CardContent>
  </Card>
);

const Dashboard = ({ onTabChange }: DashboardProps) => {
  const handleNewTrip = () => {
    onTabChange?.('trips');
  };

  const handleFuelRecord = () => {
    onTabChange?.('fuel');
  };

  const handleShowRoute = () => {
    onTabChange?.('trips');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground shadow-elegant">
        <h1 className="text-3xl font-bold mb-2">Fahrtenbuch Dashboard</h1>
        <p className="text-primary-foreground/80">Willkommen zurück! Hier ist Ihre Fahrtübersicht.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          className="bg-gradient-accent text-accent-foreground hover:opacity-90 transition-all"
          onClick={handleNewTrip}
        >
          <Plus className="w-4 h-4 mr-2" />
          Neue Fahrt
        </Button>
        <Button 
          variant="outline" 
          className="border-automotive-light hover:bg-automotive-light transition-colors"
          onClick={handleFuelRecord}
        >
          <Fuel className="w-4 h-4 mr-2" />
          Tanken erfassen
        </Button>
        <Button 
          variant="outline" 
          className="border-automotive-light hover:bg-automotive-light transition-colors"
          onClick={handleShowRoute}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Route anzeigen
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gesamte Fahrten"
          value="0"
          icon={<MapPin className="h-4 w-4" />}
          description="Diesen Monat"
        />
        <StatCard
          title="Gefahrene Kilometer"
          value="0 km"
          icon={<Car className="h-4 w-4" />}
          description="Diesen Monat"
        />
        <StatCard
          title="Kraftstoffkosten"
          value="€0,00"
          icon={<Fuel className="h-4 w-4" />}
          description="Diesen Monat"
        />
        <StatCard
          title="Ø Verbrauch"
          value="0 L/100km"
          icon={<BarChart3 className="h-4 w-4" />}
          description="Letzte 30 Tage"
        />
      </div>

      {/* Recent Trips */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-automotive-accent" />
            Letzte Fahrten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Noch keine Fahrten</h3>
              <p className="text-muted-foreground">
                Starten Sie Ihre erste Fahrt über die Fahrtaufzeichnung
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="w-5 h-5 mr-2 text-automotive-accent" />
            Meine Fahrzeuge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Noch keine Fahrzeuge</h3>
              <p className="text-muted-foreground">
                Fügen Sie Ihr erstes Fahrzeug über die Fahrzeugverwaltung hinzu
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;