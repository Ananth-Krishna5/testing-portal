import { Card, CardContent, Typography } from "@mui/material";
import type { ComponentType } from "react";
import { FluentIcon } from "./FluentIcon";

export function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: ComponentType<{ fontSize?: number; color?: string }>;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "var(--app-radius-md)",
        borderColor: "var(--app-border-light)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.96) 100%)",
        height: "100%",
        boxShadow: "var(--app-shadow-xs)",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mt: 0.75,
            fontVariantNumeric: "tabular-nums",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {icon ? <FluentIcon icon={icon} size="inline" color="var(--mui-palette-text-secondary)" /> : null}
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
