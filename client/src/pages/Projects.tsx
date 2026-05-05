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
  MenuItem,
  Skeleton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Add20Regular,
  AppsListDetail24Regular,
  Briefcase24Regular,
  GridDots24Regular,
  Search20Regular,
  ChevronDown12Regular,
} from "@fluentui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { FluentIcon } from "../components/ui/FluentIcon";

interface Project {
  id: string;
  name: string;
  description?: string | null;
  targetProduct: string;
  environment: string;
  status: string;
  programId: string;
  autoCreateTickets?: boolean;
  scheduledJobs?: { id: string; suite: { name: string }; recurrence: string; status: string }[];
}

interface Program {
  id: string;
  name: string;
}

interface Suite {
  id: string;
  name: string;
}

const products = ["Sia", "Olympus", "Horus", "Valhalla"] as const;
const envs = ["Staging", "Dev", "Production", "UAT"] as const;

export default function ProjectsPage(): JSX.Element {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: projects, isPending: projectsPending } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await http.get<Project[]>("/projects")).data,
  });
  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await http.get<Program[]>("/programs")).data,
  });
  const { data: suites } = useQuery({
    queryKey: ["suites"],
    queryFn: async () => (await http.get<Suite[]>("/test-suites")).data,
  });

  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [w, setW] = useState({
    name: "",
    description: "",
    programId: "",
    targetProduct: "Olympus" as (typeof products)[number],
    environment: "Staging" as (typeof envs)[number],
    suiteId: "",
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    time: "09:00",
    recurrence: "daily",
  });

  const createProject = useMutation({
    mutationFn: async () =>
      (
        await http.post<Project>("/projects", {
          name: w.name,
          description: w.description,
          programId: w.programId,
          targetProduct: w.targetProduct,
          environment: w.environment,
        })
      ).data,
    onSuccess: async (proj) => {
      if (w.suiteId) {
        await http.post("/scheduled-jobs", {
          projectId: proj.id,
          suiteId: w.suiteId,
          fromDate: w.fromDate,
          toDate: w.toDate,
          time: w.time,
          recurrence: w.recurrence,
        });
      }
      qc.invalidateQueries({ queryKey: ["projects"] });
      setWizardOpen(false);
      setStep(0);
    },
  });

  const steps = useMemo(() => ["Basics", "Program", "Product", "Environment", "Schedule"], []);

  const filterOptions = ["Inspect", "Inspect", "Inspect"] as const;

  const visibleProjects = useMemo(() => {
    const rows = projects ?? [];
    const q = search.trim().toLowerCase();
    return rows.filter((p) => {
      const matchesSearch =
        q.length === 0 ||
        `${p.name} ${p.description ?? ""} ${p.targetProduct ?? ""} ${p.environment ?? ""}`.toLowerCase().includes(q);
      const matchesFilter = true;
      return matchesSearch && matchesFilter;
    });
  }, [projects, search]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const cardMeta = (project: Project) => {
    const tests = project.scheduledJobs?.length ?? 0;
    const compliance = Math.max(1, Math.min(100, (project.name.length * 11 + tests * 7) % 100));
    return { tests, compliance };
  };

  const inputFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#F9F7F5",
      minHeight: 40,
    },
    "& .MuiInputLabel-root": {
      fontSize: "13px",
    },
  };

  return (
    <Box
      className="app-page-enter"
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "#F9F7F5",
        borderRadius: { xs: 0, md: "12px" },
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 1, py: 1, borderBottom: "1px solid #F0EAE5" }}>
        <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "#11151A" }}>
          Projects
        </Typography>
      </Box>

      <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1.5, minHeight: 0, flex: 1 }} className="app-scroll">
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }} sx={{ mt: 0.5 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <ToggleButtonGroup
              exclusive
              value={view}
              onChange={(_, value: "grid" | "list" | null) => value && setView(value)}
              sx={{
                p: "2px",
                borderRadius: "6px",
                backgroundColor: "#F0EAE5",
                height: 32,
                "& .MuiToggleButton-root": {
                  border: 0,
                  width: 24,
                  height: 24,
                  borderRadius: "4px !important",
                  p: 0,
                },
                "& .Mui-selected": { backgroundColor: "#F9F7F5 !important" },
              }}
            >
              <ToggleButton value="grid" aria-label="Grid view">
                <FluentIcon icon={GridDots24Regular} size="inline" color="#11151A" />
              </ToggleButton>
              <ToggleButton value="list" aria-label="List view">
                <FluentIcon icon={AppsListDetail24Regular} size="inline" color="#11151A" />
              </ToggleButton>
            </ToggleButtonGroup>

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
            onClick={() => setWizardOpen(true)}
            sx={{ height: 32, minWidth: 159, borderRadius: "8px", px: 2, textTransform: "none", fontWeight: 590, fontSize: "13px", lineHeight: "16px" }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FluentIcon icon={Add20Regular} size="inline" color="#fff" />
              <span>New project</span>
              <FluentIcon icon={ChevronDown12Regular} size="inline" color="#fff" />
            </Stack>
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {filterOptions.map((option, idx) => {
            const selected = activeFilter === option;
            return (
              <Chip
                key={`${option}-${idx}`}
                label={option}
                onClick={() => setActiveFilter(option)}
                sx={{
                  height: 24,
                  borderRadius: "6px",
                  px: 0.5,
                  bgcolor: selected ? "#F0EAE5" : "#FFFFFF",
                  color: "#616161",
                  fontSize: "13px",
                  border: "1px solid #DBCFC3",
                }}
              />
            );
          })}
        </Stack>

        {projectsPending && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(5, 1fr)" }, gap: 1 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={156} sx={{ borderRadius: "12px" }} />
            ))}
          </Box>
        )}

        {!projectsPending && (projects ?? []).length === 0 && (
          <Box
            sx={{
              borderRadius: "12px",
              border: "1px solid #F0EAE5",
              backgroundColor: "#fff",
              px: 1.5,
              py: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "6px",
                  backgroundColor: "#F0EAE5",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <FluentIcon icon={Briefcase24Regular} size="inline" color="#616161" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "14px", lineHeight: "20px", fontWeight: 700, color: "#11151A" }}>No projects yet</Typography>
                <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#616161" }}>
                  Create your first project to start scheduling suites and tracking progress.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              onClick={() => setWizardOpen(true)}
              sx={{ height: 32, minWidth: 112, borderRadius: "8px", textTransform: "none", fontWeight: 590, fontSize: "13px" }}
            >
              New project
            </Button>
          </Box>
        )}

        {!projectsPending && (projects ?? []).length > 0 && visibleProjects.length === 0 && (
          <Box sx={{ borderRadius: "12px", border: "1px solid #F0EAE5", backgroundColor: "#fff", p: 1.25 }}>
            <Typography sx={{ fontSize: "13px", lineHeight: "20px", fontWeight: 590, color: "#11151A" }}>No matching projects</Typography>
            <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#616161" }}>Try a different search or filter.</Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(276px, 276px))" : "1fr",
            gap: 1,
            justifyContent: "start",
          }}
        >
          {visibleProjects.map((p) => {
            const meta = cardMeta(p);
            return (
              <Card
                key={p.id}
                variant="outlined"
                onClick={() => navigate(`/projects/${p.id}`)}
                sx={{
                  width: view === "grid" ? 276 : "100%",
                  height: 156,
                  borderRadius: "12px",
                  borderColor: "#F0EAE5",
                  boxShadow: "none",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <CardContent sx={{ px: 1, py: 0, height: "100%", display: "flex", flexDirection: "column", "&:last-child": { pb: 0 } }}>
                  <Box sx={{ pt: 0.75, pb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20px",
                        color: "#242424",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name || "Project Name"}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#424242", mt: 0.25 }}>
                      {meta.tests} Tests
                    </Typography>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", px: 1, pb: 0.5, columnGap: 0.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>Total tests</Typography>
                      <Typography sx={{ fontSize: "18px", lineHeight: "20px", fontWeight: 590, color: "#11151A" }}>{Math.max(1, meta.tests * 7)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>Compliance Coverage</Typography>
                      <Typography sx={{ fontSize: "18px", lineHeight: "20px", fontWeight: 590, color: "#11151A" }}>{meta.compliance}%</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ borderTop: "1px solid #F9F7F5", py: 0.75, mt: "auto" }}>
                    <Stack direction="row" alignItems="center" sx={{ px: 1, height: 28 }}>
                      <Stack direction="row" alignItems="center" sx={{ width: 76, minWidth: 76 }}>
                        <Stack direction="row" alignItems="center" sx={{ width: 53 }}>
                          {[0, 1, 2, 3].map((n) => (
                            <Avatar
                              key={n}
                              sx={{
                                width: 23,
                                height: 23,
                                border: "1px solid #fff",
                                bgcolor: "#DBD0C3",
                                fontSize: "10px",
                                ml: n === 0 ? 0 : "-13px",
                              }}
                            >
                              {String.fromCharCode(65 + n)}
                            </Avatar>
                          ))}
                        </Stack>
                        <Typography sx={{ ml: 0.75, fontSize: "13px", lineHeight: "20px", color: "#616161" }}>+2</Typography>
                      </Stack>
                    <Box sx={{ ml: "auto" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ minWidth: 62, height: 28, borderRadius: "6px", borderColor: "#DBCFC3", color: "#616161", textTransform: "none", fontSize: "13px" }}
                      disabled
                    >
                      Inspect
                    </Button>
                    </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            border: "1px solid #F0EAE5",
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.08)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 0.5, fontSize: "14px", fontWeight: 700, color: "#11151A" }}>Create project</DialogTitle>
        <DialogContent>
          <Stepper
            activeStep={step}
            sx={{
              my: 2,
              "& .MuiStepLabel-label": { fontSize: "12px" },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <Stack spacing={2}>
              <TextField label="Project name" value={w.name} onChange={(e) => setW({ ...w, name: e.target.value })} sx={inputFieldSx} />
              <TextField label="Description" value={w.description} onChange={(e) => setW({ ...w, description: e.target.value })} multiline minRows={2} sx={inputFieldSx} />
            </Stack>
          )}
          {step === 1 && (
            <TextField select label="Program" fullWidth value={w.programId} onChange={(e) => setW({ ...w, programId: e.target.value })} sx={inputFieldSx}>
              {(programs ?? []).map((pr) => (
                <MenuItem key={pr.id} value={pr.id}>
                  {pr.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          {step === 2 && (
            <TextField
              select
              label="Target product"
              fullWidth
              value={w.targetProduct}
              onChange={(e) => setW({ ...w, targetProduct: e.target.value as (typeof products)[number] })}
              sx={inputFieldSx}
            >
              {products.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </TextField>
          )}
          {step === 3 && (
            <TextField
              select
              label="Environment"
              fullWidth
              value={w.environment}
              onChange={(e) => setW({ ...w, environment: e.target.value as (typeof envs)[number] })}
              sx={inputFieldSx}
            >
              {envs.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </TextField>
          )}
          {step === 4 && (
            <Stack spacing={2}>
              <TextField select label="Test suite" fullWidth value={w.suiteId} onChange={(e) => setW({ ...w, suiteId: e.target.value })} sx={inputFieldSx}>
                <MenuItem value="">(skip scheduling)</MenuItem>
                {(suites ?? []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="From"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={w.fromDate}
                  onChange={(e) => setW({ ...w, fromDate: e.target.value })}
                  sx={inputFieldSx}
                />
                <TextField
                  label="To"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={w.toDate}
                  onChange={(e) => setW({ ...w, toDate: e.target.value })}
                  sx={inputFieldSx}
                />
              </Stack>
              <TextField label="Time" value={w.time} onChange={(e) => setW({ ...w, time: e.target.value })} sx={inputFieldSx} />
              <TextField
                label="Recurrence (daily | weekly | cron:0 9 * * *)"
                value={w.recurrence}
                onChange={(e) => setW({ ...w, recurrence: e.target.value })}
                sx={inputFieldSx}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setWizardOpen(false)}>
            Cancel
          </Button>
          {step > 0 && (
            <Button variant="outlined" onClick={back}>
              Back
            </Button>
          )}
          {step < steps.length - 1 && (
            <Button variant="contained" onClick={next} disabled={(step === 0 && !w.name) || (step === 1 && !w.programId)}>
              Next
            </Button>
          )}
          {step === steps.length - 1 && (
            <Button variant="contained" disabled={!w.programId || !w.name || createProject.isPending} onClick={() => createProject.mutate()}>
              Finish
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
