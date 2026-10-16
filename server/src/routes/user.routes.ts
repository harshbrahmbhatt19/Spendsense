import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { updateUserSchema, changePasswordSchema } from "@/validators/user.validator";
import { updateMe, changePassword, resetData } from "@/controllers/user.controller";

const router = Router();
router.use(requireAuth);

router.patch("/me", validate(updateUserSchema), updateMe);
router.post("/change-password", validate(changePasswordSchema), changePassword);
router.delete("/me/data", resetData);

export default router;
