# 🏟️ UniArena

> **UniArena** is a university platform built to streamline club, society & sports registration, simplify communication, and centralise access to events, ticketing, fixtures, media & announcements — all under one roof.

![Status](https://img.shields.io/badge/status-active%20development-yellow)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Node](https://img.shields.io/badge/node-20%2B-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

---

## 📌 Table of Contents

- [About](#-about)
- [Features & Services](#-features--services)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [University System Integration](#-university-system-integration)
- [Work Plan](#-work-plan)
- [Resources Required](#-resources-required)
- [Branch Strategy](#-branch-strategy)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About

UniArena is a full-stack web platform designed specifically for universities to manage and unify all student extracurricular activity. It brings together clubs, societies, and sports teams under one digital roof — giving students easy access to register, participate, communicate, and engage, while giving administrators powerful tools to manage everything efficiently.

The platform integrates with existing university systems (SSO, student records, email) so students and staff can log in with their university credentials without creating a new account.

---

## 🚀 Features & Services

### 🔐 Authentication & Access Control
- University SSO login via OAuth2 / SAML (Microsoft Entra, Google Workspace, Okta)
- Role-based access control (RBAC) — different views and permissions per role
- Multi-factor authentication (MFA) for admin and club leader accounts
- Auto-profile population from university student records (name, ID, faculty, year)
- Session management with automatic timeout and secure logout
- Account auto-deactivation tied to enrollment status

---

### 🏛️ Clubs & Societies
- Full searchable directory of all clubs and societies
- Filter by category: cultural, academic, arts, religious, sports, political, and more
- Individual club profile pages with description, banner, news feed, events, and member count
- Membership registration — free or tiered memberships
- Committee role management (President, Secretary, Treasurer, etc.)
- Club documents section: constitution, meeting minutes, policies
- Club creation request workflow with admin approval
- Annual club health tracking and activity reports
- Faculty advisor / lecturer assignment per club

---

### ⚽ Sports Teams & Fixtures
- Directory of all university sports teams
- Individual team profile pages with squad list, fixtures, results, and standings
- Fixture management — create matches with date, time, venue, and opposition
- Match result posting and season standings
- Season statistics per player and per team
- Training schedule with location and time
- Squad management — add/remove players, assign positions
- Injury and availability tracker
- Inter-university competition registration

---

### 📅 Events & Ticketing
- University-wide events calendar (monthly, weekly, and list views)
- Event detail pages — description, date, time, venue, capacity, organiser, and ticket price
- Ticket types: standard, early bird, group, and free
- Online ticket purchase powered by Stripe
- QR code ticket generation delivered via email
- QR code check-in scanner (mobile-friendly, for event staff)
- Waitlist system for sold-out events
- Add to Google Calendar / Outlook Calendar
- Event cancellation with automated refund processing
- Attendee list export (CSV)

---

### 📰 News & Announcements
- Platform-wide news feed with filtering by club, sport, or university-wide
- Rich text article editor (images, videos, embedded content)
- Tagging and categorisation of articles
- Featured and pinned articles
- Comment section with moderation
- Share to social media
- Email newsletter and push notifications for followers
- University-wide emergency announcements (admin only, top-of-page banner)
- Full archive of past news

---

### 🖼️ Media Galleries
- Photo and video galleries per club and sport team
- Album creation by event or season
- Auto-compression and optimisation on upload
- Student tagging in photos with consent controls
- Download permissions: public or members-only
- YouTube / Vimeo embed or direct video upload
- Moderation queue — all uploads reviewed before publishing
- Report inappropriate media

---

### 💬 Communication & Notifications
- In-app notification centre — event reminders, approvals, match results, announcements
- Email notifications — transactional and newsletter
- Push notifications (PWA-based)
- Admin broadcast messages — send to all users, specific clubs, or sports members
- Direct messaging — students can message club leaders
- Members-only discussion boards per club
- Automated email reminders 24 hours before events

---

### 📊 Admin Dashboard & Analytics
- Platform-wide overview: total users, active clubs, upcoming events
- Full user management — search, view, suspend, and assign roles
- Approval queues — clubs, events, content, and media
- Content moderation queue with approve/reject actions
- Engagement analytics — most active clubs, popular events, top sports teams
- Audit logs — full record of who changed what and when
- System health monitoring
- Exportable reports (CSV / PDF)

---

## 👥 User Roles

| Role | Access Level |
|---|---|
| **Student** | Browse, join clubs, buy tickets, RSVP events, view content |
| **Club Leader** | Manage club page, events, members, news |
| **Sports Captain** | Manage team, fixtures, results, squad, training schedule |
| **Lecturer / Staff** | Club advisor, content moderation, view-only analytics |
| **Moderator** | Review and approve content, media, and posts |
| **Super Admin** | Full platform control — all features, all data, all users |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache** | Redis |
| **Authentication** | NextAuth.js + SSO (OAuth2 / SAML) |
| **Payments** | Stripe |
| **File Storage** | AWS S3 / Cloudflare R2 |
| **Email** | SendGrid |
| **Search** | MeiliSearch |
| **Push Notifications** | Web Push API (PWA) |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Railway / AWS EC2 |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
uniarena/
├── frontend/                   # Next.js 14 App Router
│   └── src/
│       ├── app/                # Pages and routes
│       │   ├── auth/           # Login, SSO callback
│       │   ├── dashboard/      # Student dashboard
│       │   ├── clubs/          # Club directory and profiles
│       │   ├── sports/         # Sports teams and fixtures
│       │   ├── events/         # Events calendar and ticketing
│       │   ├── news/           # News and announcements
│       │   ├── gallery/        # Media galleries
│       │   └── admin/          # Admin dashboard
│       ├── components/         # Reusable UI components
│       ├── lib/                # Utility functions and API clients
│       ├── hooks/              # Custom React hooks
│       ├── store/              # Global state management
│       └── types/              # TypeScript type definitions
│
├── backend/                    # Node.js + Express API
│   └── src/
│       ├── controllers/        # Route handlers
│       ├── routes/             # API route definitions
│       ├── models/             # Database models
│       ├── middleware/         # Auth, validation, error handling
│       ├── services/           # Business logic (email, storage, SSO)
│       ├── config/             # App configuration
│       └── types/              # TypeScript types
│   └── prisma/
│       └── schema.prisma       # Database schema
│
├── docs/                       # Documentation
│   ├── api/                    # API reference
│   ├── architecture/           # System design and diagrams
│   └── deployment/             # Deployment guides
│
└── .github/                    # GitHub configuration
    ├── workflows/              # CI/CD GitHub Actions
    └── ISSUE_TEMPLATE/         # Bug and feature request templates
```

---

## ⚡ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v20 or higher
- [PostgreSQL](https://www.postgresql.org/) v15 or higher
- [Redis](https://redis.io/) v7 or higher
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Git](https://git-scm.com/)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/uniarena.git
cd uniarena
```

### Step 2 — Install Frontend Dependencies

```bash
cd frontend
pnpm install
```

### Step 3 — Install Backend Dependencies

```bash
cd ../backend
pnpm install
```

### Step 4 — Set Up Environment Variables

```bash
cd ../backend && cp .env.example .env
cd ../frontend && cp .env.example .env.local
```

Fill in your values in each `.env` file. See the [Environment Variables](#-environment-variables) section below.

### Step 5 — Set Up the Database

```bash
cd ../backend
pnpm prisma migrate dev
pnpm prisma db seed
```

### Step 6 — Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend && pnpm dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && pnpm dev
# Runs on http://localhost:3000
```

### Step 7 — Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/uniarena
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your_secret_here
SSO_CLIENT_ID=your_sso_client_id
SSO_CLIENT_SECRET=your_sso_client_secret
SSO_ISSUER_URL=https://your-university-sso.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STORAGE_BUCKET_NAME=uniarena-media
STORAGE_ACCESS_KEY=your_access_key
STORAGE_SECRET_KEY=your_secret_key
STORAGE_REGION=us-east-1
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@uniarena.ac
PORT=5000
NODE_ENV=development
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

---

## 🔗 University System Integration

| System | Integration |
|---|---|
| **SSO / Identity** | Microsoft Entra ID, Google Workspace, or Okta via OAuth2/SAML |
| **Student Records** | Auto-verify enrollment, sync name, faculty, and year of study |
| **Email System** | Send notifications via university email domain |
| **Timetabling** | Check room/facility availability when booking event venues |
| **University Portal** | Embeddable widget or direct link from intranet/portal |

---

## 🗓️ Work Plan

The project is divided into **5 phases over approximately 6 months**. This assumes a small team of 2–3 developers working full-time. A part-time team should expect 8–10 months.

---

### Phase 1 — Planning & Design
**Duration: 2 weeks (Weeks 1–2)**

| Task | Duration |
|---|---|
| Finalise requirements and feature scope | 2 days |
| Design database schema for all modules | 2 days |
| Design system architecture and API structure | 1 day |
| UI/UX wireframes for all key pages | 3 days |
| Set up GitHub repo, branches, and CI/CD pipeline | 1 day |
| Set up development environments and tooling | 1 day |

✅ **Milestone:** Architecture approved, repo live, wireframes signed off.

---

### Phase 2 — Core Foundation
**Duration: 3 weeks (Weeks 3–5)**

| Task | Duration |
|---|---|
| Project scaffold — frontend and backend | 2 days |
| Database setup with Prisma schema and migrations | 2 days |
| SSO integration, RBAC, and session management | 1 week |
| User profiles auto-populated from university records | 2 days |
| Base UI layout — navigation, sidebar, responsive shell | 3 days |
| Admin dashboard — user management and approval queues | 4 days |

✅ **Milestone:** Users can log in via SSO, roles are assigned, admin dashboard is functional.

---

### Phase 3 — Clubs, Societies & Sports
**Duration: 4 weeks (Weeks 6–9)**

| Task | Duration |
|---|---|
| Club directory — listing, search, and filter | 4 days |
| Club profile pages and management dashboard | 4 days |
| Membership registration and management | 3 days |
| Sports team directory and profile pages | 2 days |
| Fixture management — create, edit, post results | 4 days |
| Squad management, training schedules, statistics | 3 days |

✅ **Milestone:** Students can browse and join clubs; sports fixtures are live.

---

### Phase 4 — Events, News, Galleries & Communication
**Duration: 5 weeks (Weeks 10–14)**

| Task | Duration |
|---|---|
| Events calendar — monthly, weekly, and list views | 4 days |
| Event creation, management, and ticketing (Stripe + QR) | 1 week |
| QR check-in scanner (mobile-friendly) | 2 days |
| News module — article editor, feed, tagging | 4 days |
| Announcements — university-wide and per-club | 2 days |
| Media gallery — upload, albums, moderation queue | 4 days |
| In-app, email, and push notifications | 4 days |
| Direct messaging and discussion boards | 4 days |

✅ **Milestone:** Full event lifecycle works end-to-end; news, galleries, and notifications are live.

---

### Phase 5 — Testing, Polish & Launch
**Duration: 4 weeks (Weeks 15–18)**

| Task | Duration |
|---|---|
| Unit and integration testing across all modules | 1 week |
| End-to-end testing with real user scenarios | 4 days |
| Performance optimisation — caching, image compression, query tuning | 3 days |
| Security audit — OWASP checks, input validation, penetration testing | 3 days |
| Accessibility audit (WCAG 2.1 AA) | 2 days |
| Bug fixes and UI polish | 4 days |
| Staging deployment and UAT with real students and staff | 3 days |
| Production deployment and go-live | 1 day |
| Post-launch monitoring and hotfix period | Ongoing |

✅ **Milestone:** Platform live in production, stable, and monitored.

---

### 📅 Summary Timeline

```
Month 1        Month 2        Month 3        Month 4        Month 5–6
|______________|______________|______________|______________|______________|
  Planning &      Core           Clubs,        Events,        Testing &
  Design          Foundation     Societies      News,          Launch
                                 & Sports       Galleries &
                                                Communication
```

---

## 🧰 Resources Required

### 👨‍💻 Team

| Role | Responsibility | Count |
|---|---|---|
| **Full-Stack Developer** | Frontend + backend features, API, database | 2 |
| **Frontend Developer** | UI components, responsive design, accessibility | 1 |
| **UI/UX Designer** | Wireframes, design system, user flows | 1 |
| **DevOps / Cloud Engineer** | Hosting, CI/CD, monitoring, security | 1 *(part-time)* |
| **QA Tester** | Manual and automated testing, bug reporting | 1 *(Phase 5 only)* |
| **Project Manager** | Planning, coordination, stakeholder updates | 1 *(part-time)* |

> A lean setup of 2 full-stack developers + 1 designer can still deliver this, with a slightly extended timeline.

---

### 🖥️ Software & Services

| Tool / Service | Purpose | Estimated Cost |
|---|---|---|
| **Vercel** | Frontend hosting | Free – $20/month |
| **Railway / AWS EC2** | Backend hosting | $10 – $50/month |
| **Supabase / Neon** | Hosted PostgreSQL database | Free – $25/month |
| **Upstash Redis** | Caching and session management | Free – $10/month |
| **Cloudflare R2 / AWS S3** | Media and file storage | $5 – $20/month |
| **SendGrid** | Transactional and newsletter email | Free – $20/month |
| **Stripe** | Event ticketing payments | 1.4% + 20p per transaction |
| **MeiliSearch (hosted)** | Platform search functionality | Free – $30/month |
| **GitHub** | Version control, CI/CD, issue tracking | Free |
| **Figma** | UI/UX design and wireframes | Free – $15/month |
| **Sentry** | Error and performance monitoring | Free – $26/month |

**Estimated monthly running cost: ~$50 – $200/month** depending on traffic and chosen service tiers.

---

### 🧑‍💻 Skills Required

| Skill | Required For |
|---|---|
| React / Next.js 14 | All frontend development |
| Node.js + Express + TypeScript | Backend API development |
| PostgreSQL + Prisma ORM | Database design and queries |
| REST API design | All backend routes and services |
| OAuth2 / SAML / SSO | University authentication integration |
| Stripe API | Event ticketing and payments |
| AWS S3 or Cloudflare R2 | Media and file storage |
| Redis | Caching and session management |
| Git + GitHub Actions | Version control and CI/CD pipelines |
| Tailwind CSS + shadcn/ui | UI design and component system |
| WCAG 2.1 Accessibility | Accessibility compliance |
| Jest / Playwright | Unit, integration, and E2E testing |

---

### 🔧 Hardware & Local Environment

| Resource | Minimum Requirement |
|---|---|
| Developer machines | 16GB RAM, modern CPU (Mac, Windows, or Linux) |
| Local PostgreSQL | Installed locally or via Docker |
| Local Redis | Installed locally or via Docker |
| Internet connection | Required for SSO and cloud service testing |
| Mobile device | For testing responsive UI and QR check-in scanner |

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — stable, deployed code only |
| `staging` | Pre-release testing and QA |
| `develop` | Active development — all features merge here first |
| `feature/xxx` | Individual feature branches off `develop` |
| `fix/xxx` | Bug fix branches |
| `hotfix/xxx` | Urgent production fixes branched off `main` |

**Workflow:** `feature/xxx` → PR into `develop` → merged into `staging` for QA → merged into `main` for production.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request into `develop`

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages.

---

## 📄 License

Proprietary — All rights reserved. This software may not be copied, modified,
or distributed without prior written permission from the author.
See [LICENSE](./LICENSE) for full details.

---

## 🏫 Built for Universities

UniArena is purpose-built for university student unions and activity offices. It is designed to work alongside — not replace — existing university systems, extending them with a modern, student-friendly interface.

---

*Made with ❤️ for student life.*
