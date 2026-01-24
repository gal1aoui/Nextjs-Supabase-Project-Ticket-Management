"use client";

import type { DragDirection, DropPosition } from "@/contexts/drag-drop-context";
import { cn } from "@/lib/utils";

// ===========================================
// Color Variants
// ===========================================

export const dropIndicatorColors = {
  blue: "bg-blue-500/20 border-blue-500",
  green: "bg-green-500/20 border-green-500",
  red: "bg-red-500/20 border-red-500",
  yellow: "bg-yellow-500/20 border-yellow-500",
  purple: "bg-purple-500/20 border-purple-500",
  pink: "bg-pink-500/20 border-pink-500",
  orange: "bg-orange-500/20 border-orange-500",
  cyan: "bg-cyan-500/20 border-cyan-500",
} as const;

export type DropIndicatorColor = keyof typeof dropIndicatorColors;

// ===========================================
// Props
// ===========================================

interface DropIndicatorProps {
  isOver: boolean;
  position: DropPosition | null;
  direction: DragDirection;
  color?: DropIndicatorColor;
  className?: string;
}

// ===========================================
// Component
// ===========================================

export function DropIndicator({
  isOver,
  position,
  direction,
  color = "blue",
  className,
}: DropIndicatorProps) {
  if (!isOver || !position) return null;

  const colorClasses = dropIndicatorColors[color];

  // Free direction - full overlay for "inside", edge indicators for before/after
  if (direction === "free") {
    if (position === "inside") {
      return (
        <div
          className={cn(
            "absolute inset-0 z-10 pointer-events-none rounded-md border-2 border-dashed transition-all duration-150",
            colorClasses,
            className
          )}
        />
      );
    }

    // Before/after in free mode - show edge line
    return (
      <div
        className={cn(
          "absolute left-0 right-0 h-1 z-10 pointer-events-none rounded-full transition-all duration-150",
          color === "blue" && "bg-blue-500",
          color === "green" && "bg-green-500",
          color === "red" && "bg-red-500",
          color === "yellow" && "bg-yellow-500",
          color === "purple" && "bg-purple-500",
          color === "pink" && "bg-pink-500",
          color === "orange" && "bg-orange-500",
          color === "cyan" && "bg-cyan-500",
          position === "before" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2",
          className
        )}
      />
    );
  }

  // Horizontal direction - vertical line indicator
  if (direction === "horizontal") {
    return (
      <div
        className={cn(
          "absolute top-0 bottom-0 w-1 z-10 pointer-events-none rounded-full transition-all duration-150",
          color === "blue" && "bg-blue-500",
          color === "green" && "bg-green-500",
          color === "red" && "bg-red-500",
          color === "yellow" && "bg-yellow-500",
          color === "purple" && "bg-purple-500",
          color === "pink" && "bg-pink-500",
          color === "orange" && "bg-orange-500",
          color === "cyan" && "bg-cyan-500",
          position === "before" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
          className
        )}
      />
    );
  }

  // Vertical direction - horizontal line indicator
  return (
    <div
      className={cn(
        "absolute left-0 right-0 h-1 z-10 pointer-events-none rounded-full transition-all duration-150",
        color === "blue" && "bg-blue-500",
        color === "green" && "bg-green-500",
        color === "red" && "bg-red-500",
        color === "yellow" && "bg-yellow-500",
        color === "purple" && "bg-purple-500",
        color === "pink" && "bg-pink-500",
        color === "orange" && "bg-orange-500",
        color === "cyan" && "bg-cyan-500",
        position === "before" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2",
        className
      )}
    />
  );
}

// ===========================================
// Overlay Indicator (Full size highlight)
// ===========================================

interface DropOverlayProps {
  isOver: boolean;
  color?: DropIndicatorColor;
  className?: string;
}

export function DropOverlay({ isOver, color = "blue", className }: DropOverlayProps) {
  if (!isOver) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 pointer-events-none rounded-md border-2 border-dashed transition-all duration-150",
        dropIndicatorColors[color],
        className
      )}
    />
  );
}
