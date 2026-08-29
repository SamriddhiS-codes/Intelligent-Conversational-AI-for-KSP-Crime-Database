import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  Sparkles,
  FileSearch,
  Network,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Map,
  FilePlus2,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ITEM_DEFS = [
  { to: "/", icon: LayoutGrid, key: "dashboard" },
  { to: "/workspace", icon: Sparkles, key: "aiWorkspace" },
  { to: "/fir-search", icon: FileSearch, key: "firSearch" },
  { to: "/new-case", icon: FilePlus2, key: "logNewCase" },
  { to: "/network", icon: Network, key: "criminalNetwork" },
  { to: "/hotspots", icon: Map, key: "hotspotMap" },
  { to: "/reports", icon: FileText, key: "reports" },
  { to: "/analytics", icon: BarChart3, key: "analytics" },
];

function navLinkClass({ isActive }) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
    isActive
      ? "bg-highlight text-accent font-medium"
      : "text-ink-muted hover:bg-highlight/50 hover:text-ink"
  }`;
}

function SidebarNav({ showLabels, onNavigate }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="flex flex-col gap-1 pt-6 px-3">
        {ITEM_DEFS.map(({ to, icon: Icon, key }) => (
          <NavLink key={key} to={to} end={to === "/"} className={navLinkClass} onClick={onNavigate}>
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            {showLabels && <span className="text-sm whitespace-nowrap">{t(`nav.${key}`)}</span>}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink to="/users" className={navLinkClass} onClick={onNavigate}>
            <Users className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            {showLabels && <span className="text-sm whitespace-nowrap">{t("nav.userManagement")}</span>}
          </NavLink>
        )}
      </nav>

      <div className="px-3 pb-6 flex flex-col gap-1">
        <NavLink to="/settings" className={navLinkClass} onClick={onNavigate}>
          <Settings className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          {showLabels && <span className="text-sm">{t("nav.settings")}</span>}
        </NavLink>
        <button
          onClick={() => { logout(); onNavigate?.(); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-muted hover:bg-highlight/50 hover:text-ink transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          {showLabels && <span className="text-sm">{t("nav.logOut")}</span>}
        </button>
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen = false, onClose }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Desktop: hover-to-expand sticky sidebar, unchanged behavior, hidden below lg */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`hidden lg:flex shrink-0 h-screen sticky top-0 border-r border-border bg-bg-secondary flex-col justify-between transition-all duration-300 ease-out z-40 ${
          expanded ? "w-52" : "w-[68px]"
        }`}
      >
        <SidebarNav showLabels={expanded} />
      </aside>

      {/* Mobile: off-canvas drawer, only rendered/interactive below lg */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-64 bg-bg-secondary border-r border-border flex flex-col justify-between transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end px-3 pt-3">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-highlight/50 text-ink-muted"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-between overflow-y-auto -mt-3">
            <SidebarNav showLabels onNavigate={onClose} />
          </div>
        </aside>
      </div>
    </>
  );
}
