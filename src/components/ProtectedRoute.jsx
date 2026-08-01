import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-vibe" />
      </div>
    );
  }

  if (!user) {
    // Remember where the user was headed so we can return them after login.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
