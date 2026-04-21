import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAllBookings,
  useLabTests,
  useUpdateBookingStatus,
} from "@/hooks/useBackend";
import type { Booking, BookingStatus } from "@/types";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: "All" | BookingStatus; label: string }[] = [
  { value: "All", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "SampleReceived", label: "Sample Received" },
  { value: "Processing", label: "Processing" },
  { value: "ReportReady", label: "Report Ready" },
];

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isToday(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function DetailRow({
  label,
  value,
}: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4">
      <span className="text-xs text-muted-foreground sm:w-36 shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium">{value}</span>
    </div>
  );
}

function BookingDetailModal({
  booking,
  testMap,
  onClose,
  onStatusChange,
  isPending,
}: {
  booking: Booking;
  testMap: Record<string, string>;
  onClose: () => void;
  onStatusChange: (status: BookingStatus) => void;
  isPending: boolean;
}) {
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-lg" data-ocid="booking.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            Booking — {booking.patientId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info */}
          <div className="card-elevated p-4 space-y-2.5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              Patient Info
            </p>
            <DetailRow label="Patient Name" value={booking.patientName} />
            <DetailRow
              label="Age / Gender"
              value={`${booking.age} years / ${booking.gender}`}
            />
            <DetailRow label="Mobile" value={booking.mobile} />
            <DetailRow
              label="Referring Doctor"
              value={booking.referringDoctor || "—"}
            />
          </div>

          {/* Booking Info */}
          <div className="card-elevated p-4 space-y-2.5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              Booking Info
            </p>
            <DetailRow label="Partner ID" value={booking.partnerId} />
            <DetailRow
              label="Booking Date"
              value={formatDate(booking.bookingDate)}
            />
            <DetailRow
              label="Tests"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {booking.testIds.map((id) => (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {testMap[id] ?? id}
                    </Badge>
                  ))}
                </div>
              }
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={booking.status} />}
            />
            {booking.reportUrl && (
              <DetailRow
                label="Report"
                value={
                  <a
                    href={booking.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline text-sm"
                  >
                    View PDF
                  </a>
                }
              />
            )}
          </div>

          {/* Status update */}
          <Separator />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-sm text-muted-foreground shrink-0">
              Update status:
            </span>
            <Select
              value={booking.status}
              onValueChange={(v) => onStatusChange(v as BookingStatus)}
              disabled={isPending}
            >
              <SelectTrigger
                className="flex-1"
                data-ocid="booking.status_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((s) => s.value !== "All").map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isPending && (
              <span
                className="text-xs text-muted-foreground"
                data-ocid="booking.loading_state"
              >
                Updating…
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              data-ocid="booking.close_button"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BookingManagementPage() {
  const { data: bookings = [], isLoading: bookingsLoading } = useAllBookings();
  const { data: tests = [] } = useLabTests();
  const updateStatus = useUpdateBookingStatus();

  const testMap = useMemo(
    () => Object.fromEntries(tests.map((t) => [t.id, t.name])),
    [tests],
  );

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"All" | "Today">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | BookingStatus>(
    "All",
  );
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const term = search.toLowerCase();
      const matchSearch =
        !term ||
        b.patientId.toLowerCase().includes(term) ||
        b.patientName.toLowerCase().includes(term) ||
        b.partnerId.toLowerCase().includes(term);
      const matchDate = dateFilter === "All" || isToday(b.bookingDate);
      const matchStatus = statusFilter === "All" || b.status === statusFilter;
      return matchSearch && matchDate && matchStatus;
    });
  }, [bookings, search, dateFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleStatusChange = (status: BookingStatus) => {
    if (!selectedBooking) return;
    updateStatus.mutate(
      { bookingId: selectedBooking.id, status },
      {
        onSuccess: () => {
          toast.success("Status updated");
          setSelectedBooking((prev) => (prev ? { ...prev, status } : null));
        },
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  return (
    <div className="space-y-6" data-ocid="bookings.page">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          Booking Management
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          View and manage all patient bookings
        </p>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Patient ID, name, partner…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            data-ocid="bookings.search_input"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch("");
                  setPage(1);
                }
              }}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", "Today"] as const).map((d) => (
            <Button
              key={d}
              variant={dateFilter === d ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setDateFilter(d);
                setPage(1);
              }}
              data-ocid={`bookings.date_filter.${d.toLowerCase()}`}
            >
              {d}
            </Button>
          ))}
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as "All" | BookingStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44" data-ocid="bookings.status_filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="bookings.table">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Patient ID
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Patient Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Partner
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Tests
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookingsLoading ? (
                (["a", "b", "c", "d", "e", "f"] as const).map((k) => (
                  <tr key={k} className="border-b border-border">
                    {(
                      [
                        "pid",
                        "pn",
                        "par",
                        "tests",
                        "date",
                        "st",
                        "act",
                      ] as const
                    ).map((col) => (
                      <td key={col} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center"
                    data-ocid="bookings.empty_state"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CalendarCheck className="h-10 w-10 opacity-30" />
                      <p className="font-medium">No bookings found</p>
                      <p className="text-xs">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((booking, idx) => {
                  const testNames = booking.testIds
                    .map((id) => testMap[id] ?? id)
                    .join(", ");
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setSelectedBooking(booking)
                      }
                      data-ocid={`bookings.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium text-primary">
                        {booking.patientId}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {booking.patientName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {booking.partnerId}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span
                          className="text-muted-foreground text-xs truncate block"
                          title={testNames}
                        >
                          {testNames}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(booking.bookingDate)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                          }}
                          data-ocid={`bookings.edit_button.${idx + 1}`}
                          aria-label="View booking"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!bookingsLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {filtered.length} bookings — page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                data-ocid="bookings.pagination_prev"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                data-ocid="bookings.pagination_next"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          testMap={testMap}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
          isPending={updateStatus.isPending}
        />
      )}
    </div>
  );
}
