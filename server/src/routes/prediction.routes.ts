import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { AuthRequest } from "@/middleware/auth";
import { Response } from "express";
import { predictNextMonthExpense } from "@/services/prediction.service";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const prediction = await predictNextMonthExpense(req.userId!);
    res.status(200).json({ success: true, data: prediction });
  })
);

export default router;
