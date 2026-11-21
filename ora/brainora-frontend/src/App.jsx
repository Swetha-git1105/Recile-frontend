import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { ResourceProvider, useResources } from "./context/ResourceContext";

import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ComingSoonPage from "./pages/ComingSoonPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ResourcesPage from "./pages/ResourcesPage";
import UploadResourcePage from "./pages/UploadResourcePage";
import LearnPage from "./pages/LearnPage";
import TrackPage from "./pages/TrackPage";
function ProtectedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function UploadResourceRoute() {
  const navigate = useNavigate();
  const { refreshResources } = useResources();

  async function handleUpload() {
    // Reload resources, uploads and total credits. The upload page stays
    // open so the user can read the "you earned X credits" message.
    await refreshResources();
  }

  return (
    <UploadResourcePage
      onUpload={handleUpload}
      onCancel={() => navigate("/learn")}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/forgot-password"
        element={<ComingSoonPage title="Forgot password" />}
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/dashboard"
          element={<DashboardPage title="Dashboard" />}
        />

        <Route
          path="/profile"
          element={<ProfilePage title="Profile" />}
        />

        <Route
          path="/settings"
          element={<ComingSoonPage title="Settings" />}
        />

        <Route
  path="/resources"
  element={<Navigate to="/learn" replace />}
/>

        <Route
          path="/upload"
          element={<UploadResourceRoute />}
        />

        <Route
  path="/learn"
  element={<LearnPage />}
/>
        <Route path="/tracking" element={<TrackPage />} />

        <Route
          path="/updates"
          element={<ComingSoonPage title="Stay Updated" />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ResourceProvider>
      <AppRoutes />
    </ResourceProvider>
  );
}