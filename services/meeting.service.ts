import { ApiError, handleSupabaseError, handleSupabaseVoid, requireAuth } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import type {
  AttendeeUpdate,
  Meeting,
  MeetingCreate,
  MeetingUpdate,
  MeetingWithRelations,
} from "@/types/meeting";

const MEETING_SELECT = `
  *,
  creator:profiles!meetings_created_by_fkey(*),
  project:projects(*),
  attendees:meeting_attendees(
    *,
    profile:profiles(*)
  )
`;

export const meetingService = {
  async getByProject(projectId: string): Promise<MeetingWithRelations[]> {
    const supabase = createClient();

    return handleSupabaseError(() =>
      supabase
        .from("meetings")
        .select(MEETING_SELECT)
        .eq("project_id", projectId)
        .order("start_time", { ascending: true })
    ) as Promise<MeetingWithRelations[]>;
  },

  async getByDateRange(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MeetingWithRelations[]> {
    const supabase = createClient();

    return handleSupabaseError(() =>
      supabase
        .from("meetings")
        .select(MEETING_SELECT)
        .eq("project_id", projectId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time", { ascending: true })
    ) as Promise<MeetingWithRelations[]>;
  },

  async getById(id: string): Promise<MeetingWithRelations> {
    const supabase = createClient();

    return handleSupabaseError(() =>
      supabase.from("meetings").select(MEETING_SELECT).eq("id", id).single()
    ) as Promise<MeetingWithRelations>;
  },

  async create(meeting: MeetingCreate): Promise<Meeting> {
    const supabase = createClient();
    const userId = await requireAuth(supabase);

    const { attendee_ids, ...meetingData } = meeting;

    const data = await handleSupabaseError<Meeting>(() =>
      supabase
        .from("meetings")
        .insert({ ...meetingData, created_by: userId })
        .select()
        .single()
    );

    if (attendee_ids && attendee_ids.length > 0) {
      const attendees = attendee_ids
        .filter((id) => id !== userId)
        .map((user_id) => ({
          meeting_id: data.id,
          user_id,
          status: "invited" as const,
        }));

      if (attendees.length > 0) {
        const { error: attendeeError } = await supabase.from("meeting_attendees").insert(attendees);

        if (attendeeError) {
          throw ApiError.fromSupabaseError(attendeeError);
        }
      }
    }

    return data;
  },

  async update(meeting: MeetingUpdate): Promise<Meeting> {
    const supabase = createClient();
    const { id, ...updates } = meeting;

    return handleSupabaseError(() =>
      supabase
        .from("meetings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()
    );
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();

    await handleSupabaseVoid(() => supabase.from("meetings").delete().eq("id", id));
  },

  async updateAttendeeStatus(update: AttendeeUpdate): Promise<void> {
    const supabase = createClient();
    const { meeting_id, user_id, status } = update;

    await handleSupabaseVoid(() =>
      supabase
        .from("meeting_attendees")
        .update({ status })
        .eq("meeting_id", meeting_id)
        .eq("user_id", user_id)
    );
  },

  async addAttendee(meetingId: string, userId: string): Promise<void> {
    const supabase = createClient();

    await handleSupabaseVoid(() =>
      supabase
        .from("meeting_attendees")
        .insert({ meeting_id: meetingId, user_id: userId, status: "invited" })
    );
  },

  async removeAttendee(meetingId: string, userId: string): Promise<void> {
    const supabase = createClient();

    await handleSupabaseVoid(() =>
      supabase
        .from("meeting_attendees")
        .delete()
        .eq("meeting_id", meetingId)
        .eq("user_id", userId)
    );
  },
};
