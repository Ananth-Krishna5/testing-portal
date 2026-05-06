import { Box, Button, Chip, MenuItem, Skeleton, Stack, Switch, TextField, Typography } from "@mui/material";
import { Add12Regular, ChevronLeft12Regular } from "@fluentui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { FluentIcon } from "../components/ui/FluentIcon";

type ScheduledJob = {
  id: string;
  fromDate?: string | null;
  toDate?: string | null;
  recurrence?: string | null;
  time?: string | null;
  status?: string | null;
  suite?: { id?: string; name?: string | null } | null;
};

type ProjectDetail = {
  id: string;
  name: string;
  description?: string | null;
  targetProduct?: string | null;
  environment?: string | null;
  status?: string | null;
  programId?: string;
  autoCreateTickets?: boolean;
  createdAt?: string;
  updatedAt?: string;
  program?: { id: string; name: string } | null;
  scheduledJobs?: ScheduledJob[];
};

const tabs = ["Overview", "Test Suites", "Category", "Result", "Tickets", "Settings"] as const;
const toRepoUrl = (projectName: string): string => {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `github.com/org/${slug || "project-repo"}`;
};
const getHealth = (status?: string): string => {
  const value = (status ?? "").toLowerCase();
  if (value === "paused") return "At Risk";
  return "Healthy";
};

export default function ProjectDetailPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Test Suites");
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  const { data: project, isPending, isError } = useQuery({
    queryKey: ["project", id],
    enabled: Boolean(id),
    queryFn: async () => (await http.get<ProjectDetail>(`/projects/${id}`)).data,
  });
  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await http.get<{ id: string; name: string }[]>("/programs")).data,
  });
  const { data: testSuites } = useQuery({
    queryKey: ["suites"],
    queryFn: async () => (await http.get<{ id: string; name: string }[]>("/test-suites")).data,
  });

  const suites = useMemo(() => project?.scheduledJobs ?? [], [project]);
  const firstSchedule = suites[0];
  const locationState = (location.state ?? {}) as { fromProgramId?: string; fromProgramName?: string };
  const breadcrumbProgramName = locationState.fromProgramName || project?.program?.name || "Program";
  const breadcrumbProgramId = locationState.fromProgramId || project?.programId;
  const formatDate = (value?: string | null): string => (value ? new Date(value).toLocaleDateString() : "-");
  const categoryList = useMemo(
    () =>
      (project?.scheduledJobs ?? [])
        .map((job) => job.suite?.name?.trim())
        .filter((name): name is string => Boolean(name))
        .slice(0, 4),
    [project?.scheduledJobs],
  );
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
    programId: "",
    targetProduct: "Sia",
    environment: "Staging",
    status: "draft",
    autoCreateTickets: true,
    suiteId: "",
    fromDate: "",
    toDate: "",
    time: "09:00",
    recurrence: "daily",
  });

  useEffect(() => {
    if (!project) return;
    setSettingsForm({
      name: project.name ?? "",
      description: project.description ?? "",
      programId: project.programId ?? "",
      targetProduct: project.targetProduct ?? "Sia",
      environment: project.environment ?? "Staging",
      status: project.status ?? "draft",
      autoCreateTickets: Boolean(project.autoCreateTickets),
      suiteId: firstSchedule?.suite?.id ?? "",
      fromDate: firstSchedule?.fromDate ? new Date(firstSchedule.fromDate).toISOString().slice(0, 10) : "",
      toDate: firstSchedule?.toDate ? new Date(firstSchedule.toDate).toISOString().slice(0, 10) : "",
      time: firstSchedule?.time ?? "09:00",
      recurrence: firstSchedule?.recurrence ?? "daily",
    });
  }, [project, firstSchedule?.fromDate, firstSchedule?.recurrence, firstSchedule?.suite?.id, firstSchedule?.time, firstSchedule?.toDate]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await http.patch(`/projects/${id}`, {
        name: settingsForm.name,
        description: settingsForm.description,
        programId: settingsForm.programId,
        targetProduct: settingsForm.targetProduct,
        environment: settingsForm.environment,
        status: settingsForm.status,
        autoCreateTickets: settingsForm.autoCreateTickets,
      });
      if (firstSchedule?.id) {
        await http.patch(`/scheduled-jobs/${firstSchedule.id}`, {
          suiteId: settingsForm.suiteId || undefined,
          fromDate: settingsForm.fromDate || undefined,
          toDate: settingsForm.toDate || undefined,
          time: settingsForm.time || undefined,
          recurrence: settingsForm.recurrence || undefined,
        });
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["project", id] });
      await qc.invalidateQueries({ queryKey: ["projects"] });
      setIsEditingSettings(false);
    },
  });

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
      <Box sx={{ p: 1, minHeight: 0, overflow: "auto" }} className="app-scroll">
        <Stack spacing={1}>
          <Box sx={{ borderRadius: "8px", bgcolor: "#FFFFFF", border: "1px solid #F0EAE5", px: 1, py: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  onClick={() => {
                    if (breadcrumbProgramId) {
                      navigate(`/programs/${breadcrumbProgramId}`);
                      return;
                    }
                    navigate("/projects");
                  }}
                  variant="text"
                  sx={{
                    minWidth: 33,
                    width: 33,
                    height: 64,
                    borderRadius: "8px",
                    p: 0,
                    backgroundColor: "#F9F7F5",
                  }}
                >
                  <FluentIcon icon={ChevronLeft12Regular} size="inline" color="#11151A" />
                </Button>
                <Stack spacing={0.25}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "#11151A" }}>
                      Programs
                    </Typography>
                    <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>{">"}</Typography>
                    <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A", opacity: 0.8 }}>{breadcrumbProgramName}</Typography>
                    <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>{">"}</Typography>
                    <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "#11151A", opacity: 0.5 }}>
                      {project?.name ?? "Project"}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "14px", lineHeight: "20px", fontWeight: 700, color: "#242424" }}>
                    {project?.targetProduct?.trim() || "Test"}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#424242" }}>
                    {project?.description?.trim() || "PRJ-101 • Infrastructure"}
                  </Typography>
                </Stack>
              </Stack>

              <Box sx={{ ml: "auto" }}>
                <Button
                  variant="text"
                  sx={{ minWidth: 72, p: 0, textTransform: "none", color: "#0F6CBD", fontSize: "12px", fontWeight: 590, lineHeight: "20px" }}
                  startIcon={<FluentIcon icon={Add12Regular} size="inline" color="#0F6CBD" />}
                >
                  New Test
                </Button>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ borderBottom: "0.5px solid #AA9B90", px: 0 }}>
            <Stack direction="row" spacing={0.25}>
              {tabs.map((tab) => {
                const selected = tab === activeTab;
                return (
                  <Button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    variant="text"
                    sx={{
                      minHeight: 32,
                      px: 1.5,
                      borderRadius: 0,
                      borderBottom: selected ? "3px solid #7C573C" : "3px solid transparent",
                      textTransform: "none",
                      color: selected ? "#7C573C" : "rgba(124,87,60,0.8)",
                      fontSize: "13px",
                      fontWeight: 510,
                      lineHeight: "20px",
                    }}
                  >
                    {tab}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          <Box sx={{ borderRadius: "12px", border: "1px solid #F0EAE5", bgcolor: "#FFFFFF", overflow: "hidden" }}>
            {isPending && (
              <Box sx={{ p: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 0.75, borderRadius: "8px" }} />
                ))}
              </Box>
            )}

            {!isPending && isError && (
              <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#616161" }}>Project not found.</Typography>
              </Box>
            )}

            {!isPending && !isError && activeTab !== "Test Suites" && (
              <>
                {activeTab !== "Settings" && (
                  <Box sx={{ p: 1.5 }}>
                    <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#616161" }}>
                      {activeTab} section will use project-specific backend data when available.
                    </Typography>
                  </Box>
                )}
                {activeTab === "Settings" && (
                  <Box sx={{ p: 1.25 }}>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mb: 0.75 }}>
                      {!isEditingSettings ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setIsEditingSettings(true)}
                          sx={{ minWidth: 76, height: 28, borderRadius: "6px", textTransform: "none", borderColor: "#DBCFC3", color: "#616161" }}
                        >
                          Edit
                        </Button>
                      ) : (
                        <Stack direction="row" spacing={0.75}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setIsEditingSettings(false);
                              if (project) {
                                setSettingsForm({
                                  name: project.name ?? "",
                                  description: project.description ?? "",
                                  programId: project.programId ?? "",
                                  targetProduct: project.targetProduct ?? "Sia",
                                  environment: project.environment ?? "Staging",
                                  status: project.status ?? "draft",
                                  autoCreateTickets: Boolean(project.autoCreateTickets),
                                  suiteId: firstSchedule?.suite?.id ?? "",
                                  fromDate: firstSchedule?.fromDate ? new Date(firstSchedule.fromDate).toISOString().slice(0, 10) : "",
                                  toDate: firstSchedule?.toDate ? new Date(firstSchedule.toDate).toISOString().slice(0, 10) : "",
                                  time: firstSchedule?.time ?? "09:00",
                                  recurrence: firstSchedule?.recurrence ?? "daily",
                                });
                              }
                            }}
                            sx={{ minWidth: 76, height: 28, borderRadius: "6px", textTransform: "none", borderColor: "#DBCFC3", color: "#616161" }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={!settingsForm.name.trim() || !settingsForm.programId || saveSettings.isPending}
                            onClick={() => saveSettings.mutate()}
                            sx={{ minWidth: 76, height: 28, borderRadius: "6px", textTransform: "none" }}
                          >
                            Save
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                    <Box
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid #F0EAE5",
                        bgcolor: "#FAF9F7",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 1,
                          py: 0.75,
                          borderBottom: "1px solid #F0EAE5",
                          display: "grid",
                          gridTemplateColumns: "1fr 1.4fr",
                          gap: 1,
                          bgcolor: "#F5EFEA",
                        }}
                      >
                        <Typography sx={{ fontSize: "11px", lineHeight: "16px", fontWeight: 700, color: "#616161", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Field
                        </Typography>
                        <Typography sx={{ fontSize: "11px", lineHeight: "16px", fontWeight: 700, color: "#616161", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Value
                        </Typography>
                      </Box>
                      {[
                        {
                          label: "Project name",
                          read: project?.name?.trim() || "-",
                          edit: (
                            <TextField
                              size="small"
                              value={settingsForm.name}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, name: e.target.value }))}
                              fullWidth
                            />
                          ),
                        },
                        {
                          label: "Description",
                          read: project?.description?.trim() || "-",
                          edit: (
                            <TextField
                              size="small"
                              value={settingsForm.description}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, description: e.target.value }))}
                              fullWidth
                            />
                          ),
                        },
                        {
                          label: "Program",
                          read: project?.program?.name || "-",
                          edit: (
                            <TextField
                              select
                              size="small"
                              value={settingsForm.programId}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, programId: e.target.value }))}
                              fullWidth
                            >
                              {(programs ?? []).map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                  {p.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          ),
                        },
                        {
                          label: "Target product",
                          read: project?.targetProduct?.trim() || "-",
                          edit: (
                            <TextField
                              select
                              size="small"
                              value={settingsForm.targetProduct}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, targetProduct: e.target.value }))}
                              fullWidth
                            >
                              {["Sia", "Olympus", "Horus", "Valhalla"].map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </TextField>
                          ),
                        },
                        {
                          label: "Environment",
                          read: project?.environment?.trim() || "-",
                          edit: (
                            <TextField
                              select
                              size="small"
                              value={settingsForm.environment}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, environment: e.target.value }))}
                              fullWidth
                            >
                              {["Staging", "Dev", "Production", "UAT"].map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </TextField>
                          ),
                        },
                        {
                          label: "Status",
                          read: project?.status?.trim() || "-",
                          edit: (
                            <TextField
                              select
                              size="small"
                              value={settingsForm.status}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, status: e.target.value }))}
                              fullWidth
                            >
                              {["draft", "active", "paused", "completed"].map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </TextField>
                          ),
                        },
                        {
                          label: "Auto-create tickets",
                          read: project?.autoCreateTickets ? "Enabled" : "Disabled",
                          edit: (
                            <Stack direction="row" alignItems="center">
                              <Switch checked={settingsForm.autoCreateTickets} onChange={(_, v) => setSettingsForm((prev) => ({ ...prev, autoCreateTickets: v }))} />
                              <Typography sx={{ fontSize: "12px", color: "#616161" }}>
                                {settingsForm.autoCreateTickets ? "Enabled" : "Disabled"}
                              </Typography>
                            </Stack>
                          ),
                        },
                        {
                          label: "Health",
                          read: getHealth(project?.status),
                          edit: <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>{getHealth(settingsForm.status)}</Typography>,
                        },
                        {
                          label: "Repository",
                          read: toRepoUrl(project?.name ?? ""),
                          edit: (
                            <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>
                              {toRepoUrl(settingsForm.name || project?.name || "")}
                            </Typography>
                          ),
                        },
                        {
                          label: "Owner",
                          read: "teja@xmachina.ai",
                          edit: <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>teja@xmachina.ai</Typography>,
                        },
                        {
                          label: "Categories",
                          read: categoryList.length ? categoryList.join(", ") : "-",
                          edit: (
                            <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>
                              {categoryList.length ? categoryList.join(", ") : "-"}
                            </Typography>
                          ),
                        },
                        {
                          label: "Suite",
                          read: firstSchedule?.suite?.name?.trim() || "(not scheduled)",
                          edit: firstSchedule?.id ? (
                            <TextField
                              select
                              size="small"
                              value={settingsForm.suiteId}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, suiteId: e.target.value }))}
                              fullWidth
                            >
                              {(testSuites ?? []).map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                  {s.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            <Typography sx={{ fontSize: "12px", color: "#616161" }}>No schedule to edit</Typography>
                          ),
                        },
                        {
                          label: "From date",
                          read: formatDate(firstSchedule?.fromDate),
                          edit: firstSchedule?.id ? (
                            <TextField
                              size="small"
                              type="date"
                              value={settingsForm.fromDate}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, fromDate: e.target.value }))}
                              fullWidth
                            />
                          ) : (
                            <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>-</Typography>
                          ),
                        },
                        {
                          label: "To date",
                          read: formatDate(firstSchedule?.toDate),
                          edit: firstSchedule?.id ? (
                            <TextField
                              size="small"
                              type="date"
                              value={settingsForm.toDate}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, toDate: e.target.value }))}
                              fullWidth
                            />
                          ) : (
                            <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>-</Typography>
                          ),
                        },
                        {
                          label: "Time",
                          read: firstSchedule?.time?.trim() || "-",
                          edit: firstSchedule?.id ? (
                            <TextField
                              size="small"
                              value={settingsForm.time}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, time: e.target.value }))}
                              fullWidth
                            />
                          ) : (
                            <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>-</Typography>
                          ),
                        },
                        {
                          label: "Recurrence",
                          read: firstSchedule?.recurrence?.trim() || "-",
                          edit: firstSchedule?.id ? (
                            <TextField
                              size="small"
                              value={settingsForm.recurrence}
                              onChange={(e) => setSettingsForm((prev) => ({ ...prev, recurrence: e.target.value }))}
                              fullWidth
                            />
                          ) : (
                            <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>-</Typography>
                          ),
                        },
                      ].map((row) => (
                        <Box
                          key={row.label}
                          sx={{
                            px: 1,
                            py: 0.75,
                            display: "grid",
                            gridTemplateColumns: "1fr 1.4fr",
                            gap: 1,
                            borderBottom: "1px solid #F0EAE5",
                            "&:last-of-type": { borderBottom: "none" },
                          }}
                        >
                          <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#616161" }}>{row.label}</Typography>
                          {isEditingSettings ? row.edit : <Typography sx={{ fontSize: "13px", lineHeight: "18px", color: "#11151A", fontWeight: 590 }}>{row.read}</Typography>}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}

            {!isPending && !isError && activeTab === "Test Suites" && suites.length === 0 && (
              <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#616161" }}>
                  No test suites are scheduled for this project.
                </Typography>
              </Box>
            )}

            {!isPending &&
              !isError &&
              activeTab === "Test Suites" &&
              suites.map((job) => (
                <Box
                  key={job.id}
                  sx={{
                    px: 1,
                    py: 0.75,
                    borderBottom: "1px solid #F0EAE5",
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
                    gap: 1,
                    alignItems: "center",
                    minHeight: 52,
                  }}
                >
                  <Typography sx={{ fontSize: "13px", lineHeight: "20px", fontWeight: 590, color: "#11151A" }}>
                    {job.suite?.name?.trim() || "Unnamed Suite"}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#616161" }}>
                    {job.recurrence || "manual"}
                  </Typography>
                  <Chip
                    size="small"
                    label={job.status || "scheduled"}
                    sx={{ width: "fit-content", height: 22, borderRadius: "6px", bgcolor: "#FAF9F7", color: "#11151A" }}
                  />
                  <Button variant="outlined" size="small" sx={{ width: "fit-content", minWidth: 62, height: 28, borderRadius: "6px", textTransform: "none", borderColor: "#DBCFC3", color: "#616161" }}>
                    Inspect
                  </Button>
                </Box>
              ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
