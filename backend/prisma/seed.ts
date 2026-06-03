import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create clubs
  const clubs = await Promise.all([
    prisma.club.upsert({
      where: { name: 'Photography Society' },
      update: {},
      create: {
        name: 'Photography Society',
        description: 'A club for photography enthusiasts on campus. We organise photo walks, exhibitions and workshops.',
        category: 'Arts',
        status: 'ACTIVE',
        memberCount: 124,
        foundedAt: new Date('2019-01-01')
      }
    }),
    prisma.club.upsert({
      where: { name: 'Chess Club' },
      update: {},
      create: {
        name: 'Chess Club',
        description: 'Competitive and recreational chess for all skill levels. Weekly tournaments and training sessions.',
        category: 'Academic',
        status: 'ACTIVE',
        memberCount: 56
      }
    }),
    prisma.club.upsert({
      where: { name: 'African Culture Society' },
      update: {},
      create: {
        name: 'African Culture Society',
        description: 'Celebrating African heritage through music, dance, food and cultural events.',
        category: 'Cultural',
        status: 'ACTIVE',
        memberCount: 210
      }
    }),
    prisma.club.upsert({
      where: { name: 'Coding Bootcamp' },
      update: {},
      create: {
        name: 'Coding Bootcamp',
        description: 'Weekly coding sessions, hackathons and tech talks for all skill levels.',
        category: 'Technology',
        status: 'ACTIVE',
        memberCount: 89
      }
    }),
    prisma.club.upsert({
      where: { name: 'Debate Society' },
      update: {},
      create: {
        name: 'Debate Society',
        description: 'Sharpen your public speaking and critical thinking through competitive debate.',
        category: 'Academic',
        status: 'ACTIVE',
        memberCount: 67
      }
    }),
    prisma.club.upsert({
      where: { name: 'Drama Club' },
      update: {},
      create: {
        name: 'Drama Club',
        description: 'Acting, directing and stagecraft. We perform two major productions per year.',
        category: 'Arts',
        status: 'ACTIVE',
        memberCount: 43
      }
    }),
    prisma.club.upsert({
      where: { name: 'Muslim Students Association' },
      update: {},
      create: {
        name: 'Muslim Students Association',
        description: 'A community for Muslim students on campus. Weekly prayers, events and support.',
        category: 'Religious',
        status: 'ACTIVE',
        memberCount: 178
      }
    }),
    prisma.club.upsert({
      where: { name: 'Entrepreneurship Club' },
      update: {},
      create: {
        name: 'Entrepreneurship Club',
        description: 'Building the next generation of entrepreneurs through mentorship and pitch competitions.',
        category: 'Academic',
        status: 'ACTIVE',
        memberCount: 95
      }
    }),
  ])

  // Create sports teams
  const teams = await Promise.all([
    prisma.sportsTeam.upsert({
      where: { name: 'UniArena FC' },
      update: {},
      create: {
        name: 'UniArena FC',
        sport: 'Football',
        description: "The university's flagship football team competing in the national university league.",
        status: 'ACTIVE',
        season: '2025/26'
      }
    }),
    prisma.sportsTeam.upsert({
      where: { name: 'UniArena Ballers' },
      update: {},
      create: {
        name: 'UniArena Ballers',
        sport: 'Basketball',
        description: 'Our basketball team competing in the regional university basketball championship.',
        status: 'ACTIVE',
        season: '2025/26'
      }
    }),
    prisma.sportsTeam.upsert({
      where: { name: 'UniArena Swim Team' },
      update: {},
      create: {
        name: 'UniArena Swim Team',
        sport: 'Swimming',
        description: 'Competitive swimming across all strokes and distances at national level.',
        status: 'ACTIVE',
        season: '2025/26'
      }
    }),
    prisma.sportsTeam.upsert({
      where: { name: 'UniArena Athletics' },
      update: {},
      create: {
        name: 'UniArena Athletics',
        sport: 'Athletics',
        description: 'Track and field athletes representing the university at regional competitions.',
        status: 'ACTIVE',
        season: '2025/26'
      }
    }),
  ])

  // Get the admin user to create events and articles
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })

  if (adminUser) {
    // Create events
    await prisma.event.upsert({
      where: { id: 'event-sports-day-2026' },
      update: {},
      create: {
        id: 'event-sports-day-2026',
        title: 'Annual Sports Day',
        description: 'The biggest sporting event of the year featuring competitions across 10 sports.',
        venue: 'Main Stadium',
        startsAt: new Date('2026-06-07T09:00:00'),
        endsAt: new Date('2026-06-07T18:00:00'),
        capacity: 500,
        isFree: true,
        status: 'APPROVED',
        createdBy: adminUser.id
      }
    })

    await prisma.event.upsert({
      where: { id: 'event-pitch-night-2026' },
      update: {},
      create: {
        id: 'event-pitch-night-2026',
        title: 'Entrepreneurship Pitch Night',
        description: 'Student entrepreneurs pitch their startup ideas to a panel of industry judges.',
        venue: 'Business School Auditorium',
        startsAt: new Date('2026-06-12T18:00:00'),
        endsAt: new Date('2026-06-12T21:00:00'),
        capacity: 200,
        isFree: false,
        status: 'APPROVED',
        createdBy: adminUser.id,
        clubId: clubs[4].id
      }
    })

    await prisma.event.upsert({
      where: { id: 'event-culture-night-2026' },
      update: {},
      create: {
        id: 'event-culture-night-2026',
        title: 'African Culture Night',
        description: 'A celebration of African heritage through music, dance, food and art.',
        venue: 'Student Union Hall',
        startsAt: new Date('2026-06-15T19:00:00'),
        endsAt: new Date('2026-06-15T23:00:00'),
        capacity: 300,
        isFree: false,
        status: 'APPROVED',
        createdBy: adminUser.id,
        clubId: clubs[2].id
      }
    })

    // Create articles
    await prisma.article.upsert({
      where: { id: 'article-fc-championship' },
      update: {},
      create: {
        id: 'article-fc-championship',
        title: 'UniArena FC wins the National University Football Championship',
        content: 'After a thrilling final against City University, our football team clinched the national title with a 3-1 victory in front of 2,000 fans at the National Stadium.\n\nThe match started with UniArena FC taking an early lead through a stunning free kick in the 12th minute. City University equalised shortly before half time, setting up a tense second half.\n\nThe turning point came in the 67th minute when substitute Jordan Goal scored with his first touch to restore the lead. A third goal in injury time sealed the championship.\n\nThis is the third national championship title for UniArena FC and the first in eight years.',
        authorId: adminUser.id,
        teamId: teams[0].id,
        status: 'PUBLISHED',
        isPinned: true,
        tags: ['football', 'championship', 'sports'],
        isUniversityWide: false
      }
    })

    await prisma.article.upsert({
      where: { id: 'article-photo-award' },
      update: {},
      create: {
        id: 'article-photo-award',
        title: 'Photography Society wins Best University Club award',
        content: 'The Photography Society has been named the Best University Club at the National Student Union Awards for the second year running.\n\nThe society was recognised for its outstanding contribution to campus life, innovative events programme, and the exceptional quality of work produced by its members.\n\nPresident Jane Leader accepted the award on behalf of the society and thanked all members for their dedication and creativity throughout the year.',
        authorId: adminUser.id,
        clubId: clubs[0].id,
        status: 'PUBLISHED',
        isPinned: true,
        tags: ['photography', 'award', 'clubs'],
        isUniversityWide: false
      }
    })

    await prisma.article.upsert({
      where: { id: 'article-activity-centre' },
      update: {},
      create: {
        id: 'article-activity-centre',
        title: 'University announces new student activity centre opening in September',
        content: 'The long-awaited student activity centre will open its doors in September 2026 featuring new sports facilities, a performance space, club offices and a 24-hour study area.\n\nThe £12 million facility has been under construction for two years and represents the largest investment in student facilities in the university\'s history.\n\nThe centre will include a gym, swimming pool, recording studio, and dedicated spaces for over 50 clubs and societies.',
        authorId: adminUser.id,
        status: 'PUBLISHED',
        isPinned: false,
        tags: ['university', 'facilities', 'announcement'],
        isUniversityWide: true
      }
    })

    // Create fixtures for UniArena FC
    await prisma.fixture.upsert({
      where: { id: 'fixture-city-uni' },
      update: {},
      create: {
        id: 'fixture-city-uni',
        teamId: teams[0].id,
        opposition: 'City University',
        venue: 'Main Stadium',
        isHome: true,
        scheduledAt: new Date('2026-06-07T15:00:00'),
        status: 'UPCOMING'
      }
    })

    await prisma.fixture.upsert({
      where: { id: 'fixture-tech-uni' },
      update: {},
      create: {
        id: 'fixture-tech-uni',
        teamId: teams[0].id,
        opposition: 'Tech University',
        venue: 'Tech Campus',
        isHome: false,
        scheduledAt: new Date('2026-06-14T15:00:00'),
        status: 'UPCOMING'
      }
    })

    await prisma.fixture.upsert({
      where: { id: 'fixture-north-uni' },
      update: {},
      create: {
        id: 'fixture-north-uni',
        teamId: teams[0].id,
        opposition: 'North University',
        venue: 'Main Stadium',
        isHome: true,
        scheduledAt: new Date('2026-05-24T15:00:00'),
        homeScore: 3,
        awayScore: 1,
        status: 'COMPLETED'
      }
    })
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())