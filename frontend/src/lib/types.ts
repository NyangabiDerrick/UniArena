// Shapes returned by the backend API. Relations are optional because each
// endpoint only includes the ones it needs.

export interface UserSummary {
  id: string
  name: string
  email?: string
  studentId?: string
  faculty?: string | null
  avatarUrl?: string | null
}

export interface User extends UserSummary {
  email: string
  role: string
  yearOfStudy?: number | null
  isActive: boolean
  managedClubId?: string | null
  managedTeamId?: string | null
  managedClub?: { id: string; name: string } | null
  managedTeam?: { id: string; name: string } | null
  createdAt?: string
}

export interface Membership {
  id: string
  userId?: string
  clubId?: string
  status: string
  tier?: string
  joinedAt: string
  user?: UserSummary
  club?: Club
}

export interface MemberWithUser extends Membership {
  user: UserSummary
}

export interface Committee {
  id: string
  role: string
  user?: UserSummary
}

export interface Club {
  id: string
  name: string
  description?: string | null
  category: string
  type?: string
  logoUrl?: string | null
  bannerUrl?: string | null
  status?: string
  foundedAt?: string | null
  createdAt?: string
  _count?: { memberships: number }
  events?: Event[]
  memberships?: Membership[]
  committees?: Committee[]
  upcomingEvents?: number
}

export interface Fixture {
  id: string
  opposition: string
  venue: string
  isHome: boolean
  scheduledAt: string
  status: string
  homeScore?: number | null
  awayScore?: number | null
  notes?: string | null
}

export interface SquadMember {
  id: string
  position?: string | null
  isInjured: boolean
  isAvailable: boolean
  user?: UserSummary
}

export interface Team {
  id: string
  name: string
  sport: string
  description?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  status?: string
  season?: string | null
  fixtures?: Fixture[]
  squadMembers?: SquadMember[]
  _count?: { squadMembers?: number }
  wins?: number
  losses?: number
  draws?: number
  memberCount?: number
}

export interface Event {
  id: string
  title: string
  description?: string | null
  venue: string
  startsAt: string
  endsAt?: string
  capacity?: number
  status?: string
  isFree?: boolean
  club?: { id?: string; name: string } | null
  team?: { id?: string; name: string } | null
  _count?: { tickets: number }
  category?: string
  date?: string
  time?: string
  sold?: number
  price?: number
  organiser?: string
  creator?: UserSummary
}

export interface Article {
  id: string
  title: string
  content: string
  isUniversityWide?: boolean
  isPinned?: boolean
  tags?: string[]
  category?: string
  coverImageUrl?: string | null
  createdAt: string
  author?: UserSummary
  club?: { id?: string; name: string } | null
  team?: { id?: string; name: string } | null
}

export interface AuditLog {
  id: string
  action: string
  targetType: string
  targetId: string
  details?: string | null
  createdAt: string
  admin?: UserSummary
}

export interface Dashboard {
  events: Event[]
  articles: Article[]
  clubs: Club[]
  teams: Team[]
  pendingRequests?: number
  tickets?: number
}

export interface Profile extends User {
  clubMemberships?: Membership[]
}

export interface Analytics {
  totalUsers: number
  totalClubs: number
  totalEvents: number
  pendingApprovals: number
}

export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  return err instanceof Error ? err.message : fallback
}
