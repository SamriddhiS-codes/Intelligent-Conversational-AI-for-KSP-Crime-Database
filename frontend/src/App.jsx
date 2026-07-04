import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { HeroSearch } from "./components/home/HeroSearch";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";

function ProtectedLayout({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <NavbarWithSearch />
        {children}
      </div>
    </div>
  );
}

function NavbarWithSearch() {
  const { workspace, ask, reset } = useWorkspace();

  return (
    <Navbar
      onLogoClick={reset}
      searchSlot={workspace ? <HeroSearch compact onSubmit={ask} /> : null}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <HomePage />
          </ProtectedLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <AppRoutes />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
