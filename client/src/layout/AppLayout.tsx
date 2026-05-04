import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import type { PaletteMode } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Hub as HubIcon,
  IntegrationInstructions as IntegrationIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  ViewKanban as KanbanIcon,
} from "@mui/icons-material";
import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { http } from "../api/http";

const drawerWidth = 260;

const nav = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/programs", label: "Programs", icon: <ShieldIcon /> },
  { to: "/projects", label: "Projects", icon: <FolderIcon /> },
  { to: "/test-suites", label: "Test Suites", icon: <ScienceIcon /> },
  { to: "/results", label: "Results", icon: <KanbanIcon /> },
  { to: "/users", label: "Users", icon: <PeopleIcon /> },
  { to: "/integrations", label: "Integrations", icon: <IntegrationIcon />, roles: ["admin", "tester"] as const },
];

export function AppLayout({
  children,
  mode,
  onToggleMode,
}: {
  children: ReactNode;
  mode: PaletteMode;
  onToggleMode: () => void;
}): JSX.Element {
  const { user, logout, can } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState("");

  const runSearch = async () => {
    const q = search.trim();
    if (q.length < 2) return;
    const { data } = await http.get("/search", { params: { q } });
    navigate("/search", { state: data });
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar sx={{ gap: 1 }}>
        <HubIcon color="primary" />
        <Typography fontWeight={800} variant="h6">
          Test Hub
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {nav
          .filter((n) => !n.roles || n.roles.some((r) => can(r as "admin" | "tester" | "viewer" | "external")))
          .map((item) => (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={loc.pathname === item.to}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Signed in as
        </Typography>
        <Typography fontWeight={600}>{user?.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.role}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          zIndex: (t) => t.zIndex.drawer + 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>
          <TextField
            size="small"
            placeholder="Global search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            sx={{ flex: 1, maxWidth: 480 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton onClick={onToggleMode} sx={{ ml: 1 }}>
              {mode === "dark" ? "☀️" : "🌙"}
            </IconButton>
          </Tooltip>
          <IconButton sx={{ ml: 1 }} onClick={(e) => setAnchor(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.slice(0, 1)}</Avatar>
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem
              onClick={() => {
                setAnchor(null);
                logout();
                navigate("/login");
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          background: (t) =>
            t.palette.mode === "dark"
              ? "radial-gradient(1200px 600px at 20% -10%, rgba(108,99,255,0.12), transparent), #0f1117"
              : "radial-gradient(1200px 600px at 20% -10%, rgba(92,84,214,0.08), transparent), #f4f6fb",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
