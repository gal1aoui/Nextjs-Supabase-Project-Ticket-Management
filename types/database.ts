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
          permissions: string[] | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions?: string[] | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: string[] | null;
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
          status: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role_id: string;
          invited_by?: string | null;
          invited_at?: string;
          joined_at?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          joined_at?: string | null;
          status?: string;
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
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Role = Database["public"]["Tables"]["roles"]["Row"];
export type ProjectMember = Database["public"]["Tables"]["project_members"]["Row"];
export type TicketState = Database["public"]["Tables"]["ticket_states"]["Row"];
export type TicketPriority = Database["public"]["Tables"]["ticket_priorities"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];

export type ProjectMembersData = {
  user_id: string;
  status: string;
  role_id: string;
  invited_at: string;
};
