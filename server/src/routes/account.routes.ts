import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { createAccountSchema, updateAccountSchema, transferSchema } from "@/validators/account.validator";
import { create, list, getOne, update, remove, history, transfer } from "@/controllers/account.controller";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createAccountSchema), create);
router.get("/", list);
router.post("/transfer", validate(transferSchema), transfer);
router.get("/:id", getOne);
router.patch("/:id", validate(updateAccountSchema), update);
router.delete("/:id", remove);
router.get("/:id/history", history);

export default router;
