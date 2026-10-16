import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Account } from "@/models/Account";
import { Transaction } from "@/models/Transaction";
import { ApiError } from "@/utils/ApiError";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const account = await Account.create({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, data: account });
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const accounts = await Account.find({ userId: req.userId }).sort({ createdAt: 1 });
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  res.status(200).json({ success: true, data: accounts, totalBalance });
});

export const getOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const account = await Account.findOne({ _id: req.params.id, userId: req.userId });
  if (!account) throw new ApiError(404, "Account not found");
  res.status(200).json({ success: true, data: account });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!account) throw new ApiError(404, "Account not found");
  res.status(200).json({ success: true, data: account });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const txCount = await Transaction.countDocuments({
    userId: req.userId,
    $or: [{ accountId: req.params.id }, { toAccountId: req.params.id }],
  });
  if (txCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete an account that has transactions. Delete or reassign them first."
    );
  }
  const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!account) throw new ApiError(404, "Account not found");
  res.status(200).json({ success: true, message: "Account deleted" });
});

export const history = asyncHandler(async (req: AuthRequest, res: Response) => {
  const transactions = await Transaction.find({
    userId: req.userId,
    $or: [{ accountId: req.params.id }, { toAccountId: req.params.id }],
  })
    .sort({ date: -1 })
    .limit(100)
    .populate("categoryId", "name icon color");
  res.status(200).json({ success: true, data: transactions });
});

export const transfer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fromAccountId, toAccountId, amount, notes } = req.body;

  if (fromAccountId === toAccountId) {
    throw new ApiError(400, "Cannot transfer to the same account");
  }

  const [fromAccount, toAccount] = await Promise.all([
    Account.findOne({ _id: fromAccountId, userId: req.userId }),
    Account.findOne({ _id: toAccountId, userId: req.userId }),
  ]);

  if (!fromAccount || !toAccount) throw new ApiError(404, "Account not found");

  const tx = await Transaction.create({
    userId: req.userId,
    title: `Transfer: ${fromAccount.name} → ${toAccount.name}`,
    amount,
    type: "transfer",
    accountId: fromAccountId,
    toAccountId,
    paymentMethod: "bank_transfer",
    date: new Date(),
    notes: notes || "",
  });

  fromAccount.balance -= amount;
  toAccount.balance += amount;
  await Promise.all([fromAccount.save(), toAccount.save()]);

  res.status(201).json({ success: true, data: tx });
});
