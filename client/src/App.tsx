import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { appTheme } from "./theme";
import type { PaletteMode } from "@mui/material";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AppLayout } from "./layout/AppLayout";
import { RequireAuth } from "./routes/RequireAuth";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import ProgramsPage from "./pages/Programs";
import ProjectsPage from "./pages/Projects";
import TestSuitesPage from "./pages/TestSuites";
import ResultsPage from "./pages/Results";
import UsersPage from "./pages/Users";
import IntegrationsPage from "./pages/Integrations";
import SearchPage from "./pages/Search";

const qc = new QueryClient();

function Shell({ children }: { children: ReactNode }): JSX.Element {
  const [mode, setMode] = useState<PaletteMode>(() => (localStorage.getItem("th_theme") as PaletteMode) || "dark");
  const theme = useMemo(() => appTheme(mode), [mode]);
  const toggle = () =>
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      localStorage.setItem("th_theme", next);
      return next;
    });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout mode={mode} onToggleMode={toggle}>
        {children}
      </AppLayout>
    </ThemeProvider>
  );
}

function Private({ children }: { children: ReactNode }): JSX.Element {
  const { loading, user } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App(): JSX.Element {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <Private>
                  <DashboardPage />
                </Private>
              }
            />
            <Route
              path="/programs"
              element={
                <Private>
                  <ProgramsPage />
                </Private>
              }
            />
            <Route
              path="/projects"
              element={
                <Private>
                  <ProjectsPage />
                </Private>
              }
            />
            <Route
              path="/test-suites"
              element={
                <Private>
                  <TestSuitesPage />
                </Private>
              }
            />
            <Route
              path="/results"
              element={
                <Private>
                  <ResultsPage />
                </Private>
              }
            />
            <Route
              path="/users"
              element={
                <Private>
                  <RequireAuth roles={["admin", "tester"]}>
                    <UsersPage />
                  </RequireAuth>
                </Private>
              }
            />
            <Route
              path="/integrations"
              element={
                <Private>
                  <RequireAuth roles={["admin", "tester"]}>
                    <IntegrationsPage />
                  </RequireAuth>
                </Private>
              }
            />
            <Route
              path="/search"
              element={
                <Private>
                  <SearchPage />
                </Private>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
