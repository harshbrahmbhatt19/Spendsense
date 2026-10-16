import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { list } from "@/controllers/insights.controller";

const router = Router();
router.use(requireAuth);
router.get("/", list);

export default router;
