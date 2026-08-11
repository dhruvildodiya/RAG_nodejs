import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  organizationId: string | null;
  organizationName?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const secretKey = (env.JWT_SECRET || "default_secret") as string;
    const decoded = jwt.verify(token, secretKey) as unknown as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuthenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const secretKey = (env.JWT_SECRET || "default_secret") as string;
        const decoded = jwt.verify(token, secretKey) as unknown as AuthUser;
        req.user = decoded;
      } catch (e) {
        // Ignore token verification errors for optional auth
      }
    }
  }

  next();
};
