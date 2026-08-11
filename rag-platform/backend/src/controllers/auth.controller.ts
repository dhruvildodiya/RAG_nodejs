import type { Response } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, name, accountType, organizationName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const result = await registerUser({
      email,
      password,
      name,
      accountType,
      organizationName,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Registration error:", error.message || error);
    return res.status(400).json({ message: error.message || "Registration failed" });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const result = await loginUser({ email, password });
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Login error:", error.message || error);
    return res.status(401).json({ message: error.message || "Invalid credentials" });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res.status(200).json({ user: req.user });
};
