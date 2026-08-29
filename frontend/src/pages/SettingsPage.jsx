import { useTranslation } from "react-i18next";
import { ShieldHalf, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LanguageToggle } from "../components/home/LanguageToggle";
import { RoleBadge } from "../components/common/RoleBadge";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const language = i18n.language === "kn" ? "kn" : "en";
  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("ksp_lang", lang);
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">{t("settingsPage.title")}</h1>
      <p className="text-ink-muted text-sm mb-8">{t("settingsPage.subtitle")}</p>

      {/* Account */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 mb-5">
        <h3 className="text-sm font-semibold text-ink mb-4">{t("settingsPage.account")}</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-highlight/60 flex items-center justify-center shrink-0">
            <ShieldHalf className="w-5 h-5 text-accent" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink truncate">{user?.username}</p>
            {user?.email && (
              <p className="text-xs text-ink-muted truncate">{user.email}</p>
            )}
          </div>
          {user?.role && <RoleBadge role={user.role} />}
        </div>
      </div>

      {/* Language */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 mb-5">
        <h3 className="text-sm font-semibold text-ink mb-1">{t("settingsPage.language")}</h3>
        <p className="text-xs text-ink-muted mb-4">{t("settingsPage.languageDesc")}</p>
        <LanguageToggle language={language} onChange={setLanguage} />
      </div>

      {/* Notifications (placeholder — no backend support yet) */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 mb-5">
        <h3 className="text-sm font-semibold text-ink mb-1">{t("settingsPage.notifications")}</h3>
        <p className="text-xs text-ink-muted">{t("settingsPage.notificationsDesc")}</p>
      </div>

      {/* About */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 mb-5">
        <h3 className="text-sm font-semibold text-ink mb-1">{t("settingsPage.about")}</h3>
        <p className="text-xs text-ink-muted">{t("app.title")} · v1.0.0</p>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm font-medium text-[#8A4A3E] hover:opacity-80 transition-opacity"
      >
        <LogOut className="w-4 h-4" strokeWidth={1.75} />
        {t("nav.logOut")}
      </button>
    </div>
  );
}
