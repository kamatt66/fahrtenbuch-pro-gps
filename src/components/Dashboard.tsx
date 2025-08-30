import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, MapPin, Fuel, BarChart3, Plus } from "lucide-react";

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

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground shadow-elegant">
        <h1 className="text-3xl font-bold mb-2">Fahrtenbuch Dashboard</h1>
        <p className="text-primary-foreground/80">Willkommen zurück! Hier ist Ihre Fahrtübersicht.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-gradient-accent text-accent-foreground hover:opacity-90 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Neue Fahrt
        </Button>
        <Button variant="outline" className="border-automotive-light hover:bg-automotive-light transition-colors">
          <Fuel className="w-4 h-4 mr-2" />
          Tanken erfassen
        </Button>
        <Button variant="outline" className="border-automotive-light hover:bg-automotive-light transition-colors">
          <MapPin className="w-4 h-4 mr-2" />
          Route anzeigen
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gesamte Fahrten"
          value="156"
          icon={<MapPin className="h-4 w-4" />}
          description="Diesen Monat"
          trend="+12% zum Vormonat"
        />
        <StatCard
          title="Gefahrene Kilometer"
          value="2.847 km"
          icon={<Car className="h-4 w-4" />}
          description="Diesen Monat"
          trend="+8% zum Vormonat"
        />
        <StatCard
          title="Kraftstoffkosten"
          value="€347,50"
          icon={<Fuel className="h-4 w-4" />}
          description="Diesen Monat"
          trend="-3% zum Vormonat"
        />
        <StatCard
          title="Ø Verbrauch"
          value="6,8 L/100km"
          icon={<BarChart3 className="h-4 w-4" />}
          description="Letzte 30 Tage"
          trend="-0,2L zum Vormonat"
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
          <div className="space-y-4">
            {[
              { from: "Berlin", to: "Hamburg", date: "Heute, 14:30", km: "289 km", purpose: "Geschäftlich" },
              { from: "Hamburg", to: "München", date: "Gestern, 09:15", km: "612 km", purpose: "Geschäftlich" },
              { from: "München", to: "Berlin", date: "27.12.2024", km: "584 km", purpose: "Privat" },
            ].map((trip, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1">
                  <div className="font-medium">{trip.from} → {trip.to}</div>
                  <div className="text-sm text-muted-foreground">{trip.date}</div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="font-medium">{trip.km}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    trip.purpose === 'Geschäftlich' 
                      ? 'bg-automotive-accent/20 text-automotive-accent' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {trip.purpose}
                  </span>
                </div>
              </div>
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "BMW 320d", plate: "B-MW 1234", fuel: "Diesel", consumption: "5,8 L/100km", km: "1.247 km" },
              { name: "VW Golf", plate: "HH-VW 567", fuel: "Benzin", consumption: "7,2 L/100km", km: "1.600 km" },
            ].map((vehicle, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-card hover:shadow-card transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{vehicle.name}</h3>
                  <span className="text-sm text-muted-foreground">{vehicle.plate}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Kraftstoff:</span>
                    <div className="font-medium">{vehicle.fuel}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verbrauch:</span>
                    <div className="font-medium">{vehicle.consumption}</div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Diesen Monat: </span>
                  <span className="font-medium">{vehicle.km}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;