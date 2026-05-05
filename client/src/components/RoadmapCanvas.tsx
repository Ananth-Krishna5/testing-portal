import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, type Node, type Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Box, Typography } from "@mui/material";
import { Flowchart24Regular } from "@fluentui/react-icons";
import { FluentIcon } from "./ui/FluentIcon";

export function RoadmapCanvas({ title, canvas }: { title: string; canvas: unknown }): JSX.Element {
  const { nodes, edges, isSample } = useMemo(() => {
    const c = (canvas ?? {}) as { nodes?: Node[]; edges?: Edge[] };
    const hasNodes = Array.isArray(c.nodes) && c.nodes.length > 0;
    const hasEdges = Array.isArray(c.edges) && c.edges.length > 0;
    const nodes = hasNodes
      ? c.nodes!
      : [
          { id: "1", type: "default", position: { x: 0, y: 0 }, data: { label: "Kickoff" } },
          { id: "2", type: "default", position: { x: 220, y: 40 }, data: { label: "Design" } },
          { id: "3", type: "default", position: { x: 460, y: 0 }, data: { label: "Build" } },
          { id: "4", type: "default", position: { x: 700, y: 60 }, data: { label: "Certify" } },
        ];
    const edges = hasEdges
      ? c.edges!
      : [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
          { id: "e3-4", source: "3", target: "4" },
        ];
    return { nodes, edges, isSample: !hasNodes || !hasEdges };
  }, [canvas]);

  return (
    <Box
      role="region"
      aria-label={`Roadmap: ${title}`}
      sx={{
        maxHeight: 320,
        borderRadius: "var(--app-radius-md)",
        border: "1px solid var(--app-border-light)",
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid var(--app-border-light)", display: "flex", alignItems: "center", gap: 1 }}>
        <FluentIcon icon={Flowchart24Regular} size="inline" color="var(--mui-palette-primary-main)" />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontFamily: "var(--app-font-display)" }}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {isSample ? "Sample pathway — edit roadmap data to customize." : "Roadmap canvas"}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: 260 }} tabIndex={0} className="app-scroll">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            proOptions={{ hideAttribution: true }}
            style={{ outline: "none" }}
          >
            <MiniMap pannable zoomable />
            <Controls showInteractive={false} />
            <Background gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
