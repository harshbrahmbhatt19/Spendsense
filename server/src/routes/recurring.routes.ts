import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { createRecurringSchema, updateRecurringSchema } from "@/validators/recurring.validator";
import { create, list, update, remove, toggleActive } from "@/controllers/recurring.controller";

const router = Router();
router.use(requireAuth);

router.post("/", validate(createRecurringSchema), create);
router.get("/", list);
router.patch("/:id", validate(updateRecurringSchema), update);
router.delete("/:id", remove);
router.post("/:id/toggle", toggleActive);

export default router;
