import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { HeroSearch } from "./components/home/HeroSearch";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { NetworkPage } from "./pages/NetworkPage";
import { HotspotPage } from "./pages/HotspotPage";
import { FIRSearchPage } from "./pages/FIRSearchPage";
import { ReportsPage } from "./pages/ReportsPage";
import { UsersPage } from "./pages/UsersPage";
import { NewCasePage } from "./pages/NewCasePage";
import { SettingsPage } from "./pages/SettingsPage";

function ProtectedLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 min-w-0">
        <NavbarWithSearch onMenuClick={() => setMobileNavOpen(true)} />
        {children}
      </div>
    </div>
  );
}

function NavbarWithSearch({ onMenuClick }) {
  const { workspace, ask, reset } = useWorkspace();
  return (
    <Navbar
      onLogoClick={reset}
      onMenuClick={onMenuClick}
      searchSlot={workspace ? <HeroSearch compact onSubmit={ask} /> : null}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
      <Route path="/workspace" element={<ProtectedLayout><WorkspacePage /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><AnalyticsPage /></ProtectedLayout>} />
      <Route path="/network" element={<ProtectedLayout><NetworkPage /></ProtectedLayout>} />
      <Route path="/hotspots" element={<ProtectedLayout><HotspotPage /></ProtectedLayout>} />
      <Route path="/fir-search" element={<ProtectedLayout><FIRSearchPage /></ProtectedLayout>} />
      <Route path="/new-case" element={<ProtectedLayout><NewCasePage /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
      <Route path="/users" element={<ProtectedLayout><UsersPage /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
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
