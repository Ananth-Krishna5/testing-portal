import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertTitle, Box, Button, Link as MuiLink, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowClockwise24Regular, ClipboardTask24Regular, Home24Regular } from "@fluentui/react-icons";
import { FluentIcon } from "./ui/FluentIcon";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Unhandled app render error:", error, errorInfo);
  }

  private reloadPage = (): void => {
    window.location.reload();
  };

  private copyDetails = async (): Promise<void> => {
    const text = this.state.error?.stack ?? this.state.error?.message ?? "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, bgcolor: "background.default" }}>
        <Stack spacing={2} sx={{ maxWidth: 760, width: "100%" }} className="app-page-enter">
          <Alert severity="error" variant="outlined">
            <AlertTitle>Something went wrong</AlertTitle>
            {this.state.error?.message ?? "Unknown rendering error"}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Open the browser console for the full stack trace. You can copy technical details below or return home.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained" component={Link} to="/" startIcon={<FluentIcon icon={Home24Regular} size="inline" color="inherit" />}>
              Home
            </Button>
            <Button variant="outlined" onClick={this.reloadPage} startIcon={<FluentIcon icon={ArrowClockwise24Regular} size="inline" />}>
              Reload page
            </Button>
            <Button variant="outlined" onClick={() => void this.copyDetails()} startIcon={<FluentIcon icon={ClipboardTask24Regular} size="inline" />}>
              Copy error details
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Need help?{" "}
            <MuiLink href="https://xmachina.digital/" target="_blank" rel="noopener noreferrer">
              xMachina Digital
            </MuiLink>
          </Typography>
        </Stack>
      </Box>
    );
  }
}
