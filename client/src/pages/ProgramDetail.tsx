import { Box, Button, Chip, Skeleton, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Add20Regular, ChevronLeft12Regular, Search20Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { FluentIcon } from "../components/ui/FluentIcon";

type ProgramDetail = {
  id: string;
  name: string;
  description?: string | null;
  manager?: string | null;
  status: "draft" | "active" | "completed" | "archived" | string;
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

const sectionTabs = ["Projects", "Roadmaps", "Test Suites", "Info"] as const;

const getStatusChip = (status?: string) => {
  const value = (status ?? "").toLowerCase();
  if (value === "active") return { label: "Active", bg: "rgba(15, 108, 189, 0.12)", color: "#0F6CBD", leftBorder: "none" };
  if (value === "paused") return { label: "At Risk", bg: "#FAF9F7", color: "#FF383C", leftBorder: "4px solid #FF383C" };
  if (value === "completed") return { label: "On Track", bg: "#FAF9F7", color: "#138425", leftBorder: "none" };
  if (value === "draft") return { label: "Draft", bg: "#FAF9F7", color: "#616161", leftBorder: "none" };
  return { label: "Unknown", bg: "#FAF9F7", color: "#616161", leftBorder: "none" };
};

export default function ProgramDetailPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<(typeof sectionTabs)[number]>("Projects");
  const [search, setSearch] = useState("");

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

  const visibleProjects = useMemo(() => {
    const rows = projects ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => `${p.name} ${p.description ?? ""}`.toLowerCase().includes(q));
  }, [projects, search]);

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
                {programPending ? (
                  <Skeleton variant="text" width={220} height={30} />
                ) : (
                  <Typography sx={{ fontSize: "18px", lineHeight: "24px", fontWeight: 700, color: "#11151A" }}>
                    {program?.name ?? "Program not found"}
                  </Typography>
                )}
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
              <Chip
                size="small"
                label={getStatusChip(program?.status).label}
                sx={{
                  height: 24,
                  borderRadius: "6px",
                  bgcolor: getStatusChip(program?.status).bg,
                  color: getStatusChip(program?.status).color,
                  borderLeft: getStatusChip(program?.status).leftBorder,
                  "& .MuiChip-label": { fontWeight: 590 },
                }}
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
            sx={{ height: 32, minWidth: 145, borderRadius: "8px", px: 2, textTransform: "none", fontWeight: 590, fontSize: "13px", lineHeight: "16px" }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FluentIcon icon={Add20Regular} size="inline" color="#FFFFFF" />
              <span>New project</span>
            </Stack>
          </Button>
        </Stack>

        <Box sx={{ borderRadius: "12px", border: "1px solid #F0EAE5", bgcolor: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          <Box
            sx={{
              px: 1,
              py: 0.75,
              borderBottom: "1px solid #F0EAE5",
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1fr",
              gap: 0.75,
              bgcolor: "#FAF9F7",
            }}
          >
            {["Project", "Status", "Owner", "Repository", "Application", "Category"].map((label) => (
              <Typography key={label} sx={{ fontSize: "10px", lineHeight: "16px", fontWeight: 700, color: "#616161", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {label}
              </Typography>
            ))}
          </Box>

          <Box sx={{ overflow: "auto", minHeight: 0, flex: 1 }}>
            {(projectsPending || programPending) &&
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={58} sx={{ borderBottom: "1px solid #F0EAE5" }} />)}

            {!projectsPending && !programPending && programError && (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: "13px", color: "#616161" }}>Program not found or unavailable.</Typography>
              </Box>
            )}

            {!projectsPending && !programPending && !programError && activeSection !== "Projects" && (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: "13px", color: "#616161" }}>
                  {activeSection} data is not available from current backend endpoints.
                </Typography>
              </Box>
            )}

            {!projectsPending && !programPending && !programError && activeSection === "Projects" && visibleProjects.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: "13px", color: "#616161" }}>No projects found for this program.</Typography>
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
                    sx={{
                      px: 1,
                      py: 0.75,
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1fr",
                      gap: 0.75,
                      borderBottom: "1px solid #F0EAE5",
                      minHeight: 58,
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "13px", lineHeight: "18px", fontWeight: 590, color: "#11151A" }}>{project.name}</Typography>
                      <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#616161" }}>
                        {project.description?.trim() ? project.description : "No description"}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        size="small"
                        label={chip.label}
                        sx={{
                          height: 24,
                          borderRadius: "6px",
                          bgcolor: chip.bg,
                          color: chip.color,
                          borderLeft: chip.leftBorder,
                          "& .MuiChip-label": { fontWeight: 590, fontSize: "12px", lineHeight: "20px" },
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: "13px", color: "#11151A" }}>{program?.manager?.trim() ? program.manager : "-"}</Typography>
                    <Typography sx={{ fontSize: "13px", color: "#11151A" }}>-</Typography>
                    <Typography sx={{ fontSize: "13px", color: "#11151A" }}>{project.targetProduct?.trim() ? project.targetProduct : "-"}</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                      {categories.length ? (
                        categories.map((cat) => (
                          <Chip key={`${project.id}-${cat}`} size="small" label={cat} sx={{ height: 22, borderRadius: "6px", bgcolor: "#FAF9F7", color: "#11151A" }} />
                        ))
                      ) : (
                        <Typography sx={{ fontSize: "13px", color: "#11151A" }}>-</Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
