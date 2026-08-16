import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ roles }) {
  const { user, loading, isAuthenticated, dashboardPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length) {
    const role = String(user.role || "").toLowerCase();
    const allowed = roles.map((r) => r.toLowerCase());
    if (!allowed.includes(role)) {
      return <Navigate to={dashboardPath} replace />;
    }
  }

  return <Outlet />;
}

export function GuestOnly() {
  const { isAuthenticated, loading, dashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}
