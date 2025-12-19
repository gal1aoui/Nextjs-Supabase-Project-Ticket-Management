"use client";

import { MonitorCog, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const themePreview = (theme: string | undefined) => {
  switch (theme) {
    case "light":
      return <Sun className="h-5 w-5" />;
    case "dark":
      return <Moon className="h-5 w-5" />;
    default:
      return <MonitorCog className="h-5 w-5" />;
  }
};

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() =>
        setTheme((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"))
      }
      className="rounded-full"
    >
      {themePreview(theme)}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
