import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { client } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function UsersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "investigator" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Only admin can access
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  const fetchUsers = async () => {
    try {
      const res = await client.get("api/auth/users");
      setUsers(res.data);
    } catch {
      setUsers([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    setError(""); setSuccess("");
    try {
      await client.post("api/auth/register", form);
      setSuccess(t("usersPage.userCreated", { username: form.username }));
      setForm({ username: "", email: "", password: "", role: "investigator" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || t("usersPage.createFailed"));
    }
  };

  const ROLES = ["admin", "investigator", "analyst"];
  const ROLE_COLORS = {
    admin: "bg-purple-100 text-purple-700",
    investigator: "bg-blue-100 text-blue-700",
    analyst: "bg-green-100 text-green-700",
  };

  const tableHeaders = [
    t("usersPage.table.username"),
    t("usersPage.table.email"),
    t("usersPage.table.role"),
    t("usersPage.table.status"),
    t("usersPage.table.created"),
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">{t("usersPage.title")}</h1>
          <p className="text-ink-muted text-sm">{t("usersPage.subtitle")}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
          {t("usersPage.newUser")}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 rounded-xl p-4 mb-6 text-sm">✅ {success}</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6 text-sm">❌ {error}</div>
      )}

      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">{t("usersPage.createNewUser")}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1 block">{t("usersPage.username")}</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder={t("usersPage.usernamePlaceholder")} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1 block">{t("usersPage.email")}</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder={t("usersPage.emailPlaceholder")} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1 block">{t("usersPage.password")}</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder={t("usersPage.passwordPlaceholder")} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1 block">{t("usersPage.role")}</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent bg-white">
                {ROLES.map(r => <option key={r} value={r}>{t(`role.${r}`, { defaultValue: r })}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate}
              className="bg-accent text-white px-5 py-2 rounded-xl text-sm font-semibold">
              {t("usersPage.createUser")}
            </button>
            <button onClick={() => setShowForm(false)}
              className="border border-border text-ink-muted px-5 py-2 rounded-xl text-sm">
              {t("usersPage.cancel")}
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">
          {loading ? t("usersPage.loadingUsers") : t("usersPage.userCount", { count: users.length })}
        </h3>

        {users.length === 0 && !loading ? (
          <div className="text-center py-12 text-ink-muted">
            <p className="text-sm">{t("usersPage.defaultUsersNote")}</p>
            <p className="text-xs mt-1">{t("usersPage.newUserHint")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary">
                  {tableHeaders.map(h => (
                    <th key={h} className="text-left p-3 text-ink-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="border-t border-border hover:bg-bg-secondary/50">
                    <td className="p-3 font-medium text-ink">{u.username}</td>
                    <td className="p-3 text-ink-muted">{u.email}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700"}`}>
                        {t(`role.${u.role}`, { defaultValue: u.role })}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.is_active ? t("usersPage.active") : t("usersPage.inactive")}
                      </span>
                    </td>
                    <td className="p-3 text-ink-muted text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
