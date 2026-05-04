import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { http } from "../api/http";

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
  const qc = useQueryClient();
  const { data: projects } = useQuery({
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

  const trigger = useMutation({
    mutationFn: async (jobId: string) => (await http.post(`/scheduled-jobs/${jobId}/trigger`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["runs"] }),
  });

  const steps = useMemo(() => ["Basics", "Program", "Product", "Environment", "Schedule"], []);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={900}>
          Projects
        </Typography>
        <Button variant="contained" onClick={() => setWizardOpen(true)}>
          New project (wizard)
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {(projects ?? []).map((p) => (
          <Card key={p.id} variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                {p.name}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {p.targetProduct} · {p.environment}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Jobs: {p.scheduledJobs?.length ?? 0}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {(p.scheduledJobs ?? []).map((j) => (
                  <Stack key={j.id} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="body2">
                      {j.suite.name} — {j.recurrence}
                    </Typography>
                    <Button size="small" variant="outlined" onClick={() => trigger.mutate(j.id)} disabled={trigger.isPending}>
                      Run now
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
            <CardActions />
          </Card>
        ))}
      </Box>

      <Dialog open={wizardOpen} onClose={() => setWizardOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Project wizard</DialogTitle>
        <DialogContent>
          <Stepper activeStep={step} sx={{ my: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <Stack spacing={2}>
              <TextField label="Project name" value={w.name} onChange={(e) => setW({ ...w, name: e.target.value })} />
              <TextField label="Description" value={w.description} onChange={(e) => setW({ ...w, description: e.target.value })} multiline minRows={2} />
            </Stack>
          )}
          {step === 1 && (
            <TextField select label="Program" fullWidth value={w.programId} onChange={(e) => setW({ ...w, programId: e.target.value })}>
              {(programs ?? []).map((pr) => (
                <MenuItem key={pr.id} value={pr.id}>
                  {pr.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          {step === 2 && (
            <TextField select label="Target product" fullWidth value={w.targetProduct} onChange={(e) => setW({ ...w, targetProduct: e.target.value as (typeof products)[number] })}>
              {products.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </TextField>
          )}
          {step === 3 && (
            <TextField select label="Environment" fullWidth value={w.environment} onChange={(e) => setW({ ...w, environment: e.target.value as (typeof envs)[number] })}>
              {envs.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </TextField>
          )}
          {step === 4 && (
            <Stack spacing={2}>
              <TextField select label="Test suite" fullWidth value={w.suiteId} onChange={(e) => setW({ ...w, suiteId: e.target.value })}>
                <MenuItem value="">(skip scheduling)</MenuItem>
                {(suites ?? []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={2}>
                <TextField label="From" type="date" fullWidth InputLabelProps={{ shrink: true }} value={w.fromDate} onChange={(e) => setW({ ...w, fromDate: e.target.value })} />
                <TextField label="To" type="date" fullWidth InputLabelProps={{ shrink: true }} value={w.toDate} onChange={(e) => setW({ ...w, toDate: e.target.value })} />
              </Stack>
              <TextField label="Time" value={w.time} onChange={(e) => setW({ ...w, time: e.target.value })} />
              <TextField label="Recurrence (daily | weekly | cron:0 9 * * *)" value={w.recurrence} onChange={(e) => setW({ ...w, recurrence: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWizardOpen(false)}>Cancel</Button>
          {step > 0 && <Button onClick={back}>Back</Button>}
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
