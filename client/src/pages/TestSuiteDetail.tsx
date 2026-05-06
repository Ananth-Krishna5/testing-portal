import { Box, Button, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { ChevronLeft12Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { AddSuiteToProjectDialog } from "../components/testing/AddSuiteToProjectDialog";
import { FluentIcon } from "../components/ui/FluentIcon";

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

export default function TestSuiteDetailPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["suites", "detail", id],
    enabled: Boolean(id),
    queryFn: async () => (await http.get<Suite[]>("/test-suites")).data,
  });

  const suite = useMemo(() => (data ?? []).find((item) => item.id === id) ?? null, [data, id]);

  if (!id) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontSize: "13px", color: "#616161" }}>Testing id is missing.</Typography>
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
          Testing Details
        </Typography>
      </Box>

      <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1, minHeight: 0, flex: 1 }}>
        <Box sx={{ borderRadius: "12px", border: "1px solid #F0EAE5", bgcolor: "#FFFFFF", p: 1.25 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Button
                onClick={() => navigate("/test-suites")}
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
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>Testings</Typography>
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A" }}>{">"}</Typography>
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", color: "#11151A", opacity: 0.7 }}>
                    {suite?.name ?? "Details"}
                  </Typography>
                </Stack>
                {isPending ? (
                  <Skeleton variant="text" width={220} height={30} />
                ) : (
                  <Typography sx={{ fontSize: "18px", lineHeight: "24px", fontWeight: 700, color: "#11151A" }}>
                    {suite?.name ?? "Testing not found"}
                  </Typography>
                )}
                <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#616161" }}>
                  {suite?.description?.trim() ? suite.description : "No description available"}
                </Typography>
              </Stack>
            </Stack>
            <Button
              variant="contained"
              onClick={() => setAddOpen(true)}
              disabled={!suite}
              sx={{ height: 32, minWidth: 122, borderRadius: "8px", px: 2, textTransform: "none", fontWeight: 590, fontSize: "13px", lineHeight: "16px" }}
            >
              Add to project
            </Button>
          </Stack>
        </Box>

        <Box sx={{ borderRadius: "12px", border: "1px solid #F0EAE5", bgcolor: "#FFFFFF", p: 1.25 }}>
          {isPending ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={24} />
              <Skeleton variant="rounded" height={24} />
              <Skeleton variant="rounded" height={80} />
            </Stack>
          ) : !suite ? (
            <Typography sx={{ fontSize: "13px", color: "#616161" }}>Testing suite not found or unavailable.</Typography>
          ) : (
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                <Chip label={suite.category} size="small" sx={{ height: 24, borderRadius: "6px", backgroundColor: "#FAF9F7", color: "#11151A" }} />
                {suite.severity ? (
                  <Chip label={suite.severity} size="small" sx={{ height: 24, borderRadius: "6px", backgroundColor: "#FAF9F7", color: "#FF383C", "& .MuiChip-label": { fontWeight: 590 } }} />
                ) : null}
              </Stack>
              <Box sx={{ borderRadius: "8px", backgroundColor: "rgba(240, 234, 229, 0.7)", p: 1 }}>
                <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, color: "#616161", textTransform: "uppercase" }}>
                  Tools / Methods
                </Typography>
                <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#11151A" }}>{suite.tools?.trim() || "-"}</Typography>
              </Box>
              <Box sx={{ borderRadius: "8px", backgroundColor: "rgba(240, 234, 229, 0.7)", p: 1 }}>
                <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, color: "#616161", textTransform: "uppercase" }}>
                  Focus Areas
                </Typography>
                <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#11151A" }}>{suite.focusAreas?.trim() || "-"}</Typography>
              </Box>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <Box sx={{ borderRadius: "8px", backgroundColor: "rgba(240, 234, 229, 0.7)", p: 1, flex: 1 }}>
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, color: "#616161", textTransform: "uppercase" }}>
                    Scope
                  </Typography>
                  <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#11151A" }}>{suite.scope?.trim() || "-"}</Typography>
                </Box>
                <Box sx={{ borderRadius: "8px", backgroundColor: "rgba(240, 234, 229, 0.7)", p: 1, flex: 1 }}>
                  <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, color: "#616161", textTransform: "uppercase" }}>
                    Standards
                  </Typography>
                  <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "#11151A" }}>{suite.standards?.trim() || "-"}</Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>

      <AddSuiteToProjectDialog open={addOpen} suiteId={suite?.id ?? null} suiteName={suite?.name} onClose={() => setAddOpen(false)} />
    </Box>
  );
}
