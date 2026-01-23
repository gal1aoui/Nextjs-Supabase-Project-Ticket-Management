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
  location: string | null;
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
// Service Schemas (API operations)
// ===========================================

export const meetingCreateSchema = z
  .object({
    project_id: z.string().uuid("Invalid project ID"),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().optional(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    location: z.string().optional(),
    meeting_url: z.string().url().optional().or(z.literal("")),
    attendee_ids: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export const meetingUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  location: z.string().optional(),
  meeting_url: z.string().url().optional().or(z.literal("")),
});

export const attendeeUpdateSchema = z.object({
  meeting_id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: z.enum(["invited", "accepted", "declined", "tentative"]),
});

export type MeetingCreate = z.infer<typeof meetingCreateSchema>;
export type MeetingUpdate = z.infer<typeof meetingUpdateSchema>;
export type AttendeeUpdate = z.infer<typeof attendeeUpdateSchema>;

// ===========================================
// Form Schemas (UI forms)
// ===========================================

export const meetingFormSchema = z.object({
  title: z.string().min(3, "Meeting title is required").max(200),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  attendees: z.array(z.string().email()).optional(),
  location: z.enum(["In-Person", "Online"]).default("Online"),
  meetingUrl: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export type MeetingFormSchema = z.infer<typeof meetingFormSchema>;
