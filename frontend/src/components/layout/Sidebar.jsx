import { useState } from "react";
import { NavLink } from "react-router-dom";
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

const ITEMS = [
  { to: "/", icon: LayoutGrid, label: "Dashboard" },
  { to: "/workspace", icon: Sparkles, label: "AI Workspace" },
  { to: "/fir-search", icon: FileSearch, label: "FIR Search" },
  { to: "/network", icon: Network, label: "Criminal Network" },
  { to: "/hotspots", icon: Map, label: "Hotspot Map" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export function Sidebar() {
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
        {ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
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
              <span className="text-sm whitespace-nowrap">{label}</span>
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
              <span className="text-sm whitespace-nowrap">User Management</span>
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
          {expanded && <span className="text-sm">Settings</span>}
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-muted hover:bg-highlight/50 hover:text-ink transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          {expanded && <span className="text-sm">Log out</span>}
        </button>
      </div>
    </aside>
  );
}