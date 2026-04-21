import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabTests } from "@/hooks/useBackend";
import type { LabTest } from "@/types";
import { ChevronDown, ChevronUp, Search, TestTube2 } from "lucide-react";
import { useMemo, useState } from "react";

function TestCard({ test }: { test: LabTest }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      className="card-interactive p-5 space-y-3 text-left w-full"
      data-ocid="price_list.item"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm leading-snug truncate">
            {test.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {test.category}
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs shrink-0 border-primary/30 text-primary bg-primary/5"
        >
          {test.sampleType}
        </Badge>
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground line-through">
          MRP ₹{test.mrp}
        </span>
        <span className="text-base font-bold text-primary">
          ₹{test.partnerPrice}
        </span>
        <span className="text-xs text-muted-foreground">partner price</span>
      </div>

      {/* Expand toggle */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TestTube2 className="h-3 w-3" />
          {test.tubeType}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          className="pt-3 border-t border-border space-y-2 text-xs"
          data-ocid="price_list.item.detail_panel"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/40 rounded p-2">
              <p className="text-muted-foreground">Fasting Required</p>
              <p
                className={`font-medium mt-0.5 ${test.fastingRequired ? "text-destructive" : "text-primary"}`}
              >
                {test.fastingRequired ? "Yes" : "No"}
              </p>
            </div>
            <div className="bg-muted/40 rounded p-2">
              <p className="text-muted-foreground">Report Time</p>
              <p className="font-medium text-foreground mt-0.5">
                {test.reportTime}
              </p>
            </div>
          </div>
          {test.description && (
            <p className="text-muted-foreground leading-relaxed">
              {test.description}
            </p>
          )}
        </div>
      )}
    </button>
  );
}

function LoadingGrid() {
  const skels = ["a", "b", "c", "d", "e", "f"];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skels.map((k) => (
        <Skeleton key={k} className="h-36 rounded-lg" />
      ))}
    </div>
  );
}

export default function PriceListPage() {
  const { data: tests = [], isLoading } = useLabTests();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo<string[]>(() => {
    const cats = Array.from(new Set(tests.map((t) => t.category)));
    return ["All", ...cats];
  }, [tests]);

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        !search || t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCat && t.isActive;
    });
  }, [tests, search, activeCategory]);

  return (
    <div className="space-y-6" data-ocid="price_list.page">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Price List
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse available tests with your exclusive partner pricing
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="card-elevated p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="price_list.search_input"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className="text-xs h-7 rounded-full"
              onClick={() => setActiveCategory(cat)}
              data-ocid={`price_list.category_filter.${cat.toLowerCase().replace(/\s+/g, "_")}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          test{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <LoadingGrid />
      ) : filtered.length === 0 ? (
        <div
          className="card-elevated p-12 text-center space-y-3"
          data-ocid="price_list.empty_state"
        >
          <TestTube2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-medium text-foreground">No tests found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search term or category
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setActiveCategory("All");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}
