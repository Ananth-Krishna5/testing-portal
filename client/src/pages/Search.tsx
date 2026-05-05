import { Box, Button, Divider, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { ArrowLeft24Regular, Search24Regular } from "@fluentui/react-icons";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { FluentIcon } from "../components/ui/FluentIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";

interface SearchState {
  programs?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  suites?: { id: string; name: string }[];
  users?: { id: string; name: string; email: string }[];
}

export default function SearchPage(): JSX.Element {
  const loc = useLocation();
  const hasState = loc.state != null && typeof loc.state === "object";
  const s = (hasState ? loc.state : {}) as SearchState;
  const total = (s.programs?.length ?? 0) + (s.projects?.length ?? 0) + (s.suites?.length ?? 0) + (s.users?.length ?? 0);

  return (
    <Box className="app-page-enter">
      <PageHeader
        title="Search results"
        subtitle={hasState ? "Global results grouped by module." : "Open this page from the header search to see grouped matches."}
        action={
          <Button component={RouterLink} to="/" variant="outlined" startIcon={<FluentIcon icon={ArrowLeft24Regular} size="inline" />}>
            Back to dashboard
          </Button>
        }
      />

      {!hasState && (
        <EmptyState
          title="Search from the shell"
          message="Use the global search field and Search button in the header. Results land here grouped by programs, projects, suites, and people."
          illustration={Search24Regular}
        >
          <Button component={RouterLink} variant="contained" to="/">
            Go to dashboard
          </Button>
        </EmptyState>
      )}

      {hasState && total === 0 && (
        <EmptyState
          title="No matches"
          message="Try a different phrase or clear filters in the originating module."
          illustration={Search24Regular}
        >
          <Button component={RouterLink} variant="outlined" to="/">
            Home
          </Button>
        </EmptyState>
      )}

      {hasState && total > 0 && (
        <Paper
          sx={{
            p: 2,
            borderRadius: "var(--app-radius-md)",
            border: "1px solid var(--app-border-light)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.96) 100%)",
            boxShadow: "var(--app-shadow-xs)",
          }}
        >
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Programs
          </Typography>
          <List disablePadding>
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
          <List disablePadding>
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
          <List disablePadding>
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
          <List disablePadding>
            {(s.users ?? []).map((p) => (
              <ListItemButton key={p.id} component={RouterLink} to="/users">
                <ListItemText primary={p.name} secondary={p.email} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
