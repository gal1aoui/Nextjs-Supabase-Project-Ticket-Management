# WeConnect Frontend - Coding Patterns & Conventions

## Project Overview
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: TanStack Query + React Context
- **UI**: shadcn/ui + Tailwind CSS 4

---

## Architecture: Three-Layer Pattern

```
Component → Store Hook → Service → Supabase REST API
```

1. **Services** (`/services`): Pure Supabase database operations with centralized error handling
2. **Stores** (`/stores`): TanStack Query hooks for caching & mutations
3. **Components** (`/components`): Presentational UI consuming stores

---

## Supabase API Patterns

### Auto-Generated REST API
Supabase provides a RESTful API via PostgREST at `https://<project>.supabase.co/rest/v1/`. The API:
- Auto-generates from database schema
- Supports deep relational queries
- Integrates with Row Level Security (RLS)
- Resolves to single SQL statements for performance

### Query Best Practices
```typescript
// Basic query with ordering
supabaseClient.from("tickets").select("*").order("updated_at", { ascending: false });

// Relational query (joins)
supabaseClient.from("meetings").select(`
  *,
  creator:profiles!meetings_created_by_fkey(*),
  attendees:meeting_attendees(*, profile:profiles(*))
`);

// Filtered query
supabaseClient.from("tickets").select("*").eq("project_id", projectId).single();
```

---

## Authentication & Middleware

### Middleware Setup (`lib/supabase/middleware.ts`)
The middleware handles auth state and route protection:
- Uses `supabase.auth.getClaims()` for JWT verification
- Enforces email verification via `verified_code` in user metadata
- Redirects unauthenticated users from protected routes
- Redirects authenticated users from auth routes

### Route Protection Flow
```
Request → Middleware → Check Auth Claims
  ├── No user → Redirect to login (if protected route)
  ├── Unverified user → Redirect to OTP verification
  └── Verified user → Allow access
```

### User Verification States
```typescript
// User is verified when:
user.user_metadata.verified_code === "confirmed"

// User is unverified when:
user.user_metadata.verified_code !== "confirmed" // Contains OTP code
```

---

## Row Level Security (RLS)

### Policy Structure
```sql
CREATE POLICY "policy_name" ON table_name
  FOR operation        -- SELECT, INSERT, UPDATE, DELETE
  TO role              -- authenticated, anon
  USING (condition)    -- Read condition
  WITH CHECK (condition); -- Write condition
```

### Performance Best Practices
```sql
-- ✓ Good: Wrap auth functions in SELECT for caching
USING ((select auth.uid()) = user_id)

-- ✗ Bad: Direct function call (no caching)
USING (auth.uid() = user_id)

-- ✓ Good: Specify role to skip unnecessary evaluation
FOR SELECT TO authenticated

-- ✓ Good: Index columns used in policies
CREATE INDEX idx_tickets_project ON tickets(project_id);
```

### Helper Functions
```sql
-- Check if user is active project member
is_project_member(project_id, user_id) → boolean

-- Check if user has specific permission
has_project_permission(project_id, user_id, permission) → boolean
```

---

## Role-Based Access Control

### System Roles
| Role | Key Permissions |
|------|-----------------|
| Owner | Full access - `manage_project`, `manage_members`, `manage_roles` |
| Admin | `manage_members`, `manage_tickets`, `manage_meetings` |
| Manager | `manage_tickets`, `manage_states`, `manage_priorities` |
| Developer | `create_tickets`, `update_own_tickets`, `comment` |
| Guest | `view_tickets` only |

### Permission Checks in Services
```typescript
// RLS handles permission checks automatically via policies
// The service just makes the query - RLS filters results
async getByProject(projectId: string): Promise<Ticket[]> {
  return handleSupabaseError(() =>
    supabaseClient.from("tickets").select("*").eq("project_id", projectId)
  );
}
```

---

## Centralized Error Handling (`lib/errors.ts`)

### Error Types & Classes
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCodeType,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromSupabaseError(error: PostgrestError | AuthError): ApiError;
  static unauthorized(message?: string): ApiError;
  static notFound(resource: string): ApiError;
  static validation(message: string, details?: unknown): ApiError;
}
```

### Result Type Pattern
```typescript
type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

function success<T>(data: T): Result<T>;
function failure<E>(error: E): Result<never, E>;
```

### Supabase Error Wrapper
```typescript
async function handleSupabaseError<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T>;

async function requireAuth(supabase): Promise<string>; // returns userId
```

---

## Modal/Dialog Pattern

### Context-Based Modal (for dynamic content)
```typescript
const { openModal } = useModal();

openModal({
  title: "Edit Project",
  description: "Update your project information",
  render: ({ close }) => <ProjectForm project={project} closeModal={close} />,
});
```

### Local State Dialog (for simple modals)
```typescript
const { isOpen, toggleModal, closeModal } = useModalDialog();

<Dialog open={isOpen} onOpenChange={toggleModal}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>
```

---

## Form Pattern

### Structure
1. **Zod schema** in `/types` for validation
2. **useState** for form state (not React Hook Form controller)
3. **TanStack Query mutation** for submission
4. **Toast** for success/error feedback

### Example
```typescript
const [form, setForm] = useState<ProjectFormSchema>({
  name: project?.name ?? "",
  description: project?.description ?? "",
});

const updateProject = useUpdateProject();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const parsed = projectFormSchema.safeParse(form);
  if (!parsed.success) {
    setError(z.treeifyError(parsed.error).properties?.name?.errors[0]);
    return;
  }

  try {
    await updateProject.mutateAsync({ id: project.id, ...form });
    closeModal();
    toast.success("Project updated successfully");
  } catch (_) {
    toast.error(`Failed to update: ${updateProject.error?.message}`);
  }
};
```

---

## Data Fetching Pattern (TanStack Query)

### Query Keys Factory
```typescript
export const ticketKeys = {
  byProject: (projectId: string) => ["tickets", projectId] as const,
  detail: (id: string) => ["tickets", "detail", id] as const,
};
```

### Query Hook
```typescript
export function useTickets(projectId: string) {
  return useQuery({
    queryKey: ticketKeys.byProject(projectId),
    queryFn: () => ticketService.getByProject(projectId),
    enabled: !!projectId,
  });
}
```

### Mutation Hook
```typescript
export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketCreate) => ticketService.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ticketKeys.byProject(variables.project_id) });
    },
  });
}
```

---

## Supabase Service Pattern

### Using Centralized Error Handling
```typescript
import { handleSupabaseError, requireAuth } from "@/lib/errors";

export const ticketService = {
  async getByProject(projectId: string): Promise<Ticket[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .select("*")
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false })
    );
  },

  async create(ticket: TicketCreate): Promise<Ticket> {
    const userId = await requireAuth(supabaseClient);

    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .insert({ ...ticket, created_by: userId })
        .select()
        .single()
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseError(() =>
      supabaseClient.from("tickets").delete().eq("id", id).select()
    );
  },
};
```

### Key Rules
- Use `handleSupabaseError()` wrapper for all Supabase operations
- Use `requireAuth()` to get authenticated user ID
- Return promise directly from `handleSupabaseError()`
- Use `.select()` on delete/update to enable error detection

---

## Auth Service Pattern (Result Type)

### Login/Register Services
```typescript
import { failure, type Result, success } from "@/lib/errors";

type ValidationErrors = Record<string, { errors: string[] }>;

export type LoginResult = Result<
  { user: Record<string, unknown> },
  { validation?: ValidationErrors; server?: string }
>;

export async function signInWithEmail(formData: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(formData);

  if (!parsed.success) {
    return failure({
      validation: z.treeifyError(parsed.error).properties as ValidationErrors,
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({...});

  if (error) {
    return failure({ server: error.message });
  }

  return success({ user: data.user.user_metadata });
}
```

### Auth Actions (using Result)
```typescript
export async function loginAction(formData: LoginInput) {
  const result = await signInWithEmail(formData);

  if (!result.success) {
    return {
      error: result.error.validation,
      serverError: result.error.server,
    };
  }

  redirect(routes.dashboard.home);
}
```

---

## TypeScript Patterns

### Database Types (from Supabase)
```typescript
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
```

### Extended Types with Relations
```typescript
export type TicketWithRelations = Ticket & {
  state: TicketState;
  priority: TicketPriority | null;
};
```

### Zod Schema Types
```typescript
export const ticketCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  project_id: z.uuid(),
  state_id: z.uuid(),
});

export type TicketCreate = z.infer<typeof ticketCreateSchema>;
```

---

## Naming Conventions

### Files
- `kebab-case.tsx` for components
- `name.service.ts` for services
- `name.store.ts` for stores
- `use-name.ts` for hooks

### Functions
- `handleSubmit`, `handleDelete` - event handlers
- `useTickets`, `useCreateProject` - hooks
- `ticketService`, `projectService` - service objects

### Variables
- `[state, setState]` - state pairs
- `isPending`, `isLoading` - boolean flags
- `ticketKeys`, `projectKeys` - query key factories

---

## Folder Structure

```
lib/
├── errors.ts            # Centralized error handling
├── utils.ts             # Utility functions
├── helpers.ts           # Helper functions (OTP generation, etc.)
├── mailer.ts            # Email configuration
└── supabase/
    ├── client.ts        # Browser Supabase client
    ├── server.ts        # Server Supabase client
    ├── middleware.ts    # Auth middleware
    └── migrations/      # SQL migrations
        ├── schemas/     # Table definitions
        ├── policies/    # RLS policies
        └── seeds/       # Seed data

components/
├── ui/                  # shadcn/ui components
├── kanban/              # Kanban feature
├── projects/            # Project management
├── members/             # Team members
├── calendar/            # Calendar views
├── meetings/            # Meeting management
└── emails/              # Email templates

services/
├── ticket.service.ts    # Ticket CRUD (uses handleSupabaseError)
├── project.service.ts   # Project CRUD
├── profile.service.ts   # Profile operations
├── login.service.ts     # Auth login (uses Result type)
├── register.service.ts  # Auth register (uses Result type)
└── mailer.service.ts    # Email sending (uses Result type)

stores/
├── ticket.store.ts      # Ticket TanStack Query hooks
├── project.store.ts     # Project hooks
└── profile.store.ts     # Profile hooks

types/
├── database.ts          # Supabase generated types
├── ticket.ts            # Ticket Zod schemas
└── project.ts           # Project Zod schemas

app/
├── (auth)/              # Auth routes (unprotected)
│   ├── login/
│   ├── register/
│   └── verify-otp/
└── (root)/              # Protected routes
    ├── projects/
    └── calendar/
```

---

## Database Migrations Structure

### Location: `lib/supabase/migrations/`

```
migrations/
├── schemas/             # Table definitions (run first)
│   ├── 00_extensions.sql
│   ├── 01_profiles.sql
│   ├── 02_roles.sql
│   ├── 03_projects.sql
│   ├── 04_project_members.sql  # Includes helper functions
│   ├── 05_ticket_states.sql
│   ├── 06_ticket_priorities.sql
│   ├── 07_tickets.sql
│   ├── 08_meetings.sql
│   ├── 09_meeting_attendees.sql
│   └── 10_storage.sql
├── policies/            # RLS policies (run after schemas)
│   ├── 01_profiles_policies.sql
│   ├── 02_roles_policies.sql
│   └── ...
├── seeds/               # Seed data (run last)
│   ├── 01_roles.sql     # Required: system roles
│   └── 02_demo_*.sql    # Optional: demo data
└── README.md            # Execution instructions
```

---

## Best Practices

1. **Centralized error handling**: Use `handleSupabaseError()` for DB operations, `Result` type for auth
2. **RLS for security**: Let database policies handle authorization, not application code
3. **Middleware for auth**: Route protection handled in middleware, not components
4. **Dual-purpose forms**: Same form for create/update with optional prop
5. **Conditional queries**: Use `enabled: !!id` for dependent queries
6. **Toast feedback**: Always notify user on success/error
7. **Loading states**: Use `isPending` to disable buttons during mutations
8. **Memoization**: Use `useMemo` for expensive derived state
9. **Type inference**: Use `z.infer<typeof schema>` for form types
10. **Auth checks**: Use `requireAuth()` instead of manual auth checks
11. **Role-based access**: Use `has_project_permission()` in RLS policies
