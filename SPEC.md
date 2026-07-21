# Hardwire — Full-Stack Specification

## Overview
Hardwire is a YSWS (You Ship, We Ship) program that guides teens (13–18) through the semiconductor pipeline. Participants progress through three tiers, shipping validated designs at each stage to earn hardware rewards.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 14+ (App Router) | Vercel-native, RSCs, Route Handlers, Server Actions |
| **Language** | TypeScript | Type safety across full stack |
| **Styling** | Tailwind CSS 4 | Utility-first, fast iteration |
| **UI Kit** | shadcn/ui + Radix | Accessible, composable primitives |
| **Database** | PostgreSQL via Neon | Serverless, Vercel-integrated |
| **ORM** | Prisma | Type-safe queries, migrations |
| **Auth** | Hack Club Auth (HCA) | OIDC provider at `https://auth.hackclub.com` |
| **File Uploads** | Uploadthing | Serverless, Vercel-friendly, file validation |
| **Analytics** | PostHog | Product analytics (privacy-compliant for teens) |
| **Package Manager** | pnpm | Workspace-native monorepo support |
| **Notifications** | Slack | Slack bot/webhook for admin notifications |

### Architecture

Hardwire is a single Next.js app, not a multi-service architecture:

- **Backend** = Next.js Route Handlers (`app/api/`) — no separate NestJS
- **Gateway** = Next.js rewrites (`next.config.js`) — no Express proxy
- **Admin** = Route group (`app/admin/`) — not a separate app
- **Shared types** = `packages/shared` — no OpenAPI codegen needed

Everything deploys as one Vercel project.

---

## Flow (no application step)

```
HCA Login → Onboarding (age, country, Discord) → Dashboard → Create Project → T1 → T2 → T3
```

No application/review gate. Authenticate, onboard, start building.

---

## Database Schema (Prisma)

### Core Entities

```
User
  id                UUID    PK
  email             String  unique
  firstName         String
  lastName          String
  avatarUrl         String?
  birthday          DateTime?
  country           String?
  address           Json?         // shipping address (encrypted at rest)
  discordHandle     String?
  githubId          String?       // GitHub username
  hcaId             String  unique  // HCA subject ID
  slackUserId       String?
  roles             Role[]    default: [USER]
  onboardComplete   Boolean   default: false
  banned            Boolean   default: false
  createdAt         DateTime
  updatedAt         DateTime

UserSession
  id                UUID    PK
  userId            UUID    FK -> User
  expiresAt         DateTime  (21 days from creation)
  createdAt         DateTime

Project
  id                UUID    PK
  userId            UUID    FK -> User
  name              String
  description       String?
  repoUrl           String?
  currentTier       Tier    default: T1        // highest unlocked tier
  createdAt         DateTime
  updatedAt         DateTime

TierProgress
  id                UUID    PK
  userId            UUID    FK -> User
  projectId         UUID    FK -> Project
  tier              Tier    (T1, T2, T3)
  status            TierStatus  default: LOCKED
  startedAt         DateTime?
  completedAt       DateTime?
  createdAt         DateTime
  updatedAt         DateTime

  @@unique([projectId, tier])

Submission
  id                UUID    PK
  userId            UUID    FK -> User
  projectId         UUID    FK -> Project
  tier              Tier
  type              SubmissionType  (DESIGN, SIMULATION, GDS, PCB)
  title             String
  description       Text?
  files             Json          // Uploadthing URLs [{ name, url, size }]
  commitUrl         String?
  status            SubStatus  default: PENDING_REVIEW
  reviewerNotes     Text?
  reviewedBy        UUID?   FK -> User
  reviewedAt        DateTime?
  createdAt         DateTime
  updatedAt         DateTime

Shipment
  id                UUID    PK
  userId            UUID    FK -> User
  projectId         UUID?   FK -> Project
  tier              Tier
  submissionId      UUID?   FK -> Submission
  trackingUrl       String?
  carrier           String?       // USPS, DHL, FedEx, etc
  status            ShipStatus  default: PREPARING
  shippedAt         DateTime?
  deliveredAt       DateTime?
  createdAt         DateTime
  updatedAt         DateTime
```

### Enums

```prisma
enum Role {
  USER
  ADMIN
  REVIEWER
  SUPERADMIN
}

enum Tier {
  T1
  T2
  T3
}

enum TierStatus {
  LOCKED
  ACTIVE
  COMPLETED
}

enum SubmissionType {
  DESIGN
  SIMULATION
  GDS
  PCB
}

enum SubStatus {
  PENDING_REVIEW
  CHANGES_REQUESTED
  APPROVED
}

enum ShipStatus {
  PREPARING
  SHIPPED
  DELIVERED
}
```

---

## HCA Auth Flow

Implemented in Next.js Route Handlers at `app/api/auth/`.

### Flow

```
User clicks "Sign in"
  -> GET /api/auth/login
    -> Server generates HMAC-SHA256 state token (10-min TTL)
    -> Returns { url: "https://auth.hackclub.com/oauth/authorize?..." }

User authenticates on HCA
  -> HCA redirects to /api/auth/callback?code=...&state=...

Callback handler
  -> Verifies state (HMAC signature + TTL check)
  -> POST https://auth.hackclub.com/oauth/token { code, client_id, client_secret }
  -> GET https://auth.hackclub.com/oauth/userinfo (with access_token)
  -> findOrCreateUser in Prisma (match by hcaId first, then email)
  -> check age 13-18, check banned status
  -> Create UserSession (21-day expiry)
  -> Set httpOnly sessionId cookie
  -> Redirect to /dashboard (or /onboarding if first time)
```

### API Routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/auth/login` | Public | Returns HCA authorize URL; accepts `?redirect=` |
| GET | `/api/auth/callback` | Public | OAuth callback — exchanges code, sets session, redirects |
| GET | `/api/auth/me` | Auth | Returns current user (with active project) |
| POST | `/api/auth/logout` | Auth | Clears session from DB + cookie |
| GET | `/api/auth/onboarding-status` | Auth | Returns `{ onboardComplete, needsBirthday }` |
| POST | `/api/auth/complete-onboarding` | Auth | Marks `onboardComplete = true` |

### Scopes Requested

```
openid email name profile birthdate address verification_status
```

### Session Cookie

- **Name**: `sessionId`
- **Flags**: `httpOnly: true`, `secure: true` (prod), `sameSite: lax`
- **MaxAge**: 21 days (matches `UserSession.expiresAt`)

### Auth Guard Pattern

```typescript
// lib/auth/get-auth-user.ts
export async function getAuthUser(): Promise<User> {
  const sessionId = cookies().get('sessionId')?.value
  if (!sessionId) throw new UnauthorizedError()

  const session = await prisma.userSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })
  if (!session || session.expiresAt < new Date()) {
    throw new UnauthorizedError()
  }
  return session.user
}

// lib/auth/require-admin.ts
export async function requireAdmin(): Promise<User> {
  const user = await getAuthUser()
  if (!hasRole(user.roles, Role.ADMIN, Role.SUPERADMIN)) {
    throw new ForbiddenError()
  }
  return user
}
```

### Role System

```typescript
enum Role { USER, ADMIN, REVIEWER, SUPERADMIN }

function hasRole(roles: Role[], ...wanted: Role[]): boolean {
  return roles.includes(Role.SUPERADMIN) || wanted.some(r => roles.includes(r))
}

function isElevated(roles: Role[]): boolean {
  return roles.some(r => r !== Role.USER)
}
```

---

## Page Tree

### Public Routes
```
/                          Landing page — tiers, hero, CTA
/resources                 Learning resources, toolchain docs
/gallery                   Showcase of completed chips/PCBs
```

### Authenticated Routes (requires valid session)
```
/dashboard                 User hub — project, current tier, next steps
/dashboard/new             Create a new project
/dashboard/project/[id]    Project detail — tier progress, submissions
/dashboard/project/[id]/tier/[tier]  Tier detail — requirements, submit work
/dashboard/settings        Profile, shipping address, Discord
/onboarding                First-time setup (age, country, Discord)
```

### Admin Routes (requires ADMIN/SUPERADMIN role)
```
/admin                     Overview — stats, pending reviews
/admin/submissions         Review submissions per tier
/admin/shipments           Manage shipping (mark shipped, add tracking)
/admin/users               User management (roles, bans)
```

---

## API Route Structure

```
src/app/api/
├── auth/
│   ├── login/route.ts              GET  — return HCA authorize URL
│   ├── callback/route.ts           GET  — OAuth callback
│   ├── me/route.ts                 GET  — current user + project
│   ├── logout/route.ts             POST — destroy session
│   ├── onboarding-status/route.ts  GET
│   └── complete-onboarding/route.ts POST
├── projects/
│   ├── route.ts                    GET/POST — list/create projects
│   └── [id]/
│       ├── route.ts                GET/PATCH — project detail
│       └── submissions/route.ts    GET — submissions for this project
├── tiers/
│   └── [tier]/
│       ├── route.ts                GET — tier info + user's progress
│       └── submit/route.ts         POST — create submission for this tier
├── submissions/
│   └── [id]/
│       ├── route.ts                GET/PATCH — submission detail
│       └── review/route.ts         POST — approve/request-changes (admin)
└── shipments/
    ├── route.ts                    GET — user's shipments
    └── [id]/route.ts               PATCH — update tracking (admin)
```

---

## Key Implementation Patterns

### 1. Middleware (Edge)

```
src/middleware.ts
  - Matches: /dashboard/*, /admin/*, /onboarding
  - Checks for sessionId cookie presence
  - If missing: redirect to /
  - Passes sessionId via header to Route Handlers
```

### 2. PII Scoping (Horizons-inspired)

```typescript
const SCOPED_USER_SELECT = {
  id: true, firstName: true, lastName: true,
  avatarUrl: true, slackUserId: true,
  // NO email, birthday, address
}

const ADMIN_USER_SELECT = {
  ...SCOPED_USER_SELECT,
  email: true, birthday: true, address: true,
  roles: true, banned: true,
}
```

### 3. Uploadthing File Handling

```typescript
export const submissionFileRouter = {
  t1Design: { image: { maxFileSize: '16MB' } },
  t1Simulation: { image: { maxFileSize: '16MB' } },
  t2Gds: { image: { maxFileSize: '64MB' } },
  t3Pcb: { image: { maxFileSize: '32MB' } },
}
```

### 4. Slack Notifications (replaces email)

```typescript
// lib/slack/notify.ts
export async function notifyNewSubmission(submission: Submission) {
  // POST to Slack webhook with submission details + review link
}

export async function notifySubmissionReviewed(submission: Submission) {
  // DM user on Slack (if slackUserId exists) with result
}

export async function notifyShipmentUpdate(shipment: Shipment) {
  // Post to #hardwire-shipping channel
}
```

Notification events: new submission, submission reviewed, shipment dispatched.

---

## Project Structure

```
hardwire/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (public)/
│       │   │   │   ├── page.tsx           # Landing
│       │   │   │   ├── resources/
│       │   │   │   └── gallery/
│       │   │   ├── (auth)/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── onboarding/
│       │   │   │   └── ...
│       │   │   ├── (admin)/
│       │   │   │   ├── admin/
│       │   │   │   └── ...
│       │   │   └── api/
│       │   ├── components/
│       │   ├── lib/
│       │   │   ├── auth/           # getAuthUser, requireAdmin, hasRole
│       │   │   ├── db/             # Prisma client singleton
│       │   │   ├── hca/            # HCA OAuth helpers
│       │   │   ├── slack/          # Slack notification helpers
│       │   │   └── upload/         # Uploadthing config
│       │   ├── styles/
│       │   └── middleware.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types/              # Tier types, status enums
│       │   ├── constants/          # Tier configs, reward mappings
│       │   └── index.ts
│       └── package.json
├── pnpm-workspace.yaml
├── SPEC.md
└── README.md
```

---

## Deployment (Vercel)

- **Framework**: Next.js (auto-detected)
- **Database**: Neon Postgres (`DATABASE_URL`)
- **File Uploads**: Uploadthing (`UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`)
- **Auth**: HCA (`HACKCLUB_CLIENT_ID`, `HACKCLUB_CLIENT_SECRET`, `HACKCLUB_REDIRECT_URI`, `STATE_SECRET`)
- **Build**: `pnpm build` from root, output in `apps/web/.next`
- **Root Directory**: `apps/web`

### Environment Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Neon | Postgres connection |
| `HACKCLUB_CLIENT_ID` | HCA | OAuth client ID |
| `HACKCLUB_CLIENT_SECRET` | HCA | OAuth client secret |
| `HACKCLUB_REDIRECT_URI` | HCA | Callback URL |
| `STATE_SECRET` | Generate | HMAC key for OAuth state tokens |
| `UPLOADTHING_SECRET` | Uploadthing | File uploads |
| `UPLOADTHING_APP_ID` | Uploadthing | File uploads |
| `SLACK_WEBHOOK_URL` | Slack | Admin notifications |

---

## Implementation Plan

### Phase 1: Foundation
- [ ] Scaffold Next.js app + shadcn/ui + Tailwind
- [ ] Prisma schema + migrations
- [ ] HCA auth flow (login, callback, session, me)
- [ ] Auth middleware + getAuthUser + requireAdmin
- [ ] Landing page (hero, tiers, sign-in CTA)
- [ ] Onboarding flow (age, country, Discord)

### Phase 2: Projects & Tiers
- [ ] `/dashboard` — create project, view tier progress
- [ ] `/dashboard/project/[id]` — project hub
- [ ] T1 tier page — requirements, resources, submission form
- [ ] Uploadthing integration for file uploads
- [ ] Submission create + status tracking

### Phase 3: Admin
- [ ] Admin dashboard with stats
- [ ] Submission review queue (approve/request-changes)
- [ ] Shipment management (tracking, carrier)
- [ ] User management (roles, bans)

### Phase 4: Polish
- [ ] Slack notifications for new submissions + reviews
- [ ] Gallery page (showcase approved projects)
- [ ] Resources/documentation pages
- [ ] Analytics (PostHog)
