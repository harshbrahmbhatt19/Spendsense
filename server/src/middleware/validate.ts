import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "@/utils/ApiError";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(", ");
      return next(new ApiError(400, message));
    }
    req.body = result.data;
    next();
  };
