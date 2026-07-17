import { useEffect, useState } from "react";
import { client } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function UsersPage() {
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
      const res = await client.get("/auth/users");
      setUsers(res.data);
    } catch {
      setUsers([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    setError(""); setSuccess("");
    try {
      await client.post("/auth/register", form);
      setSuccess(`User "${form.username}" created successfully!`);
      setForm({ username: "", email: "", password: "", role: "investigator" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create user");
    }
  };

  const ROLES = ["admin", "investigator", "analyst"];
  const ROLE_COLORS = {
    admin: "bg-purple-100 text-purple-700",
    investigator: "bg-blue-100 text-blue-700",
    analyst: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">User Management</h1>
          <p className="text-ink-muted text-sm">Manage investigator and analyst accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
          + New User
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
          <h3 className="font-semibold text-ink mb-4">Create New User</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1 block">Username</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="e.g. officer_raju" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1 block">Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="officer@ksp.gov.in" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1 block">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1 block">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent bg-white">
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate}
              className="bg-accent text-white px-5 py-2 rounded-xl text-sm font-semibold">
              Create User
            </button>
            <button onClick={() => setShowForm(false)}
              className="border border-border text-ink-muted px-5 py-2 rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">
          {loading ? "Loading users..." : `${users.length} user${users.length !== 1 ? "s" : ""}`}
        </h3>

        {users.length === 0 && !loading ? (
          <div className="text-center py-12 text-ink-muted">
            <p className="text-sm">Default users: admin, investigator, analyst</p>
            <p className="text-xs mt-1">Use "+ New User" to create additional accounts</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary">
                  {["Username","Email","Role","Status","Created"].map(h => (
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
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.is_active ? "Active" : "Inactive"}
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
