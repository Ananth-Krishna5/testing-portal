import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ClipboardTaskListLtr24Regular, Search20Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { AddSuiteToProjectDialog } from "../components/testing/AddSuiteToProjectDialog";
import { EmptyState } from "../components/ui/EmptyState";
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

const categories = ["Foundational", "AI", "Voice", "E2E", "Performance", "Security", "UX", "CI/CD"] as const;

export default function TestSuitesPage(): JSX.Element {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [assigningSuite, setAssigningSuite] = useState<Suite | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["suites", q, cat],
    queryFn: async () =>
      (
        await http.get<Suite[]>("/test-suites", {
          params: { q, category: cat === "all" ? undefined : cat },
        })
      ).data,
  });

  const filteredSuites = useMemo(() => data ?? [], [data]);

  return (
    <Box className="app-page-enter" sx={{ width: "100%", height: "100%", bgcolor: "#F9F7F5", borderRadius: { xs: 0, md: "12px" }, overflow: "hidden" }}>
      <Box sx={{ px: 1, py: 1, borderBottom: "1px solid #F0EAE5" }}>
        <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "#11151A" }}>Testings</Typography>
      </Box>
      <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} sx={{ alignItems: { xs: "stretch", lg: "center" } }}>
          <Stack direction="row" spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
            <TextField
              size="small"
              placeholder="Search testings"
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
          {(q || cat !== "all") && (
            <Button
              variant="text"
              onClick={() => {
                setQ("");
                setCat("all");
              }}
              sx={{ height: 32, minWidth: 118, borderRadius: "8px", textTransform: "none", fontWeight: 590, fontSize: "13px" }}
            >
              Clear filters
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip
            label="All"
            onClick={() => setCat("all")}
            sx={{
              height: 24,
              borderRadius: "6px",
              px: 0.5,
              bgcolor: cat === "all" ? "#F0EAE5" : "#FFFFFF",
              color: "#616161",
              fontSize: "13px",
              border: "1px solid #DBCFC3",
            }}
          />
          {categories.map((c) => (
            <Chip
              key={c}
              label={c}
              onClick={() => setCat(c)}
              sx={{
                height: 24,
                borderRadius: "6px",
                px: 0.5,
                bgcolor: cat === c ? "#F0EAE5" : "#FFFFFF",
                color: "#616161",
                fontSize: "13px",
                border: "1px solid #DBCFC3",
              }}
            />
          ))}
        </Stack>

      {isPending && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(5, 1fr)" }, gap: 1, mb: 2 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={212} sx={{ borderRadius: "12px" }} />
          ))}
        </Box>
      )}
      {!isPending && filteredSuites.length === 0 && (
        <EmptyState
          title="No testings found"
          message="Try broadening your search or changing the selected category."
          illustration={ClipboardTaskListLtr24Regular}
        >
          {(q || cat !== "all") ? (
            <Button variant="outlined" onClick={() => { setQ(""); setCat("all"); }}>
              Clear filters
            </Button>
          ) : null}
        </EmptyState>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(303px, 303px))", gap: 1, justifyContent: "start" }}>
        {filteredSuites.map((s) => (
          <Card
            key={s.id}
            variant="outlined"
            onClick={() => navigate(`/test-suites/${s.id}`)}
            sx={{
              width: 303,
              minHeight: 206,
              borderRadius: "12px",
              borderColor: "#F0EAE5",
              boxShadow: "none",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            <CardContent sx={{ px: 0.875, py: 0.875, height: "100%", display: "flex", flexDirection: "column", "&:last-child": { pb: 0.875 } }}>
              <Box sx={{ minHeight: 62 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, lineHeight: "20px", color: "#242424" }}>
                  {s.name}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.25, mb: 0.5, flexWrap: "wrap" }}>
                  <Chip
                    label={s.category}
                    size="small"
                    sx={{
                      height: 20,
                      borderRadius: "6px",
                      backgroundColor: "#F9F7F5",
                      border: "1px solid #F0EAE5",
                      color: "#7C695A",
                      "& .MuiChip-label": { fontSize: "11px", lineHeight: "16px", px: "6px" },
                    }}
                  />
                  {s.severity ? (
                    <Chip
                      label={s.severity}
                      size="small"
                      sx={{
                        height: 20,
                        borderRadius: "6px",
                        backgroundColor: "#FAF9F7",
                        border: "1px solid #FFE0E0",
                        color: "#FF383C",
                        "& .MuiChip-label": { fontWeight: 590, fontSize: "11px", lineHeight: "16px", px: "6px" },
                      }}
                    />
                  ) : null}
                </Stack>
              </Box>

              <Box sx={{ borderRadius: "8px", backgroundColor: "#FAF9F7", border: "1px solid #F0EAE5", p: 0.75, flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontSize: "10px", lineHeight: "14px", fontWeight: 700, color: "#616161", mb: 0.35, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Description
                </Typography>
                <Typography sx={{ fontSize: "12px", lineHeight: "17px", color: "#474747", minHeight: 44 }}>
                  {s.description?.trim() || "No description available"}
                </Typography>
                <Stack direction="row" spacing={0.375} sx={{ mt: "auto", pt: 0.5, flexWrap: "wrap" }}>
                  {s.tools ? (
                    <Chip
                      size="small"
                      label={`Tools: ${s.tools}`}
                      sx={{ height: 18, borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #F0EAE5", color: "#7C695A", "& .MuiChip-label": { fontSize: "10px", px: "5px" } }}
                    />
                  ) : null}
                  {s.scope ? (
                    <Chip
                      size="small"
                      label={`Scope: ${s.scope}`}
                      sx={{ height: 18, borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #F0EAE5", color: "#7C695A", "& .MuiChip-label": { fontSize: "10px", px: "5px" } }}
                    />
                  ) : null}
                </Stack>
              </Box>

              <Stack direction="row" spacing={0.625} sx={{ mt: 0.75, alignItems: "center", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/test-suites/${s.id}`);
                  }}
                  sx={{ minWidth: 86, height: 28, borderRadius: "6px", borderColor: "#DBCFC3", color: "#616161", textTransform: "none", fontSize: "12px", fontWeight: 590 }}
                >
                  Details
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={(event) => {
                    event.stopPropagation();
                    setAssigningSuite(s);
                  }}
                  sx={{ minWidth: 112, height: 28, borderRadius: "6px", textTransform: "none", fontSize: "12px", fontWeight: 590 }}
                >
                  Add to project
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <AddSuiteToProjectDialog
        open={Boolean(assigningSuite)}
        suiteId={assigningSuite?.id ?? null}
        suiteName={assigningSuite?.name}
        onClose={() => setAssigningSuite(null)}
      />
      </Box>
    </Box>
  );
}
