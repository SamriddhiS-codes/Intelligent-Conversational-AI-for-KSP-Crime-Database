const LABELS = {
  admin: "Admin",
  investigator: "Investigator",
  analyst: "Analyst",
};

export function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-highlight/60 text-ink border border-border">
      {LABELS[role] || role}
    </span>
  );
}
