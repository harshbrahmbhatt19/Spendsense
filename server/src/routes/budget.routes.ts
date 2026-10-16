import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { createBudgetSchema, updateBudgetSchema } from "@/validators/budget.validator";
import { create, list, update, remove } from "@/controllers/budget.controller";

const router = Router();
router.use(requireAuth);

router.post("/", validate(createBudgetSchema), create);
router.get("/", list);
router.patch("/:id", validate(updateBudgetSchema), update);
router.delete("/:id", remove);

export default router;
