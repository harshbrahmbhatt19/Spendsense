import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt";
import { ApiError } from "@/utils/ApiError";

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined);

    if (!token) {
      throw new ApiError(401, "Not authenticated");
    }

    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired session"));
  }
};
