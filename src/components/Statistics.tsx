import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, TrendingUp, Car, Fuel, Euro, Calendar } from "lucide-react";
import { useTrips } from "@/hooks/useTrips";
import { useFuelRecords } from "@/hooks/useFuelRecords";
import { useCosts } from "@/hooks/useCosts";
import { useVehicles } from "@/hooks/useVehicles";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const COLORS = ['hsl(var(--automotive-primary))', 'hsl(var(--automotive-accent))', 'hsl(var(--automotive-secondary))', '#8884d8', '#82ca9d', '#ffc658'];

const Statistics = () => {
  const { trips } = useTrips();
  const { fuelRecords, getFuelStatistics } = useFuelRecords();
  const { costs, getCostStatistics } = useCosts();
  const { vehicles } = useVehicles();

  // Calculate trip statistics
  const tripStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonth = trips.filter(trip => {
      const tripDate = new Date(trip.start_time);
      return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
    });

    const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance_km || 0), 0);
    const thisMonthDistance = thisMonth.reduce((sum, trip) => sum + (trip.distance_km || 0), 0);

    // Group trips by month for chart
    const monthlyTrips = trips.reduce((acc, trip) => {
      const date = new Date(trip.start_time);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, count: 0, distance: 0 };
      }
      acc[monthKey].count += 1;
      acc[monthKey].distance += trip.distance_km || 0;
      return acc;
    }, {} as Record<string, { month: string; count: number; distance: number }>);

    const monthlyData = Object.values(monthlyTrips)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    return {
      totalTrips: trips.length,
      thisMonthTrips: thisMonth.length,
      totalDistance,
      thisMonthDistance,
      monthlyData
    };
  }, [trips]);

  // Fuel statistics
  const fuelStats = getFuelStatistics();

  // Cost statistics
  const costStats = getCostStatistics();

  // Vehicle distribution for pie chart
  const vehicleDistribution = useMemo(() => {
    const distribution = trips.reduce((acc, trip) => {
      const vehicleId = trip.vehicle_id || 'Unbekannt';
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const vehicleName = vehicle ? vehicle.name : 'Unbekannt';
      
      if (!acc[vehicleName]) {
        acc[vehicleName] = 0;
      }
      acc[vehicleName] += trip.distance_km || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, distance]) => ({
      name,
      value: Math.round(distance * 10) / 10
    }));
  }, [trips, vehicles]);

  // Cost by category for pie chart
  const costByCategory = useMemo(() => {
    return costStats.categoryTotals.map(cat => ({
      name: cat.category,
      value: cat.total
    }));
  }, [costStats.categoryTotals]);

  // Monthly cost trend
  const monthlyCostTrend = useMemo(() => {
    const monthlyData = costs.reduce((acc, cost) => {
      const date = new Date(cost.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, costs: 0, fuel: 0 };
      }
      acc[monthKey].costs += cost.amount;
      return acc;
    }, {} as Record<string, { month: string; costs: number; fuel: number }>);

    // Add fuel costs
    fuelRecords.forEach(fuel => {
      const date = new Date(fuel.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, costs: 0, fuel: 0 };
      }
      monthlyData[monthKey].fuel += fuel.total_amount;
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [costs, fuelRecords]);

  const chartConfig = {
    trips: { label: "Fahrten", color: "hsl(var(--automotive-primary))" },
    distance: { label: "Kilometer", color: "hsl(var(--automotive-accent))" },
    costs: { label: "Kosten", color: "hsl(var(--automotive-secondary))" },
    fuel: { label: "Kraftstoff", color: "hsl(var(--automotive-accent))" },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground shadow-elegant">
        <h1 className="text-3xl font-bold mb-2">Statistiken & Analysen</h1>
        <p className="text-primary-foreground/80">Detaillierte Auswertung Ihrer Fahrtenbuchdaten</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-elegant border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamte Fahrten</CardTitle>
            <Car className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{tripStats.totalTrips}</div>
            <p className="text-xs text-muted-foreground">
              {tripStats.thisMonthTrips} diesen Monat
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-elegant border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtkilometer</CardTitle>
            <TrendingUp className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{Math.round(tripStats.totalDistance)} km</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(tripStats.thisMonthDistance)} km diesen Monat
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-elegant border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kraftstoffkosten</CardTitle>
            <Fuel className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">€{fuelStats.totalCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              €{fuelStats.thisMonthTotal.toFixed(2)} diesen Monat
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-elegant border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtkosten</CardTitle>
            <Euro className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              €{(costStats.totalCosts + fuelStats.totalCosts).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              €{(costStats.thisMonthTotal + fuelStats.thisMonthTotal).toFixed(2)} diesen Monat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trips Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-automotive-accent" />
              Monatliche Fahrtentwicklung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tripStats.monthlyData.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tripStats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(-2)}`;
                      }}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--automotive-primary))" name="Fahrten" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Keine Fahrtdaten verfügbar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="w-5 h-5 mr-2 text-automotive-accent" />
              Kilometerverteilung nach Fahrzeug
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicleDistribution.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={vehicleDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, value }) => `${name}: ${value}km`}
                    >
                      {vehicleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Keine Fahrzeugdaten verfügbar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Cost Trend */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-automotive-accent" />
              Kostenentwicklung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyCostTrend.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyCostTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month"
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(-2)}`;
                      }}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="costs" 
                      stroke="hsl(var(--automotive-primary))" 
                      name="Kosten"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fuel" 
                      stroke="hsl(var(--automotive-accent))" 
                      name="Kraftstoff"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Keine Kostendaten verfügbar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost by Category */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Euro className="w-5 h-5 mr-2 text-automotive-accent" />
              Kosten nach Kategorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {costByCategory.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={costByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, value }) => `${name}: €${value.toFixed(2)}`}
                    >
                      {costByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Keine Kostenkategorien verfügbar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Kraftstoff-Statistiken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gesamte Liter:</span>
              <span className="font-medium">{fuelStats.totalLiters.toFixed(1)} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ø Preis/Liter:</span>
              <span className="font-medium">€{fuelStats.averagePricePerLiter.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tankstopps:</span>
              <span className="font-medium">{fuelStats.recordCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Fahrzeug-Übersicht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registrierte Fahrzeuge:</span>
              <span className="font-medium">{vehicles.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aktive Fahrzeuge:</span>
              <span className="font-medium">
                {vehicles.filter(v => v.status === 'active').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Durchschnittswerte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ø Fahrt:</span>
              <span className="font-medium">
                {tripStats.totalTrips > 0 ? (tripStats.totalDistance / tripStats.totalTrips).toFixed(1) : '0'} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kosten/km:</span>
              <span className="font-medium">
                {tripStats.totalDistance > 0 
                  ? `€${((costStats.totalCosts + fuelStats.totalCosts) / tripStats.totalDistance).toFixed(2)}`
                  : '€0.00'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;