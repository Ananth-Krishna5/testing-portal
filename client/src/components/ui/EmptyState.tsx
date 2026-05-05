import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ComponentType } from "react";
import type { ReactNode } from "react";
import { FluentIcon } from "./FluentIcon";

export function EmptyState({
  title,
  message,
  illustration,
  children,
}: {
  title: string;
  message: string;
  illustration?: ComponentType<{ fontSize?: number; color?: string }>;
  children?: ReactNode;
}) {
  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        textAlign: "center",
        borderRadius: "var(--app-radius-md)",
        border: "1px dashed var(--app-border-strong)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.94) 100%)",
        boxShadow: "var(--app-shadow-xs)",
      }}
    >
      <Stack spacing={2} alignItems="center">
        {illustration ? (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: "action.hover",
              color: "primary.main",
            }}
            aria-hidden
          >
            <FluentIcon icon={illustration} size="nav" color="var(--mui-palette-primary-main)" />
          </Box>
        ) : null}
        <Box>
          <Typography variant="subtitle1" sx={{ fontFamily: "var(--app-font-display)", fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 420, mx: "auto" }}>
            {message}
          </Typography>
        </Box>
        {children ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="center" sx={{ pt: 0.5, width: "100%" }}>
            {children}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
