import { Router } from "express";
import { requireAuth, AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Response } from "express";
import { Transaction } from "@/models/Transaction";
import { Category } from "@/models/Category";
import { Account } from "@/models/Account";
import { Goal } from "@/models/Goal";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const q = (req.query.q as string || "").trim();
    if (!q) {
      return res.status(200).json({ success: true, data: { transactions: [], categories: [], accounts: [], goals: [] } });
    }

    const regex = { $regex: q, $options: "i" };

    const [transactions, categories, accounts, goals] = await Promise.all([
      Transaction.find({ userId: req.userId, title: regex }).limit(10).populate("categoryId", "name icon"),
      Category.find({ userId: req.userId, name: regex }).limit(10),
      Account.find({ userId: req.userId, name: regex }).limit(10),
      Goal.find({ userId: req.userId, title: regex }).limit(10),
    ]);

    res.status(200).json({ success: true, data: { transactions, categories, accounts, goals } });
  })
);

export default router;
