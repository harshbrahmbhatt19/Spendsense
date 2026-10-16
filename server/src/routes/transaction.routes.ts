import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { createTransactionSchema, updateTransactionSchema } from "@/validators/transaction.validator";
import {
  create,
  list,
  getOne,
  update,
  remove,
  duplicate,
} from "@/controllers/transaction.controller";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createTransactionSchema), create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", validate(updateTransactionSchema), update);
router.delete("/:id", remove);
router.post("/:id/duplicate", duplicate);

export default router;
