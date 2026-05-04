import { createTheme, type PaletteMode } from "@mui/material/styles";

export function appTheme(mode: PaletteMode) {
  const dark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? "#8a9bff" : "#3f51d0" },
      secondary: { main: dark ? "#58d2d8" : "#0e9aa7" },
      success: { main: dark ? "#4caf8c" : "#1f8a63" },
      warning: { main: dark ? "#e1a24f" : "#bb6e1a" },
      error: { main: dark ? "#f06d6d" : "#c14141" },
      background: {
        default: dark ? "#0d1117" : "#f3f5fb",
        paper: dark ? "#141a24" : "#ffffff",
      },
      text: {
        primary: dark ? "#eaf0fb" : "#1b2333",
        secondary: dark ? "#9da8bf" : "#5a657b",
      },
      divider: dark ? "rgba(138,155,255,0.22)" : "rgba(63,81,208,0.14)",
    },
    typography: {
      fontFamily: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
      h3: { fontWeight: 700, letterSpacing: "-0.01em" },
      h4: { fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontWeight: 650, letterSpacing: "-0.01em" },
      h6: { fontWeight: 650, letterSpacing: "-0.01em" },
      subtitle1: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.01em" },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: dark
              ? "radial-gradient(1000px 500px at 10% -10%, rgba(138,155,255,0.12), transparent)"
              : "radial-gradient(1000px 500px at 10% -10%, rgba(63,81,208,0.08), transparent)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: dark ? "1px solid rgba(138,155,255,0.2)" : "1px solid rgba(63,81,208,0.14)",
            boxShadow: dark
              ? "0 8px 30px rgba(3, 9, 20, 0.45)"
              : "0 8px 30px rgba(22, 30, 58, 0.08)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: dark ? "1px solid rgba(138,155,255,0.2)" : "1px solid rgba(63,81,208,0.14)",
            transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: dark ? "1px solid rgba(138,155,255,0.18)" : "1px solid rgba(63,81,208,0.12)",
            "&:before": { display: "none" },
            "&:not(:last-child)": { marginBottom: 12 },
            overflow: "hidden",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16 },
          contained: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: dark ? "1px solid rgba(138,155,255,0.16)" : "1px solid rgba(63,81,208,0.12)",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&.Mui-selected": {
              backgroundColor: dark ? "rgba(138,155,255,0.2)" : "rgba(63,81,208,0.12)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
        },
      },
    },
  });
}
