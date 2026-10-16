import { Schema, model, Document, Types } from "mongoose";

export interface IReminder extends Document {
  userId: Types.ObjectId;
  title: string;
  amount: number;
  dueDate: Date;
  category?: string;
  reminderFrequency: "once" | "daily" | "weekly";
  status: "pending" | "paid" | "overdue";
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true, index: true },
    category: { type: String, default: "" },
    reminderFrequency: { type: String, enum: ["once", "daily", "weekly"], default: "once" },
    status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
  },
  { timestamps: true }
);

export const Reminder = model<IReminder>("Reminder", reminderSchema);
