import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabTests, usePartnerBookings } from "@/hooks/useBackend";
import type { Booking, BookingStatus } from "@/types";
import { BookOpen, CheckCircle2, Circle, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_STEPS: { key: BookingStatus; label: string }[] = [
  { key: "Pending", label: "Booking Created" },
  { key: "SampleReceived", label: "Sample Received" },
  { key: "Processing", label: "Processing" },
  { key: "ReportReady", label: "Report Ready" },
];

function StatusStepper({ status }: { status: BookingStatus }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-start gap-0" data-ocid="booking_detail.stepper">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div
                className={`h-0.5 flex-1 ${idx === 0 ? "invisible" : done ? "bg-primary" : "bg-border"}`}
              />
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <div
                className={`h-0.5 flex-1 ${idx === STATUS_STEPS.length - 1 ? "invisible" : done && idx < currentIdx ? "bg-primary" : "bg-border"}`}
              />
            </div>
            <span
              className={`text-[10px] mt-1.5 text-center leading-tight ${active ? "text-primary font-medium" : done ? "text-foreground" : "text-muted-foreground"}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BookingDetailModal({
  booking,
  testMap,
  open,
  onClose,
}: {
  booking: Booking;
  testMap: Record<string, string>;
  open: boolean;
  onClose: () => void;
}) {
  const date = new Date(booking.bookingDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-ocid="booking_detail.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            {booking.patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status timeline */}
          <StatusStepper status={booking.status} />

          {/* Details */}
          <div className="card-elevated p-4 space-y-2 text-sm">
            <DetailRow label="Patient ID" value={booking.patientId} />
            <DetailRow
              label="Age / Gender"
              value={`${booking.age} yrs / ${booking.gender}`}
            />
            <DetailRow label="Mobile" value={booking.mobile} />
            {booking.referringDoctor && (
              <DetailRow
                label="Referred By"
                value={`Dr. ${booking.referringDoctor}`}
              />
            )}
            <DetailRow label="Booking Date" value={date} />
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Tests</span>
              <div className="text-right space-y-0.5">
                {booking.testIds.map((id) => (
                  <p key={id} className="font-medium text-foreground text-xs">
                    {testMap[id] ?? id}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Report download */}
          {booking.status === "ReportReady" && booking.reportUrl && (
            <a
              href={booking.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="booking_detail.download_report_button"
            >
              <Button className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            </a>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-ocid="booking_detail.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function SkeletonRows() {
  const keys = ["a", "b", "c", "d", "e"];
  return (
    <>
      {keys.map((k) => (
        <tr key={k}>
          <td className="px-4 py-3" colSpan={5}>
            <Skeleton className="h-5 w-full rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function MyBookingsPage() {
  const { data: bookings = [], isLoading } = usePartnerBookings();
  const { data: tests = [] } = useLabTests();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const testMap = useMemo(
    () => Object.fromEntries(tests.map((t) => [t.id, t.name])),
    [tests],
  );

  const today = new Date().toDateString();

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (
        dateFilter === "today" &&
        new Date(b.bookingDate).toDateString() !== today
      )
        return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (
        search &&
        !b.patientName.toLowerCase().includes(search.toLowerCase()) &&
        !b.patientId.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [bookings, dateFilter, statusFilter, search, today]);

  return (
    <div className="space-y-6" data-ocid="my_bookings.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          My Bookings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and track all your patient bookings
        </p>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 flex flex-wrap gap-3 items-center">
        {/* Today / All toggle */}
        <div className="flex border border-border rounded-md overflow-hidden">
          {(["today", "all"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setDateFilter(v)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                dateFilter === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
              data-ocid={`my_bookings.date_filter.${v}`}
            >
              {v === "today" ? "Today" : "All Time"}
            </button>
          ))}
        </div>

        {/* Status dropdown */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="h-8 text-xs w-[150px]"
            data-ocid="my_bookings.status_filter"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="SampleReceived">Sample Received</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="ReportReady">Report Ready</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs w-48"
            data-ocid="my_bookings.search_input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="my_bookings.table">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Patient ID
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Patient Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                  Tests
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center"
                    data-ocid="my_bookings.empty_state"
                  >
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium text-foreground">
                      No bookings found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your filters
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((booking, idx) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedBooking(booking)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelectedBooking(booking)
                    }
                    tabIndex={0}
                    data-ocid={`my_bookings.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary">
                      {booking.patientId}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {booking.patientName}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {booking.testIds.slice(0, 2).map((id) => (
                          <span
                            key={id}
                            className="text-xs text-muted-foreground"
                          >
                            {testMap[id] ?? id}
                            {booking.testIds.indexOf(id) <
                            Math.min(1, booking.testIds.length - 1)
                              ? ","
                              : ""}
                          </span>
                        ))}
                        {booking.testIds.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{booking.testIds.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-xs">
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          testMap={testMap}
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
