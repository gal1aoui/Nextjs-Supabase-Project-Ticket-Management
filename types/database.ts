export type Database = {
  public: {
    Tables: {
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
          assigned_to: string;
          priority_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          project_id: string;
          state_id: string;
          assigned_to: string;
          priority_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          state_id?: string;
          assigned_to?: string;
          priority_id?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type TicketState = Database["public"]["Tables"]["ticket_states"]["Row"];
export type TicketPriority = Database["public"]["Tables"]["ticket_priorities"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
