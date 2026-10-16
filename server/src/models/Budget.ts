import { Schema, model, Document, Types } from "mongoose";

export interface IBudget extends Document {
  userId: Types.ObjectId;
  categoryId?: Types.ObjectId; // undefined = overall monthly budget
  amount: number;
  period: "monthly" | "yearly";
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    amount: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, categoryId: 1, startDate: 1 });

export const Budget = model<IBudget>("Budget", budgetSchema);
