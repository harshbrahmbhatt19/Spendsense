import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { createCategorySchema, updateCategorySchema } from "@/validators/category.validator";
import { create, list, update, remove } from "@/controllers/category.controller";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createCategorySchema), create);
router.get("/", list);
router.patch("/:id", validate(updateCategorySchema), update);
router.delete("/:id", remove);

export default router;
