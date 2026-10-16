import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Category } from "@/models/Category";
import { Transaction } from "@/models/Transaction";
import { Budget } from "@/models/Budget";
import { ApiError } from "@/utils/ApiError";
import { buildDefaultCategories } from "@/utils/defaultCategories";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.create({ ...req.body, userId: req.userId, isDefault: false });
  res.status(201).json({ success: true, data: category });
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter: Record<string, any> = { userId: req.userId };
  if (req.query.type) filter.type = req.query.type;
  let categories = await Category.find(filter).sort({ name: 1 });

  if (categories.length === 0 && !req.query.type) {
    await Category.insertMany(buildDefaultCategories(new Types.ObjectId(req.userId)));
    categories = await Category.find(filter).sort({ name: 1 });
  }

  res.status(200).json({ success: true, data: categories });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, data: category });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.userId });
  if (!category) throw new ApiError(404, "Category not found");
  if (category.isDefault) {
    throw new ApiError(400, "Default categories cannot be deleted");
  }

  const [txCount, budgetCount] = await Promise.all([
    Transaction.countDocuments({ userId: req.userId, categoryId: req.params.id }),
    Budget.countDocuments({ userId: req.userId, categoryId: req.params.id }),
  ]);
  if (txCount > 0 || budgetCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete a category with existing transactions or budgets tied to it"
    );
  }

  await category.deleteOne();
  res.status(200).json({ success: true, message: "Category deleted" });
});
