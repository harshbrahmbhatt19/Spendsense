import { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
  userId: Types.ObjectId;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    icon: { type: String, default: "circle" },
    color: { type: String, default: "#6366f1" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

export const Category = model<ICategory>("Category", categorySchema);
