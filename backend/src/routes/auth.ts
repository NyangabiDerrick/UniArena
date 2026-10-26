import { Router } from "express"
import { body } from "express-validator"
import { register, login, forgotPassword, resetPassword } from "../controllers/auth/authController"
import { validate } from "../middleware/validate"
import { authLimiter, loginLimiter } from "../middleware/rateLimiter"

const router = Router()
const password = body("password").isLength({ min: 8, max: 100 }).withMessage("Password must be at least 8 characters")

router.post("/register", authLimiter,
  [body("name").trim().notEmpty(), body("email").isEmail(), body("studentId").trim().notEmpty(), password],
  validate, register)

router.post("/login", loginLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  validate, login)

router.post("/forgot-password", authLimiter, [body("email").isEmail()], validate, forgotPassword)

router.post("/reset-password", authLimiter,
  [body("token").notEmpty(), password],
  validate, resetPassword)

export default router