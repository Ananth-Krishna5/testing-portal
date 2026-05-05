import { Box, Button, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { Add12Regular, ChevronLeft12Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { FluentIcon } from "../components/ui/FluentIcon";

type ScheduledJob = {
  id: string;
  recurrence?: string | null;
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
  scheduledJobs?: ScheduledJob[];
};

const tabs = ["Overview", "Test Suites", "Category", "Result", "Tickets", "Settings"] as const;

export default function ProjectDetailPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Test Suites");

  const { data: project, isPending, isError } = useQuery({
    queryKey: ["project", id],
    enabled: Boolean(id),
    queryFn: async () => (await http.get<ProjectDetail>(`/projects/${id}`)).data,
  });

  const suites = useMemo(() => project?.scheduledJobs ?? [], [project]);

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
                  onClick={() => navigate("/projects")}
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
                      Projects
                    </Typography>
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
              <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#616161" }}>
                  {activeTab} section will use project-specific backend data when available.
                </Typography>
              </Box>
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
