import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { protect } from "../middleware/auth";

const router = Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), register);

// POST /api/auth/login
router.post("/login", validate(loginSchema), login);

// POST /api/auth/refresh
router.post("/refresh", refresh);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", protect, getMe);

export default router;
