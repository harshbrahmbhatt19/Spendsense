import { Schema, model, Document, Types } from "mongoose";

export interface IRecurringTransaction extends Document {
  userId: Types.ObjectId;
  title: string;
  amount: number;
  type: "income" | "expense";
  categoryId?: Types.ObjectId;
  accountId: Types.ObjectId;
  paymentMethod: "cash" | "upi" | "credit_card" | "debit_card" | "bank_transfer";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  nextOccurrence: Date;
  autoCreate: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recurringSchema = new Schema<IRecurringTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense"], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "credit_card", "debit_card", "bank_transfer"],
      default: "cash",
    },
    frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextOccurrence: { type: Date, required: true, index: true },
    autoCreate: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RecurringTransaction = model<IRecurringTransaction>(
  "RecurringTransaction",
  recurringSchema
);
