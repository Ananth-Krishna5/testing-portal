import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ComponentType } from "react";
import type { ReactNode } from "react";
import { FluentIcon } from "./FluentIcon";

export function SectionShell({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ fontSize?: number; color?: string }>;
  children?: ReactNode;
}) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: "var(--app-radius-md)",
        border: "1px solid var(--app-border-light)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.95) 100%)",
        boxShadow: "var(--app-shadow-xs)",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ mb: description ? 1.25 : 0 }}>
        {icon ? (
          <Box sx={{ color: "primary.main", pt: 0.25 }} aria-hidden>
            <FluentIcon icon={icon} size="nav" color="var(--mui-palette-primary-main)" />
          </Box>
        ) : null}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontFamily: "var(--app-font-display)", fontWeight: 600, letterSpacing: "-0.02em" }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      {children ? <Box sx={{ mt: 2 }}>{children}</Box> : null}
    </Paper>
  );
}
