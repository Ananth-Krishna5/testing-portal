import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Alert24Regular,
  Beaker24Regular,
  DataBarHorizontal24Regular,
  DataPie24Regular,
  Folder24Regular,
  Navigation24Regular,
  People24Regular,
  PlugConnected24Regular,
  Shield24Regular,
  SignOut24Regular,
} from "@fluentui/react-icons";
import type { ComponentType } from "react";
import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FluentIcon } from "../components/ui/FluentIcon";

const drawerWidth = 253;
const rightRailWidth = 52;

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ fontSize?: number; color?: string }>;
  roles?: readonly ("admin" | "tester")[];
};

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Home",
    items: [{ to: "/", label: "Dashboard", icon: DataPie24Regular }],
  },
  {
    title: "Governance",
    items: [{ to: "/programs", label: "Programs", icon: Shield24Regular }],
  },
  {
    title: "Execution",
    items: [
      { to: "/projects", label: "Projects", icon: Folder24Regular },
      { to: "/test-suites", label: "Testings", icon: Beaker24Regular },
    ],
  },
  {
    title: "Insight",
    items: [{ to: "/results", label: "Reports & AI", icon: DataBarHorizontal24Regular }],
  },
  {
    title: "Administrations",
    items: [
      { to: "/users", label: "Users", icon: People24Regular },
      { to: "/integrations", label: "Integrations", icon: PlugConnected24Regular, roles: ["admin", "tester"] },
    ],
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, can } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [alertAnchor, setAlertAnchor] = useState<null | HTMLElement>(null);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#F0EAE5", py: 1 }}>
      <Toolbar sx={{ pl: 1.75, pr: 1, py: 0, minHeight: 36, alignItems: "center", justifyContent: "flex-start" }}>
        <Typography
          component="div"
          sx={{
            width: 92,
            height: 36,
            px: 1.75,
            py: 1,
            borderRadius: "8px",
            backgroundColor: "#fff",
            color: "#11151A",
            fontWeight: 700,
            fontSize: "18px",
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          }}
        >
          Testing
        </Typography>
      </Toolbar>
      <Box sx={{ height: 12 }} />
      <List sx={{ flex: 1, px: 1, py: 0, overflow: "auto", gap: 1, display: "flex", flexDirection: "column" }} className="app-scroll">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.some((r) => can(r as "admin" | "tester" | "viewer" | "external")),
          );
          if (visibleItems.length === 0) return null;
          const hasSelected = visibleItems.some((item) => loc.pathname === item.to);
          return (
            <Box
              key={section.title}
              sx={{
                px: 0,
                py: 0.5,
                borderRadius: "6px",
                backgroundColor: hasSelected ? "#F9F7F5" : "transparent",
              }}
            >
              <Typography
                sx={{
                  px: 1.5,
                  pb: 0.5,
                  textTransform: "uppercase",
                  fontSize: "11px",
                  lineHeight: "20px",
                  letterSpacing: "0.5px",
                  fontWeight: 600,
                  color: "#616161",
                }}
              >
                {section.title}
              </Typography>
              {visibleItems.map((item) => {
                const selected = loc.pathname === item.to;
                return (
                  <ListItemButton
                    key={item.to}
                    component={Link}
                    to={item.to}
                    selected={selected}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      mx: 0.5,
                      px: 1.5,
                      py: 0,
                      minHeight: 32,
                      borderRadius: "6px",
                      gap: 1.5,
                      "&.Mui-selected": {
                        backgroundColor: "#F0EAE5",
                        "&:hover": { backgroundColor: "#ECE3DD" },
                      },
                      "&:hover": { backgroundColor: "#F3EDE8" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 20 }}>
                      <FluentIcon icon={item.icon} size="nav" color={selected ? "#11151A" : "#424242"} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: selected ? 700 : 400,
                        fontSize: "12px",
                        lineHeight: "20px",
                        color: selected ? "#11151A" : "#424242",
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#0B0E11" }}>
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", backgroundColor: "#F0EAE5" }}>
      <IconButton
        edge="start"
        onClick={() => setMobileOpen(true)}
        sx={{
          position: "fixed",
          top: 8,
          left: 8,
          zIndex: (t) => t.zIndex.drawer + 2,
          display: { xs: "inline-flex", md: "none" },
          bgcolor: "#fff",
          border: "1px solid var(--app-border-light)",
          borderRadius: "8px",
          "&:hover": { bgcolor: "#fff" },
        }}
        aria-label="Open menu"
      >
        <FluentIcon icon={Navigation24Regular} size="toolbar" />
      </IconButton>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, backgroundColor: "#F0EAE5" },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#F0EAE5",
              borderRight: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          p: { xs: 0, md: "8px 8px 8px 0px" },
          gap: { xs: 0, md: "4px" },
        }}
      >
        <Box
          component="main"
          className="app-page-enter"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 0 },
            width: { md: `calc(100% - ${rightRailWidth}px)` },
            backgroundColor: "#F9F7F5",
            minHeight: "100vh",
            borderRadius: { xs: 0, md: "12px" },
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
        <Box
          component="aside"
          sx={{
            width: { xs: 0, md: rightRailWidth },
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "stretch",
            backgroundColor: "#F0EAE5",
            flexShrink: 0,
            pl: 0.5,
          }}
        >
          <Box
            sx={{
              width: 48,
              my: 0,
              borderRadius: "12px",
              bgcolor: "#F9F7F5",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
              py: 1.5,
              px: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: "100%",
              height: "100%",
            }}
          >
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Account menu" sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  bgcolor: "#F0EAE5",
                  color: "#11151A",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                }}
              >
                {user?.name?.slice(0, 1)}
              </Avatar>
            </IconButton>
            <Box sx={{ py: 1, display: "flex", justifyContent: "center", width: 32 }}>
              <Box sx={{ width: 24, height: 1, bgcolor: "rgba(0,0,0,0.12)" }} />
            </Box>
            <IconButton
              onClick={(e) => setAlertAnchor(e.currentTarget)}
              sx={{ width: 32, height: 32, borderRadius: "8px", p: "6px", position: "relative" }}
              aria-label="Notifications"
            >
              <FluentIcon icon={Alert24Regular} size="inline" color="#616161" />
              <Box
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 14,
                  height: 15.5,
                  borderRadius: "7px",
                  bgcolor: "#D13438",
                  border: "1px solid #F9F7F5",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 700,
                  lineHeight: "15px",
                  textAlign: "center",
                }}
              >
                1
              </Box>
            </IconButton>
            <IconButton
              onClick={(e) => setAlertAnchor(e.currentTarget)}
              sx={{ width: 32, height: 32, borderRadius: "8px", p: "6px", position: "relative" }}
              aria-label="Alerts"
            >
              <FluentIcon icon={DataBarHorizontal24Regular} size="inline" color="#616161" />
              <Box
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 14,
                  height: 15.5,
                  borderRadius: "7px",
                  bgcolor: "#D13438",
                  border: "1px solid #F9F7F5",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 700,
                  lineHeight: "15px",
                  textAlign: "center",
                }}
              >
                3
              </Box>
            </IconButton>
            <IconButton sx={{ width: 32, height: 32, borderRadius: "8px", p: "6px" }} aria-label="Nudges">
              <FluentIcon icon={Shield24Regular} size="inline" color="#616161" />
            </IconButton>
            <Box sx={{ py: 1, display: "flex", justifyContent: "center", width: 32 }}>
              <Box sx={{ width: 24, height: 1, bgcolor: "rgba(0,0,0,0.12)" }} />
            </Box>
          </Box>
        </Box>
      </Box>
      <Menu anchorEl={alertAnchor} open={Boolean(alertAnchor)} onClose={() => setAlertAnchor(null)} anchorOrigin={{ vertical: "center", horizontal: "left" }} transformOrigin={{ vertical: "center", horizontal: "right" }}>
        <ListSubheader sx={{ fontWeight: 600, lineHeight: 2 }}>Notifications</ListSubheader>
        <MenuItem
          disabled
          sx={{ maxWidth: 280, whiteSpace: "normal", opacity: 0.85, fontSize: "var(--app-font-size-sm)" }}
        >
          Alert digests and run failures will surface here as rules are configured.
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAlertAnchor(null);
            navigate("/results");
          }}
        >
          Open results
        </MenuItem>
      </Menu>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "center", horizontal: "left" }} transformOrigin={{ vertical: "center", horizontal: "right" }}>
        <ListSubheader sx={{ fontWeight: 600, lineHeight: 2 }}>Account</ListSubheader>
        <MenuItem disabled sx={{ opacity: 1, py: 0.5, fontSize: "var(--app-font-size-sm)" }}>
          {user?.email}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            logout();
            navigate("/login");
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <FluentIcon icon={SignOut24Regular} size="inline" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
      </Box>
    </Box>
  );
}
