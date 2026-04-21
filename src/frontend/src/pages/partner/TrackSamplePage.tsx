import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabTests } from "@/hooks/useBackend";
import type { Booking, BookingStatus } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Download,
  Loader2,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_STEPS: {
  key: BookingStatus;
  label: string;
  description: string;
}[] = [
  {
    key: "Pending",
    label: "Booking Created",
    description: "Sample collection is pending",
  },
  {
    key: "SampleReceived",
    label: "Sample Received",
    description: "Sample received at lab",
  },
  {
    key: "Processing",
    label: "Processing",
    description: "Analysis in progress",
  },
  {
    key: "ReportReady",
    label: "Report Ready",
    description: "Download your report",
  },
];

function StatusTimeline({ booking }: { booking: Booking }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === booking.status);

  return (
    <div className="space-y-0" data-ocid="track_sample.stepper">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const isLast = idx === STATUS_STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Left column: icon + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : done
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-10 ${done ? "bg-primary/40" : "bg-border"}`}
                />
              )}
            </div>

            {/* Right column: text */}
            <div className="pb-8 pt-1 min-w-0">
              <p
                className={`font-medium text-sm leading-tight ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackSamplePage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { data: tests = [] } = useLabTests();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testMap = useMemo(
    () => Object.fromEntries(tests.map((t) => [t.id, t.name])),
    [tests],
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearchTerm(trimmed);
    setSearching(true);
    setError(null);
    setBooking(undefined);

    try {
      if (!actor) {
        setError("Backend not ready. Please try again.");
        return;
      }
      // @ts-expect-error method added when backend is ready
      if (typeof actor.getBookingByPatientId !== "function") {
        setBooking(null);
        return;
      }
      // @ts-expect-error method added when backend is ready
      const result = await actor.getBookingByPatientId(trimmed);
      setBooking(result ?? null);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg" data-ocid="track_sample.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Track Sample
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search by Patient ID or mobile number to track status
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="card-elevated p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="trackQuery">Patient ID or Mobile Number</Label>
          <div className="flex gap-2">
            <Input
              id="trackQuery"
              placeholder="e.g. MED1234567890 or 9876543210"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-ocid="track_sample.search_input"
            />
            <Button
              type="submit"
              disabled={searching || actorFetching || !query.trim()}
              data-ocid="track_sample.search_button"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Loading */}
      {searching && (
        <div
          className="card-elevated p-6 space-y-3"
          data-ocid="track_sample.loading_state"
        >
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-8 w-full rounded" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !searching && (
        <div
          className="card-elevated p-5 flex items-start gap-3 border-destructive/20"
          data-ocid="track_sample.error_state"
        >
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Not found */}
      {!searching && !error && booking === null && searchTerm && (
        <div
          className="card-elevated p-8 text-center space-y-3"
          data-ocid="track_sample.empty_state"
        >
          <Search className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-medium text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground">
            No booking found for{" "}
            <span className="font-mono font-medium text-foreground">
              "{searchTerm}"
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Check the Patient ID or mobile number and try again
          </p>
        </div>
      )}

      {/* Found */}
      {!searching && booking && (
        <div
          className="card-elevated p-5 space-y-5"
          data-ocid="track_sample.result_card"
        >
          {/* Patient info */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display font-bold text-foreground text-lg">
                {booking.patientName}
              </p>
              <p className="text-xs font-mono text-primary">
                {booking.patientId}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>
                {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="mt-0.5">
                {booking.age}y · {booking.gender}
              </p>
            </div>
          </div>

          {/* Tests */}
          <div className="text-sm">
            <p className="text-muted-foreground text-xs mb-1.5">Tests</p>
            <div className="flex flex-wrap gap-1.5">
              {booking.testIds.map((id) => (
                <span
                  key={id}
                  className="text-xs bg-primary/5 border border-primary/20 text-primary rounded px-2 py-0.5"
                >
                  {testMap[id] ?? id}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-4">Sample Status</p>
            <StatusTimeline booking={booking} />
          </div>

          {/* Report download */}
          {booking.status === "ReportReady" && booking.reportUrl && (
            <a
              href={booking.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="track_sample.download_report_button"
            >
              <Button className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
