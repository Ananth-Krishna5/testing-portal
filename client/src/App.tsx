import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AppLayout } from "./layout/AppLayout";
import { RequireAuth } from "./routes/RequireAuth";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import ProgramsPage from "./pages/Programs";
import ProgramDetailPage from "./pages/ProgramDetail";
import ProjectsPage from "./pages/Projects";
import ProjectDetailPage from "./pages/ProjectDetail";
import TestSuitesPage from "./pages/TestSuites";
import TestSuiteDetailPage from "./pages/TestSuiteDetail";
import ResultsPage from "./pages/Results";
import UsersPage from "./pages/Users";
import IntegrationsPage from "./pages/Integrations";
import SearchPage from "./pages/Search";

// Visual identity is light-only per Archive 6 design system. The previous
// dark/light toggle was intentionally removed during the UI migration; the
// MUI ThemeProvider now lives at the root in main.tsx.

const qc = new QueryClient();

function Shell({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

function Private({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return <Box sx={{ p: 3 }}>Loading…</Box>;
  if (!user) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
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
              path="/programs/:id"
              element={
                <Private>
                  <ProgramDetailPage />
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
              path="/projects/:id"
              element={
                <Private>
                  <ProjectDetailPage />
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
              path="/test-suites/:id"
              element={
                <Private>
                  <TestSuiteDetailPage />
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
