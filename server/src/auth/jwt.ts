import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

const secret = (): string => env.JWT_SECRET;

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: 12 * 60 * 60 });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret()) as JwtPayload;
}
