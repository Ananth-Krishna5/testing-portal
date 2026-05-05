import { Tooltip as MuiTooltip } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactElement } from "react";

interface TooltipProps {
  text: string;
  children: ReactElement;
  placement?: "top" | "bottom";
  allowWrap?: boolean;
  maxLines?: 2;
  bubbleMaxWidth?: string;
  rootClassName?: string;
}

/**
 * TSX port of Archive 6 src/components/Tooltip. Thin wrapper around MUI Tooltip
 * with shared visual defaults (compact bubble, optional wrap / 2-line clamp).
 */
export function Tooltip({
  text,
  children,
  placement = "top",
  allowWrap = false,
  maxLines,
  bubbleMaxWidth,
  rootClassName = "",
}: TooltipProps) {
  const wrapSx =
    allowWrap && maxLines === undefined
      ? {
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          maxWidth: "min(360px, 85vw)",
          textAlign: "center",
        }
      : {};

  const clampSx =
    maxLines === 2
      ? {
          whiteSpace: "normal",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          overflow: "hidden",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          maxWidth: "min(320px, 92vw)",
          textAlign: "center",
          boxSizing: "border-box",
        }
      : {};

  return (
    <MuiTooltip
      describeChild
      title={text || ""}
      placement={placement}
      enterDelay={400}
      enterNextDelay={200}
      disableHoverListener={!text}
      disableFocusListener={!text}
      disableTouchListener={!text}
      slotProps={{
        tooltip: {
          className: rootClassName,
          sx: {
            fontSize: "var(--app-font-size-sm)",
            lineHeight: 1.2,
            px: "4px",
            py: "3px",
            bgcolor: "rgba(15, 27, 45, 0.96)",
            color: "#fff",
            borderRadius: "var(--app-radius-xs)",
            boxShadow: "0 6px 18px rgba(15, 27, 45, 0.28)",
            pointerEvents: "none",
            ...wrapSx,
            ...clampSx,
            ...(bubbleMaxWidth != null
              ? { maxWidth: bubbleMaxWidth, width: "fit-content" }
              : {}),
          } as SxProps<Theme>,
        },
        popper: {
          popperOptions: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, placement === "bottom" ? 6 : -6],
                },
              },
            ],
          },
        },
      }}
    >
      {children}
    </MuiTooltip>
  );
}

export default Tooltip;
