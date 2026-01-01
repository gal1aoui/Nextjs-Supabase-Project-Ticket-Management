export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          permissions: string[];
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions?: string[];
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: string[];
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role_id: string;
          invited_by: string | null;
          invited_at: string;
          joined_at: string | null;
          status: "pending" | "active" | "inactive";
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role_id: string;
          invited_by?: string | null;
          invited_at?: string;
          joined_at?: string | null;
          status?: "pending" | "active" | "inactive";
        };
        Update: {
          id?: string;
          role_id?: string;
          joined_at?: string | null;
          status?: "pending" | "active" | "inactive";
        };
      };
      ticket_states: {
        Row: {
          id: string;
          name: string;
          project_id: string;
          order: number;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          project_id: string;
          order?: number;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          order?: number;
          color?: string | null;
        };
      };
      ticket_priorities: {
        Row: {
          id: string;
          name: string;
          project_id: string;
          order: number;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          project_id: string;
          order?: number;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          order?: number;
          color?: string | null;
        };
      };
      tickets: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          project_id: string;
          state_id: string;
          assigned_to: string | null;
          priority_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          project_id: string;
          state_id: string;
          assigned_to?: string | null;
          priority_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          state_id?: string;
          assigned_to?: string | null;
          priority_id?: string | null;
          updated_at?: string;
        };
      };
      meetings: {
        Row: {
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
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          location?: string | null;
          meeting_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          meeting_url?: string | null;
          updated_at?: string;
        };
      };
      meeting_attendees: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          status: "invited" | "accepted" | "declined" | "tentative";
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id: string;
          status?: "invited" | "accepted" | "declined" | "tentative";
          created_at?: string;
        };
        Update: {
          id?: string;
          status?: "invited" | "accepted" | "declined" | "tentative";
        };
      };
    };
  };
};

// Base types from database tables
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Role = Database["public"]["Tables"]["roles"]["Row"];
export type ProjectMember = Database["public"]["Tables"]["project_members"]["Row"];
export type TicketState = Database["public"]["Tables"]["ticket_states"]["Row"];
export type TicketPriority = Database["public"]["Tables"]["ticket_priorities"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type MeetingAttendee = Database["public"]["Tables"]["meeting_attendees"]["Row"];

export type ProjectMemberWithProfile = ProjectMember & {
  profile: Profile;
  role: Role;
};

export type ProjectWithCounts = Project & {
  ticket_count: number;
  member_count: number;
};

export type TicketWithRelations = Ticket & {
  state: TicketState;
  priority: TicketPriority | null;
  assigned_user: Profile | null;
  created_user: Profile | null;
};
