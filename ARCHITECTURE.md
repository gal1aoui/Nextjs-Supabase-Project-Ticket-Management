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
Component → Store Hook → Service → Supabase
```

1. **Services** (`/services`): Pure Supabase database operations
2. **Stores** (`/stores`): TanStack Query hooks for caching & mutations
3. **Components** (`/components`): Presentational UI consuming stores

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

```typescript
export const ticketService = {
  async getByProject(projectId: string): Promise<Ticket[]> {
    const { data, error } = await supabaseClient
      .from("tickets")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(ticket: TicketCreate): Promise<Ticket> {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabaseClient
      .from("tickets")
      .insert({ ...ticket, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
```

### Key Rules
- Always throw on error, return on success
- Use `.single()` for single-row queries
- Use `.select().single()` on mutations to return data
- Check auth with `supabaseClient.auth.getUser()` before writes
- Auto-set `created_by` and `updated_at` timestamps

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

## Component Structure

### Props Interface
```typescript
interface CreateTicketDialogProps {
  projectId: string;
  states: TicketState[];
  priorities: TicketPriority[];
}
```

### Component Pattern
```typescript
"use client";

export function CreateTicketDialog({ projectId, states, priorities }: CreateTicketDialogProps) {
  const { isOpen, toggleModal, closeModal } = useModalDialog();
  const createTicket = useCreateTicket();

  // Form state
  const [title, setTitle] = useState("");

  // Handler
  const handleSubmit = async (e: React.FormEvent) => { ... };

  return (
    <Dialog open={isOpen} onOpenChange={toggleModal}>
      ...
    </Dialog>
  );
}
```

---

## Error Handling

### Service Level
```typescript
if (error) throw error;
```

### Component Level
```typescript
try {
  await mutation.mutateAsync(data);
  toast.success("Success!");
} catch (_) {
  toast.error(`Failed: ${mutation.error?.message}`);
}
```

### Form Validation
```typescript
const parsed = schema.safeParse(form);
if (!parsed.success) {
  setError(z.treeifyError(parsed.error).properties?.fieldName?.errors[0]);
  return;
}
```

---

## Folder Structure

```
components/
├── ui/              # shadcn/ui components
├── kanban/          # Kanban feature
│   ├── kanban-board.tsx
│   ├── column.tsx
│   ├── ticket-card.tsx
│   └── create-ticket-dialog.tsx
├── projects/
│   ├── items/       # List items
│   ├── forms/       # Form components
│   └── project-detail/
└── members/
    ├── items/
    └── invite-member-dialog.tsx

services/
├── ticket.service.ts
├── project.service.ts
└── profile.service.ts

stores/
├── ticket.store.ts
├── project.store.ts
└── profile.store.ts

types/
├── database.ts      # Supabase generated
├── ticket.ts        # Zod schemas
└── project.ts
```

---

## Best Practices

1. **Dual-purpose forms**: Same form for create/update with optional prop
2. **Conditional queries**: Use `enabled: !!id` for dependent queries
3. **Toast feedback**: Always notify user on success/error
4. **Loading states**: Use `isPending` to disable buttons during mutations
5. **Memoization**: Use `useMemo` for expensive derived state
6. **Type inference**: Use `z.infer<typeof schema>` for form types
