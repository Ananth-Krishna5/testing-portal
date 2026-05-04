import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage(): JSX.Element {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: { pathname: string } } };
  const [email, setEmail] = useState("admin@xmachina.digital");
  const [password, setPassword] = useState("TestHub123!");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" } }}>
      <Box
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
          setPointer({ x, y });
        }}
        onMouseLeave={() => setPointer({ x: 0, y: 0 })}
        sx={{
          display: { xs: "none", md: "block" },
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(140deg, #070b19 0%, #0f1630 42%, #121b37 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: -120,
            background:
              "radial-gradient(360px circle at 25% 20%, rgba(110, 97, 255, 0.35), transparent 70%), radial-gradient(500px circle at 70% 72%, rgba(32, 201, 207, 0.24), transparent 70%)",
            transform: `translate(${pointer.x * -18}px, ${pointer.y * -16}px)`,
            transition: "transform 140ms ease-out",
          }}
        />
        <Box sx={{ position: "absolute", top: 28, left: 30 }}>
          <Typography sx={{ color: "rgba(239,243,255,0.9)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Test Hub Central</Typography>
        </Box>
        <Box
          component="a"
          href="https://xmachina.digital/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            position: "absolute",
            top: 96,
            left: 40,
            width: 520,
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(125, 144, 255, 0.35)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            transform: `translate(${pointer.x * 10}px, ${pointer.y * 8}px) rotate(${pointer.x * 2}deg)`,
            transition: "transform 150ms ease-out",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          <Box component="img" src="/login/sia.png" alt="SIA visual" sx={{ width: "100%", display: "block" }} />
        </Box>
        <Box
          component="a"
          href="https://olympusos.ai/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            position: "absolute",
            right: 50,
            bottom: 90,
            width: 460,
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(99, 224, 255, 0.32)",
            boxShadow: "0 22px 56px rgba(0,0,0,0.45)",
            transform: `translate(${pointer.x * -12}px, ${pointer.y * -10}px) rotate(${pointer.x * -1.8}deg)`,
            transition: "transform 160ms ease-out",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          <Box component="img" src="/login/olympus.png" alt="Olympus visual" sx={{ width: "100%", display: "block" }} />
        </Box>
        <Box sx={{ position: "absolute", left: 48, bottom: 48, maxWidth: 520 }}>
          <Typography variant="h4" sx={{ color: "#f2f5ff", mb: 1 }}>
            AI command center for modern test operations.
          </Typography>
          <Typography sx={{ color: "rgba(218,226,248,0.8)" }}>
            Move the cursor to explore SIA and Olympus in a layered, reactive preview.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="center" p={{ xs: 2, md: 4 }}>
        <Card elevation={0} sx={{ width: "100%", maxWidth: 440 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom>
              Sign in
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Access your testing workspace.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Stack spacing={2}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth autoComplete="username" />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth autoComplete="current-password" onKeyDown={(e) => e.key === "Enter" && submit()} />
              <Button variant="contained" size="large" disabled={busy} onClick={submit}>
                {busy ? "Signing in..." : "Continue"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
