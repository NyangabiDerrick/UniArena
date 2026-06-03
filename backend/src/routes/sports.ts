import { Router } from 'express'
import { getTeams, getTeamById, createFixture, updateFixture } from '../controllers/sports/sportsController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'

const router = Router()

router.get('/', getTeams)
router.get('/:id', getTeamById)
router.post('/:id/fixtures', authenticate, requireRole(ROLES.SPORTS_CAPTAIN, ROLES.ADMIN), createFixture)
router.put('/:id/fixtures/:fixtureId', authenticate, requireRole(ROLES.SPORTS_CAPTAIN, ROLES.ADMIN), updateFixture)

export default router