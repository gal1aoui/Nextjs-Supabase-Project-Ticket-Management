import type { DragEvent } from "react";
import type { Edge } from "../types";

export const getClosestEdge = (e: DragEvent<HTMLElement>): Edge =>  {
  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const threshold = rect.height / 2;
  return y < threshold ? "top" : "bottom";
}


export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}