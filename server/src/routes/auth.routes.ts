import { Router } from "express";
import { register, login, logout, me } from "@/controllers/auth.controller";
import { validate } from "@/middleware/validate";
import { registerSchema, loginSchema } from "@/validators/auth.validator";
import { requireAuth } from "@/middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts, please try again later" },
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
