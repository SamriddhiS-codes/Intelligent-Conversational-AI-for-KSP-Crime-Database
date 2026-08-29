import { useTranslation } from "react-i18next";

export function RoleBadge({ role }) {
  const { t } = useTranslation();
  const label = t(`role.${role}`, { defaultValue: role });
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-highlight/60 text-ink border border-border">
      {label}
    </span>
  );
}
