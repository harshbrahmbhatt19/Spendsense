import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { dashboard, overview, heatmap } from "@/controllers/analytics.controller";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", dashboard);
router.get("/overview", overview);
router.get("/heatmap", heatmap);

export default router;
