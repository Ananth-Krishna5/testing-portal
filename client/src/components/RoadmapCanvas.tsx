import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, type Node, type Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Box, Typography } from "@mui/material";

export function RoadmapCanvas({ title, canvas }: { title: string; canvas: unknown }): JSX.Element {
  const { nodes, edges } = useMemo(() => {
    const c = (canvas ?? {}) as { nodes?: Node[]; edges?: Edge[] };
    const nodes =
      Array.isArray(c.nodes) && c.nodes.length > 0
        ? c.nodes
        : [
            { id: "1", type: "default", position: { x: 0, y: 0 }, data: { label: "Kickoff" } },
            { id: "2", type: "default", position: { x: 220, y: 40 }, data: { label: "Design" } },
            { id: "3", type: "default", position: { x: 460, y: 0 }, data: { label: "Build" } },
            { id: "4", type: "default", position: { x: 700, y: 60 }, data: { label: "Certify" } },
          ];
    const edges =
      Array.isArray(c.edges) && c.edges.length > 0
        ? c.edges
        : [
            { id: "e1-2", source: "1", target: "2" },
            { id: "e2-3", source: "2", target: "3" },
            { id: "e3-4", source: "3", target: "4" },
          ];
    return { nodes, edges };
  }, [canvas]);

  return (
    <Box sx={{ height: 360, borderRadius: 2, border: 1, borderColor: "divider", overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
        <Typography fontWeight={700}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          Roadmap canvas (React Flow)
        </Typography>
      </Box>
      <Box sx={{ height: 300 }}>
        <ReactFlowProvider>
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <MiniMap />
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
