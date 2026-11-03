import { Router } from 'express'
import { body } from 'express-validator'
import {
  getTeams, getTeamById, createFixture, updateFixture, deleteFixture
} from '../controllers/sports/sportsController'
import {
  getMyTeam, getManageView, addSquadMember, updateSquadMember, removeSquadMember, addTraining, deleteTraining
} from '../controllers/sports/sportsManageController'
import { authenticate, requireRole, requireGroupManager, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const own = [authenticate, requireGroupManager('team')]
const time = (field: string) => body(field).matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Use the format HH:MM')
const score = (field: string) => body(field).optional({ nullable: true }).isInt({ min: 0, max: 999 })

router.get('/', getTeams)
router.get('/mine', authenticate, requireRole(ROLES.CLUB_LEADER), getMyTeam)
router.get('/:id', getTeamById)
router.get('/:id/manage', ...own, getManageView)

router.post('/:id/fixtures', ...own,
  [
    body('opposition').trim().isLength({ min: 1, max: 100 }),
    body('venue').trim().isLength({ min: 1, max: 150 }),
    body('scheduledAt').isISO8601(),
    body('isHome').optional().isBoolean(),
    body('notes').optional({ nullable: true }).isString().isLength({ max: 500 }),
    score('ourScore'), score('theirScore')
  ],
  validate, createFixture)

router.put('/:id/fixtures/:fixtureId', ...own,
  [
    body('opposition').optional().trim().isLength({ min: 1, max: 100 }),
    body('venue').optional().trim().isLength({ min: 1, max: 150 }),
    body('scheduledAt').optional().isISO8601(),
    body('isHome').optional().isBoolean(),
    body('status').optional().isIn(['UPCOMING', 'COMPLETED']),
    score('ourScore'), score('theirScore'),
    body('notes').optional({ nullable: true }).isString().isLength({ max: 500 })
  ],
  validate, updateFixture)

router.delete('/:id/fixtures/:fixtureId', ...own, deleteFixture)

router.post('/:id/squad', ...own,
  [
    body('studentId').trim().isLength({ min: 3, max: 40 }),
    body('position').optional({ nullable: true }).isString().isLength({ max: 40 }),
    body('jerseyNumber').optional({ nullable: true, values: 'falsy' }).isInt({ min: 0, max: 99 })
  ],
  validate, addSquadMember)

router.put('/:id/squad/:memberId', ...own,
  [
    body('position').optional({ nullable: true }).isString().isLength({ max: 40 }),
    body('jerseyNumber').optional({ nullable: true, values: 'falsy' }).isInt({ min: 0, max: 99 }),
    body('isInjured').optional().isBoolean(),
    body('isAvailable').optional().isBoolean()
  ],
  validate, updateSquadMember)

router.delete('/:id/squad/:memberId', ...own, removeSquadMember)

router.post('/:id/training', ...own,
  [
    body('dayOfWeek').isInt({ min: 1, max: 7 }),
    time('startTime'), time('endTime'),
    body('venue').trim().isLength({ min: 1, max: 150 }),
    body('notes').optional({ nullable: true }).isString().isLength({ max: 300 })
  ],
  validate, addTraining)

router.delete('/:id/training/:sessionId', ...own, deleteTraining)

export default router