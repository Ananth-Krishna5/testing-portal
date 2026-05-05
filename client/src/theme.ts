import { createTheme } from "@mui/material/styles";

/**
 * Material UI theme — TS port of Archive 6 src/theme/muiTheme.js.
 * Visual identity: light-only. Token layer is in src/styles/tokens.scss.
 *
 * Spacing follows MUI's default 8px scale (no override). Use `sx={{ p: N }}`
 * with values 0.5 / 1 / 1.5 / 2 / 2.5 / 3 / 4 to map cleanly to the scale.
 */
const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#005fb8" },
    secondary: { main: "#1a2b44" },
    success: { main: "#0f7b51" },
    warning: { main: "#b45309" },
    error: { main: "#b42318" },
    background: {
      default: "#f4efe9",
      paper: "#fcfaf8",
    },
    text: {
      primary: "#0f1b2d",
      secondary: "#5a5f67",
      disabled: "rgba(90, 95, 103, 0.6)",
    },
    divider: "#e4d9cf",
    action: {
      active: "#0f1b2d",
      hover: "rgba(0, 95, 184, 0.08)",
      selected: "rgba(0, 95, 184, 0.12)",
    },
  },
  typography: {
    fontFamily: "var(--app-font-sans)",
    h1: { fontFamily: "var(--app-font-display)" },
    h2: { fontFamily: "var(--app-font-display)" },
    h3: { fontFamily: "var(--app-font-display)" },
    h4: {
      fontFamily: "var(--app-font-display)",
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.25,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontFamily: "var(--app-font-display)",
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "var(--app-font-display)",
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 600,
    },
    body1: { fontSize: "var(--app-font-size-sm)", lineHeight: "20px" },
    body2: { fontSize: "var(--app-font-size-sm)", lineHeight: "20px" },
    caption: { fontSize: "var(--app-font-size-sm)", lineHeight: "20px" },
    button: {
      fontSize: "var(--app-font-size-sm)",
      lineHeight: "20px",
      fontWeight: 590,
      textTransform: "none",
    },
    overline: {
      fontSize: "var(--app-font-size-sm)",
      lineHeight: "20px",
      fontWeight: 400,
      textTransform: "none",
    },
  },
  /** Default MUI radius (px); matches `--app-radius-xs` in src/styles/tokens.scss. */
  shape: {
    borderRadius: 10,
  },
  components: {
    /** No touch ripple on any ButtonBase-derived control (Button, IconButton, MenuItem, Tab, …). */
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontFamily: "inherit",
          borderRadius: "var(--app-radius-xs)",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          borderRadius: "var(--app-radius-md)",
          ...(ownerState.variant === "outlined"
            ? { boxShadow: "none" }
            : {
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "var(--app-shadow-xs)",
              }),
          transition: "transform var(--app-transition-fast), box-shadow var(--app-transition-fast), border-color var(--app-transition-fast)",
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          "&:last-child": { paddingBottom: 16 },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "8px 16px 16px",
          gap: 8,
          flexWrap: "wrap",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: "var(--app-radius-md)",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[8],
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: "var(--app-font-display)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          paddingBottom: 8,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingTop: 0,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "12px 16px 16px",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: "var(--app-radius-xs)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "var(--app-font-size-sm)",
          paddingTop: 10,
          paddingBottom: 10,
        },
        head: {
          fontWeight: 600,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          fontSize: "11px",
          color: "var(--app-text-muted)",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: "none",
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: "none",
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[3],
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          fontSize: "var(--app-font-size-sm)",
          lineHeight: "20px",
          minHeight: 24,
          paddingTop: 2,
          paddingBottom: 2,
          paddingLeft: 4,
          paddingRight: 4,
          columnGap: 6,
          "& .MuiListItemIcon-root": {
            minWidth: 22,
          },
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&.Mui-focusVisible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -1,
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 22,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 6,
          paddingBottom: 6,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "var(--app-radius-xs)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
          },
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: "inherit",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "var(--app-font-size-sm)",
          lineHeight: 1.2,
          padding: "3px 4px",
          backgroundColor: "rgba(43, 43, 43, 0.95)",
          color: "#fff",
          borderRadius: 10,
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
        },
        arrow: {
          color: "rgba(43, 43, 43, 0.95)",
        },
      },
    },
  },
});

export default muiTheme;
