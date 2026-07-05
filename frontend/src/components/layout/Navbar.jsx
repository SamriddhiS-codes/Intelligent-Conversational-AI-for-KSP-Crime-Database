import { Bell, ShieldHalf } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { RoleBadge } from "../common/RoleBadge";

export function Navbar({ searchSlot, onLogoClick }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-bg-primary/90 backdrop-blur-sm sticky top-0 z-30">
      <button
        onClick={onLogoClick}
        className="flex items-center gap-2 shrink-0"
      >
        <ShieldHalf className="w-5 h-5 text-accent" strokeWidth={1.75} />
        <span className="font-semibold text-ink text-[15px]">
          KSP Intelligence AI
        </span>
      </button>

      <div className="flex-1 max-w-xl mx-6">{searchSlot}</div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden md:inline text-sm text-ink-muted">{today}</span>
        <button
          aria-label="Notifications"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-highlight/50 transition-colors"
        >
          <Bell className="w-4.5 h-4.5 text-ink-muted" strokeWidth={1.75} />
        </button>
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-ink leading-none">
                {user.username}
              </p>
            </div>
            <RoleBadge role={user.role} />
          </div>
        )}
      </div>
    </header>
  );
}
