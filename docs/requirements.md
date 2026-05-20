# 📋 UniArena — Requirements Document

> This document defines the full requirements for UniArena, including MVP scope, post-MVP features, user role permissions, and business rules. It serves as the single source of truth for what the platform does and how it behaves.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [MVP Scope](#-mvp-scope)
- [Post-MVP Features](#-post-mvp-features)
- [User Roles & Permissions](#-user-roles--permissions)
- [Business Rules](#-business-rules)
- [Constraints & Assumptions](#-constraints--assumptions)

---

## 📖 Project Overview

UniArena is a university platform built to streamline club, society & sports registration, simplify communication, and centralise access to events, ticketing, fixtures, media & announcements — all under one roof.

The platform is designed to work alongside existing university infrastructure — SSO, student records, and email systems — so no separate account creation is needed.

---

## 🚀 MVP Scope

The MVP (Minimum Viable Product) is the first working version of UniArena. It includes only the features necessary for the platform to be functional and useful from day one. Everything else is deferred to post-MVP.

### ✅ In Scope for MVP

| Module | Features Included |
|---|---|
| **Authentication** | SSO login, role-based access, session management, auto-profile creation |
| **Clubs & Societies** | Club directory, club profile pages, membership registration, club creation requests, admin approval workflow, committee role assignment |
| **Sports Teams** | Sports team directory, team profile pages, fixture creation and management, match result posting, squad management, training schedules |
| **Events & Ticketing** | Events calendar, event creation, standard and free ticket types, Stripe payment, QR code ticket generation, QR check-in scanner, attendee export |
| **News & Announcements** | News feed, article creation with rich text editor, university-wide announcements, article tagging and categorisation |
| **Notifications** | In-app notification centre, email notifications for key actions (join approvals, event reminders, ticket confirmations) |
| **Admin Dashboard** | User management, approval queues for clubs and events, audit logs, basic engagement analytics |

---

## 🔜 Post-MVP Features

These features are planned but will not be included in the first release. They will be prioritised and scheduled after the MVP is live and stable.

| Feature | Reason Deferred |
|---|---|
| Media galleries (photo & video) | Non-critical for launch; adds complexity to moderation |
| Discussion boards per club | Requires additional moderation infrastructure |
| Push notifications (PWA) | In-app and email notifications sufficient for MVP |
| Direct messaging | Adds complexity; email sufficient for initial communication |
| Early bird and group ticket types | Standard tickets sufficient for MVP |
| Waitlist for sold-out events | Nice to have; not critical at launch |
| Inter-university competition registration | Requires external coordination |
| Season statistics per player | Data can be tracked manually at first |
| Injury and availability tracker | Low priority for MVP |
| Engagement analytics (advanced) | Basic analytics sufficient for MVP |
| Add to Google/Outlook Calendar | Useful but not blocking launch |
| Social media sharing | Not critical for internal university platform |
| Faculty advisor assignment | Can be done manually by admin at first |
| Club documents section | Not required for basic club operations |

---

## 👥 User Roles & Permissions

### Role Definitions

| Role | Who They Are |
|---|---|
| **Student** | Any enrolled university student with a valid SSO account |
| **Club Leader** | A student assigned as leader of an approved club or society |
| **Sports Captain** | A student assigned as captain of an approved sports team |
| **Lecturer / Staff** | University staff member — can act as club advisor or moderator |
| **Moderator** | Assigned user who reviews and approves content and media |
| **Super Admin** | Platform administrator with full control — typically university union staff |

---

### Permissions Matrix

| Action | Student | Club Leader | Sports Captain | Lecturer | Moderator | Super Admin |
|---|---|---|---|---|---|---|
| Log in via SSO | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View club directory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Join a club | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Request to create a club | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage club page | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Post club news | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Create events | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Buy event tickets | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check in attendees (QR) | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage sports fixtures | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Post match results | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Manage squad | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Approve/reject clubs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve/reject events | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve/reject content | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View analytics dashboard | ❌ | ✅ *(own club)* | ✅ *(own team)* | ❌ | ❌ | ✅ |
| Post university-wide announcements | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Suspend or deactivate users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📏 Business Rules

Business rules define how the platform behaves in specific situations. These are non-negotiable constraints that must be enforced by the system.

---

### 🔐 Authentication & Access

- **BR-001** — Only users with a valid university SSO account can access the platform. No public registration is allowed.
- **BR-002** — A user's role is determined at login based on their university record. Students are assigned the `STUDENT` role by default.
- **BR-003** — A user's account is automatically deactivated if they are no longer enrolled or employed at the university.
- **BR-004** — A user can only hold one primary role at a time. A Club Leader is still a Student in all other contexts.
- **BR-005** — Admin and Club Leader accounts must have MFA enabled before they can access their dashboards.

---

### 🏛️ Clubs & Societies

- **BR-006** — A club cannot be listed publicly until it has been approved by a Super Admin.
- **BR-007** — Only verified students (active SSO account) can join a club.
- **BR-008** — A student cannot submit more than one new club creation request per semester.
- **BR-009** — A club must have at least one assigned committee member (President) before it can go live.
- **BR-010** — A club with no activity (no events, no posts, no new members) for 6 consecutive months is flagged as inactive and reviewed by admin.
- **BR-011** — A student can be a member of multiple clubs simultaneously with no restriction.
- **BR-012** — A Club Leader can only manage the club they are assigned to. They cannot access or edit other clubs.
- **BR-013** — Membership fees, if applicable, must be paid before a student is granted full member access to a paid club.

---

### ⚽ Sports Teams

- **BR-014** — A sports team cannot be listed publicly until approved by a Super Admin.
- **BR-015** — Only students with an active university SSO account can be added to a squad.
- **BR-016** — A Sports Captain can only manage the team they are assigned to.
- **BR-017** — Match results can only be posted by the Sports Captain of the relevant team or a Super Admin.
- **BR-018** — A fixture must have a confirmed date, time, venue, and opposition before it can be published.

---

### 📅 Events & Ticketing

- **BR-019** — An event cannot appear on the public calendar until it has been approved by a Moderator or Super Admin.
- **BR-020** — A Club Leader can only create events under their own club.
- **BR-021** — A student cannot purchase more tickets than the per-person limit set by the event organiser.
- **BR-022** — Ticket purchases are final unless the event is cancelled or rescheduled by the organiser.
- **BR-023** — If an event is cancelled, all ticket holders are automatically refunded and notified via email.
- **BR-024** — An event cannot be published with zero ticket capacity.
- **BR-025** — Free events do not require payment but still require ticket registration so attendance can be tracked.
- **BR-026** — QR codes are single-use — once scanned at check-in, they cannot be used again.

---

### 📰 News & Announcements

- **BR-027** — Club Leaders can only post news articles under their own club.
- **BR-028** — University-wide announcements can only be posted by a Super Admin.
- **BR-029** — All articles go through a moderation review before being published publicly.
- **BR-030** — A pinned article limit of 3 applies per club at any one time.

---

### 💬 Notifications

- **BR-031** — A user receives an email notification when their club join request is approved or rejected.
- **BR-032** — Ticket holders receive an automated email reminder 24 hours before their event.
- **BR-033** — A Club Leader is notified when a new student requests to join their club.
- **BR-034** — A Super Admin is notified when a new club creation request is submitted.
- **BR-035** — Notifications cannot be sent to users who have opted out of non-essential emails.

---

### 📊 Admin & Moderation

- **BR-036** — All content (articles, events, club requests) enters a moderation queue before going live.
- **BR-037** — A Super Admin can suspend any user account immediately without prior notice in cases of policy violation.
- **BR-038** — All admin actions (approvals, rejections, suspensions, role changes) are recorded in the audit log with a timestamp and the acting admin's ID.
- **BR-039** — Deleted content is soft-deleted (hidden, not permanently removed) for a minimum of 30 days before being purged, to allow recovery if needed.

---

## ⚙️ Constraints & Assumptions

| Item | Detail |
|---|---|
| **University SSO required** | The platform assumes the university has an existing SSO provider (Microsoft Entra, Google Workspace, or Okta). Without this, authentication must be rebuilt. |
| **English language only** | The MVP will be built in English only. Multilingual support is post-MVP. |
| **Single university** | The MVP supports one university only. Multi-tenancy (multiple universities) is a future consideration. |
| **Internet required** | The platform requires an active internet connection. Offline support is post-MVP. |
| **Desktop & mobile browsers** | The platform will be fully responsive and tested on Chrome, Firefox, Safari, and Edge on both desktop and mobile. |
| **No native mobile app** | The MVP is a web app only. A native iOS/Android app is post-MVP. |
| **Payment currency** | Stripe payments will be configured for the university's local currency. |
| **Data privacy** | The platform must comply with GDPR. Student data is never shared with third parties. |

---

*This document should be reviewed and signed off by all key stakeholders before development begins. Any changes to scope, rules, or permissions after sign-off must go through a formal change request.*

---

*Last updated: 2026*
