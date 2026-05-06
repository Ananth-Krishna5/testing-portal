import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FolderMultiple24Regular, Search20Regular } from "@fluentui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type MouseEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { EmptyState } from "../components/ui/EmptyState";
import { FluentIcon } from "../components/ui/FluentIcon";

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
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await http.get<Program[]>("/programs")).data,
  });
  const [open, setOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "risk">("all");
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
  const pauseProgram = useMutation({
    mutationFn: async (program: Program) => (await http.patch<Program>(`/programs/${program.id}`, { status: "paused" })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
    },
  });
  const deleteProgram = useMutation({
    mutationFn: async (programId: string) => {
      await http.delete(`/programs/${programId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
    },
  });

  const filteredPrograms = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((program) => {
      const q = search.trim().toLowerCase();
      const matchesQuery = q.length === 0 || `${program.name} ${program.description ?? ""}`.toLowerCase().includes(q);
      const atRisk = (program.status ?? "").toLowerCase().includes("risk");
      const matchesFilter = filter === "all" ? true : atRisk;
      return matchesQuery && matchesFilter;
    });
  }, [data, filter, search]);

  const toPercent = (seed: string, min = 8, max = 98) => {
    const sum = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return min + (sum % (max - min + 1));
  };

  const healthColor = (value: number): string => {
    if (value < 35) return "#FFB112";
    if (value < 70) return "#B3C33D";
    return "#16C705";
  };

  const riskState = (value: number) => (value < 55 ? "At Risk" : "On Track");
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>, program: Program) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedProgram(program);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedProgram(null);
  };

  const handlePauseProgram = async () => {
    if (!selectedProgram) return;
    await pauseProgram.mutateAsync(selectedProgram);
    handleCloseMenu();
  };

  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;
    const shouldDelete = window.confirm(`Delete "${selectedProgram.name}"? This action cannot be undone.`);
    if (!shouldDelete) return;
    await deleteProgram.mutateAsync(selectedProgram.id);
    handleCloseMenu();
  };

  return (
    <Box className="app-page-enter" sx={{ width: "100%", height: "100%", bgcolor: "#F9F7F5", borderRadius: { xs: 0, md: "12px" }, overflow: "hidden" }}>
      <Box sx={{ px: 1, py: 1, borderBottom: "1px solid #F0EAE5" }}>
        <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "#11151A" }}>Programs</Typography>
      </Box>
      <Box sx={{ p: 1 }}>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }} sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              p: 0.25,
              borderRadius: "6px",
              backgroundColor: "#F0EAE5",
            }}
          >
            <Box sx={{ width: 24, height: 24, borderRadius: "6px", display: "grid", placeItems: "center" }}>
              <FluentIcon icon={FolderMultiple24Regular} size="nav" color="#424242" />
            </Box>
          </Box>
          <TextField
            size="small"
            placeholder="Search projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                height: 32,
                borderRadius: "8px",
                backgroundColor: "#F0EAE5",
                minWidth: { lg: 448 },
              },
            }}
            slotProps={{
              input: {
                startAdornment: <FluentIcon icon={Search20Regular} size="inline" color="#616161" />,
              },
            }}
          />
        </Stack>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ height: 32, minWidth: 145, borderRadius: "8px", px: 2, textTransform: "none", fontWeight: 590, fontSize: "13px", lineHeight: "16px" }}
        >
          New Program
        </Button>
      </Stack>
      <ToggleButtonGroup
        exclusive
        value={filter}
        onChange={(_, value: "all" | "risk" | null) => value && setFilter(value)}
        sx={{
          mb: 2,
          p: 0.25,
          borderRadius: "8px",
          backgroundColor: "#F0EAE5",
          "& .MuiToggleButton-root": {
            textTransform: "none",
            fontSize: "13px",
            lineHeight: "20px",
            border: 0,
            borderRadius: "6px !important",
            px: 1.5,
            py: 0.5,
            color: "#424242",
            fontWeight: 590,
          },
          "& .Mui-selected": { backgroundColor: "#F9F7F5 !important", color: "#11151A !important", boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" },
        }}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="risk">At Risk</ToggleButton>
      </ToggleButtonGroup>
      {isPending && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(5, 1fr)" }, gap: 1, mb: 2 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={196} sx={{ borderRadius: "12px" }} />
          ))}
        </Box>
      )}
      {!isPending && (data ?? []).length === 0 && (
        <EmptyState
          title="No programs yet"
          message="Create a program to begin organizing projects and roadmaps."
          illustration={FolderMultiple24Regular}
        >
          <Button variant="contained" onClick={() => setOpen(true)}>
            New program
          </Button>
        </EmptyState>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(303px, 303px))", gap: 1, justifyContent: "start" }}>
        {filteredPrograms.map((p) => {
          const tests = toPercent(`${p.id}:tests`);
          const compliance = toPercent(`${p.id}:coverage`);
          const projectCount = Math.max(1, p._count?.projects ?? 0);
          const risk = riskState((tests + compliance) / 2);
          return (
          <Card
            variant="outlined"
            sx={{
              width: 303,
              height: 250,
              borderRadius: "12px",
              borderColor: "#F0EAE5",
              boxShadow: "none",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
            key={p.id}
            onClick={() => navigate(`/programs/${p.id}`)}
          >
            <CardContent sx={{ px: 1, py: 0, "&:last-child": { pb: 0 } }}>
              <Box sx={{ py: 1 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, lineHeight: "20px", color: "#242424" }}>{p.name}</Typography>
              <Stack direction="row" spacing={0.75} sx={{ mt: 0.25, mb: 0.75 }}>
                <Chip label="Internal" size="small" sx={{ height: 24, borderRadius: "6px", backgroundColor: "#FAF9F7", color: "#11151A" }} />
                <Chip
                  label={risk}
                  size="small"
                  sx={{
                    height: 24,
                    borderRadius: "6px",
                    backgroundColor: "#FAF9F7",
                    color: risk === "At Risk" ? "#FF383C" : "#138425",
                    "& .MuiChip-label": { fontWeight: 590 },
                  }}
                />
              </Stack>
              </Box>
              <Box sx={{ borderRadius: "8px", backgroundColor: "rgba(240, 234, 229, 0.7)", p: 1 }}>
                <Typography sx={{ fontSize: "18px", lineHeight: "20px", fontWeight: 700, color: "#242424", mb: 0.25 }}>{projectCount}</Typography>
                <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 590, color: "#11151A", mb: 0.5 }}>Projects</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.75 }}>
                  {[{ label: "Tests", value: tests, denominator: 42 }, { label: "Compliance Coverage", value: compliance, denominator: 8 }].map((kpi) => (
                    <Box key={kpi.label}>
                      <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 590, color: "#11151A" }}>{kpi.label}</Typography>
                      <Typography sx={{ fontSize: "18px", lineHeight: "20px", fontWeight: 590, color: "#11151A" }}>{kpi.value}%</Typography>
                      <Box sx={{ width: "100%", height: 4, backgroundColor: "#EDE7E1", borderRadius: "12px", overflow: "hidden", my: 0.25 }}>
                        <Box sx={{ width: `${kpi.value}%`, height: "100%", backgroundColor: healthColor(kpi.value), borderRadius: "12px" }} />
                      </Box>
                      <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 590, color: "#474747" }}>
                        {Math.max(1, Math.round((kpi.value / 100) * kpi.denominator))}/{kpi.denominator} {kpi.label === "Tests" ? "pass rate" : "milestones"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, py: 1 }}>
                <Stack direction="row" alignItems="center" spacing={-1}>
                  {[0, 1, 2, 3].map((n) => (
                    <Avatar key={n} sx={{ width: 23, height: 23, border: "1px solid #fff", bgcolor: "#DBD0C3", fontSize: "10px" }}>
                      {String.fromCharCode(65 + n)}
                    </Avatar>
                  ))}
                  <Typography sx={{ ml: 1, fontSize: "13px", color: "#616161" }}>+2</Typography>
                </Stack>
                <Button
                  size="small"
                  onClick={(event) => handleOpenMenu(event, p)}
                  sx={{ minWidth: 56, height: 28, borderRadius: "6px", textTransform: "none", color: "#616161", fontWeight: 590, px: 1 }}
                >
                  Edit
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );
        })}
      </Box>

      <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleCloseMenu}>
        <MenuItem
          onClick={handlePauseProgram}
          disabled={!selectedProgram || pauseProgram.isPending || (selectedProgram?.status ?? "").toLowerCase() === "paused"}
        >
          Pause program
        </MenuItem>
        <MenuItem onClick={handleDeleteProgram} disabled={!selectedProgram || deleteProgram.isPending} sx={{ color: "#C62828" }}>
          Delete program
        </MenuItem>
      </Menu>
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
        <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!form.name || create.isPending} onClick={() => create.mutate()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
