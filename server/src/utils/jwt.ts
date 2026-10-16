import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export interface JwtPayload {
  userId: string; // Mongo _id of the user
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
