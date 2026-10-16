import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { createGoalSchema, updateGoalSchema, goalContributionSchema } from "@/validators/goal.validator";
import { create, list, update, remove, addMoney, withdrawMoney } from "@/controllers/goal.controller";

const router = Router();
router.use(requireAuth);

router.post("/", validate(createGoalSchema), create);
router.get("/", list);
router.patch("/:id", validate(updateGoalSchema), update);
router.delete("/:id", remove);
router.post("/:id/add", validate(goalContributionSchema), addMoney);
router.post("/:id/withdraw", validate(goalContributionSchema), withdrawMoney);

export default router;
