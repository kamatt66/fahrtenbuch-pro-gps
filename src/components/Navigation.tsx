import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Car, 
  Users, 
  MapPin, 
  Fuel, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Euro
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "trips", label: "Fahrten", icon: MapPin },
  { id: "vehicles", label: "Fahrzeuge", icon: Car },
  { id: "drivers", label: "Fahrer", icon: Users },
  { id: "costs", label: "Kosten", icon: Euro },
  { id: "statistics", label: "Statistiken", icon: BarChart3 },
  { id: "settings", label: "Einstellungen", icon: Settings },
];

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-primary p-4 text-primary-foreground shadow-elegant">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Fahrtenbuch</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-card shadow-elegant border-r border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-all",
                      activeTab === item.id 
                        ? "bg-gradient-primary text-primary-foreground shadow-card" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-card border-r border-border shadow-elegant">
          {/* Logo/Header */}
          <div className="bg-gradient-primary p-6 text-primary-foreground">
            <h1 className="text-2xl font-bold">Fahrtenbuch</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">Professional</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all",
                    activeTab === item.id 
                      ? "bg-gradient-primary text-primary-foreground shadow-card" 
                      : "hover:bg-muted hover:shadow-sm"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Version 1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;