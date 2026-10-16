import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { createReminderSchema, updateReminderSchema } from "@/validators/reminder.validator";
import { create, list, upcoming, update, markPaid, remove } from "@/controllers/reminder.controller";

const router = Router();
router.use(requireAuth);

router.post("/", validate(createReminderSchema), create);
router.get("/", list);
router.get("/upcoming", upcoming);
router.patch("/:id", validate(updateReminderSchema), update);
router.post("/:id/paid", markPaid);
router.delete("/:id", remove);

export default router;
