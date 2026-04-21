import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import {
  useCreateLabTest,
  useDeleteLabTest,
  useLabTests,
  useUpdateLabTest,
} from "@/hooks/useBackend";
import type { LabTest } from "@/types";
import { Edit2, FlaskConical, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "Haematology",
  "Biochemistry",
  "Urinalysis",
  "Microbiology",
  "Immunology",
  "Radiology",
  "Pathology",
];

const EMPTY_FORM: Omit<LabTest, "id"> = {
  name: "",
  category: "Biochemistry",
  mrp: 0,
  partnerPrice: 0,
  sampleType: "Blood",
  tubeType: "",
  fastingRequired: false,
  reportTime: "",
  description: "",
  isActive: true,
};

type FormData = Omit<LabTest, "id">;

function TestFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: FormData;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);

  // Reset when dialog opens with new initial data
  const handleOpenChange = (v: boolean) => {
    if (v) setForm(initial);
    onOpenChange(v);
  };

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Test name is required");
      return;
    }
    if (form.mrp <= 0) {
      toast.error("MRP must be greater than 0");
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="test.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {initial === EMPTY_FORM ? "Add New Test" : "Edit Test"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="t-name">Test Name *</Label>
              <Input
                id="t-name"
                data-ocid="test.name_input"
                placeholder="e.g. Complete Blood Count (CBC)"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger data-ocid="test.category_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-sample">Sample Type</Label>
              <Input
                id="t-sample"
                data-ocid="test.sample_type_input"
                placeholder="Blood, Urine, Stool…"
                value={form.sampleType}
                onChange={(e) => set("sampleType", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-mrp">MRP (₹) *</Label>
              <Input
                id="t-mrp"
                type="number"
                min={0}
                data-ocid="test.mrp_input"
                placeholder="0"
                value={form.mrp === 0 ? "" : form.mrp}
                onChange={(e) => set("mrp", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-partner">Partner Price (₹)</Label>
              <Input
                id="t-partner"
                type="number"
                min={0}
                data-ocid="test.partner_price_input"
                placeholder="0"
                value={form.partnerPrice === 0 ? "" : form.partnerPrice}
                onChange={(e) => set("partnerPrice", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-tube">Tube Type</Label>
              <Input
                id="t-tube"
                data-ocid="test.tube_type_input"
                placeholder="EDTA, SST, Fluoride…"
                value={form.tubeType}
                onChange={(e) => set("tubeType", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-report-time">Report Time</Label>
              <Input
                id="t-report-time"
                data-ocid="test.report_time_input"
                placeholder="e.g. 4 Hours"
                value={form.reportTime}
                onChange={(e) => set("reportTime", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="t-desc">Description</Label>
              <Input
                id="t-desc"
                data-ocid="test.description_input"
                placeholder="Brief description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.fastingRequired}
                onCheckedChange={(v) => set("fastingRequired", v)}
                data-ocid="test.fasting_switch"
              />
              <Label>Fasting Required</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => set("isActive", v)}
                data-ocid="test.active_switch"
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="test.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="test.submit_button"
            >
              {isPending ? "Saving…" : "Save Test"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TestManagementPage() {
  const { data: tests = [], isLoading } = useLabTests();
  const createMut = useCreateLabTest();
  const updateMut = useUpdateLabTest();
  const deleteMut = useDeleteLabTest();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LabTest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LabTest | null>(null);

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        categoryFilter === "All" || t.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [tests, search, categoryFilter]);

  const openAdd = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };
  const openEdit = (t: LabTest) => {
    setEditTarget(t);
    setDialogOpen(true);
  };

  const handleSubmit = (data: FormData) => {
    if (editTarget) {
      updateMut.mutate(
        { ...data, id: editTarget.id },
        {
          onSuccess: () => {
            toast.success("Test updated");
            setDialogOpen(false);
          },
          onError: () => toast.error("Failed to update test"),
        },
      );
    } else {
      createMut.mutate(data, {
        onSuccess: () => {
          toast.success("Test created");
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to create test"),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Test deleted");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete test"),
    });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6" data-ocid="tests.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Test Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your lab test catalogue
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="tests.add_button"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Test
        </Button>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests by name…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="tests.search_input"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              onKeyDown={(e) => e.key === "Enter" && setSearch("")}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger
            className="w-full sm:w-48"
            data-ocid="tests.category_filter"
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="tests.table">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Test Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  MRP (₹)
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Partner (₹)
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Sample
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Tube
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Fasting
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Report Time
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                (["a", "b", "c", "d", "e"] as const).map((k) => (
                  <tr key={k} className="border-b border-border">
                    {(
                      [
                        "n",
                        "cat",
                        "mrp",
                        "pp",
                        "st",
                        "tt",
                        "f",
                        "rt",
                        "s",
                        "act",
                      ] as const
                    ).map((col) => (
                      <td key={col} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center"
                    data-ocid="tests.empty_state"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FlaskConical className="h-10 w-10 opacity-30" />
                      <p className="font-medium">No tests found</p>
                      <p className="text-xs">
                        Try adjusting your search or filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((test, idx) => (
                  <tr
                    key={test.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => openEdit(test)}
                    onKeyDown={(e) => e.key === "Enter" && openEdit(test)}
                    data-ocid={`tests.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px]">
                      <span className="truncate block">{test.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {test.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      ₹{test.mrp}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-primary font-medium">
                      ₹{test.partnerPrice}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {test.sampleType}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {test.tubeType}
                    </td>
                    <td className="px-4 py-3">
                      {test.fastingRequired ? (
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-500/40 text-amber-700"
                        >
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {test.reportTime}
                    </td>
                    <td className="px-4 py-3">
                      {test.isActive ? (
                        <Badge
                          className="text-xs bg-primary/10 text-primary border-primary/30"
                          variant="outline"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(test)}
                          data-ocid={`tests.edit_button.${idx + 1}`}
                          aria-label="Edit test"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(test)}
                          data-ocid={`tests.delete_button.${idx + 1}`}
                          aria-label="Delete test"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} test{filtered.length !== 1 ? "s" : ""} shown
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <TestFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editTarget ? { ...editTarget } : EMPTY_FORM}
        onSubmit={handleSubmit}
        isPending={isPending}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="tests.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="tests.delete_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="tests.delete_confirm_button"
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
