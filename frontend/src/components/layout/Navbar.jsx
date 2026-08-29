import { Bell, ShieldHalf, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { RoleBadge } from "../common/RoleBadge";

export function Navbar({ searchSlot, onLogoClick, onMenuClick }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const today = new Date().toLocaleDateString(i18n.language === "kn" ? "kn-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="h-16 flex items-center justify-between gap-2 px-3 sm:px-6 border-b border-border bg-bg-primary/90 backdrop-blur-sm sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-highlight/50 transition-colors"
      >
        <Menu className="w-5 h-5 text-ink-muted" strokeWidth={1.75} />
      </button>

      <button
        onClick={onLogoClick}
        className="flex items-center gap-2 shrink-0 min-w-0"
      >
        <ShieldHalf className="w-5 h-5 text-accent shrink-0" strokeWidth={1.75} />
        <span className="hidden sm:inline font-semibold text-ink text-[15px] truncate">
          {t("app.title")}
        </span>
      </button>

      <div className="flex-1 min-w-0 max-w-xl mx-1 sm:mx-6">{searchSlot}</div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <span className="hidden md:inline text-sm text-ink-muted">{today}</span>
        <button
          aria-label="Notifications"
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center hover:bg-highlight/50 transition-colors"
        >
          <Bell className="w-4.5 h-4.5 text-ink-muted" strokeWidth={1.75} />
        </button>
        {user && (
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-border">
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
