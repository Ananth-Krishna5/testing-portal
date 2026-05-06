import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Apps24Regular,
  ArrowTrending24Regular,
  ChevronDown24Regular,
  DataBarVertical24Regular,
  DataTrending24Regular,
  PlugConnected24Regular,
} from "@fluentui/react-icons";
import { FluentIcon } from "../components/ui/FluentIcon";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { http, wsUrl } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { AiChatPanel } from "../components/AiChatPanel";
import { AppPageFrame } from "../components/ui/AppPageFrame";
import { MetricCard } from "../components/ui/MetricCard";
import { SectionShell } from "../components/ui/SectionShell";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Kpis {
  overview: { programs: number; projects: number; users: number; suites: number };
  runs: { total: number; recent: { id: string; status: string; createdAt: string }[] };
  results: { total: number; pass: number; fail: number; skip: number };
  integration: { ticketsBridged: number };
}

export default function DashboardPage(): JSX.Element {
  const theme = useTheme();
  const { token } = useAuth();
  const [live, setLive] = useState<string | null>(null);
  const { data, isPending } = useQuery({
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

  const tooltipSurface = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "var(--app-radius-xs)",
    boxShadow: theme.shadows[2],
  } as const;

  return (
    <AppPageFrame
      title="Dashboard"
      actions={
        live ? (
          <Chip
            color="primary"
            variant="outlined"
            size="small"
            sx={{ borderRadius: "6px" }}
            label={`Live · ${live}`}
            onDelete={() => setLive(null)}
          />
        ) : isPending ? (
          <Skeleton variant="rounded" width={120} height={24} sx={{ borderRadius: "6px" }} />
        ) : null
      }
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2 }}>
        <Box>
          <Stack spacing={2}>
            <Accordion defaultExpanded disableGutters sx={{ "&:before": { display: "none" }, borderRadius: "var(--app-radius-md)", border: "1px solid var(--app-border-light)", overflow: "hidden", boxShadow: "var(--app-shadow-xs)", background: "rgba(255,255,255,0.78)" }}>
              <AccordionSummary expandIcon={<ChevronDown24Regular />} sx={{ px: 2, minHeight: 52, "&.Mui-expanded": { minHeight: 52 } }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <FluentIcon icon={Apps24Regular} size="inline" color="var(--mui-palette-primary-main)" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "var(--app-font-display)" }}>
                    Overview
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 2 }}>
                  {isPending
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: "var(--app-radius-sm)" }} />)
                    : [
                        { label: "Programs", v: data?.overview.programs ?? "—" },
                        { label: "Projects", v: data?.overview.projects ?? "—" },
                        { label: "Users", v: data?.overview.users ?? "—" },
                        { label: "Test Suites", v: data?.overview.suites ?? "—" },
                      ].map((k) => <MetricCard key={k.label} label={k.label} value={k.v} />)}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters sx={{ "&:before": { display: "none" }, borderRadius: "var(--app-radius-md)", border: "1px solid var(--app-border-light)", overflow: "hidden", boxShadow: "var(--app-shadow-xs)", background: "rgba(255,255,255,0.78)" }}>
              <AccordionSummary expandIcon={<ChevronDown24Regular />} sx={{ px: 2, minHeight: 52, "&.Mui-expanded": { minHeight: 52 } }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <FluentIcon icon={DataTrending24Regular} size="inline" color="var(--mui-palette-primary-main)" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "var(--app-font-display)" }}>
                    Program & project metrics
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                <SectionShell
                  title="Operational context"
                  description="Portfolio health is driven by scheduled jobs, recent runs, and bridge activity. Use Programs and Projects modules for detailed controls."
                  icon={DataTrending24Regular}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded disableGutters sx={{ "&:before": { display: "none" }, borderRadius: "var(--app-radius-md)", border: "1px solid var(--app-border-light)", overflow: "hidden", boxShadow: "var(--app-shadow-xs)", background: "rgba(255,255,255,0.78)" }}>
              <AccordionSummary expandIcon={<ChevronDown24Regular />} sx={{ px: 2, minHeight: 52, "&.Mui-expanded": { minHeight: 52 } }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <FluentIcon icon={DataBarVertical24Regular} size="inline" color="var(--mui-palette-primary-main)" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "var(--app-font-display)" }}>
                    Results distribution
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                <Card variant="outlined" sx={{ borderRadius: "var(--app-radius-md)", borderColor: "var(--app-border-light)", boxShadow: "none" }}>
                  <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                    <Box sx={{ width: "100%", height: 280, p: 1 }}>
                      {isPending ? (
                        <Skeleton variant="rounded" height="100%" sx={{ borderRadius: "var(--app-radius-sm)" }} />
                      ) : (
                        <ResponsiveContainer>
                          <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <Tooltip contentStyle={tooltipSurface} />
                            <Legend />
                            <Bar dataKey="value" fill={theme.palette.primary.main} name="Cases" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters sx={{ "&:before": { display: "none" }, borderRadius: "var(--app-radius-md)", border: "1px solid var(--app-border-light)", overflow: "hidden", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ChevronDown24Regular />} sx={{ px: 2, minHeight: 52, "&.Mui-expanded": { minHeight: 52 } }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <FluentIcon icon={ArrowTrending24Regular} size="inline" color="var(--mui-palette-primary-main)" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "var(--app-font-display)" }}>
                    Recent runs trend
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                <Card variant="outlined" sx={{ borderRadius: "var(--app-radius-md)", borderColor: "var(--app-border-light)", boxShadow: "none" }}>
                  <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                    <Box sx={{ width: "100%", height: 260, p: 1 }}>
                      {isPending ? (
                        <Skeleton variant="rounded" height="100%" sx={{ borderRadius: "var(--app-radius-sm)" }} />
                      ) : (
                        <ResponsiveContainer>
                          <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="i" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <YAxis domain={[0, 1]} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <Tooltip contentStyle={tooltipSurface} />
                            <Line type="monotone" dataKey="score" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters sx={{ "&:before": { display: "none" }, borderRadius: "var(--app-radius-md)", border: "1px solid var(--app-border-light)", overflow: "hidden", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ChevronDown24Regular />} sx={{ px: 2, minHeight: 52, "&.Mui-expanded": { minHeight: 52 } }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <FluentIcon icon={PlugConnected24Regular} size="inline" color="var(--mui-palette-primary-main)" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "var(--app-font-display)" }}>
                    Integration & tickets
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "var(--app-radius-md)",
                    borderColor: "var(--app-border-light)",
                    backgroundColor: "background.paper",
                    boxShadow: "none",
                  }}
                >
                  <CardContent>
                    {isPending ? (
                      <Skeleton width="60%" height={24} />
                    ) : (
                      <Typography variant="body2">
                        Tickets bridged from failed tests: <strong>{data?.integration.ticketsBridged ?? 0}</strong>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>
        <Box>
          <AiChatPanel />
        </Box>
      </Box>
    </AppPageFrame>
  );
}
