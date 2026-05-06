import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { People24Regular } from "@fluentui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { http } from "../api/http";
import { AppPageFrame } from "../components/ui/AppPageFrame";
import { EmptyState } from "../components/ui/EmptyState";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  teamType: string;
  status: string;
}

export default function UsersPage(): JSX.Element {
  const qc = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await http.get<UserRow[]>("/users")).data,
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "viewer", teamType: "internal" });

  const create = useMutation({
    mutationFn: async () => (await http.post("/users", form)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
  });

  return (
    <AppPageFrame
      title="Users"
      actions={
        <Button
          variant="contained"
          size="small"
          onClick={() => setOpen(true)}
          sx={{ height: 24, minHeight: 24, borderRadius: "6px", textTransform: "none", fontSize: "12px", px: 1.25 }}
        >
          Invite member
        </Button>
      }
    >
      {isPending ? (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "var(--app-radius-md)", borderColor: "var(--app-border-light)" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No members found" message="Invite a member to start assigning test ownership." illustration={People24Regular}>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Invite member
          </Button>
        </EmptyState>
      ) : (
        <TableContainer component={Paper} className="app-scroll" sx={{ maxHeight: 520, borderRadius: "var(--app-radius-md)", border: "1px solid var(--app-border-light)" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data ?? []).map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.role}
                      color={u.role === "admin" ? "primary" : u.role === "tester" ? "secondary" : "default"}
                      variant="outlined"
                      sx={{ borderRadius: "var(--app-radius-xs)", textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>{u.teamType}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>{u.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Invite workspace member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {["admin", "tester", "viewer", "external"].map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Team category" value={form.teamType} onChange={(e) => setForm({ ...form, teamType: e.target.value })}>
              {["internal", "development", "external"].map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!form.email || !form.name || create.isPending} onClick={() => create.mutate()}>
            Send invite
          </Button>
        </DialogActions>
      </Dialog>
    </AppPageFrame>
  );
}
