import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
  Fade,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const slides = [
  { title: "Olympus", subtitle: "Certification & release readiness", tone: "linear-gradient(135deg,#1a1040,#312e81)" },
  { title: "Valhalla", subtitle: "Resilience & operational excellence", tone: "linear-gradient(135deg,#0a1628,#164e63)" },
  { title: "Horus", subtitle: "Observability & governance", tone: "linear-gradient(135deg,#1f2937,#0f766e)" },
  { title: "Sia", subtitle: "AI safety & quality signals", tone: "linear-gradient(135deg,#3b0764,#7c3aed)" },
];

export default function LoginPage(): JSX.Element {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: { pathname: string } } };
  const [email, setEmail] = useState("admin@xmachina.digital");
  const [password, setPassword] = useState("TestHub123!");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      nav(loc.state?.from?.pathname || "/", { replace: true });
    } catch {
      setError("Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  const s = slides[idx];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" }, minHeight: "100vh" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          display: { xs: "none", md: "block" },
        }}
      >
        <Fade in key={idx} timeout={600}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: s.tone,
              display: "flex",
              alignItems: "flex-end",
              p: 6,
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight={900} color="common.white" gutterBottom>
                {s.title}
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.78)", maxWidth: 520 }}>
                {s.subtitle}
              </Typography>
            </Box>
          </Box>
        </Fade>
        <Box sx={{ position: "absolute", top: 24, left: 24, color: "common.white", opacity: 0.8, fontSize: 12 }}>
          Xmachina · Test Hub Central
        </Box>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="center" p={3}>
        <Card elevation={6} sx={{ width: "100%", maxWidth: 440 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Sign in
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Internal workspace access
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth autoComplete="username" />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <Button variant="contained" size="large" disabled={busy} onClick={submit}>
                {busy ? "Signing in…" : "Continue"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
