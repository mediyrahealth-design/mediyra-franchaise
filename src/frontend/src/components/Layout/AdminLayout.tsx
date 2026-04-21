import { Outlet, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  DollarSign,
  FlaskConical,
  LayoutDashboard,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Sidebar } from "./Sidebar";
import type { NavItem } from "./Sidebar";

const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
    ocid: "admin.nav.dashboard_link",
  },
  {
    label: "Tests",
    to: "/admin/tests",
    icon: FlaskConical,
    ocid: "admin.nav.tests_link",
  },
  {
    label: "Bookings",
    to: "/admin/bookings",
    icon: CalendarCheck,
    ocid: "admin.nav.bookings_link",
  },
  {
    label: "Collection Centers",
    to: "/admin/centers",
    icon: Building2,
    ocid: "admin.nav.centers_link",
  },
  {
    label: "Payments",
    to: "/admin/payments",
    icon: DollarSign,
    ocid: "admin.nav.payments_link",
  },
  {
    label: "Analytics",
    to: "/admin/analytics",
    icon: BarChart3,
    ocid: "admin.nav.analytics_link",
  },
];

export function AdminLayout() {
  const { role, isInitializing, roleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && !roleLoading && role !== "admin") {
      navigate({ to: "/login" });
    }
  }, [role, isInitializing, roleLoading, navigate]);

  if (isInitializing || roleLoading || role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={adminNavItems} sidebarRole="admin" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-muted/40 px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
