import { Schema, model, Document, Types } from "mongoose";

export interface IAccount extends Document {
  userId: Types.ObjectId;
  name: string;
  type: "cash" | "bank" | "savings" | "credit_card" | "wallet" | "other";
  balance: number;
  currency: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["cash", "bank", "savings", "credit_card", "wallet", "other"],
      default: "cash",
    },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    icon: { type: String, default: "wallet" },
  },
  { timestamps: true }
);

accountSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Account = model<IAccount>("Account", accountSchema);
