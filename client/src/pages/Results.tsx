import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChartMultiple24Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { http } from "../api/http";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "../components/ui/EmptyState";
import { FilterBar } from "../components/ui/FilterBar";
import { PageHeader } from "../components/ui/PageHeader";

interface TestResultRow {
  id: string;
  testName: string;
  status: string;
  durationMs?: number | null;
  errorMsg?: string | null;
  screenshotUrl?: string | null;
  logUrl?: string | null;
  createdAt: string;
  run?: { id: string; job?: { project?: { name: string }; suite?: { name: string } } };
  ticketBridgeLogs?: { sdTicketId: number }[];
}

export default function ResultsPage(): JSX.Element {
  const theme = useTheme();
  const [status, setStatus] = useState<string>("");
  const { data, isPending } = useQuery({
    queryKey: ["results", status],
    queryFn: async () => (await http.get<TestResultRow[]>("/test-results", { params: { status: status || undefined } })).data,
  });

  const chart = useMemo(() => {
    const pass = (data ?? []).filter((r) => r.status === "pass").length;
    const fail = (data ?? []).filter((r) => r.status === "fail").length;
    const skip = (data ?? []).filter((r) => r.status === "skip").length;
    return [
      { name: "Pass", v: pass },
      { name: "Fail", v: fail },
      { name: "Skip", v: skip },
    ];
  }, [data]);

  const tooltipSurface = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "var(--app-radius-xs)",
    boxShadow: theme.shadows[2],
  } as const;

  return (
    <Box className="app-page-enter">
      <PageHeader title="Results" subtitle="Execution outcomes, distribution, and failure signals." />
      <FilterBar
        end={
          status ? (
            <Chip label={`Status: ${status}`} onDelete={() => setStatus("")} size="small" sx={{ borderRadius: "var(--app-radius-xs)" }} />
          ) : undefined
        }
      >
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ alignItems: "center" }}>
          {["", "pass", "fail", "skip"].map((s) => (
            <Chip
              key={s || "all"}
              label={s ? s : "All"}
              color={status === s ? "primary" : "default"}
              onClick={() => setStatus(s)}
              variant={status === s ? "filled" : "outlined"}
              sx={{ borderRadius: "var(--app-radius-xs)" }}
            />
          ))}
        </Stack>
      </FilterBar>
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: "var(--app-radius-md)",
          border: "1px solid var(--app-border-light)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.96) 100%)",
          boxShadow: "var(--app-shadow-xs)",
        }}
      >
        <Typography sx={{ fontWeight: 600, fontFamily: "var(--app-font-display)", mb: 1 }}>Distribution</Typography>
        <Box sx={{ width: "100%", height: 260 }}>
          {isPending ? (
            <Skeleton variant="rounded" height="100%" sx={{ borderRadius: "var(--app-radius-sm)" }} />
          ) : (
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipSurface} />
                <Legend />
                <Bar dataKey="v" fill={theme.palette.primary.main} name="Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>
      {!isPending && (data ?? []).length === 0 ? (
        <EmptyState
          title="No results to display"
          message="Run a suite or clear the status filter to populate this table."
          illustration={ChartMultiple24Regular}
        />
      ) : isPending ? (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "var(--app-radius-md)", borderColor: "var(--app-border-light)" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Test</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Project / Suite</TableCell>
                <TableCell>Ticket</TableCell>
                <TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} className="app-scroll" sx={{ maxHeight: 480, borderRadius: "var(--app-radius-md)", border: "1px solid var(--app-border-light)" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Test</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Project / Suite</TableCell>
                <TableCell>Ticket</TableCell>
                <TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data ?? []).map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.testName}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.status}
                      color={r.status === "pass" ? "success" : r.status === "fail" ? "error" : "default"}
                      variant="outlined"
                      sx={{ borderRadius: "var(--app-radius-xs)", textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell>
                    {r.run?.job?.project?.name} / {r.run?.job?.suite?.name}
                  </TableCell>
                  <TableCell>{r.ticketBridgeLogs?.[0]?.sdTicketId ?? "—"}</TableCell>
                  <TableCell sx={{ maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.errorMsg}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
