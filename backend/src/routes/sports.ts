import { Router } from 'express'
import { body } from 'express-validator'
import { getTeams, getTeamById, createFixture, updateFixture } from '../controllers/sports/sportsController'
import { authenticate, requireGroupManager } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', getTeams)
router.get('/:id', getTeamById)
router.post('/:id/fixtures',
  authenticate,
  requireGroupManager('team'),
  [
    body('opposition').trim().notEmpty(),
    body('venue').trim().notEmpty(),
    body('scheduledAt').isISO8601()
  ],
  validate,
  createFixture
)
router.put('/:id/fixtures/:fixtureId', authenticate, requireGroupManager('team'), updateFixture)

export default router