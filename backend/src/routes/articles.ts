import { Router } from 'express'
import { body } from 'express-validator'
import {
  getArticles, getArticleById, createArticle, getArticleCategories
} from '../controllers/news/articlesController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', getArticles)
router.get('/categories', authenticate, requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN), getArticleCategories)
router.get('/:id', getArticleById)
router.post('/',
  authenticate,
  requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN),
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('category').isIn(['CLUB', 'SPORTS', 'UNIVERSITY']),
    body('content').trim().isLength({ min: 20, max: 20000 }).withMessage('The article must be at least 20 characters'),
    body('tags').optional({ nullable: true }).isArray({ max: 8 })
  ],
  validate,
  createArticle
)

export default router