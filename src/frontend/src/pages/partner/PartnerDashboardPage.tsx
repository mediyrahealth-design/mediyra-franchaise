import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePartnerBookings, usePartnerDashboard } from "@/hooks/useBackend";
import type { Booking } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Clock,
  DollarSign,
  FlaskConical,
  Search,
  UserPlus,
} from "lucide-react";

function QuickActionCard({
  icon: Icon,
  title,
  desc,
  to,
  ocid,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  to: string;
  ocid: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate({ to })}
      className="card-interactive flex items-center gap-4 p-4 text-left w-full"
      data-ocid={ocid}
    >
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = usePartnerDashboard();
  const { data: bookings = [], isLoading: bookingsLoading } =
    usePartnerBookings();

  const recentBookings: Booking[] = bookings.slice(0, 5);

  const stats = [
    {
      title: "Total Bookings",
      value: summary?.totalBookings ?? 0,
      icon: CalendarCheck,
      ocid: "partner.dashboard.total_bookings.card",
    },
    {
      title: "Today's Samples",
      value: summary?.todaysSamples ?? 0,
      icon: FlaskConical,
      ocid: "partner.dashboard.todays_samples.card",
    },
    {
      title: "Reports Pending",
      value: summary?.reportsPending ?? 0,
      icon: Clock,
      ocid: "partner.dashboard.reports_pending.card",
    },
    {
      title: "Earnings (₹)",
      value: `₹${(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      icon: DollarSign,
      ocid: "partner.dashboard.earnings.card",
    },
  ];

  return (
    <div className="space-y-6" data-ocid="partner.dashboard.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Partner Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your collection center overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon, ocid }) => (
          <Card key={title} className="card-elevated" data-ocid={ocid}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-primary shrink-0" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-xl font-display font-bold text-foreground">
                  {value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickActionCard
            icon={UserPlus}
            title="Book Patient Test"
            desc="Register a new patient"
            to="/partner/book"
            ocid="partner.dashboard.book_patient.button"
          />
          <QuickActionCard
            icon={ClipboardList}
            title="View Price List"
            desc="Browse available tests"
            to="/partner/price-list"
            ocid="partner.dashboard.price_list.button"
          />
          <QuickActionCard
            icon={Search}
            title="Track Sample"
            desc="Check sample status"
            to="/partner/track"
            ocid="partner.dashboard.track_sample.button"
          />
        </div>
      </div>

      {/* Recent Bookings */}
      <Card
        className="card-elevated"
        data-ocid="partner.dashboard.recent_bookings.card"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            Recent Bookings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary text-xs"
            data-ocid="partner.dashboard.view_all_bookings.button"
            onClick={() => navigate({ to: "/partner/bookings" })}
          >
            View all
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {bookingsLoading ? (
            <div className="px-6 py-8 flex justify-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : recentBookings.length === 0 ? (
            <div
              className="px-6 py-10 text-center space-y-2"
              data-ocid="partner.dashboard.bookings.empty_state"
            >
              <CalendarCheck className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No bookings yet</p>
              <p className="text-xs text-muted-foreground">
                Book your first patient test to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentBookings.map((booking, idx) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 px-6 py-3.5"
                  data-ocid={`partner.dashboard.booking.item.${idx + 1}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {booking.patientName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {booking.patientId}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
