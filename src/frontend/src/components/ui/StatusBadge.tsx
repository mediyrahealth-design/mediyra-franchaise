import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types";

interface StatusBadgeProps {
  status: BookingStatus;
}

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  Pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  SampleReceived: {
    label: "Sample Received",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  Processing: {
    label: "Processing",
    className: "bg-chart-5/10 text-chart-5 border-chart-5/30",
  },
  ReportReady: {
    label: "Report Ready",
    className: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.Pending;
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${cfg.className}`}
      data-ocid={`status-badge-${status.toLowerCase()}`}
    >
      {cfg.label}
    </Badge>
  );
}
