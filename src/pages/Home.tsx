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

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold mb-4">Fahrtaufzeichnung</h1>
            <TripRecorder />
            <TripList />
          </div>
        );
      case "fuel":
        return (
          <div className="p-6">
            <FuelManagement />
          </div>
        );
      case "costs":
        return (
          <div className="p-6">
            <CostManagement />
          </div>
        );
      case "statistics":
        return <Statistics />;
      case "settings":
        return (
          <div className="p-6">
            <SettingsManagement />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="lg:ml-64">{renderContent()}</div>
    </div>
  );
};

export default Home;
