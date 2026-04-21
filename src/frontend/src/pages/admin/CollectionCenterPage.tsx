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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useCollectionCenters,
  useCreateCollectionCenter,
  useUpdateCollectionCenter,
} from "@/hooks/useBackend";
import type { CollectionCenter } from "@/types";
import { Building2, Edit2, Eye, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type CenterFormData = Omit<
  CollectionCenter,
  "id" | "createdAt" | "assignedPrincipal"
>;

const EMPTY_FORM: CenterFormData = {
  name: "",
  contactPerson: "",
  mobile: "",
  city: "",
  address: "",
  status: "active",
};

function CenterFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isPending,
  editMode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: CenterFormData;
  onSubmit: (data: CenterFormData) => void;
  isPending: boolean;
  editMode: boolean;
}) {
  const [form, setForm] = useState<CenterFormData>(initial);

  const handleOpenChange = (v: boolean) => {
    if (v) setForm(initial);
    onOpenChange(v);
  };

  const set = <K extends keyof CenterFormData>(
    key: K,
    value: CenterFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Center name is required");
      return;
    }
    if (!form.mobile.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg" data-ocid="center.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {editMode ? "Edit Collection Center" : "Add Collection Center"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="c-name">Center Name *</Label>
              <Input
                id="c-name"
                data-ocid="center.name_input"
                placeholder="e.g. City Diagnostics Pvt. Ltd."
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-contact">Contact Person</Label>
              <Input
                id="c-contact"
                data-ocid="center.contact_input"
                placeholder="Full name"
                value={form.contactPerson}
                onChange={(e) => set("contactPerson", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-mobile">Mobile *</Label>
              <Input
                id="c-mobile"
                data-ocid="center.mobile_input"
                placeholder="+91 98765 43210"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-city">City</Label>
              <Input
                id="c-city"
                data-ocid="center.city_input"
                placeholder="e.g. Mumbai"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="c-address">Address</Label>
              <Input
                id="c-address"
                data-ocid="center.address_input"
                placeholder="Full address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.status === "active"}
                onCheckedChange={(v) =>
                  set("status", v ? "active" : "inactive")
                }
                data-ocid="center.status_switch"
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="center.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="center.submit_button"
            >
              {isPending ? "Saving…" : editMode ? "Save Changes" : "Add Center"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
}: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4">
      <span className="text-xs text-muted-foreground sm:w-32 shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium">{value}</span>
    </div>
  );
}

function CenterDetailDialog({
  center,
  onClose,
  onEdit,
}: {
  center: CollectionCenter;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-md" data-ocid="center.detail_dialog">
        <DialogHeader>
          <DialogTitle className="font-display">{center.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="card-elevated p-4 space-y-2.5">
            <DetailRow
              label="Contact Person"
              value={center.contactPerson || "—"}
            />
            <DetailRow label="Mobile" value={center.mobile} />
            <DetailRow label="City" value={center.city || "—"} />
            <DetailRow label="Address" value={center.address || "—"} />
            <DetailRow
              label="Status"
              value={
                <Badge
                  variant="outline"
                  className={
                    center.status === "active"
                      ? "text-xs bg-primary/10 text-primary border-primary/30"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {center.status === "active" ? "Active" : "Inactive"}
                </Badge>
              }
            />
            <DetailRow
              label="Registered"
              value={new Date(center.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              data-ocid="center.close_button"
            >
              Close
            </Button>
            <Button onClick={onEdit} data-ocid="center.edit_button">
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CollectionCenterPage() {
  const { data: centers = [], isLoading } = useCollectionCenters();
  const createMut = useCreateCollectionCenter();
  const updateMut = useUpdateCollectionCenter();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CollectionCenter | null>(null);
  const [viewTarget, setViewTarget] = useState<CollectionCenter | null>(null);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return centers;
    return centers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.contactPerson.toLowerCase().includes(term),
    );
  }, [centers, search]);

  const handleAdd = (data: CenterFormData) => {
    createMut.mutate(data, {
      onSuccess: () => {
        toast.success("Collection center added");
        setAddOpen(false);
      },
      onError: () => toast.error("Failed to add center"),
    });
  };

  // Edit handler — calls real update mutation
  const handleEdit = (data: CenterFormData) => {
    if (!editTarget) return;
    updateMut.mutate(
      { ...editTarget, ...data },
      {
        onSuccess: () => {
          toast.success("Collection center updated");
          setEditTarget(null);
        },
        onError: () => toast.error("Failed to update center"),
      },
    );
  };

  return (
    <div className="space-y-6" data-ocid="centers.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Collection Centers
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your B2B partner collection centers
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          data-ocid="centers.add_button"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Center
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Centers",
            value: centers.length,
            color: "text-foreground",
          },
          {
            label: "Active",
            value: centers.filter((c) => c.status === "active").length,
            color: "text-primary",
          },
          {
            label: "Inactive",
            value: centers.filter((c) => c.status === "inactive").length,
            color: "text-muted-foreground",
          },
          {
            label: "Cities",
            value: new Set(centers.map((c) => c.city).filter(Boolean)).size,
            color: "text-foreground",
          },
        ].map((stat) => (
          <div key={stat.label} className="card-elevated p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p
              className={`text-2xl font-bold font-display mt-0.5 ${stat.color}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card-elevated p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, contact…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="centers.search_input"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch("");
              }}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="centers.table">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Center Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Contact Person
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Mobile
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  City
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                (["a", "b", "c", "d"] as const).map((k) => (
                  <tr key={k} className="border-b border-border">
                    {(
                      [
                        "name",
                        "contact",
                        "mobile",
                        "city",
                        "status",
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
                    colSpan={6}
                    className="px-4 py-12 text-center"
                    data-ocid="centers.empty_state"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="h-10 w-10 opacity-30" />
                      <p className="font-medium">No collection centers yet</p>
                      <p className="text-xs">
                        Add your first partner center to get started
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setAddOpen(true)}
                        data-ocid="centers.empty_add_button"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Center
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((center, idx) => (
                  <tr
                    key={center.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setViewTarget(center)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setViewTarget(center);
                    }}
                    data-ocid={`centers.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {center.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {center.contactPerson || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {center.mobile}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {center.city || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          center.status === "active"
                            ? "text-xs bg-primary/10 text-primary border-primary/30"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {center.status === "active" ? "Active" : "Inactive"}
                      </Badge>
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
                          onClick={() => setViewTarget(center)}
                          data-ocid={`centers.view_button.${idx + 1}`}
                          aria-label="View center"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setViewTarget(null);
                            setEditTarget(center);
                          }}
                          data-ocid={`centers.edit_button.${idx + 1}`}
                          aria-label="Edit center"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
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
            {filtered.length} center{filtered.length !== 1 ? "s" : ""} shown
          </div>
        )}
      </div>

      {/* Add dialog */}
      <CenterFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={EMPTY_FORM}
        onSubmit={handleAdd}
        isPending={createMut.isPending}
        editMode={false}
      />

      {/* Edit dialog */}
      {editTarget && (
        <CenterFormDialog
          open={!!editTarget}
          onOpenChange={(v) => {
            if (!v) setEditTarget(null);
          }}
          initial={{
            name: editTarget.name,
            contactPerson: editTarget.contactPerson,
            mobile: editTarget.mobile,
            city: editTarget.city,
            address: editTarget.address,
            status: editTarget.status,
          }}
          onSubmit={handleEdit}
          isPending={updateMut.isPending}
          editMode={true}
        />
      )}

      {/* View detail */}
      {viewTarget && (
        <CenterDetailDialog
          center={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={() => {
            setEditTarget(viewTarget);
            setViewTarget(null);
          }}
        />
      )}
    </div>
  );
}
