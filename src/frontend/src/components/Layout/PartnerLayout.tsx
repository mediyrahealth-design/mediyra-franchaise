import { Outlet, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  DollarSign,
  FileText,
  HeadphonesIcon,
  LayoutDashboard,
  Search,
  UserPlus,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Sidebar } from "./Sidebar";
import type { NavItem } from "./Sidebar";

const partnerNavItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/partner",
    icon: LayoutDashboard,
    ocid: "partner.nav.dashboard_link",
  },
  {
    label: "Price List",
    to: "/partner/price-list",
    icon: ClipboardList,
    ocid: "partner.nav.pricelist_link",
  },
  {
    label: "Book Patient",
    to: "/partner/book",
    icon: UserPlus,
    ocid: "partner.nav.book_link",
  },
  {
    label: "My Bookings",
    to: "/partner/bookings",
    icon: BookOpen,
    ocid: "partner.nav.bookings_link",
  },
  {
    label: "Track Sample",
    to: "/partner/track",
    icon: Search,
    ocid: "partner.nav.track_link",
  },
  {
    label: "Download Report",
    to: "/partner/reports",
    icon: FileText,
    ocid: "partner.nav.reports_link",
  },
  {
    label: "Billing",
    to: "/partner/billing",
    icon: DollarSign,
    ocid: "partner.nav.billing_link",
  },
  {
    label: "Support",
    to: "/partner/support",
    icon: HeadphonesIcon,
    ocid: "partner.nav.support_link",
  },
];

export function PartnerLayout() {
  const { role, isInitializing, roleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !isInitializing &&
      !roleLoading &&
      role !== "partner" &&
      role !== "admin"
    ) {
      navigate({ to: "/login" });
    }
  }, [role, isInitializing, roleLoading, navigate]);

  if (isInitializing || roleLoading || (role !== "partner" && role !== "admin"))
    return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={partnerNavItems} sidebarRole="partner" />

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
