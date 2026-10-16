import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { generate, exportCsv, exportPdf } from "@/controllers/report.controller";

const router = Router();
router.use(requireAuth);

router.get("/", generate);
router.get("/export/csv", exportCsv);
router.get("/export/pdf", exportPdf);

export default router;
