import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Skeleton, Stack, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import type { ReactNode } from "react";
import type { Role } from "../auth/AuthContext";

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }): JSX.Element {
  const { user, loading, can } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 360, width: "100%" }} className="app-page-enter">
          <Typography
            variant="overline"
            sx={{ letterSpacing: "0.14em", color: "text.secondary", fontWeight: 600 }}
          >
            Test Hub Central
          </Typography>
          <CircularProgress size={36} thickness={4} aria-label="Loading session" />
          <Stack spacing={1} sx={{ width: "100%" }}>
            <Skeleton variant="rounded" height={10} />
            <Skeleton variant="rounded" height={10} width="80%" sx={{ alignSelf: "center" }} />
            <Skeleton variant="rounded" height={10} width="60%" sx={{ alignSelf: "center" }} />
          </Stack>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Restoring your workspace…
          </Typography>
        </Stack>
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (roles && !roles.some((r) => can(r))) return <Navigate to="/" replace />;
  return <>{children}</>;
}
