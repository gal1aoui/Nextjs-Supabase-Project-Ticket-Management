# Next.js Supabase Project&Ticket Management System

A modern, full-featured project and ticket management system built with Next.js 15, Supabase, TanStack Query, and Pragmatic Drag-and-Drop. Create projects, manage ticket states and priorities, and organize work with an intuitive Kanban board interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.9-red?style=flat-square&logo=react-query)](https://tanstack.com/query)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🎨 **Project Management**
- ✅ Create, update, and delete projects with custom colors
- ✅ View all projects with ticket counts and metadata
- ✅ Project-specific settings and configuration
- ✅ Beautiful project cards with visual indicators

### 📊 **Kanban Board**
- ✅ Drag-and-drop tickets between states with visual indicators
- ✅ Real-time UI updates with optimistic rendering
- ✅ Custom drag preview with smooth animations
- ✅ Column highlighting and drop indicators
- ✅ Empty state handling

### 🎫 **Ticket Management**
- ✅ Create, read, update, and delete tickets
- ✅ Rich ticket details with descriptions
- ✅ Priority and state assignment
- ✅ User assignment tracking
- ✅ Ticket statistics and analytics

### ⚙️ **Customizable States & Priorities**
- ✅ Create custom ticket states per project (To Do, In Progress, Done, etc.)
- ✅ Create custom priorities with color coding
- ✅ Drag-and-drop ordering
- ✅ Edit and delete states/priorities
- ✅ Visual color pickers

### 🔐 **Authentication & Security**
- ✅ Supabase authentication integration
- ✅ Row-level security (RLS) policies
- ✅ User-specific data isolation
- ✅ Protected routes and API calls

### 🎯 **Developer Experience**
- ✅ Full TypeScript support with strict typing
- ✅ Zod validation for all forms and data
- ✅ Clean architecture with service layer
- ✅ TanStack Query for state management
- ✅ Automatic cache invalidation
- ✅ Beautiful UI with shadcn/ui components

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm
- Supabase account and project
- Resend account for email delivery
- Docker Desktop (optional, for containerization)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/gal1aoui/Nextjs-Supabase-Project-Ticket-Management.git
cd Nextjs-Supabase-Project-Ticket-Management
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Rename `.env.example.local` to `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publish_key
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=onboarding@resend.dev
```

Get these values from your [Supabase Project Settings](https://app.supabase.com) → API.

4. **Set up the database**

Run the migrations in your Supabase SQL Editor:

```sql
-- Run migrations in order:
-- 1. lib/supabase/migrations/initial_schema.sql
-- 2. lib/supabase/migrations/seed_data.sql (optional - for demo data)
```

5. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
.
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # Root layout
│   ├── not-found.tsx                # Not found page
│   ├── (auth)/                      # Authentication pages
│   ├── (root)/                      # Dashboard pages
│   │   └── projects/                # Projects pages
│   │      ├── page.tsx              # Projects list
│   │      └── [projectId]/          # Project detail
│   │          └── page.tsx          # Kanban board & settings
│   ├── routes.ts       # App routes
│   └── ...
├── components/                      # React components
│   ├── ui/                          # Shadcn UI components
│   ├── emails/                      # Mailing components
│   ├── Logo.tsx/                    # App logo component
│   ├── projects/                    # Project components
│   │   ├── project-card.tsx
│   │   ├── create-project-dialog.tsx
│   │   └── edit-project-dialog.tsx
│   ├── project-detail/              # Project detail components
│   │   ├── project-stats.tsx
│   │   └── state-priority-manager.tsx
│   ├── kanban/                      # Kanban board components
│   │   ├── kanban-board.tsx
│   │   ├── column.tsx
│   │   ├── ticket-card.tsx
│   │   ├── drop-indicator.tsx
│   │   ├── create-ticket-dialog.tsx
│   │   ├── edit-ticket-dialog.tsx
│   │   └── ticket-detail-dialog.tsx
│   └── ...
├── lib/                              # Utility functions
│   ├── supabase/                     # Supabase setup
│   │   └── migrations/               # Database migrations
│   │       ├── 001_initial_schema.sql
│   │       └── 002_seed_data.sql
│   └── ...
├── hooks/                            # Custom React hooks
│   └── use-user.ts
├── services/                         # API service layer
│   ├── project.service.ts
│   ├── ticket.service.ts
│   ├── ticket-state.service.ts
│   └── ticket-priority.service.ts
├── stores/                           # TanStack Query hooks
│   ├── project.store.ts
│   ├── ticket.store.ts
│   ├── ticket-state.store.ts
│   └── ticket-priority.store.ts
├── types/              # TypeScript type definitions and validation
│   ├── project.ts
│   ├── ticket.ts
│   ├── ticket-state.ts
│   ├── ticket-priority.ts
│   └── database.ts
└── public/             # Static assets
```

## 📦 Tech Stack

### Core
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service (PostgreSQL)

### State Management
- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **React Context** - Client state management

### UI & Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Lucide Icons](https://lucide.dev/)** - Icon library

### Drag and Drop
- **[@atlaskit/pragmatic-drag-and-drop](https://atlassian.design/components/pragmatic-drag-and-drop)** - Performant drag-and-drop

### Validation & Forms
- **[Zod](https://zod.dev/)** - Schema validation
- **React Hook Form** - Form handling

### Notifications
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### Code Quality
- **[Biome.js](https://biomejs.dev/)** - Fast linter and formatter

### Containerization:
- ** [Docker](https://www.docker.com/)

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm run check        # Run Biome checks (lint + format check)

# Docker (optional)
# Build
docker build -t image-name:latest .
# Run
docker run -p 3000:3000 --env-file .env.local image-name:latest
```

# Database
# Run migrations in Supabase SQL Editor

## 🗃️ Database Schema

### Tables

**projects**
- id (uuid, primary key)
- name (text)
- description (text, nullable)
- color (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
- created_by (uuid, foreign key to auth.users)

**ticket_states**
- id (uuid, primary key)
- name (text)
- project_id (uuid, foreign key)
- order (integer)
- color (text, nullable)
- created_at (timestamp)

**ticket_priorities**
- id (uuid, primary key)
- name (text)
- project_id (uuid, foreign key)
- order (integer)
- color (text, nullable)
- created_at (timestamp)

**tickets**
- id (uuid, primary key)
- title (text)
- description (text, nullable)
- project_id (uuid, foreign key)
- state_id (uuid, foreign key)
- assigned_to (uuid, foreign key to auth.users)
- priority_id (uuid, foreign key, nullable)
- created_at (timestamp)
- updated_at (timestamp)
- created_by (uuid, foreign key to auth.users)

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data.

## 🎨 Features in Detail

### Drag and Drop System

The application uses **Pragmatic Drag-and-Drop** for a smooth, performant drag-and-drop experience:

- **Visual Indicators**: Blue line showing exact drop position
- **Custom Preview**: Rotated card preview following cursor
- **Column Highlighting**: Visual feedback when dragging over columns
- **Optimistic Updates**: Instant UI updates with automatic rollback on error
- **Smart Detection**: Automatically detects top/bottom edge for precise placement

### State Management Architecture

```typescript
// Service Layer - API calls
projectService.getAll() → Supabase query

// Store Layer - TanStack Query hooks
useProjects() → React hook with caching

// Component Layer - UI rendering
<ProjectCard /> → Displays data
```

**Benefits:**
- Automatic caching and background refetching
- Optimistic updates
- Request deduplication
- Automatic error handling
- Cache invalidation

### Form Validation

All forms use Zod schemas for type-safe validation:

```typescript
const ticketCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  project_id: z.string().uuid(),
  state_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
  priority_id: z.string().uuid().optional(),
})
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Docker

```bash
# Build
docker build -t ticket-management:latest .

# Run
docker run -p 3000:3000 --env-file .env.local ticket-management:latest
```

### Other Platforms

Compatible with:
- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)

## 🎯 Roadmap

- [ ] Real-time collaboration with Supabase Realtime
- [ ] Ticket comments and activity history
- [ ] File attachments
- [ ] Time tracking
- [ ] Advanced filtering and search
- [ ] Sprint/milestone management
- [ ] Email notifications
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] API documentation
- [ ] Webhook integrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Achref Gallaoui**

- GitHub: [@gal1aoui](https://github.com/gal1aoui)
- LinkedIn: [Achref Gallaoui](https://www.linkedin.com/in/gal1aoui)

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/) for the amazing framework
- [Supabase Team](https://supabase.com/) for the excellent BaaS platform
- [shadcn](https://ui.shadcn.com/) for the beautiful UI components
- [TanStack](https://tanstack.com/) for the powerful state management library
- [Atlassian](https://atlassian.design/) for Pragmatic Drag-and-Drop

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ using Next.js, Supabase, and TanStack Query
