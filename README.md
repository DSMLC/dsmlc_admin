# DSMLC Admin Portal

An internal analytics and management dashboard for the DSMLC (UCalgary) club. Built with Next.js App Router and Supabase, it gives club executives a single place to track events, memberships, registrations, and overall club performance with authenticated access, CSV exports, and live charts.

---

push

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Architecture Notes](#architecture-notes)
- [Authentication Flow](#authentication-flow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Styling & Design System](#styling--design-system)

---

## Overview

The admin portal is a **Next.js 16 (App Router)** application backed by **Supabase** (Postgres + Auth). It is scoped to a dedicated Postgres schema (`adminportal`) rather than `public`, so the whole app talks to Supabase through that schema on both the browser and server clients.

The app is split into two route groups:

- **`/` and `/auth/*`** — public landing/login page and the auth flows (forgot password, reset password, set password/onboarding), all rendered on a shared animated shader background.
- **`/dashboard/*`** — the authenticated app shell (sidebar + topbar + content) with four main sections: Overview, Events, Memberships, and People.

---

## Tech Stack

| Concern           | Library / Tool                                                                    |
| ----------------- | --------------------------------------------------------------------------------- |
| Framework         | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| Language          | TypeScript                                                                        |
| Auth & DB         | [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`)      |
| Styling           | Tailwind CSS v4 (`@theme` tokens in `globals.css`)                                |
| Animation         | Framer Motion                                                                     |
| Charts            | Recharts                                                                          |
| Shader background | `@paper-design/shaders-react`                                                     |
| Icons             | lucide-react                                                                      |
| Utilities         | `clsx` + `tailwind-merge` (via a `cn()` helper)                                   |

---

## Features

### Authentication

- Email/password sign-in against Supabase Auth, gated by an `ADMINS` table lookup (`is_active` must be true, otherwise the session is signed out immediately).
- **Forgot / reset password** flow using Supabase's `resetPasswordForEmail` + `updateUser`, including a dedicated `/auth/confirm` route that verifies the OTP token from the email link and redirects.
- **Invite-based onboarding** (`/auth/set-password`) for new admins to set their name and password in one step, calling a Postgres RPC (`complete_admin_profile`) to finish their profile.
- Password strength meter (client-side heuristic: length + case mix + digits + symbols).
- Route protection via `proxy.ts` (Next.js middleware) — any request to `/dashboard/*` without an authenticated Supabase session is redirected to `/`.

### Dashboard Overview (`/dashboard`)

- KPI stat cards: total events, total attendees, average turnout rate, average rating — each with an animated count-up and a mini trend sparkline.
- **Attendance Over Time** area chart.
- **RSVP vs. Actual Turnout** bar chart (RSVP / attended / at-door, per event).
- **Avg Rating by Category** breakdown bars.
- **Member Growth** area chart (cumulative membership signups over time).
- **Sign-up Source** breakdown (Mailman, Instagram, LinkedIn, Website, Word-of-Mouth, etc.).

### Events (`/dashboard/events`)

- Sortable/searchable/filterable table of all events with RSVP, at-door, attended counts, turnout rate, and average rating.
- "Events by Category" breakdown chart.
- **Create event** dialog (Server Action → `EVENTS` insert, redirects into the new event's detail page).
- **Event detail page** (`/dashboard/events/[eventId]`):
  - Turnout rate & average rating stat cards.
  - RSVP vs. actual turnout chart for that single event.
  - Feedback list (star rating + comment) with a scrollable panel.
  - **Course Collab Retention** chart — compares attendance rate between registrants tied to a course-credit collaboration vs. general attendees (only rendered when course-linked registrations exist).
  - Paginated, searchable, filterable registrations table with inline **add/edit registration** dialogs.
  - **Course credit CSV export** button, filterable by course name.
  - Copyable event ID chip for quick reference/debugging.

### Memberships (`/dashboard/memberships`)

- Full members table (joins `MEMBERSHIP` ↔ `PEOPLE`) with search, and filters by membership type and mailing-list status.
- **Add/edit member** dialogs — creation auto-matches an existing `PEOPLE` row by email or student ID before creating a new one, and sets membership expiry to the next September 4th.
- "Memberships by Major" breakdown chart.
- **Mailing list actions**: copy all subscribed emails to clipboard, or export them as CSV.

### People (`/dashboard/people`)

- Paginated, debounced-search directory of every person on record (members, event registrants, etc.), independent of membership status.

### Shared UI/UX

- Animated page transitions between dashboard routes (Framer Motion, `AnimatePresence`).
- Responsive sidebar (desktop) + slide-out mobile nav drawer with account footer (initials avatar, name/email, sign out).
- Reusable `DataTable` component: generic column config, built-in search box, pill-style filter chips, and cursor-based pagination controls — used by every table in the app (events, memberships, people, registrations).
- Reusable modal `FormDialogShell` (Framer Motion enter/exit, Escape-to-close, backdrop click-to-close) used by all create/edit forms.
- CSV export helper (`lib/csv.ts`) shared by mailing list and course-credit exports.

---

## Project Structure

```
admin_portal/
├── app/
│   ├── auth/                     # Public auth routes (forgot/reset/set password, OTP confirm)
│   ├── dashboard/                # Authenticated app (layout + overview/events/memberships/people)
│   ├── layout.tsx                # Root layout, fonts, metadata
│   └── page.tsx                  # Landing page (login card)
├── components/
│   ├── features/
│   │   ├── auth/                 # Login form, auth field, password strength, auth card
│   │   └── dashboard/
│   │       ├── forms/            # Create/edit dialogs (event, member, registration)
│   │       ├── graphs/           # Recharts wrappers (attendance, rsvp, growth, etc.)
│   │       ├── tables/           # Column configs for each entity's DataTable
│   │       └── *.tsx             # Shell, sidebar, mobile nav, header, mailing list, etc.
│   ├── motion/                   # AnimatedNumber, PageTransition
│   └── ui/                       # Design-system primitives: Button, DataTable, StatCard,
│                                  # SearchInput, Pagination, FormField, hero shader background
├── config/site.ts                # App name + sidebar nav config
├── lib/
│   ├── actions/                  # Server Actions (events, members, registrations)
│   ├── queries/                  # Server-side data-fetching functions (per entity)
│   ├── supabase/                 # Browser + server Supabase client factories
│   ├── csv.ts, date.ts, palette.ts, nav-icons.tsx, utils.ts
├── proxy.ts                      # Next.js middleware — protects /dashboard routes
├── types/                        # Shared TS types (auth, database rows)
└── public/                       # Logos
```

---

## Data Model

Types are declared in `types/database.ts`; all tables live under the Postgres schema **`adminportal`** (not `public`).

| Table           | Purpose                                       | Key columns                                                                                         |
| --------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ADMINS`        | Portal users (1:1 with Supabase `auth.users`) | `admin_id`, `first_name`, `last_name`, `email`, `role`, `is_active`                                 |
| `EVENTS`        | Club events                                   | `event_id`, `event_name`, `event_date`, `event_type`, `admin_id`                                    |
| `PEOPLE`        | Any person on record (member or not)          | `people_id`, `first_name`, `last_name`, `student_id`, `email`, `major`                              |
| `FEEDBACK`      | Post-event ratings/comments                   | `feedback_id`, `event_id`, `rating`, `comment`                                                      |
| `REGISTRATIONS` | Event sign-ups / attendance                   | `registration_id`, `event_id`, `people_id`, `status`, `course_name`, `coming_from`, `registered_at` |
| `MEMBERSHIP`    | Club membership records                       | `membership_id`, `people_id`, `membership_type`, `mailing`, `expires_at`, `created_at`              |

**Derived concepts worth knowing:**

- `status` on `REGISTRATIONS` is one of `registered`, `attended`, `at-door`. Turnout rate = `attended / rsvp` where `rsvp` excludes walk-ins (`at-door`); total "attended" for display purposes includes both `attended` and `at-door`.
- A registration with a non-null `course_name` is treated as a "course collab" sign-up, used both for the retention chart and the course-credit CSV export.
- Membership `expires_at` is automatically set to the **next upcoming September 4th** on creation (`getNextSeptemberFourth` in `lib/actions/members.ts`).
- Member/registration creation dedupes people by **email first, then student ID**, only inserting a new `PEOPLE` row if neither match is found.

---

## Architecture Notes

- **Server Components by default.** Every dashboard page (`app/dashboard/**/page.tsx`) is an async Server Component that calls query functions directly (`lib/queries/*`) — no client-side data fetching/loading spinners for initial page data.
- **Server Actions for mutations.** All creates/updates (`createEvent`, `createMember`, `updateMember`, `createRegistration`, `updateRegistration`) live in `lib/actions/*`, are marked `"use server"`, use `useActionState` on the client, and call `revalidatePath` on success so lists refresh without a full reload.
- **Two Supabase clients**, both scoped to the `adminportal` schema:
  - `lib/supabase/server.ts` — `createServerClient` wired to Next.js cookies, used in Server Components/Actions.
  - `lib/supabase/client.ts` — `createBrowserClient`, used in client components (login form, password reset, sign out, etc.).
- **Generic, composable UI:**
  - `DataTable<T>` takes a column config, optional search/filter/pagination config, and renders consistent tables everywhere — event, membership, people, and registration tables are just column definitions on top of it.
  - `FormDialogShell` centralizes modal behavior (animation, escape key, backdrop click) so every create/edit form only has to supply its fields.
- **CSV exports** are generated entirely client-side (`lib/csv.ts` builds a CSV string and triggers a Blob download) — no server round trip needed.
- **Chart theming** is centralized in `lib/palette.ts` (brand color, category/status color mapping, gradient helpers) so every Recharts component stays visually consistent.

---

## Authentication Flow

1. **Landing page (`/`)** renders `AuthCard` → `LoginForm`. On submit, it signs in via Supabase, then checks the `ADMINS` table for an `is_active` record matching the user ID; if missing/inactive it signs the user back out and shows an error.
2. **Middleware (`proxy.ts`)** runs on every request (excluding static assets), refreshes the Supabase session cookies, and redirects unauthenticated users away from `/dashboard/*`.
3. **Forgot password (`/auth/forgot-password`)** → Supabase sends a reset email pointing at `/auth/reset-password`.
4. **`/auth/confirm`** (route handler) verifies the emailed OTP (`token_hash` + `type`) and redirects into the app, or back to `/` with an `error=invalid_or_expired_link` query param.
5. **Reset password (`/auth/reset-password`)** checks for a valid session (from the confirm redirect) before allowing a new password to be set; shows an "invalid or expired" state otherwise.
6. **Set password (`/auth/set-password`)** is the onboarding flow for newly invited admins — collects first/last name and a password in one form, then calls the `complete_admin_profile` RPC to finish setting up the `ADMINS` row.

---

## Getting Started

```bash
# install dependencies
npm install

# run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

> **Note:** `next.config.ts` sets `allowedDevOrigins: ['10.0.0.103']` — update or remove this if you're not developing on that LAN address.

---

## Environment Variables

Create a `.env.local` file in `admin_portal/` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Both Supabase clients (browser and server) are configured to use the **`adminportal`** Postgres schema — make sure that schema exists in your Supabase project and is exposed via the API settings (Database → API → Exposed schemas).

---

## Scripts

| Command         | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| `npm run dev`   | Start the Next.js dev server                                         |
| `npm run build` | Production build                                                     |
| `npm run start` | Run the production build                                             |
| `npm run lint`  | Run ESLint (flat config, Next.js core-web-vitals + TypeScript rules) |

---

## Styling & Design System

- **Tailwind CSS v4**, configured via `@theme` in `app/globals.css` — the brand orange (`--color-brand: #ff5a2e`) and hover variant are the only custom theme tokens; everything else uses Tailwind's default scale plus arbitrary values for the dark palette (`#0a0a0a`, `#111111`, `#1e1e1e`, etc.).
- **Fonts:** Geist Sans/Mono + Instrument Serif (Google Fonts via `next/font`).
- **Motion:** Framer Motion drives page transitions, dialog enter/exit, sidebar active-pill morphing (`layoutId`), stat card sparklines, and animated numbers — all respecting `useReducedMotion()`.
- **Shader background:** `ShaderBackground` (wrapping `@paper-design/shaders-react`'s `MeshGradient`) powers the animated backdrop on the landing and auth pages.
