import { Box, Button, Stack, Switch, TextField, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Chip } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { http } from "../api/http";
import { PageHeader } from "../components/ui/PageHeader";
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
  const { data } = useQuery({
    queryKey: ["integration-settings"],
    queryFn: async () => (await http.get<Settings>("/integrations/settings")).data,
  });
  const { data: logs } = useQuery({
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

  return (
    <Box>
      <PageHeader title="Integrations" subtitle="Configure support desk bridging and monitor delivery health." />
      <SectionShell title="Support Desk connection" description="Configuration, health checks, and automated ticketing preferences.">
        <Stack spacing={2} maxWidth={720}>
          <TextField
            label="Support Desk base URL"
            fullWidth
            value={form.supportDeskUrl ?? ""}
            onChange={(e) => setForm({ ...form, supportDeskUrl: e.target.value })}
          />
          <Stack direction="row" spacing={2} alignItems="center">
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
        </Stack>
      </SectionShell>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="h6">Ticket bridge audit log</Typography>
          <Chip size="small" label={`${logs?.length ?? 0} entries`} variant="outlined" />
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
              {(logs ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{l.sdTicketId}</TableCell>
                  <TableCell>{l.result?.testName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
