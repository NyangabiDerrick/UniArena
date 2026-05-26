# UniArena — Architecture Overview

## System Diagram
See `system-architecture.png` for the full visual diagram.
Editable source: `system-architecture.excalidraw`

---

## How the System Works

### Request Flow
1. A user opens UniArena in their browser
2. The browser loads the Next.js frontend served from Vercel
3. The frontend makes REST API calls to the Express backend
4. The backend processes the request — querying the database, checking cache, or calling an external service
5. The backend returns a JSON response to the frontend
6. The frontend renders the data to the user

---

## Layers

### Layer 1 — Frontend (Next.js 14)
- Hosted on Vercel
- Handles all UI rendering, routing, and client-side state
- Communicates with the backend via REST API calls using Axios
- Handles SSO login redirect and session management via NextAuth.js
- Development URL: http://localhost:3000
- Production URL: https://uniarena.ac

### Layer 2 — Backend API (Node.js + Express)
- Hosted on Railway or AWS EC2
- Handles all business logic, authentication, and data processing
- Exposes a REST API consumed by the frontend
- Connects to the database, cache, storage, and external services
- Development URL: http://localhost:5000
- Production URL: https://api.uniarena.ac

### Layer 3 — Database (PostgreSQL)
- Hosted on Supabase or Neon
- Primary data store for all platform data
- Accessed via Prisma ORM — no raw SQL queries
- Port: 5432

### Layer 4 — Cache (Redis)
- Hosted on Upstash
- Caches frequently read data (club lists, event listings)
- Stores session data for fast authentication checks
- Port: 6379

### Layer 5 — File Storage (AWS S3 / Cloudflare R2)
- Stores all uploaded media — profile photos, club banners, gallery images, videos, documents
- Files are served via CDN for fast global delivery
- Direct uploads from the backend using signed URLs

### Layer 6 — Email (SendGrid)
- Sends all transactional emails — ticket confirmations, join approvals, event reminders
- Sends newsletter emails to club followers
- Triggered by backend events

---

## External Services

### University SSO
- Provider: Microsoft Entra ID / Google Workspace / Okta
- Protocol: OAuth2 / SAML
- Flow: User clicks login → redirected to university SSO → SSO returns token → backend validates token → session created
- All user identity comes from the university — no separate registration

### Stripe
- Handles all payment processing for event tickets
- Backend creates a payment intent → frontend collects card details → Stripe confirms payment → backend issues ticket
- Webhooks notify the backend of payment success or failure

---

## Security

- All traffic over HTTPS in production
- JWT tokens for API authentication
- Redis for secure session storage
- Helmet.js for HTTP security headers
- CORS restricted to the frontend domain only
- Rate limiting on all public endpoints
- Environment variables for all secrets — never hardcoded