import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  userId: string; // simple login id chosen by the user, e.g. "dev123" - no email required
  name: string;
  password: string;
  profileImage?: string;
  currency: string;
  theme: "light" | "dark";
  monthlyIncomeGoal?: number;
  savingsTarget?: number;
  monthStartDate: number; // day of month (1-28) the "month" starts on for budgeting
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_.]+$/,
    },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    profileImage: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    monthlyIncomeGoal: { type: Number, default: 0 },
    savingsTarget: { type: Number, default: 0 },
    monthStartDate: { type: Number, default: 1, min: 1, max: 28 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", userSchema);
