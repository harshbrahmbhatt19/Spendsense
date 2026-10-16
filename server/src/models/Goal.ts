import { Schema, model, Document, Types } from "mongoose";

export interface IGoal extends Document {
  userId: Types.ObjectId;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  description?: string;
  icon: string;
  status: "active" | "completed" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date },
    description: { type: String, default: "" },
    icon: { type: String, default: "target" },
    status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
  },
  { timestamps: true }
);

export const Goal = model<IGoal>("Goal", goalSchema);
