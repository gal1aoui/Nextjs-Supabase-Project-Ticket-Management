"use client";

import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/dist/types/types";
import { memo } from "react";

interface DropIndicatorProps {
  edge: Edge;
  gap?: string;
}

export const DropIndicator = memo(function DropIndicator({
  edge,
  gap = "8px",
}: DropIndicatorProps) {
  const lineOffset =
    edge === "top" ? `calc(-1 * ${gap} / 2)` : `calc(100% + (${gap} / 2))`;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: lineOffset,
        height: "2px",
        transform: "translateY(-50%)",
        background: "hsl(var(--primary))",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "hsl(var(--primary))",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translate(50%, -50%)",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "hsl(var(--primary))",
        }}
      />
    </div>
  );
});
