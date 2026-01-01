import { z } from "zod";

export const meetingFormSchema = z.object({
  title: z.string().min(3, "Meeting title is required").max(200),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  attendees: z.array(z.email()).optional(),
  location: z.enum(["In-Person", "Online"]).default("Online"),
  meetingUrl: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export type MeetingFormSchema = z.infer<typeof meetingFormSchema>

const meetingUpdate = z.object({
  id: z.uuid(),
});

const meetingUpdateSchema = z.intersection(meetingFormSchema, meetingUpdate);

export type MeetingUpdateSchema = z.infer<typeof meetingUpdateSchema>;