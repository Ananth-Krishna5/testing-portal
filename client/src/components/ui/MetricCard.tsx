import { Card, CardContent, Typography } from "@mui/material";

export function MetricCard({ label, value }: { label: string; value: number | string }): JSX.Element {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
