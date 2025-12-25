import { z } from "zod";

export const meetingCreateSchema = z.object({
  title: z.string().min(3, "Meeting title is required").max(200),
  description: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  attendees: z.array(z.email()).optional(),
  location: z.enum(["In-Person", "Online"]).default("Online"),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export const meetingUpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().min(3, "Meeting title is required").max(200).optional(),
  description: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  attendees: z.array(z.email()).optional(),
  location: z.enum(["In-Person", "Online"]).default("Online"),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export type MeetingCreate = z.infer<typeof meetingCreateSchema>;
export type MeetingUpdate = z.infer<typeof meetingUpdateSchema>;
