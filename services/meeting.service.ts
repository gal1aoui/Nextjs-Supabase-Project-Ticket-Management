import {
  ApiError,
  handleSupabaseError,
  handleSupabaseVoid,
  requireAuth,
} from "@/lib/errors";
import { createClient, supabaseClient } from "@/lib/supabase/client";
import type {
  AttendeeUpdate,
  Meeting,
  MeetingCreate,
  MeetingUpdate,
  MeetingWithRelations,
} from "@/types/meeting";

const MEETING_SELECT = `
  *,
  creator:profiles!meetings_created_by_fkey (*),
  project:projects!meetings_project_id_fkey (*),
  attendees:meeting_attendees!meeting_attendees_meeting_id_fkey (
    *,
    profile:profiles!meeting_attendees_profile_id_fkey (*)
  )
`;

export const meetingService = {
  async getByProject(projectId: string): Promise<MeetingWithRelations[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("meetings")
        .select(MEETING_SELECT)
        .eq("project_id", projectId)
        .order("start_time", { ascending: true }),
    ) as Promise<MeetingWithRelations[]>;
  },

  async getByDateRange(
    projectId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MeetingWithRelations[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("meetings")
        .select(MEETING_SELECT)
        .eq("project_id", projectId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time", { ascending: true }),
    ) as Promise<MeetingWithRelations[]>;
  },

  async getById(id: string): Promise<MeetingWithRelations> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("meetings")
        .select(MEETING_SELECT)
        .eq("id", id)
        .single(),
    ) as Promise<MeetingWithRelations>;
  },

  async create(meeting: MeetingCreate): Promise<Meeting> {
    const userId = await requireAuth(supabaseClient);

    const { attendee_ids, ...meetingData } = meeting;

    const data = await handleSupabaseError<Meeting>(() =>
      supabaseClient
        .from("meetings")
        .insert({ ...meetingData, created_by: userId })
        .select()
        .single(),
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
        const { error: attendeeError } = await supabaseClient
          .from("meeting_attendees")
          .insert(attendees);

        if (attendeeError) {
          throw ApiError.fromSupabaseError(attendeeError);
        }
      }
    }

    return data;
  },

  async update(meeting: MeetingUpdate): Promise<Meeting> {
    const { id, ...updates } = meeting;

    return handleSupabaseError(() =>
      supabaseClient
        .from("meetings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single(),
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseVoid(() =>
      supabaseClient.from("meetings").delete().eq("id", id),
    );
  },

  async updateAttendeeStatus(update: AttendeeUpdate): Promise<void> {
    const { meeting_id, user_id, status } = update;

    await handleSupabaseVoid(() =>
      supabaseClient
        .from("meeting_attendees")
        .update({ status })
        .eq("meeting_id", meeting_id)
        .eq("user_id", user_id),
    );
  },

  async addAttendee(meetingId: string, userId: string): Promise<void> {
    await handleSupabaseVoid(() =>
      supabaseClient
        .from("meeting_attendees")
        .insert({ meeting_id: meetingId, user_id: userId, status: "invited" }),
    );
  },

  async removeAttendee(meetingId: string, userId: string): Promise<void> {
    const supabase = createClient();

    await handleSupabaseVoid(() =>
      supabase
        .from("meeting_attendees")
        .delete()
        .eq("meeting_id", meetingId)
        .eq("user_id", userId),
    );
  },
};
