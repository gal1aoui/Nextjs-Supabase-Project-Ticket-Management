"use client";

import { use } from "react";
import DailyView from "@/components/calendar/day-view";
import { Button } from "@/components/ui/button";

export default function Page() {
  return <DailyView nextButton={<Button>Next</Button>} />;
}
