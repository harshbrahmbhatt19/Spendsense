import { Router } from "express";
import { requireAuth, AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Response } from "express";
import { calculateFinancialHealthScore } from "@/services/health-score.service";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await calculateFinancialHealthScore(req.userId!);
    res.status(200).json({ success: true, data: result });
  })
);

export default router;
