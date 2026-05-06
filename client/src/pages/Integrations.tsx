import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Clipboard24Regular, PlugConnected24Regular } from "@fluentui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { http } from "../api/http";
import { AppPageFrame } from "../components/ui/AppPageFrame";
import { FluentIcon } from "../components/ui/FluentIcon";
import { SectionShell } from "../components/ui/SectionShell";

interface Settings {
  id?: string;
  supportDeskUrl?: string | null;
  autoTicketGlobal?: boolean;
  lastHealthCheckAt?: string | null;
  lastHealthCheckOk?: boolean | null;
  ticketsCreatedCount?: number;
  bridgeErrorCount?: number;
}

interface BridgeRow {
  id: string;
  sdTicketId: number;
  createdAt: string;
  result?: { testName: string };
}

export default function IntegrationsPage(): JSX.Element {
  const qc = useQueryClient();
  const { data, isPending: settingsPending } = useQuery({
    queryKey: ["integration-settings"],
    queryFn: async () => (await http.get<Settings>("/integrations/settings")).data,
  });
  const { data: logs, isPending: logsPending } = useQuery({
    queryKey: ["bridge-log"],
    queryFn: async () => (await http.get<BridgeRow[]>("/integrations/bridge-log")).data,
  });

  const [form, setForm] = useState<Settings>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => http.patch("/integrations/settings", form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration-settings"] }),
  });

  const health = useMutation({
    mutationFn: async () => (await http.post<{ ok: boolean }>("/integrations/health")).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration-settings"] }),
  });

  const copyUrl = async (): Promise<void> => {
    const u = form.supportDeskUrl?.trim();
    if (!u) return;
    try {
      await navigator.clipboard.writeText(u);
    } catch {
      /* ignore */
    }
  };

  return (
    <AppPageFrame title="Integrations">
      <SectionShell
        title="Support Desk connection"
        description="Configuration, health checks, and automated ticketing preferences."
        icon={PlugConnected24Regular}
      >
        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          {settingsPending ? (
            <>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={40} width="50%" />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={100} height={36} />
                <Skeleton variant="rounded" width={120} height={36} />
              </Stack>
            </>
          ) : (
            <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "flex-start" }}>
            <TextField
              label="Support Desk base URL"
              fullWidth
              value={form.supportDeskUrl ?? ""}
              onChange={(e) => setForm({ ...form, supportDeskUrl: e.target.value })}
              placeholder="https://support.example.com"
            />
            <Tooltip title="Copy URL">
              <span>
                <IconButton
                  aria-label="Copy support desk URL"
                  onClick={() => void copyUrl()}
                  disabled={!form.supportDeskUrl?.trim()}
                  sx={{ mt: { xs: 0, sm: 0.5 } }}
                >
                  <FluentIcon icon={Clipboard24Regular} size="inline" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Typography>Auto-create tickets globally</Typography>
            <Switch checked={Boolean(form.autoTicketGlobal)} onChange={(_, v) => setForm({ ...form, autoTicketGlobal: v })} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => save.mutate()} disabled={save.isPending}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => health.mutate()} disabled={health.isPending}>
              Health check
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Last check: {form.lastHealthCheckAt ?? "—"} ({form.lastHealthCheckOk === true ? "OK" : form.lastHealthCheckOk === false ? "FAIL" : "unknown"})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tickets created (counter): {form.ticketsCreatedCount ?? 0} · Bridge errors: {form.bridgeErrorCount ?? 0}
          </Typography>
            </>
          )}
        </Stack>
      </SectionShell>

      <Paper
        sx={{
          p: 2,
          mt: 2,
          borderRadius: "var(--app-radius-md)",
          border: "1px solid var(--app-border-light)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.96) 100%)",
          boxShadow: "var(--app-shadow-xs)",
        }}
      >
        <Stack
          direction="row"
          sx={{ mb: 1.5, justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h6">Ticket bridge audit log</Typography>
          <Chip
            size="small"
            label={`${logs?.length ?? 0} entries`}
            variant="outlined"
            sx={{ borderRadius: "var(--app-radius-xs)" }}
          />
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>SD ticket</TableCell>
                <TableCell>Test</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logsPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                (logs ?? []).map((l) => (
                  <TableRow key={l.id} hover>
                    <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{l.sdTicketId}</TableCell>
                    <TableCell>{l.result?.testName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </AppPageFrame>
  );
}
