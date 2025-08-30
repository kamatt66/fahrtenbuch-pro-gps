import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, MapPin, Fuel, BarChart3, Plus } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips } from "@/hooks/useTrips";
import { useFuelRecords } from "@/hooks/useFuelRecords";
import { useMemo } from "react";
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
  const { vehicles, loading } = useVehicles();
  const { trips } = useTrips();
  const { fuelRecords } = useFuelRecords();

  // Calculate statistics
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTrips = trips.filter(trip => {
      const tripDate = new Date(trip.start_time);
      return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
    });

    const currentMonthFuel = fuelRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    const totalDistance = currentMonthTrips.reduce((sum, trip) => sum + (trip.distance_km || 0), 0);
    const totalFuelCost = currentMonthFuel.reduce((sum, record) => sum + (record.total_amount || 0), 0);
    const totalFuelAmount = currentMonthFuel.reduce((sum, record) => sum + (record.fuel_amount || 0), 0);
    
    const avgConsumption = totalDistance > 0 && totalFuelAmount > 0 
      ? (totalFuelAmount / totalDistance) * 100 
      : 0;

    return {
      totalTrips: currentMonthTrips.length,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalFuelCost: Math.round(totalFuelCost * 100) / 100,
      avgConsumption: Math.round(avgConsumption * 10) / 10
    };
  }, [trips, fuelRecords]);

  const recentTrips = trips.slice(0, 5);

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
          value={stats.totalTrips.toString()}
          icon={<MapPin className="h-4 w-4" />}
          description="Diesen Monat"
        />
        <StatCard
          title="Gefahrene Kilometer"
          value={`${stats.totalDistance} km`}
          icon={<Car className="h-4 w-4" />}
          description="Diesen Monat"
        />
        <StatCard
          title="Kraftstoffkosten"
          value={`€${stats.totalFuelCost.toFixed(2)}`}
          icon={<Fuel className="h-4 w-4" />}
          description="Diesen Monat"
        />
        <StatCard
          title="Ø Verbrauch"
          value={`${stats.avgConsumption} L/100km`}
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
          {recentTrips.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Noch keine Fahrten</h3>
                <p className="text-muted-foreground mb-4">
                  Starten Sie Ihre erste Fahrt über die Fahrtaufzeichnung
                </p>
                <Button onClick={handleNewTrip} className="bg-automotive-primary hover:bg-automotive-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Erste Fahrt erstellen
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentTrips.map((trip) => (
                <li key={trip.id} className="py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{trip.driver_name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        trip.purpose === 'Geschäftlich' ? 'bg-blue-100 text-blue-800' :
                        trip.purpose === 'Privat' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {trip.purpose}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trip.start_location && trip.end_location ? (
                        <span>{trip.start_location} → {trip.end_location}</span>
                      ) : (
                        <span>Fahrt vom {new Date(trip.start_time).toLocaleDateString('de-DE')}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(trip.start_time).toLocaleDateString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      {trip.distance_km ? `${trip.distance_km.toFixed(1)} km` : '-'}
                    </div>
                    {trip.is_active && (
                      <span className="text-xs text-success">Aktiv</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
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
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">Fahrzeuge werden geladen...</div>
          ) : vehicles.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Noch keine Fahrzeuge</h3>
                <p className="text-muted-foreground">
                  Fügen Sie Ihr erstes Fahrzeug über die Fahrzeugverwaltung hinzu
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {vehicles.slice(0, 5).map((v) => (
                <li key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{v.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.brand ?? '-'} {v.model ?? ''} • {v.plate}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-automotive-light text-foreground/80">
                    {v.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;