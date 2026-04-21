import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AdminLayout } from "./components/Layout/AdminLayout";
import { PartnerLayout } from "./components/Layout/PartnerLayout";
import { PageLoader } from "./components/ui/LoadingSpinner";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import BookingManagementPage from "./pages/admin/BookingManagementPage";
import CollectionCenterPage from "./pages/admin/CollectionCenterPage";
import TestManagementPage from "./pages/admin/TestManagementPage";
import BillingPage from "./pages/partner/BillingPage";
import BookPatientPage from "./pages/partner/BookPatientPage";
import MyBookingsPage from "./pages/partner/MyBookingsPage";
import PartnerDashboardPage from "./pages/partner/PartnerDashboardPage";
import PriceListPage from "./pages/partner/PriceListPage";
import SupportPage from "./pages/partner/SupportPage";
import TrackSamplePage from "./pages/partner/TrackSamplePage";

// Placeholder pages for routes not yet written
function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="space-y-4" data-ocid="coming_soon.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          This page is coming soon.
        </p>
      </div>
      <div className="card-elevated p-12 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">🚧</span>
        </div>
        <p className="text-muted-foreground text-sm">
          This module is under construction and will be available soon.
        </p>
      </div>
    </div>
  );
}

// ---------- Root ----------
const rootRoute = createRootRoute({
  component: Outlet,
  pendingComponent: PageLoader,
});

// ---------- Login ----------
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// ---------- Admin root ----------
const adminRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/",
  component: AdminDashboardPage,
});

const adminTestsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/tests",
  component: TestManagementPage,
});

const adminBookingsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/bookings",
  component: BookingManagementPage,
});

const adminCentersRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/centers",
  component: CollectionCenterPage,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/payments",
  component: () => <ComingSoonPage title="Payment Management" />,
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/analytics",
  component: () => <ComingSoonPage title="Analytics" />,
});

// ---------- Partner root ----------
const partnerRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/partner",
  component: PartnerLayout,
});

const partnerIndexRoute = createRoute({
  getParentRoute: () => partnerRootRoute,
  path: "/",
  component: PartnerDashboardPage,
});

const partnerPriceListRoute = createRoute({
  getParentRoute: () => partnerRootRoute,
  path: "/price-list",
  component: PriceListPage,
});

const partnerBookRoute = createRoute({
  getParentRoute: () => partnerRootRoute,
  path: "/book",
  component: BookPatientPage,
});

const partnerBookingsRoute = createRoute({
  getParentRoute: () => partnerRootRoute,
  path: "/bookings",
  component: MyBookingsPage,
});

const partnerTrackRoute = createRoute({
  getParentRoute: () => partnerRootRoute,
  path: "/track",
  component: TrackSamplePage,
});

const partnerReportsRoute = createRoute({
  getParentRoute: () => partnerRootRoute,
  path: "/reports",
  component: () => <ComingSoonPage title="Download Report" />,
});

const partnerBillingRoute = createRoute({
  getParentRoute: () => partnerRootRoute,
  path: "/billing",
  component: BillingPage,
});

const partnerSupportRoute = createRoute({
  getParentRoute: () => partnerRootRoute,
  path: "/support",
  component: SupportPage,
});

// ---------- Index redirect ----------
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

// ---------- Router ----------
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminRootRoute.addChildren([
    adminIndexRoute,
    adminTestsRoute,
    adminBookingsRoute,
    adminCentersRoute,
    adminPaymentsRoute,
    adminAnalyticsRoute,
  ]),
  partnerRootRoute.addChildren([
    partnerIndexRoute,
    partnerPriceListRoute,
    partnerBookRoute,
    partnerBookingsRoute,
    partnerTrackRoute,
    partnerReportsRoute,
    partnerBillingRoute,
    partnerSupportRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
