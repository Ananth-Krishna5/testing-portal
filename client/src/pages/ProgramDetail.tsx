import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Add20Regular, ChevronLeft12Regular, Search20Regular } from "@fluentui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { RoadmapCanvas } from "../components/RoadmapCanvas";
import { FluentIcon } from "../components/ui/FluentIcon";

type ProgramDetail = {
  id: string;
  name: string;
  description?: string | null;
  manager?: string | null;
  status: "draft" | "active" | "completed" | "archived" | string;
  roadmap?: { id: string; name: string; canvasJson?: unknown; updatedAt?: string } | null;
};

type ProjectRow = {
  id: string;
  name: string;
  description?: string | null;
  targetProduct?: string | null;
  environment?: string | null;
  status?: "draft" | "active" | "paused" | "completed" | string;
  scheduledJobs?: Array<{ suite?: { name?: string | null } | null }>;
};

const sectionTabs = ["Overview", "Projects", "Roadmaps", "Reports"] as const;

const getStatusChip = (status?: string) => {
  const value = (status ?? "").toLowerCase();
  if (value === "paused") return { label: "At Risk", bg: "#FAF9F7", color: "#FF383C", leftBorder: "4px solid #FF383C" };
  return { label: "Healthy", bg: "#FAF9F7", color: "#138425", leftBorder: "none" };
};

export default function ProgramDetailPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState<(typeof sectionTabs)[number]>("Projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [addProjectsOpen, setAddProjectsOpen] = useState(false);
  const [selectedToAddIds, setSelectedToAddIds] = useState<string[]>([]);

  const {
    data: program,
    isPending: programPending,
    isError: programError,
  } = useQuery({
    queryKey: ["program", id],
    enabled: Boolean(id),
    queryFn: async () => (await http.get<ProgramDetail>(`/programs/${id}`)).data,
  });

  const { data: projects, isPending: projectsPending } = useQuery({
    queryKey: ["projects", { programId: id }],
    enabled: Boolean(id),
    queryFn: async () => (await http.get<ProjectRow[]>("/projects", { params: { programId: id } })).data,
  });
  const { data: allProjects, isPending: allProjectsPending } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await http.get<ProjectRow[]>("/projects")).data,
  });

  const visibleProjects = useMemo(() => {
    const rows = projects ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => `${p.name} ${p.description ?? ""}`.toLowerCase().includes(q));
  }, [projects, search]);
  const selectedProject = useMemo(
    () => (projects ?? []).find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );
  const attachableProjects = useMemo(
    () => (allProjects ?? []).filter((project) => !(projects ?? []).some((linked) => linked.id === project.id)),
    [allProjects, projects],
  );
  const breadcrumbTail = useMemo(() => {
    const trail: string[] = [];
    trail.push(activeSection);
    if (selectedProject) {
      trail.push(selectedProject.name);
    }
    if (activeSection === "Roadmaps" && selectedRoadmapId && program?.roadmap?.id === selectedRoadmapId) {
      trail.push(program.roadmap.name);
      trail.push("Canvas");
    }
    return trail;
  }, [activeSection, selectedProject, selectedRoadmapId, program?.roadmap]);
  const dynamicHeading = useMemo(() => {
    if (activeSection === "Projects") return `${program?.name ?? "Program"} · Projects`;
    if (activeSection === "Roadmaps" && selectedProject && selectedRoadmapId) return `${selectedProject.name} · Roadmap Canvas`;
    if (activeSection === "Roadmaps" && selectedProject) return `${selectedProject.name} · Roadmaps`;
    return `${activeSection} · ${program?.name ?? "Program"}`;
  }, [activeSection, program?.name, selectedProject, selectedRoadmapId]);
  const createRoadmap = useMutation({
    mutationFn: async () => {
      if (!id || !selectedProject) return;
      return (
        await http.post(`/programs/${id}/roadmap`, {
          name: `${selectedProject.name} roadmap`,
          canvasJson: {
            nodes: [
              { id: "1", type: "default", position: { x: 0, y: 0 }, data: { label: "Kickoff" } },
              { id: "2", type: "default", position: { x: 220, y: 40 }, data: { label: "Design" } },
              { id: "3", type: "default", position: { x: 460, y: 0 }, data: { label: "Build" } },
              { id: "4", type: "default", position: { x: 700, y: 60 }, data: { label: "Certify" } },
            ],
            edges: [
              { id: "e1-2", source: "1", target: "2" },
              { id: "e2-3", source: "2", target: "3" },
              { id: "e3-4", source: "3", target: "4" },
            ],
          },
          isCustom: true,
        })
      ).data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["program", id] });
    },
  });
  const addProjectsMutation = useMutation({
    mutationFn: async (projectIds: string[]) => {
      if (!id || projectIds.length === 0) return;
      await Promise.all(projectIds.map((projectId) => http.patch(`/projects/${projectId}`, { programId: id })));
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["projects"] }),
        qc.invalidateQueries({ queryKey: ["projects", { programId: id }] }),
        qc.invalidateQueries({ queryKey: ["program", id] }),
      ]);
      setSelectedToAddIds([]);
      setAddProjectsOpen(false);
    },
  });
  const toRepoUrl = (projectName: string): string => {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `github.com/org/${slug || "project-repo"}`;
  };

  if (!id) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontSize: "13px", color: "#616161" }}>Program id is missing.</Typography>
      </Box>
    );
  }

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
          Program Details
        </Typography>
      </Box>

      <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1, minHeight: 0, flex: 1 }}>
        <Box sx={{ borderRadius: "12px", border: "1px solid #F0EAE5", bgcolor: "#FFFFFF", p: 1.25 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                onClick={() => navigate("/programs")}
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
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>Programs</Typography>
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>{">"}</Typography>
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A", opacity: 0.7 }}>{program?.name ?? "Program"}</Typography>
                  {breadcrumbTail.map((crumb) => (
                    <Box key={crumb} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>{">"}</Typography>
                      <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A", opacity: 0.6 }}>{crumb}</Typography>
                    </Box>
                  ))}
                </Stack>
                {programPending ? (
                  <Skeleton variant="text" width={220} height={30} />
                ) : (
                  <Typography sx={{ fontSize: "18px", lineHeight: "24px", fontWeight: 700, color: "#11151A" }}>
                    {dynamicHeading}
                  </Typography>
                )}
                {!programPending ? (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 6, height: 6, borderRadius: "2px", bgcolor: getStatusChip(program?.status).color }} />
                    <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: getStatusChip(program?.status).color, fontWeight: 590 }}>
                      {getStatusChip(program?.status).label}
                    </Typography>
                  </Stack>
                ) : null}
                <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#616161" }}>
                  {program?.description?.trim() ? program.description : "No description available"}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center">
              <Chip
                size="small"
                label={program?.manager?.trim() ? program.manager : "Unassigned"}
                sx={{ height: 24, borderRadius: "6px", bgcolor: "#FAF9F7", color: "#11151A" }}
              />
            </Stack>
          </Stack>
        </Box>

        <ToggleButtonGroup
          exclusive
          value={activeSection}
          onChange={(_, value: (typeof sectionTabs)[number] | null) => value && setActiveSection(value)}
          sx={{
            p: 0.25,
            borderRadius: "8px",
            backgroundColor: "#F0EAE5",
            width: "fit-content",
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
          {sectionTabs.map((tab) => (
            <ToggleButton key={tab} value={tab}>
              {tab}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {activeSection === "Projects" && (
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1} alignItems={{ xs: "stretch", lg: "center" }}>
          <TextField
            size="small"
            placeholder="Search projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              minWidth: { lg: 448 },
              "& .MuiOutlinedInput-root": {
                height: 32,
                borderRadius: "8px",
                backgroundColor: "#F0EAE5",
              },
            }}
            slotProps={{
              input: {
                startAdornment: <FluentIcon icon={Search20Regular} size="inline" color="#616161" />,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => setAddProjectsOpen(true)}
            sx={{ height: 32, minWidth: 145, borderRadius: "8px", px: 2, textTransform: "none", fontWeight: 590, fontSize: "13px", lineHeight: "16px" }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FluentIcon icon={Add20Regular} size="inline" color="#FFFFFF" />
              <span>Add Projects</span>
            </Stack>
          </Button>
        </Stack>
        )}

        <Box sx={{ borderRadius: "12px", border: "1px solid #F0EAE5", bgcolor: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          {activeSection === "Projects" && (
            <Box
              sx={{
                px: 1,
                py: 0.75,
                borderBottom: "1px solid #F0EAE5",
                display: "grid",
                gridTemplateColumns: "1.2fr 0.7fr 0.7fr 0.7fr 0.9fr 1fr 0.6fr 0.85fr 0.2fr",
                gap: 0.75,
                bgcolor: "rgba(255,255,255,0.8)",
                borderRadius: "6px",
              }}
            >
              {["Projects", "Health", "Application", "Environment", "Categories", "Git Repo", "Status", "Owner", ""].map((label) => (
                <Typography key={label} sx={{ fontSize: "9px", lineHeight: "14px", fontWeight: 700, color: "#616161", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {label}
                </Typography>
              ))}
            </Box>
          )}

          <Box sx={{ overflow: "auto", minHeight: 0, flex: 1 }}>
            {(projectsPending || programPending) &&
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={58} sx={{ borderBottom: "1px solid #F0EAE5" }} />)}

            {!projectsPending && !programPending && programError && (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: "13px", color: "#616161" }}>Program not found or unavailable.</Typography>
              </Box>
            )}

            {!projectsPending && !programPending && !programError && !["Projects", "Roadmaps"].includes(activeSection) && (
              <Box sx={{ p: 2 }}>
                {activeSection === "Roadmaps" && !selectedProject ? (
                  <>
                    <Typography sx={{ fontSize: "13px", color: "#616161", mb: 1 }}>
                      Select a project from the Projects tab to view its roadmaps.
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => setActiveSection("Projects")} sx={{ minWidth: 108, height: 28, borderRadius: "6px", textTransform: "none", borderColor: "#DBCFC3", color: "#616161" }}>
                      Open projects
                    </Button>
                  </>
                ) : (
                  <Typography sx={{ fontSize: "13px", color: "#616161" }}>
                    {activeSection} data is not available from current backend endpoints.
                  </Typography>
                )}
              </Box>
            )}

            {!projectsPending && !programPending && !programError && activeSection === "Projects" && visibleProjects.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: "13px", color: "#616161" }}>No projects found for this program.</Typography>
              </Box>
            )}
            {!projectsPending && !programPending && !programError && activeSection === "Roadmaps" && selectedProject && (
              <Box sx={{ p: 1.25 }}>
                <Box sx={{ borderRadius: "8px", border: "1px solid #F0EAE5", bgcolor: "#FAF9F7", overflow: "hidden" }}>
                  <Box sx={{ px: 1, py: 0.75, borderBottom: "1px solid #F0EAE5", bgcolor: "#F5EFEA" }}>
                    <Typography sx={{ fontSize: "11px", lineHeight: "16px", fontWeight: 700, color: "#616161", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Roadmaps under {selectedProject.name}
                    </Typography>
                  </Box>
                  {program?.roadmap ? (
                    selectedRoadmapId === program.roadmap.id ? (
                      <Box sx={{ p: 1 }}>
                        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 0.75 }}>
                          <Button variant="outlined" size="small" onClick={() => setSelectedRoadmapId(null)} sx={{ minWidth: 96, height: 28, borderRadius: "6px", textTransform: "none", borderColor: "#DBCFC3", color: "#616161" }}>
                            Back to roadmaps
                          </Button>
                        </Stack>
                        <RoadmapCanvas title={program.roadmap.name} canvas={program.roadmap.canvasJson ?? {}} />
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ px: 1, py: 0.75, borderBottom: "1px solid #F0EAE5", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 0.75, bgcolor: "#FAF9F7" }}>
                          {["Roadmap", "Updated", "Action"].map((label) => (
                            <Typography key={label} sx={{ fontSize: "10px", lineHeight: "16px", fontWeight: 700, color: "#616161", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              {label}
                            </Typography>
                          ))}
                        </Box>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.75,
                            display: "grid",
                            gridTemplateColumns: "1.4fr 1fr 1fr",
                            gap: 0.75,
                            alignItems: "center",
                            borderTop: "1px solid #F0EAE5",
                          }}
                        >
                          <Typography sx={{ fontSize: "13px", lineHeight: "18px", fontWeight: 590, color: "#11151A" }}>{program.roadmap.name}</Typography>
                          <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#616161" }}>
                            {program.roadmap.updatedAt ? new Date(program.roadmap.updatedAt).toLocaleDateString() : "-"}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setSelectedRoadmapId(program.roadmap!.id)}
                            sx={{ minWidth: 104, width: "fit-content", height: 28, borderRadius: "6px", textTransform: "none", borderColor: "#DBCFC3", color: "#616161" }}
                          >
                            Open canvas
                          </Button>
                        </Box>
                      </>
                    )
                  ) : (
                    <Box sx={{ p: 1.5 }}>
                      <Typography sx={{ fontSize: "13px", color: "#616161" }}>No roadmaps linked to this project yet.</Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => createRoadmap.mutate()}
                        disabled={createRoadmap.isPending}
                        sx={{ mt: 1, height: 28, borderRadius: "6px", textTransform: "none", fontSize: "12px", px: 1.5 }}
                      >
                        Create roadmap
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {!projectsPending &&
              !programPending &&
              !programError &&
              activeSection === "Projects" &&
              visibleProjects.map((project) => {
                const chip = getStatusChip(project.status);
                const categories = (project.scheduledJobs ?? [])
                  .map((job) => job.suite?.name?.trim())
                  .filter((name): name is string => Boolean(name))
                  .slice(0, 2);

                return (
                  <Box
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setSelectedRoadmapId(null);
                      setActiveSection("Roadmaps");
                    }}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      display: "grid",
                      gridTemplateColumns: "1.2fr 0.7fr 0.7fr 0.7fr 0.9fr 1fr 0.6fr 0.85fr 0.2fr",
                      gap: 0.75,
                      borderBottom: "1px solid #F0EAE5",
                      minHeight: 64,
                      alignItems: "center",
                      cursor: "pointer",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      borderLeft: chip.label === "At Risk" ? "4px solid #FF383C" : "4px solid transparent",
                      "&:hover": { backgroundColor: "#FAF9F7" },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "13px", lineHeight: "18px", fontWeight: 700, color: "#242424" }}>{project.name}</Typography>
                      <Typography sx={{ fontSize: "11px", lineHeight: "16px", color: "#616161" }}>
                        {project.description?.trim() ? project.description : "No description"}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        size="small"
                        label={chip.label}
                        sx={{
                          height: 22,
                          borderRadius: "6px",
                          bgcolor: chip.bg,
                          color: chip.color,
                          borderLeft: "none",
                          "& .MuiChip-label": { fontWeight: 590, fontSize: "11px", lineHeight: "18px", px: "6px" },
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: "13px", lineHeight: "18px", fontWeight: 700, color: "#242424" }}>{project.targetProduct?.trim() ? project.targetProduct : "-"}</Typography>
                    <Chip
                      size="small"
                      label={(project.environment ?? "-").toUpperCase()}
                      sx={{ width: "fit-content", height: 22, borderRadius: "6px", bgcolor: "#F9F7F5", border: "1px solid #F0EAE5", color: "#7C695A", "& .MuiChip-label": { fontSize: "11px", fontWeight: 590, px: "6px" } }}
                    />
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                      {categories.length ? (
                        categories.map((cat) => (
                          <Chip key={`${project.id}-${cat}`} size="small" label={cat} sx={{ height: 22, borderRadius: "6px", bgcolor: "#F9F7F5", border: "1px solid #F0EAE5", color: "#7C695A", "& .MuiChip-label": { fontSize: "11px", px: "6px" } }} />
                        ))
                      ) : (
                        <Typography sx={{ fontSize: "12px", color: "#11151A" }}>-</Typography>
                      )}
                    </Stack>
                    <Typography sx={{ fontSize: "13px", lineHeight: "18px", fontWeight: 700, color: "#0F6CBD", textDecoration: "underline" }}>
                      {toRepoUrl(project.name)}
                    </Typography>
                    <Chip
                      size="small"
                      label={project.status === "active" ? "Active" : project.status === "paused" ? "Scoping.." : "Active"}
                      sx={{
                        width: "fit-content",
                        height: 22,
                        borderRadius: "6px",
                        bgcolor: project.status === "active" ? "rgba(15,108,189,0.15)" : "#F9F7F5",
                        color: project.status === "active" ? "#0F6CBD" : "#7C695A",
                        border: project.status === "active" ? "none" : "1px solid #F0EAE5",
                        "& .MuiChip-label": { fontSize: "11px", fontWeight: 590, px: "6px" },
                      }}
                    />
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Avatar sx={{ width: 26, height: 26, bgcolor: "#DBCFC3", color: "#7C695A", fontSize: "10px", fontWeight: 700 }}>
                        {(program?.manager?.trim()?.[0] ?? "T").toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontSize: "11px", lineHeight: "16px", color: "#7C695A" }}>
                        {(program?.manager?.trim() || "teja")}@xmachina.ai
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: "14px", lineHeight: "16px", color: "#897158", textAlign: "right" }}>...</Typography>
                  </Box>
                );
              })}
          </Box>
        </Box>
      </Box>
      <Dialog
        open={addProjectsOpen}
        onClose={() => {
          if (addProjectsMutation.isPending) return;
          setAddProjectsOpen(false);
          setSelectedToAddIds([]);
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            border: "1px solid #F0EAE5",
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.08)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--app-font-sans)",
            fontSize: "12px",
            lineHeight: "20px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "#11151A",
            pb: 0.5,
          }}
        >
          Add Projects
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "12px", color: "#616161", mb: 1 }}>
            Select existing projects to add under this program.
          </Typography>
          {allProjectsPending ? (
            <Stack spacing={0.75}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} variant="rounded" height={40} />
              ))}
            </Stack>
          ) : attachableProjects.length === 0 ? (
            <Typography sx={{ fontSize: "13px", color: "#616161" }}>
              No existing projects available to add.
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              {attachableProjects.map((project) => {
                const checked = selectedToAddIds.includes(project.id);
                return (
                  <Button
                    key={project.id}
                    variant="text"
                    onClick={() =>
                      setSelectedToAddIds((prev) =>
                        prev.includes(project.id) ? prev.filter((value) => value !== project.id) : [...prev, project.id],
                      )
                    }
                    sx={{
                      justifyContent: "space-between",
                      borderRadius: "8px",
                      border: "1px solid #F0EAE5",
                      textTransform: "none",
                      px: 1,
                      py: 0.75,
                    }}
                  >
                    <Stack spacing={0.25} alignItems="flex-start">
                      <Typography sx={{ fontSize: "13px", color: "#11151A", fontWeight: 700 }}>{project.name}</Typography>
                      <Typography sx={{ fontSize: "11px", color: "#616161" }}>
                        {(project.description ?? "").trim() || "No description"}
                      </Typography>
                    </Stack>
                    <Checkbox checked={checked} />
                  </Button>
                );
              })}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => {
              setAddProjectsOpen(false);
              setSelectedToAddIds([]);
            }}
            disabled={addProjectsMutation.isPending}
            sx={{ height: 32, minWidth: 92, borderRadius: "8px", textTransform: "none", fontWeight: 590, fontSize: "13px", lineHeight: "16px" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => addProjectsMutation.mutate(selectedToAddIds)}
            disabled={selectedToAddIds.length === 0 || addProjectsMutation.isPending}
            sx={{ height: 32, minWidth: 118, borderRadius: "8px", textTransform: "none", fontWeight: 590, fontSize: "13px", lineHeight: "16px" }}
          >
            Add selected
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
