import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  return (
    <Stack spacing={1.25} sx={{ mb: 3.5 }} className="app-page-enter">
      {breadcrumbs ? (
        <Box sx={{ "& a": { textDecoration: "none", color: "text.secondary", "&:hover": { color: "primary.main" } } }}>{breadcrumbs}</Box>
      ) : null}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              color: "var(--app-text-strong)",
              fontFamily: "var(--app-font-display)",
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            sx={{
              flexShrink: 0,
              width: { xs: "100%", sm: "auto" },
              "& .MuiButton-root": { minHeight: 40 },
            }}
          >
            {action}
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
}
