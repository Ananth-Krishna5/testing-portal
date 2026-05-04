import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { http, wsUrl } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { AiChatPanel } from "../components/AiChatPanel";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionShell } from "../components/ui/SectionShell";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Kpis {
  overview: { programs: number; projects: number; users: number; suites: number };
  runs: { total: number; recent: { id: string; status: string; createdAt: string }[] };
  results: { total: number; pass: number; fail: number; skip: number };
  integration: { ticketsBridged: number };
}

export default function DashboardPage(): JSX.Element {
  const { token } = useAuth();
  const [live, setLive] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["kpis"],
    queryFn: async () => (await http.get<Kpis>("/dashboard/kpis")).data,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!token) return;
    const url = `${wsUrl()}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as { event?: string; data?: { status?: string; runId?: string } };
        if (msg.event === "run:updated") setLive(`${msg.data?.runId}: ${msg.data?.status}`);
      } catch {
        /* ignore */
      }
    };
    return () => ws.close();
  }, [token]);

  const barData = data
    ? [
        { name: "Pass", value: data.results.pass },
        { name: "Fail", value: data.results.fail },
        { name: "Skip", value: data.results.skip },
      ]
    : [];

  const lineData =
    data?.runs.recent.map((r, i) => ({
      i: i + 1,
      score: r.status === "passed" ? 1 : r.status === "failed" || r.status === "error" ? 0 : 0.5,
    })) ?? [];

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Portfolio performance and execution signals." />
      {live && <Chip sx={{ mb: 2 }} color="primary" label={`Live: ${live}`} onDelete={() => setLive(null)} />}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2 }}>
        <Box>
          <Stack spacing={2}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Overview</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 2 }}>
                  {[
                    { label: "Programs", v: data?.overview.programs ?? "—" },
                    { label: "Projects", v: data?.overview.projects ?? "—" },
                    { label: "Users", v: data?.overview.users ?? "—" },
                    { label: "Test Suites", v: data?.overview.suites ?? "—" },
                  ].map((k) => <MetricCard key={k.label} label={k.label} value={k.v} />)}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Program & project metrics</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SectionShell title="Operational context" description="Portfolio health is driven by scheduled jobs, recent runs, and bridge activity. Use Programs and Projects modules for detailed controls." />
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Results distribution</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#6c63ff" name="Cases" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Recent runs trend</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="i" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#06b6d4" dot />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Integration & tickets</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Card variant="outlined">
                  <Typography variant="body2" sx={{ p: 2 }}>
                    Tickets bridged from failed tests: <strong>{data?.integration.ticketsBridged ?? 0}</strong>
                  </Typography>
                </Card>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>
        <Box>
          <AiChatPanel />
        </Box>
      </Box>
    </Box>
  );
}
