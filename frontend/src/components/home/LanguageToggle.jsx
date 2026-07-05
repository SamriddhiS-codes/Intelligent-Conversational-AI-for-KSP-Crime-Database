export function LanguageToggle({ language, onChange }) {
  return (
    <div className="flex items-center bg-bg-secondary rounded-full p-1 border border-border">
      {[
        { code: "en", label: "EN" },
        { code: "kn", label: "ಕನ್ನಡ" },
      ].map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            language === code
              ? "bg-card text-ink shadow-soft"
              : "text-ink-muted hover:text-ink"
          } ${code === "kn" ? "font-kannada" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
