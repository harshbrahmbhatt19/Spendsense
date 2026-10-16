import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  listTransactions,
} from "@/services/transaction.service";
import { Transaction } from "@/models/Transaction";
import { ApiError } from "@/utils/ApiError";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tx = await createTransaction(req.userId!, req.body);
  res.status(201).json({ success: true, data: tx });
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await listTransactions(req.userId!, {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    type: req.query.type as string,
    categoryId: req.query.categoryId as string,
    accountId: req.query.accountId as string,
    search: req.query.search as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    amountMin: req.query.amountMin ? Number(req.query.amountMin) : undefined,
    amountMax: req.query.amountMax ? Number(req.query.amountMax) : undefined,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as "asc" | "desc",
  });
  res.status(200).json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tx = await Transaction.findOne({ _id: req.params.id, userId: req.userId })
    .populate("categoryId", "name icon color")
    .populate("accountId", "name icon");
  if (!tx) throw new ApiError(404, "Transaction not found");
  res.status(200).json({ success: true, data: tx });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tx = await updateTransaction(req.userId!, req.params.id, req.body);
  res.status(200).json({ success: true, data: tx });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await deleteTransaction(req.userId!, req.params.id);
  res.status(200).json({ success: true, message: "Transaction deleted" });
});

export const duplicate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const original = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
  if (!original) throw new ApiError(404, "Transaction not found");

  const copy = await createTransaction(req.userId!, {
    title: `${original.title} (copy)`,
    amount: original.amount,
    type: original.type,
    categoryId: original.categoryId?.toString(),
    accountId: original.accountId.toString(),
    toAccountId: original.toAccountId?.toString(),
    paymentMethod: original.paymentMethod,
    date: new Date(),
    notes: original.notes,
    tags: original.tags,
  });

  res.status(201).json({ success: true, data: copy });
});
