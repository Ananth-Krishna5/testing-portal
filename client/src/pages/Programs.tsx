import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Chip,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { http } from "../api/http";
import { RoadmapCanvas } from "../components/RoadmapCanvas";

interface Program {
  id: string;
  name: string;
  description?: string | null;
  manager?: string | null;
  certAgency?: string | null;
  status: string;
  roadmap?: { id: string; name: string; canvasJson: unknown } | null;
  _count?: { projects: number };
}

export default function ProgramsPage(): JSX.Element {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await http.get<Program[]>("/programs")).data,
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    manager: "",
    certAgency: "",
    status: "draft",
  });

  const create = useMutation({
    mutationFn: async () => (await http.post<Program>("/programs", form)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      setOpen(false);
    },
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={900}>
          Programs
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          New program
        </Button>
      </Stack>
      {isLoading && <Typography>Loading…</Typography>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {(data ?? []).map((p) => (
          <Card variant="outlined" sx={{ height: "100%" }} key={p.id}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>
                  {p.name}
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                  {p.description}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={p.status} size="small" />
                  <Chip label={`${p._count?.projects ?? 0} projects`} size="small" variant="outlined" />
                </Stack>
                {p.roadmap && (
                  <Box sx={{ mt: 2 }}>
                    <RoadmapCanvas title={p.roadmap.name} canvas={p.roadmap.canvasJson} />
                  </Box>
                )}
              </CardContent>
              <CardActions />
            </Card>
        ))}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create program</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline minRows={2} />
            <TextField label="Manager / sponsor" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
            <TextField label="Certification agency" value={form.certAgency} onChange={(e) => setForm({ ...form, certAgency: e.target.value })} />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["draft", "active", "completed", "archived"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!form.name || create.isPending} onClick={() => create.mutate()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
