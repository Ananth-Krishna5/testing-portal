import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function SectionShell({ title, description, children }: { title: string; description?: string; children?: ReactNode }): JSX.Element {
  return (
    <Paper sx={{ p: { xs: 2, md: 2.5 } }}>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          {description}
        </Typography>
      )}
      {children && <Box>{children}</Box>}
    </Paper>
  );
}
