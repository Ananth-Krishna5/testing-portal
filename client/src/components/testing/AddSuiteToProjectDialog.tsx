import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { http } from "../../api/http";

type ProjectOption = { id: string; name: string; program?: { name?: string | null } | null };

type PickState = {
  projectId: string;
  env: string;
  from: string;
  to: string;
  time: string;
  recurrence: string;
};

const defaultPick = (): PickState => ({
  projectId: "",
  env: "Staging",
  from: new Date().toISOString().slice(0, 10),
  to: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
  time: "09:00",
  recurrence: "daily",
});

interface AddSuiteToProjectDialogProps {
  open: boolean;
  suiteId: string | null;
  suiteName?: string;
  onClose: () => void;
}

export function AddSuiteToProjectDialog({ open, suiteId, suiteName, onClose }: AddSuiteToProjectDialogProps): JSX.Element {
  const qc = useQueryClient();
  const [pick, setPick] = useState<PickState>(defaultPick());
  const controlSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      minHeight: 40,
      backgroundColor: "#F9F7F5",
    },
    "& .MuiInputBase-input": {
      fontSize: "13px",
      lineHeight: "20px",
      fontFamily: "inherit",
      color: "#11151A",
    },
    "& .MuiInputLabel-root": { fontSize: "13px" },
  };

  useEffect(() => {
    if (!open) return;
    setPick(defaultPick());
  }, [open]);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await http.get<ProjectOption[]>("/projects")).data,
  });

  const addJob = useMutation({
    mutationFn: async () =>
      http.post("/scheduled-jobs", {
        projectId: pick.projectId,
        suiteId,
        fromDate: pick.from,
        toDate: pick.to,
        time: pick.time,
        recurrence: pick.recurrence,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle sx={{ pb: 0.5, fontSize: "14px", fontWeight: 700, color: "#11151A" }}>Add suite to project</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#616161" }}>
            {suiteName ? `Suite: ${suiteName}` : "Select a project and schedule this suite."}
          </Typography>
          <TextField select label="Project" value={pick.projectId} onChange={(e) => setPick((prev) => ({ ...prev, projectId: e.target.value }))} fullWidth sx={controlSx}>
            {(projects ?? []).map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.program?.name?.trim() ? `${project.name} (${project.program.name})` : project.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Environment" value={pick.env} onChange={(e) => setPick((prev) => ({ ...prev, env: e.target.value }))} fullWidth sx={controlSx}>
            {["Staging", "Dev", "Production", "UAT"].map((env) => (
              <MenuItem key={env} value={env}>
                {env}
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
              onChange={(e) => setPick((prev) => ({ ...prev, from: e.target.value }))}
              sx={controlSx}
            />
            <TextField
              label="To"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={pick.to}
              onChange={(e) => setPick((prev) => ({ ...prev, to: e.target.value }))}
              sx={controlSx}
            />
          </Stack>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Time"
              value={dayjs(`2000-01-01T${pick.time}`)}
              onChange={(value) => {
                if (!value) return;
                setPick((prev) => ({ ...prev, time: value.format("HH:mm") }));
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: controlSx,
                },
              }}
            />
          </LocalizationProvider>
          <TextField select label="Recurrence" value={pick.recurrence} onChange={(e) => setPick((prev) => ({ ...prev, recurrence: e.target.value }))} fullWidth sx={controlSx}>
            {[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Bi-weekly", value: "bi-weekly" },
              { label: "Monthly", value: "monthly" },
            ].map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary">
            Environment selection is informational here; project already defines its environment.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!suiteId || !pick.projectId || addJob.isPending} onClick={() => addJob.mutate()}>
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
}
