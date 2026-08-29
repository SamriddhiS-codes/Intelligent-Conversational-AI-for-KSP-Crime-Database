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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ITEM_DEFS = [
  { to: "/", icon: LayoutGrid, key: "dashboard" },
  { to: "/workspace", icon: Sparkles, key: "aiWorkspace" },
  { to: "/fir-search", icon: FileSearch, key: "firSearch" },
  { to: "/network", icon: Network, key: "criminalNetwork" },
  { to: "/hotspots", icon: Map, key: "hotspotMap" },
  { to: "/reports", icon: FileText, key: "reports" },
  { to: "/analytics", icon: BarChart3, key: "analytics" },
];

export function Sidebar() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`shrink-0 h-screen sticky top-0 border-r border-border bg-bg-secondary flex flex-col justify-between transition-all duration-300 ease-out z-40 ${
        expanded ? "w-52" : "w-[68px]"
      }`}
    >
      <nav className="flex flex-col gap-1 pt-6 px-3">
        {ITEM_DEFS.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={key}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-highlight text-accent font-medium"
                  : "text-ink-muted hover:bg-highlight/50 hover:text-ink"
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            {expanded && (
              <span className="text-sm whitespace-nowrap">{t(`nav.${key}`)}</span>
            )}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-highlight text-accent font-medium"
                  : "text-ink-muted hover:bg-highlight/50 hover:text-ink"
              }`
            }
          >
            <Users className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            {expanded && (
              <span className="text-sm whitespace-nowrap">{t("nav.userManagement")}</span>
            )}
          </NavLink>
        )}
      </nav>

      <div className="px-3 pb-6 flex flex-col gap-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              isActive
                ? "bg-highlight text-accent font-medium"
                : "text-ink-muted hover:bg-highlight/50 hover:text-ink"
            }`
          }
        >
          <Settings className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          {expanded && <span className="text-sm">{t("nav.settings")}</span>}
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-muted hover:bg-highlight/50 hover:text-ink transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          {expanded && <span className="text-sm">{t("nav.logOut")}</span>}
        </button>
      </div>
    </aside>
  );
}
