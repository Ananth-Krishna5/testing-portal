import { createTheme, type PaletteMode } from "@mui/material/styles";

export function appTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === "dark" ? "#8b83ff" : "#5c54d6" },
      secondary: { main: mode === "dark" ? "#06b6d4" : "#0891b2" },
      background: {
        default: mode === "dark" ? "#0f1117" : "#f4f6fb",
        paper: mode === "dark" ? "#1a1d27" : "#ffffff",
      },
    },
    typography: {
      fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    },
  });
}
