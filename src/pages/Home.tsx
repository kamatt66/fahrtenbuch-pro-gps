import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import VehicleManagement from "@/components/VehicleManagement";
import DriverManagement from "@/components/DriverManagement";
import TripRecorder from "@/components/TripRecorder";
import TripList from "@/components/TripList";
import CostManagement from "@/components/CostManagement";
import FuelManagement from "@/components/FuelManagement";
import SettingsManagement from "@/components/SettingsManagement";
import Statistics from "@/components/Statistics";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut, user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onTabChange={setActiveTab} />;
      case "vehicles":
        return <VehicleManagement />;
      case "drivers":
        return <DriverManagement />;
      case "trips":
        return (
          <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-3">Fahrtaufzeichnung</h1>
            <TripRecorder />
            <TripList />
          </div>
        );
      case "fuel":
        return (
          <div className="p-4">
            <FuelManagement />
          </div>
        );
      case "costs":
        return (
          <div className="p-4">
            <CostManagement />
          </div>
        );
      case "statistics":
        return <Statistics />;
      case "settings":
        return (
          <div className="p-4">
            <SettingsManagement />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="lg:ml-64">
        {/* User info and logout */}
        <div className="bg-card border-b px-6 py-3 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Angemeldet als: {user?.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </Button>
        </div>
        <div className="pb-4 lg:pb-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Home;
