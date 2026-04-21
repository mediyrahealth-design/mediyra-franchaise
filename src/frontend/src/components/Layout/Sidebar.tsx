import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { FlaskConical, LogOut } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  ocid: string;
}

interface SidebarProps {
  navItems: NavItem[];
  sidebarRole: "admin" | "partner";
}

export function Sidebar({ navItems, sidebarRole }: SidebarProps) {
  const { logout, profileName } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-primary/20">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <FlaskConical className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-foreground leading-tight text-sm truncate">
            Mediyra Lab
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {sidebarRole === "admin" ? "Admin Panel" : "Partner Portal"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.to ||
            (item.to !== "/" && currentPath.startsWith(item.to));

          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={item.ocid}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-smooth",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-border space-y-1">
        {profileName && (
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground truncate">
              Logged in as
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {profileName}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          data-ocid="nav.logout_button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
