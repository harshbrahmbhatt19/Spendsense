import { Schema, model, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  title: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  categoryId?: Types.ObjectId;
  accountId: Types.ObjectId;
  toAccountId?: Types.ObjectId; // for transfers
  paymentMethod: "cash" | "upi" | "credit_card" | "debit_card" | "bank_transfer";
  date: Date;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense", "transfer"], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    toAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "credit_card", "debit_card", "bank_transfer"],
      default: "cash",
    },
    date: { type: Date, required: true, default: Date.now, index: true },
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });

export const Transaction = model<ITransaction>("Transaction", transactionSchema);
