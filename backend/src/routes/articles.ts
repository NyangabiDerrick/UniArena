import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import {
  getArticles, getArticleById, createArticle, getArticleCategories
} from '../controllers/news/articlesController'
import {
  listManagedArticles, hideArticle, removeArticle, restoreArticle
} from '../controllers/news/articleModerationController'
import { reportArticle } from '../controllers/admin/contentReportsController'
import { authenticate, requireRole, AuthRequest, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const managers = requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN)
const reason = body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Give a reason of at least 5 characters')

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: req => (req as AuthRequest).user?.id ?? 'anonymous',
  message: { success: false, message: 'You have sent several reports already. Please try again later.' }
})

router.get('/', getArticles)
router.get('/categories', authenticate, managers, getArticleCategories)
router.get('/managed', authenticate, managers, listManagedArticles)
router.get('/:id', getArticleById)
router.post('/',
  authenticate,
  managers,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('category').isIn(['CLUB', 'SPORTS', 'UNIVERSITY']),
    body('content').trim().isLength({ min: 20, max: 20000 }).withMessage('The article must be at least 20 characters'),
    body('tags').optional({ nullable: true }).isArray({ max: 8 })
  ],
  validate,
  createArticle
)
router.put('/:id/hide', authenticate, managers, [reason], validate, hideArticle)
router.put('/:id/remove', authenticate, managers, [reason], validate, removeArticle)
router.put('/:id/restore', authenticate, managers, restoreArticle)
router.post('/:id/report',
  authenticate,
  reportLimiter,
  [
    body('reason').isIn(['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'OTHER']),
    body('details').optional({ nullable: true }).isString().isLength({ max: 1000 })
  ],
  validate,
  reportArticle
)

export default router