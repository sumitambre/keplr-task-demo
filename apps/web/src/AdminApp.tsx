import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, type NavItem } from "./components/admin/Sidebar";
import { Dashboard } from "./components/admin/Dashboard";
import { Users } from "./components/admin/Users";
import { Clients } from "./components/admin/Clients";
import { PurchasesReceipts } from "./components/admin/PurchasesReceipts";
import { Reports } from "./components/admin/Reports";
import { Settings } from "./components/admin/Settings";
import { WorkStructure } from "./components/admin/WorkStructure";
import FloatingAddButton from "./components/admin/FloatingAddButton";
import { Button } from "@repo/ui/button";
import { Menu, LayoutDashboard, Users as UsersIcon, Building2, ClipboardList, Receipt, BarChart3, Settings as SettingsIcon } from "lucide-react";
import { cn } from "./lib/utils";

export type AdminAppProps = {
  onLogout: () => void;
};

export function AdminApp({ onLogout }: AdminAppProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo<NavItem[]>(() => [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "users", label: "Users", icon: UsersIcon, path: "/users" },
    { id: "clients", label: "Clients", icon: Building2, path: "/clients" },
    { id: "work-structure", label: "Work Structure", icon: ClipboardList, path: "/work-structure" },
    { id: "purchases-receipts", label: "Purchases & Receipts", icon: Receipt, path: "/purchases-receipts" },
    { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
    { id: "settings", label: "Settings", icon: SettingsIcon, path: "/settings" },
  ], []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const desktopContentPadding = "pl-0";
  const mobileContentPadding = isDrawerOpen ? "pl-64" : "pl-0";

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Hamburger */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 rounded-md border bg-card shadow-sm"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          navItems={navItems}
          activePath={location.pathname}
          onNavigate={(path) => {
            navigate(path);
          }}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar">
            <Sidebar
              navItems={navItems}
              activePath={location.pathname}
              onNavigate={(path) => {
                navigate(path);
                setIsDrawerOpen(false);
              }}
              onLogout={() => {
                setIsDrawerOpen(false);
                onLogout();
              }}
              collapsed={false}
              onToggleCollapse={() => setIsDrawerOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "relative z-0 min-w-0 flex-1 overflow-auto transition-padding duration-300",
          isMobile ? mobileContentPadding : desktopContentPadding
        )}
      >
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="clients" element={<Clients />} />
          <Route path="work-structure" element={<WorkStructure />} />
          <Route path="purchases-receipts" element={<PurchasesReceipts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>

      <FloatingAddButton />
    </div>
  );
}
