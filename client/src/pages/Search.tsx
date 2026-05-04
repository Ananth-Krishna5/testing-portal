import { Box, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";

interface SearchState {
  programs?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  suites?: { id: string; name: string }[];
  users?: { id: string; name: string; email: string }[];
}

export default function SearchPage(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? {}) as SearchState;

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} gutterBottom>
        Search results
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Programs
      </Typography>
      <List>
        {(s.programs ?? []).map((p) => (
          <ListItemButton key={p.id} component={RouterLink} to="/programs">
            <ListItemText primary={p.name} secondary="Program" />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Projects
      </Typography>
      <List>
        {(s.projects ?? []).map((p) => (
          <ListItemButton key={p.id} component={RouterLink} to="/projects">
            <ListItemText primary={p.name} secondary="Project" />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Test suites
      </Typography>
      <List>
        {(s.suites ?? []).map((p) => (
          <ListItemButton key={p.id} component={RouterLink} to="/test-suites">
            <ListItemText primary={p.name} secondary="Suite" />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Users
      </Typography>
      <List>
        {(s.users ?? []).map((p) => (
          <ListItemButton key={p.id} component={RouterLink} to="/users">
            <ListItemText primary={p.name} secondary={p.email} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
