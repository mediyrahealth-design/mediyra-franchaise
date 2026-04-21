import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookPatient, useLabTests } from "@/hooks/useBackend";
import type { BookPatientInput, LabTest } from "@/types";
import { CheckCircle2, ClipboardCopy, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Confirmation {
  patientId: string;
  patientName: string;
  tests: LabTest[];
}

function ConfirmationScreen({
  data,
  onReset,
}: {
  data: Confirmation;
  onReset: () => void;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(data.patientId);
    toast.success("Patient ID copied to clipboard");
  };

  return (
    <div
      className="max-w-lg mx-auto space-y-6"
      data-ocid="book_patient.success_state"
    >
      <div className="card-elevated p-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Booking Confirmed!
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Patient has been registered successfully
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Patient ID</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-display text-2xl font-bold text-primary tracking-wide">
              {data.patientId}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Copy Patient ID"
            >
              <ClipboardCopy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="text-left space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Patient Name</span>
            <span className="font-medium text-foreground">
              {data.patientName}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tests Booked</span>
            <span className="font-medium text-foreground">
              {data.tests.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.tests.map((t) => (
              <Badge
                key={t.id}
                variant="outline"
                className="text-xs border-primary/30 text-primary bg-primary/5"
              >
                {t.name}
              </Badge>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Share the Patient ID with the patient to track their sample status.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          className="flex-1"
          variant="outline"
          onClick={onReset}
          data-ocid="book_patient.book_another_button"
        >
          Book Another Patient
        </Button>
        <Button
          className="flex-1"
          onClick={() => window.history.pushState({}, "", "/partner")}
          data-ocid="book_patient.dashboard_button"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function BookPatientPage() {
  const { data: tests = [], isLoading: testsLoading } = useLabTests();
  const bookMutation = useBookPatient();

  const [form, setForm] = useState<BookPatientInput>({
    patientName: "",
    age: 0,
    gender: "",
    mobile: "",
    referringDoctor: "",
    testIds: [],
  });
  const [testSearch, setTestSearch] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const filteredTests = tests.filter(
    (t) =>
      t.isActive && t.name.toLowerCase().includes(testSearch.toLowerCase()),
  );

  const selectedTests = tests.filter((t) => form.testIds.includes(t.id));

  const toggleTest = (id: string) => {
    setForm((prev) => ({
      ...prev,
      testIds: prev.testIds.includes(id)
        ? prev.testIds.filter((t) => t !== id)
        : [...prev.testIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim()) {
      toast.error("Patient name is required");
      return;
    }
    if (!form.gender) {
      toast.error("Please select gender");
      return;
    }
    if (!form.mobile || form.mobile.length < 10) {
      toast.error("Enter a valid mobile number");
      return;
    }
    if (form.testIds.length === 0) {
      toast.error("Please select at least one test");
      return;
    }

    try {
      const patientId = await bookMutation.mutateAsync(form);
      setConfirmation({
        patientId,
        patientName: form.patientName,
        tests: selectedTests,
      });
    } catch {
      toast.error("Booking failed. Please try again.");
    }
  };

  const resetForm = () => {
    setForm({
      patientName: "",
      age: 0,
      gender: "",
      mobile: "",
      referringDoctor: "",
      testIds: [],
    });
    setTestSearch("");
    setConfirmation(null);
  };

  if (confirmation) {
    return <ConfirmationScreen data={confirmation} onReset={resetForm} />;
  }

  return (
    <div className="space-y-6 max-w-2xl" data-ocid="book_patient.page">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          Book Patient Test
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Register a new patient and select tests
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient Details */}
        <div className="card-elevated p-5 space-y-4">
          <h2 className="font-display font-semibold text-foreground">
            Patient Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="patientName">
                Patient Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patientName"
                placeholder="Full name"
                value={form.patientName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, patientName: e.target.value }))
                }
                data-ocid="book_patient.patient_name_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age">
                Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g. 35"
                min={1}
                max={120}
                value={form.age || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, age: Number(e.target.value) }))
                }
                data-ocid="book_patient.age_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
              >
                <SelectTrigger
                  id="gender"
                  data-ocid="book_patient.gender_select"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="10-digit number"
                value={form.mobile}
                onChange={(e) =>
                  setForm((p) => ({ ...p, mobile: e.target.value }))
                }
                data-ocid="book_patient.mobile_input"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="referringDoctor">
                Referring Doctor{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="referringDoctor"
                placeholder="Dr. Name"
                value={form.referringDoctor}
                onChange={(e) =>
                  setForm((p) => ({ ...p, referringDoctor: e.target.value }))
                }
                data-ocid="book_patient.referring_doctor_input"
              />
            </div>
          </div>
        </div>

        {/* Test Selection */}
        <div className="card-elevated p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">
              Select Tests <span className="text-destructive">*</span>
            </h2>
            {form.testIds.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/30">
                {form.testIds.length} selected
              </Badge>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tests…"
              value={testSearch}
              onChange={(e) => setTestSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
              data-ocid="book_patient.test_search_input"
            />
          </div>

          {testsLoading ? (
            <div className="space-y-2">
              {["a", "b", "c", "d"].map((k) => (
                <Skeleton key={k} className="h-10 rounded" />
              ))}
            </div>
          ) : (
            <div
              className="space-y-1 max-h-64 overflow-y-auto pr-1"
              data-ocid="book_patient.test_list"
            >
              {filteredTests.map((test) => (
                <button
                  key={test.id}
                  type="button"
                  className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors w-full text-left ${
                    form.testIds.includes(test.id)
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                  data-ocid={`book_patient.test_checkbox.${test.id}`}
                  onClick={() => toggleTest(test.id)}
                >
                  <Checkbox
                    checked={form.testIds.includes(test.id)}
                    onCheckedChange={() => toggleTest(test.id)}
                    aria-label={test.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {test.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {test.category} · ₹{test.partnerPrice}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected summary */}
          {selectedTests.length > 0 && (
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display font-bold text-primary text-lg">
                ₹{selectedTests.reduce((s, t) => s + t.partnerPrice, 0)}
              </span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={bookMutation.isPending}
          data-ocid="book_patient.submit_button"
        >
          {bookMutation.isPending ? "Booking…" : "Confirm Booking"}
        </Button>
      </form>
    </div>
  );
}
