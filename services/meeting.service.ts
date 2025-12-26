import { createClient } from "@/lib/supabase/client";
import type {
  AttendeeUpdate,
  Meeting,
  MeetingCreate,
  MeetingUpdate,
  MeetingWithRelations,
} from "@/lib/utils";

export const meetingService = {
  async getByProject(projectId: string): Promise<MeetingWithRelations[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("meetings")
      .select(`
        *,
        creator:profiles!meetings_created_by_fkey(*),
        project:projects(*),
        attendees:meeting_attendees(
          *,
          profile:profiles(*)
        )
      `)
      .eq("project_id", projectId)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data as MeetingWithRelations[];
  },

  async getByDateRange(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MeetingWithRelations[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("meetings")
      .select(`
        *,
        creator:profiles!meetings_created_by_fkey(*),
        project:projects(*),
        attendees:meeting_attendees(
          *,
          profile:profiles(*)
        )
      `)
      .eq("project_id", projectId)
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString())
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data as MeetingWithRelations[];
  },

  async getById(id: string): Promise<MeetingWithRelations> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("meetings")
      .select(`
        *,
        creator:profiles!meetings_created_by_fkey(*),
        project:projects(*),
        attendees:meeting_attendees(
          *,
          profile:profiles(*)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as MeetingWithRelations;
  },

  async create(meeting: MeetingCreate): Promise<Meeting> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { attendee_ids, ...meetingData } = meeting;

    const { data, error } = await supabase
      .from("meetings")
      .insert({ ...meetingData, created_by: user.id })
      .select()
      .single();

    if (error) throw error;

    // Add attendees if provided
    if (attendee_ids && attendee_ids.length > 0) {
      const attendees = attendee_ids
        .filter((id) => id !== user.id) // Skip creator, already added by trigger
        .map((user_id) => ({
          meeting_id: data.id,
          user_id,
          status: "invited" as const,
        }));

      if (attendees.length > 0) {
        const { error: attendeeError } = await supabase.from("meeting_attendees").insert(attendees);

        if (attendeeError) throw attendeeError;
      }
    }

    return data;
  },

  async update(meeting: MeetingUpdate): Promise<Meeting> {
    const supabase = createClient();
    const { id, ...updates } = meeting;

    const { data, error } = await supabase
      .from("meetings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (error) throw error;
  },

  async updateAttendeeStatus(update: AttendeeUpdate): Promise<void> {
    const supabase = createClient();
    const { meeting_id, user_id, status } = update;

    const { error } = await supabase
      .from("meeting_attendees")
      .update({ status })
      .eq("meeting_id", meeting_id)
      .eq("user_id", user_id);

    if (error) throw error;
  },

  async addAttendee(meetingId: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("meeting_attendees")
      .insert({ meeting_id: meetingId, user_id: userId, status: "invited" });

    if (error) throw error;
  },

  async removeAttendee(meetingId: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("meeting_attendees")
      .delete()
      .eq("meeting_id", meetingId)
      .eq("user_id", userId);

    if (error) throw error;
  },
};
