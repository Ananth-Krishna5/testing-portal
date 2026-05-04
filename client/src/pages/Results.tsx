import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { http } from "../api/http";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  const [status, setStatus] = useState<string>("");
  const { data } = useQuery({
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

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} gutterBottom>
        Results
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {["", "pass", "fail", "skip"].map((s) => (
          <Chip key={s || "all"} label={s ? s : "All"} color={status === s ? "primary" : "default"} onClick={() => setStatus(s)} variant={status === s ? "filled" : "outlined"} />
        ))}
      </Stack>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight={700} gutterBottom>
          Distribution
        </Typography>
        <Box sx={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="v" fill="#6c63ff" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
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
          {(data ?? []).map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.testName}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>
                {r.run?.job?.project?.name} / {r.run?.job?.suite?.name}
              </TableCell>
              <TableCell>{r.ticketBridgeLogs?.[0]?.sdTicketId ?? "—"}</TableCell>
              <TableCell sx={{ maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.errorMsg}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
