import { Types } from "mongoose";
import { Transaction, ITransaction } from "@/models/Transaction";
import { Account } from "@/models/Account";
import { ApiError } from "@/utils/ApiError";
import { CreateTransactionInput } from "@/validators/transaction.validator";

const applyBalanceChange = async (
  accountId: Types.ObjectId,
  delta: number
): Promise<void> => {
  await Account.findByIdAndUpdate(accountId, { $inc: { balance: delta } });
};

// Reverses whatever effect a transaction previously had on account balances.
const reverseTransactionEffect = async (tx: ITransaction) => {
  if (tx.type === "income") {
    await applyBalanceChange(tx.accountId, -tx.amount);
  } else if (tx.type === "expense") {
    await applyBalanceChange(tx.accountId, tx.amount);
  } else if (tx.type === "transfer" && tx.toAccountId) {
    await applyBalanceChange(tx.accountId, tx.amount);
    await applyBalanceChange(tx.toAccountId, -tx.amount);
  }
};

const applyTransactionEffect = async (tx: {
  type: string;
  accountId: Types.ObjectId;
  toAccountId?: Types.ObjectId;
  amount: number;
}) => {
  if (tx.type === "income") {
    await applyBalanceChange(tx.accountId, tx.amount);
  } else if (tx.type === "expense") {
    await applyBalanceChange(tx.accountId, -tx.amount);
  } else if (tx.type === "transfer") {
    if (!tx.toAccountId) {
      throw new ApiError(400, "toAccountId is required for transfers");
    }
    await applyBalanceChange(tx.accountId, -tx.amount);
    await applyBalanceChange(tx.toAccountId, tx.amount);
  }
};

export const createTransaction = async (userId: string, input: CreateTransactionInput) => {
  const account = await Account.findOne({ _id: input.accountId, userId });
  if (!account) throw new ApiError(404, "Account not found");

  if (input.type === "transfer") {
    if (!input.toAccountId) throw new ApiError(400, "toAccountId is required for transfers");
    const toAccount = await Account.findOne({ _id: input.toAccountId, userId });
    if (!toAccount) throw new ApiError(404, "Destination account not found");
  }

  const tx = await Transaction.create({ ...input, userId });

  await applyTransactionEffect({
    type: tx.type,
    accountId: tx.accountId,
    toAccountId: tx.toAccountId,
    amount: tx.amount,
  });

  return tx;
};

export const updateTransaction = async (
  userId: string,
  txId: string,
  input: Partial<CreateTransactionInput>
) => {
  const existing = await Transaction.findOne({ _id: txId, userId });
  if (!existing) throw new ApiError(404, "Transaction not found");

  // Reverse the old effect, apply the new one - keeps account balances correct
  await reverseTransactionEffect(existing);

  Object.assign(existing, input);
  await existing.save();

  await applyTransactionEffect({
    type: existing.type,
    accountId: existing.accountId,
    toAccountId: existing.toAccountId,
    amount: existing.amount,
  });

  return existing;
};

export const deleteTransaction = async (userId: string, txId: string) => {
  const existing = await Transaction.findOne({ _id: txId, userId });
  if (!existing) throw new ApiError(404, "Transaction not found");

  await reverseTransactionEffect(existing);
  await existing.deleteOne();

  return existing;
};

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  categoryId?: string;
  accountId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const listTransactions = async (userId: string, filters: TransactionFilters) => {
  const {
    page = 1,
    limit = 20,
    type,
    categoryId,
    accountId,
    search,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
    sortBy = "date",
    sortOrder = "desc",
  } = filters;

  const query: Record<string, any> = { userId };

  if (type) query.type = type;
  if (categoryId) query.categoryId = categoryId;
  if (accountId) query.accountId = accountId;
  if (search) query.title = { $regex: search, $options: "i" };
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }
  if (amountMin !== undefined || amountMax !== undefined) {
    query.amount = {};
    if (amountMin !== undefined) query.amount.$gte = amountMin;
    if (amountMax !== undefined) query.amount.$lte = amountMax;
  }

  const skip = (page - 1) * limit;
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [items, total] = await Promise.all([
    Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name icon color")
      .populate("accountId", "name icon"),
    Transaction.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
