import { createContext, useContext, useMemo, useState } from "react";
import { login as loginRequest } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ksp_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (username, password) => {
    const data = await loginRequest(username, password);
    localStorage.setItem("ksp_token", data.access_token);
    localStorage.setItem("ksp_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("ksp_token");
    localStorage.removeItem("ksp_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
