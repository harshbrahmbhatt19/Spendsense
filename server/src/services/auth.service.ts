import { User } from "@/models/User";
import { Account } from "@/models/Account";
import { Category } from "@/models/Category";
import { buildDefaultCategories } from "@/utils/defaultCategories";
import { ApiError } from "@/utils/ApiError";
import { RegisterInput, LoginInput } from "@/validators/auth.validator";

export const registerUser = async (input: RegisterInput) => {
  const existing = await User.findOne({ userId: input.userId.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "That ID is already taken");
  }

  const user = await User.create({
    userId: input.userId.toLowerCase(),
    name: input.name,
    password: input.password,
  });

  // Set up a default "Cash" account and the standard category list
  await Account.create({
    userId: user._id,
    name: "Cash",
    type: "cash",
    balance: 0,
    icon: "wallet",
  });

  await Category.insertMany(buildDefaultCategories(user._id));

  return user;
};

export const authenticateUser = async (input: LoginInput) => {
  const user = await User.findOne({ userId: input.userId.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid ID or password");
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid ID or password");
  }

  return user;
};
