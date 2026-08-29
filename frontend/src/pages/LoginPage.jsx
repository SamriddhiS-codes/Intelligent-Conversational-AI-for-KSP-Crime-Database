import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldHalf, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.detail || t("login.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-card border border-border rounded-card shadow-soft p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-full bg-highlight/50 flex items-center justify-center mb-4">
            <ShieldHalf className="w-5 h-5 text-accent" strokeWidth={1.75} />
          </div>
          <h1 className="text-lg font-semibold text-ink">{t("login.title")}</h1>
          <p className="text-sm text-ink-muted mt-1">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">
              {t("login.username")}
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-border text-sm text-ink outline-none focus:border-accent/50 transition-colors"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">
              {t("login.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-border text-sm text-ink outline-none focus:border-accent/50 transition-colors"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-xs text-[#8A4A3E]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("login.signIn")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
