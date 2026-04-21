import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabTests, usePartnerBookings } from "@/hooks/useBackend";
import type { Booking } from "@/types";
import { AlertCircle, DollarSign, TestTube, TrendingUp } from "lucide-react";
import { useMemo } from "react";

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="card-elevated p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24 rounded" />
      ) : (
        <>
          <p className="font-display text-2xl font-bold text-foreground">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </>
      )}
    </div>
  );
}

export default function BillingPage() {
  const { data: bookings = [], isLoading: bookingsLoading } =
    usePartnerBookings();
  const { data: tests = [], isLoading: testsLoading } = useLabTests();

  const isLoading = bookingsLoading || testsLoading;

  const testMap = useMemo(
    () => Object.fromEntries(tests.map((t) => [t.id, t])),
    [tests],
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthBookings = useMemo(() => {
    return bookings.filter((b) => {
      const d = new Date(b.bookingDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [bookings, currentMonth, currentYear]);

  const totalEarnings = useMemo(() => {
    return thisMonthBookings.reduce((sum, b) => {
      const testsTotal = b.testIds.reduce((s, id) => {
        return s + (testMap[id]?.partnerPrice ?? 0);
      }, 0);
      return sum + testsTotal;
    }, 0);
  }, [thisMonthBookings, testMap]);

  const getBookingAmount = (b: Booking) =>
    b.testIds.reduce((s, id) => s + (testMap[id]?.partnerPrice ?? 0), 0);

  const monthName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6" data-ocid="billing.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Billing & Earnings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Summary for {monthName}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          label="Total Tests Booked"
          value={isLoading ? "—" : String(thisMonthBookings.length)}
          sub="this month"
          icon={TestTube}
          loading={isLoading}
        />
        <SummaryCard
          label="Total Earnings"
          value={isLoading ? "—" : `₹${totalEarnings.toLocaleString("en-IN")}`}
          sub="partner price total"
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-4">
        <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          Billing is <span className="font-medium">read-only</span>. For payment
          queries, settlements, or invoices, please contact the lab directly.
        </p>
      </div>

      {/* Bookings table */}
      <div className="card-elevated overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">
            This Month's Bookings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="billing.table">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Patient
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
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                ["a", "b", "c", "d", "e"].map((k) => (
                  <tr key={k}>
                    <td className="px-4 py-3" colSpan={5}>
                      <Skeleton className="h-5 w-full rounded" />
                    </td>
                  </tr>
                ))
              ) : thisMonthBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center"
                    data-ocid="billing.empty_state"
                  >
                    <p className="font-medium text-foreground">
                      No bookings this month
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      New bookings will appear here
                    </p>
                  </td>
                </tr>
              ) : (
                thisMonthBookings.map((booking, idx) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`billing.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {booking.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {booking.patientId}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                      {booking.testIds.length} test
                      {booking.testIds.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                        },
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-display font-semibold text-primary">
                      ₹{getBookingAmount(booking).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!isLoading && thisMonthBookings.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/20">
                  <td
                    className="px-4 py-3 font-medium text-foreground text-sm"
                    colSpan={4}
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-display font-bold text-primary text-base">
                    ₹{totalEarnings.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
