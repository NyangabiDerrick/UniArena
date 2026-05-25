# UniArena — Database Schema

Full visual diagram: see `database-schema.png` in this folder.
Live editable diagram: https://dbdiagram.io/d/6a140bc5dfb20dafcde58718

## Tables

### users
Stores all platform users — students, staff, and admins.
Role is assigned at login based on university SSO data.

### clubs
Stores all clubs and societies. Status starts as PENDING until approved by admin.

### club_memberships
Junction table linking users to clubs. Tracks membership status and tier.

### club_committees
Tracks which users hold committee positions in which clubs.

### club_documents
Stores uploaded documents (constitution, minutes) belonging to a club.

### sports_teams
Stores all university sports teams. Status starts as PENDING until approved.

### squad_members
Junction table linking users to sports teams. Tracks position and availability.

### fixtures
Stores all match fixtures for sports teams including results once played.

### events
Stores all events created by clubs or sports teams. Linked to either a club or team.

### tickets
Stores individual tickets purchased for events. Each ticket has a unique QR code.

### articles
Stores all news articles and announcements. Can belong to a club, team, or be university-wide.

### comments
Stores comments on articles. Requires moderation approval before appearing publicly.

### galleries
Stores media album collections belonging to a club or sports team.

### media
Stores individual photos and videos inside a gallery. Requires moderation approval.

### notifications
Stores in-app notifications per user. Marked as read when the user views them.

### messages
Stores direct messages between students and club leaders.

### discussion_boards
Stores discussion posts inside club member-only boards.

### audit_logs
Records every significant admin action for accountability and compliance.