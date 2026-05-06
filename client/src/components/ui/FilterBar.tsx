import { Box, Paper, Stack } from "@mui/material";
import type { ReactNode } from "react";

export function FilterBar({ children, end }: { children: ReactNode; end?: ReactNode }) {
  return (
    <Paper
      sx={{
        p: 1.5,
        mb: 2,
        borderRadius: "var(--app-radius-sm)",
        border: "1px solid var(--app-border-light)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.95) 100%)",
        boxShadow: "var(--app-shadow-xs)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        useFlexGap
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          useFlexGap
          sx={{ flex: 1, minWidth: 0 }}
        >
          {children}
        </Stack>
        {end ? (
          <Box sx={{ flexShrink: 0, display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>{end}</Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
