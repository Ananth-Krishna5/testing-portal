import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import type { ReactNode } from "react";
import type { Role } from "../auth/AuthContext";

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }): JSX.Element {
  const { user, loading, can } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (roles && !roles.some((r) => can(r))) return <Navigate to="/" replace />;
  return <>{children}</>;
}
