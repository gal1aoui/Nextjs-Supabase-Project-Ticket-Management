import { z } from "zod";
import type { Profile, Project } from "@/types/database";

// ===========================================
// Database Types
// ===========================================

export type Meeting = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: "In-Person" | "Online";
  meeting_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingAttendee = {
  id: string;
  meeting_id: string;
  user_id: string;
  status: "invited" | "accepted" | "declined" | "tentative";
  created_at: string;
};

export type MeetingWithRelations = Meeting & {
  attendees: (MeetingAttendee & { profile: Profile })[];
  creator: Profile | null;
  project: Project;
};

// ===========================================
// Form Schemas (UI forms)
// ===========================================

export const meetingFormSchema = z
  .object({
    title: z.string().min(3, "Meeting title is required").max(200),
    description: z.string().optional(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    start_time: z.iso.time(),
    end_time: z.iso.time(),
    attendees: z.array(z.uuid()).optional(),
    location: z.enum(["In-Person", "Online"]).default("Online"),
    meeting_url: z.url().optional().or(z.literal("")),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i)
      .optional(),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export type MeetingFormSchema = z.infer<typeof meetingFormSchema>;

// ===========================================
// Service Schemas (API operations)
// ===========================================

const meetingCreateSchema = z
  .object({
    project_id: z.uuid("Invalid project ID"),
  });

const meetingCreate = z.intersection(meetingFormSchema, meetingCreateSchema);
export type MeetingCreate = z.infer<typeof meetingCreate>;

export const meetingUpdateSchema = z.object({
  id: z.uuid(),
});

const meetingUpdate = z.intersection(meetingFormSchema, meetingUpdateSchema);
export type MeetingUpdate = z.infer<typeof meetingUpdate>;

export const attendeeUpdateSchema = z.object({
  meeting_id: z.uuid(),
  user_id: z.uuid(),
  status: z.enum(["invited", "accepted", "declined", "tentative"]),
});

export type AttendeeUpdate = z.infer<typeof attendeeUpdateSchema>;
