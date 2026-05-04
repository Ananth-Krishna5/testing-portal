import { Paper, Stack } from "@mui/material";
import type { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Paper sx={{ p: 1.5, mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        {children}
      </Stack>
    </Paper>
  );
}
