import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ClipboardTaskListLtr24Regular } from "@fluentui/react-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { http } from "../api/http";
import { EmptyState } from "../components/ui/EmptyState";
import { FilterBar } from "../components/ui/FilterBar";
import { PageHeader } from "../components/ui/PageHeader";

interface Suite {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  tools?: string | null;
  focusAreas?: string | null;
  scope?: string | null;
  standards?: string | null;
  severity?: string;
}

const categories = ["Foundational", "AI", "Voice", "E2E", "Performance", "Security", "UX", "CI/CD"] as const;

export default function TestSuitesPage(): JSX.Element {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [detail, setDetail] = useState<Suite | null>(null);
  const [modal, setModal] = useState(false);
  const [pick, setPick] = useState({ programId: "", projectId: "", suiteId: "", env: "Staging", from: "", to: "", time: "09:00", recurrence: "daily" });

  const { data, isPending } = useQuery({
    queryKey: ["suites", q, cat],
    queryFn: async () => (await http.get<Suite[]>("/test-suites", { params: { q, category: cat || undefined } })).data,
  });
  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await http.get<{ id: string; name: string }[]>("/programs")).data,
  });
  const { data: projects } = useQuery({
    queryKey: ["projects", pick.programId],
    queryFn: async () => (await http.get<{ id: string; name: string }[]>("/projects", { params: { programId: pick.programId } })).data,
    enabled: Boolean(pick.programId),
  });

  const addJob = useMutation({
    mutationFn: async () =>
      http.post("/scheduled-jobs", {
        projectId: pick.projectId,
        suiteId: pick.suiteId,
        fromDate: pick.from,
        toDate: pick.to,
        time: pick.time,
        recurrence: pick.recurrence,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setModal(false);
    },
  });

  const subtitle = useMemo(() => "Marketplace-style catalog with filters and suite metadata.", []);

  return (
    <Box className="app-page-enter">
      <PageHeader title="Test Suites" subtitle={subtitle} />
      <FilterBar
        end={
          q || cat ? (
            <Button variant="text" onClick={() => { setQ(""); setCat(""); }}>
              Clear filters
            </Button>
          ) : undefined
        }
      >
        <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} fullWidth />
        <TextField select label="Category" value={cat} onChange={(e) => setCat(e.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">All</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </FilterBar>

      {isPending && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3,1fr)" }, gap: 2, mb: 2 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: "var(--app-radius-md)" }} />
          ))}
        </Box>
      )}
      {!isPending && (data ?? []).length === 0 && (
        <EmptyState
          title="No suites found"
          message="Try broadening your search or changing the selected category."
          illustration={ClipboardTaskListLtr24Regular}
        >
          {(q || cat) ? (
            <Button variant="outlined" onClick={() => { setQ(""); setCat(""); }}>
              Clear filters
            </Button>
          ) : null}
        </EmptyState>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3,1fr)" }, gap: 2 }}>
        {(data ?? []).map((s) => (
          <Card
            key={s.id}
            variant="outlined"
            sx={{
              borderRadius: "var(--app-radius-md)",
              borderColor: "var(--app-border-light)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.96) 100%)",
              boxShadow: "var(--app-shadow-xs)",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <Typography variant="h6">
                  {s.name}
                </Typography>
                <Chip size="small" label={s.category} sx={{ borderRadius: "var(--app-radius-xs)" }} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {s.description}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
                {s.tools && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={s.tools}
                    sx={{ borderRadius: "var(--app-radius-xs)" }}
                  />
                )}
                {s.severity && (
                  <Chip
                    size="small"
                    color="warning"
                    label={s.severity}
                    sx={{ borderRadius: "var(--app-radius-xs)" }}
                  />
                )}
              </Stack>
            </CardContent>
            <CardActions>
              <Button onClick={() => setDetail(s)}>Details</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setPick((p) => ({ ...p, suiteId: s.id, from: new Date().toISOString().slice(0, 10), to: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10) }));
                  setModal(true);
                }}
              >
                Add to project
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Drawer anchor="right" open={Boolean(detail)} onClose={() => setDetail(null)}>
        <Box sx={{ width: 420, p: 2 }}>
          {detail && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {detail.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {detail.description}
              </Typography>
              <Typography sx={{ mt: 2 }} variant="subtitle2">
                Tools / methods
              </Typography>
              <Typography variant="body2">{detail.tools}</Typography>
              <Typography sx={{ mt: 2 }} variant="subtitle2">
                Focus areas
              </Typography>
              <Typography variant="body2">{detail.focusAreas}</Typography>
              <Typography sx={{ mt: 2 }} variant="subtitle2">
                Scope
              </Typography>
              <Typography variant="body2">{detail.scope}</Typography>
              <Typography sx={{ mt: 2 }} variant="subtitle2">
                Standards
              </Typography>
              <Typography variant="body2">{detail.standards}</Typography>
            </>
          )}
        </Box>
      </Drawer>

      <Dialog open={modal} onClose={() => setModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add suite to project</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Program" value={pick.programId} onChange={(e) => setPick({ ...pick, programId: e.target.value, projectId: "" })} fullWidth>
              {(programs ?? []).map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Project" value={pick.projectId} onChange={(e) => setPick({ ...pick, projectId: e.target.value })} fullWidth disabled={!pick.programId}>
              {(projects ?? []).map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Environment" value={pick.env} onChange={(e) => setPick({ ...pick, env: e.target.value })} fullWidth>
              {["Staging", "Dev", "Production", "UAT"].map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                label="From"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={pick.from}
                onChange={(e) => setPick({ ...pick, from: e.target.value })}
              />
              <TextField
                label="To"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={pick.to}
                onChange={(e) => setPick({ ...pick, to: e.target.value })}
              />
            </Stack>
            <TextField label="Time" value={pick.time} onChange={(e) => setPick({ ...pick, time: e.target.value })} />
            <TextField label="Recurrence" value={pick.recurrence} onChange={(e) => setPick({ ...pick, recurrence: e.target.value })} />
            <Typography variant="caption" color="text.secondary">
              Environment selection is informational here; project already defines its environment.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!pick.projectId || !pick.suiteId || addJob.isPending} onClick={() => addJob.mutate()}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
