import { format } from "date-fns";
import { ApiError, handleSupabaseError, handleSupabaseVoid, requireAuth } from "@/lib/errors";
import { createClient, supabaseClient } from "@/lib/supabase/client";
import type {
  Event,
  EventAttendeeUpdate,
  EventCreate,
  EventUpdate,
  EventWithRelations,
} from "@/types/event";

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

const EVENT_SELECT = `
  *,
  creator:profiles!events_created_by_fkey (*),
  project:projects!events_project_id_fkey (*),
  attendees:event_attendees!event_attendees_event_id_fkey (
    *,
    profile:profiles!event_attendees_user_id_fkey (*)
  )
`;

export const eventService = {
  async getByProject(projectId: string): Promise<EventWithRelations[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("events")
        .select(EVENT_SELECT)
        .eq("project_id", projectId)
        .order("start_time", { ascending: true })
    ) as Promise<EventWithRelations[]>;
  },

  async getByDateRange(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EventWithRelations[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("events")
        .select(EVENT_SELECT)
        .eq("project_id", projectId)
        .gte("start_date", toDateStr(startDate))
        .lte("end_date", toDateStr(endDate))
        .order("start_time", { ascending: true })
    ) as Promise<EventWithRelations[]>;
  },

  async getUserEventsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EventWithRelations[]> {
    const startStr = toDateStr(startDate);
    const endStr = toDateStr(endDate);

    // Get event IDs where user is an attendee
    const attendeeRows = (await handleSupabaseError(() =>
      supabaseClient.from("event_attendees").select("event_id").eq("user_id", userId)
    )) as { event_id: string }[];

    const attendeeEventIds = attendeeRows.map((r) => r.event_id);

    // Fetch events created by user in date range (includes personal events)
    const created = (await handleSupabaseError(() =>
      supabaseClient
        .from("events")
        .select(EVENT_SELECT)
        .eq("created_by", userId)
        .gte("start_date", startStr)
        .lte("end_date", endStr)
        .order("start_time", { ascending: true })
    )) as EventWithRelations[];

    // Fetch events where user is an attendee in date range
    let attending: EventWithRelations[] = [];
    if (attendeeEventIds.length > 0) {
      attending = (await handleSupabaseError(() =>
        supabaseClient
          .from("events")
          .select(EVENT_SELECT)
          .in("id", attendeeEventIds)
          .gte("start_date", startStr)
          .lte("end_date", endStr)
          .order("start_time", { ascending: true })
      )) as EventWithRelations[];
    }

    // Deduplicate and sort
    const uniqueMap = new Map([...created, ...attending].map((m) => [m.id, m]));
    return Array.from(uniqueMap.values()).sort(
      (a, b) =>
        new Date(`${a.start_date}T${a.start_time}`).getTime() -
        new Date(`${b.start_date}T${b.start_time}`).getTime()
    );
  },

  async getById(id: string): Promise<EventWithRelations> {
    return handleSupabaseError(() =>
      supabaseClient.from("events").select(EVENT_SELECT).eq("id", id).single()
    ) as Promise<EventWithRelations>;
  },

  async create(event: EventCreate): Promise<Event> {
    const userId = await requireAuth(supabaseClient);

    const { attendees, start_date, end_date, ...eventData } = event;

    const data = await handleSupabaseError<Event>(() =>
      supabaseClient
        .from("events")
        .insert({
          ...eventData,
          start_date: start_date ? toDateStr(start_date as unknown as Date) : undefined,
          end_date: end_date ? toDateStr(end_date as unknown as Date) : undefined,
          created_by: userId,
        })
        .select()
        .single()
    );

    if (attendees && attendees.length > 0) {
      const attendeeRecords = attendees
        .filter((id) => id !== userId)
        .map((user_id) => ({
          event_id: data.id,
          user_id,
          status: "invited" as const,
        }));

      if (attendeeRecords.length > 0) {
        const { error: attendeeError } = await supabaseClient
          .from("event_attendees")
          .insert(attendeeRecords);

        if (attendeeError) {
          throw ApiError.fromSupabaseError(attendeeError);
        }
      }
    }

    return data;
  },

  async update(event: EventUpdate): Promise<Event> {
    const { id, start_date, end_date, ...updates } = event;

    return handleSupabaseError(() =>
      supabaseClient
        .from("events")
        .update({
          ...updates,
          start_date: start_date ? toDateStr(start_date as unknown as Date) : undefined,
          end_date: end_date ? toDateStr(end_date as unknown as Date) : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseVoid(() => supabaseClient.from("events").delete().eq("id", id));
  },

  async updateAttendeeStatus(update: EventAttendeeUpdate): Promise<void> {
    const { event_id, user_id, status } = update;

    await handleSupabaseVoid(() =>
      supabaseClient
        .from("event_attendees")
        .update({ status })
        .eq("event_id", event_id)
        .eq("user_id", user_id)
    );
  },

  async addAttendee(eventId: string, userId: string): Promise<void> {
    await handleSupabaseVoid(() =>
      supabaseClient
        .from("event_attendees")
        .insert({ event_id: eventId, user_id: userId, status: "invited" })
    );
  },

  async removeAttendee(eventId: string, userId: string): Promise<void> {
    const supabase = createClient();

    await handleSupabaseVoid(() =>
      supabase.from("event_attendees").delete().eq("event_id", eventId).eq("user_id", userId)
    );
  },
};
