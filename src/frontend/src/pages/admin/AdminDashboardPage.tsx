import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/useBackend";
import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  Clock,
  FlaskConical,
  TrendingUp,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: string;
  ocid: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  ocid,
}: StatCardProps) {
  return (
    <Card className="card-interactive" data-ocid={ocid}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-display font-bold text-foreground">
          {value}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <span className="flex items-center gap-0.5 text-xs text-chart-3 font-medium ml-auto">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const recentActivity = [
  {
    id: "MED1746012301",
    patient: "Rahul Sharma",
    tests: "CBC, LFT",
    status: "Report Ready",
    time: "2 hrs ago",
  },
  {
    id: "MED1746012289",
    patient: "Priya Patel",
    tests: "Lipid Profile",
    status: "Processing",
    time: "3 hrs ago",
  },
  {
    id: "MED1746012245",
    patient: "Amit Kumar",
    tests: "KFT, BSR",
    status: "Sample Received",
    time: "5 hrs ago",
  },
  {
    id: "MED1746012190",
    patient: "Sunita Verma",
    tests: "Urine Routine",
    status: "Pending",
    time: "6 hrs ago",
  },
  {
    id: "MED1746012133",
    patient: "Vikas Singh",
    tests: "CBC",
    status: "Report Ready",
    time: "8 hrs ago",
  },
];

const statusColors: Record<string, string> = {
  "Report Ready": "status-badge-success",
  Processing: "status-badge-warning",
  "Sample Received": "medical-badge",
  Pending: "status-badge-pending",
};

export default function AdminDashboardPage() {
  const { data: summary, isLoading } = useAdminDashboard();

  return (
    <div className="space-y-6" data-ocid="admin.dashboard.page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Lab Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Overview of today's laboratory operations
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-primary" />
          <span>Live</span>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-28" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Bookings"
            value={summary?.totalBookings ?? 248}
            description="All time bookings"
            icon={CalendarCheck}
            trend="+12%"
            ocid="admin.dashboard.total_bookings.card"
          />
          <StatCard
            title="Today's Samples"
            value={summary?.todaysSamples ?? 34}
            description="Samples received today"
            icon={FlaskConical}
            trend="+5"
            ocid="admin.dashboard.todays_samples.card"
          />
          <StatCard
            title="Reports Pending"
            value={summary?.reportsPending ?? 12}
            description="Awaiting report upload"
            icon={Clock}
            ocid="admin.dashboard.reports_pending.card"
          />
          <StatCard
            title="Revenue (₹)"
            value={`₹${(summary?.totalRevenue ?? 84520).toLocaleString("en-IN")}`}
            description="Total revenue collected"
            icon={TrendingUp}
            trend="+8%"
            ocid="admin.dashboard.total_revenue.card"
          />
        </div>
      )}

      {/* Recent Activity */}
      <Card
        className="card-elevated"
        data-ocid="admin.dashboard.recent_activity.card"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentActivity.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-smooth"
                data-ocid={`admin.dashboard.booking.item.${idx + 1}`}
              >
                <div className="min-w-0 flex-1 grid grid-cols-4 gap-4 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.patient}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.id}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate col-span-1">
                    {item.tests}
                  </p>
                  <span
                    className={`${statusColors[item.status] ?? "status-badge-pending"} text-xs`}
                  >
                    {item.status}
                  </span>
                  <p className="text-xs text-muted-foreground text-right">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
