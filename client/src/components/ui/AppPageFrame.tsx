import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function AppPageFrame({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      className="app-page-enter"
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "#F9F7F5",
        borderRadius: { xs: 0, md: "12px" },
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 1,
          borderBottom: "1px solid #F0EAE5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: "12px", lineHeight: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "#11151A" }}>
          {title}
        </Typography>
        {actions}
      </Box>
      <Stack sx={{ p: 1, minHeight: 0, flex: 1 }} className="app-scroll">
        {children}
      </Stack>
    </Box>
  );
}
