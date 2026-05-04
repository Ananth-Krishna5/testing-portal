import { Paper, Typography } from "@mui/material";

export function EmptyState({ title, message }: { title: string; message: string }): JSX.Element {
  return (
    <Paper sx={{ p: 3, textAlign: "center", borderStyle: "dashed" }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {message}
      </Typography>
    </Paper>
  );
}
