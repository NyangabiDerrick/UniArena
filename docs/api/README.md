# UniArena — API Reference

## Base URLs
| Environment | URL |
|---|---|
| Development | `http://localhost:5000/api` |
| Production | `https://api.uniarena.ac/api` |

---

## Standard Response Format
Every API response follows this structure:
```json
{
  "success": true,
  "data": {},
  "message": "string",
  "error": null
}
```

---

## Authentication
All protected routes require a Bearer token in the request header:

Authorization: Bearer <token>

---

## Endpoints

### 🔐 Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /auth/session | Get current session | All |
| POST | /auth/login | SSO login | Public |
| POST | /auth/logout | Logout current session | All |
| GET | /auth/profile | Get own profile | All |
| PUT | /auth/profile | Update own profile | All |

---

### 🏛️ Clubs
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /clubs | Get all approved clubs | Public |
| GET | /clubs/:id | Get single club details | Public |
| POST | /clubs | Submit club creation request | Student |
| PUT | /clubs/:id | Update club details | Club Leader |
| DELETE | /clubs/:id | Archive a club | Admin |
| POST | /clubs/:id/join | Request to join a club | Student |
| PUT | /clubs/:id/join | Cancel join request | Student |
| GET | /clubs/:id/members | Get all club members | Club Leader |
| PUT | /clubs/:id/members/:userId | Approve or reject member | Club Leader |
| DELETE | /clubs/:id/members/:userId | Remove a member | Club Leader |
| GET | /clubs/:id/committee | Get committee members | Public |
| POST | /clubs/:id/committee | Assign committee role | Club Leader |
| DELETE | /clubs/:id/committee/:userId | Remove committee role | Club Leader |
| GET | /clubs/:id/documents | Get club documents | Members |
| POST | /clubs/:id/documents | Upload a document | Club Leader |
| DELETE | /clubs/:id/documents/:docId | Delete a document | Club Leader |

---

### ⚽ Sports Teams
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /sports | Get all approved teams | Public |
| GET | /sports/:id | Get single team details | Public |
| POST | /sports | Submit team creation request | Student |
| PUT | /sports/:id | Update team details | Sports Captain |
| DELETE | /sports/:id | Archive a team | Admin |
| GET | /sports/:id/squad | Get all squad members | Public |
| POST | /sports/:id/squad | Add a squad member | Sports Captain |
| PUT | /sports/:id/squad/:userId | Update member details | Sports Captain |
| DELETE | /sports/:id/squad/:userId | Remove a squad member | Sports Captain |
| GET | /sports/:id/fixtures | Get all team fixtures | Public |
| POST | /sports/:id/fixtures | Create a new fixture | Sports Captain |
| PUT | /sports/:id/fixtures/:fixtureId | Update fixture or post result | Sports Captain |
| DELETE | /sports/:id/fixtures/:fixtureId | Cancel a fixture | Sports Captain |
| GET | /sports/:id/standings | Get season standings | Public |
| GET | /sports/:id/stats | Get season statistics | Public |

---

### 📅 Events
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /events | Get all approved events | Public |
| GET | /events/:id | Get single event details | Public |
| POST | /events | Create a new event | Club Leader |
| PUT | /events/:id | Update event details | Club Leader |
| DELETE | /events/:id | Cancel an event | Club Leader |
| GET | /events/:id/attendees | Get attendee list | Club Leader |
| POST | /events/:id/tickets | Purchase a ticket | Student |
| GET | /events/:id/tickets/:ticketId | Get ticket details | Student |
| DELETE | /events/:id/tickets/:ticketId | Cancel a ticket | Student |
| POST | /events/:id/checkin | Check in attendee via QR | Club Leader |

---

### 📰 News & Articles
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /articles | Get all published articles | Public |
| GET | /articles/:id | Get single article | Public |
| POST | /articles | Create a new article | Club Leader |
| PUT | /articles/:id | Update an article | Club Leader |
| DELETE | /articles/:id | Delete an article | Club Leader |
| GET | /articles/:id/comments | Get approved comments | Public |
| POST | /articles/:id/comments | Post a comment | Student |
| DELETE | /articles/:id/comments/:commentId | Delete a comment | Moderator |

---

### 🖼️ Gallery
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /galleries | Get all public galleries | Public |
| GET | /galleries/:id | Get single gallery | Public |
| POST | /galleries | Create a new gallery | Club Leader |
| PUT | /galleries/:id | Update gallery details | Club Leader |
| DELETE | /galleries/:id | Delete a gallery | Club Leader |
| GET | /galleries/:id/media | Get all media in gallery | Public |
| POST | /galleries/:id/media | Upload media to gallery | Club Leader |
| DELETE | /galleries/:id/media/:mediaId | Delete a media item | Club Leader |

---

### 💬 Notifications
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /notifications | Get own notifications | All |
| GET | /notifications/unread | Get unread count | All |
| PUT | /notifications/:id/read | Mark one as read | All |
| PUT | /notifications/read-all | Mark all as read | All |
| DELETE | /notifications/:id | Delete a notification | All |

---

### ✉️ Messages
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /messages | Get all own conversations | All |
| POST | /messages | Send a new message | Student |
| GET | /messages/:userId | Get conversation with a user | All |
| DELETE | /messages/:messageId | Delete a message | All |

---

### 📊 Admin
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /admin/users | Get all platform users | Admin |
| GET | /admin/users/:id | Get single user details | Admin |
| PUT | /admin/users/:id | Update user role or status | Admin |
| DELETE | /admin/users/:id | Suspend a user account | Admin |
| GET | /admin/approvals/clubs | Get pending club requests | Admin |
| PUT | /admin/approvals/clubs/:id | Approve or reject a club | Admin |
| GET | /admin/approvals/events | Get pending events | Moderator |
| PUT | /admin/approvals/events/:id | Approve or reject an event | Moderator |
| GET | /admin/approvals/articles | Get pending articles | Moderator |
| PUT | /admin/approvals/articles/:id | Approve or reject an article | Moderator |
| GET | /admin/approvals/media | Get pending media uploads | Moderator |
| PUT | /admin/approvals/media/:id | Approve or reject media | Moderator |
| GET | /admin/audit-logs | Get full audit log | Admin |
| GET | /admin/analytics | Get platform analytics | Admin |
| POST | /admin/announcements | Post university-wide announcement | Admin |

---

## Error Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request — invalid input |
| 401 | Unauthorised — not logged in |
| 403 | Forbidden — wrong role |
| 404 | Resource not found |
| 409 | Conflict — already exists |
| 422 | Validation error |
| 429 | Too many requests — rate limited |
| 500 | Internal server error |