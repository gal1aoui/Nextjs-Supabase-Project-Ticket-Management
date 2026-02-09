import { z } from "zod";
import type { Profile } from "@/types/profile";
import type { Project } from "@/types/project";

// ===========================================
// Constants
// ===========================================

export const EVENT_TYPES = [
  "meeting",
  "holiday",
  "out_of_office",
  "sick_leave",
  "personal",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meeting: "Meeting",
  holiday: "Holiday",
  out_of_office: "Out of Office",
  sick_leave: "Sick Leave",
  personal: "Personal",
};

// ===========================================
// Database Types
// ===========================================

export type Event = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  event_type: EventType;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: "In-Person" | "Online" | null;
  event_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EventAttendee = {
  id: string;
  event_id: string;
  user_id: string;
  status: "invited" | "accepted" | "declined" | "tentative";
  created_at: string;
};

export type EventWithRelations = Event & {
  attendees: (EventAttendee & { profile: Profile })[];
  creator: Profile | null;
  project: Project | null;
};

// ===========================================
// Form Schemas (UI forms)
// ===========================================

export const eventFormSchema = z
  .object({
    title: z.string().min(3, "Event title is required").max(200),
    description: z.string().optional(),
    event_type: z.enum(EVENT_TYPES).default("meeting"),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    start_time: z.iso.time(),
    end_time: z.iso.time(),
    attendees: z.array(z.uuid()).optional(),
    location: z.enum(["In-Person", "Online"]).default("Online"),
    event_url: z.url().optional().or(z.literal("")),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i)
      .optional(),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export type EventFormSchema = z.infer<typeof eventFormSchema>;

// ===========================================
// Service Schemas (API operations)
// ===========================================

const eventCreateSchema = z.object({
  project_id: z.uuid("Invalid project ID").optional(),
});

const eventCreate = z.intersection(eventFormSchema, eventCreateSchema);
export type EventCreate = z.infer<typeof eventCreate>;

export const eventUpdateSchema = z.object({
  id: z.uuid(),
});

const eventUpdate = z.intersection(eventFormSchema, eventUpdateSchema);
export type EventUpdate = z.infer<typeof eventUpdate>;

export const eventAttendeeUpdateSchema = z.object({
  event_id: z.uuid(),
  user_id: z.uuid(),
  status: z.enum(["invited", "accepted", "declined", "tentative"]),
});

export type EventAttendeeUpdate = z.infer<typeof eventAttendeeUpdateSchema>;
