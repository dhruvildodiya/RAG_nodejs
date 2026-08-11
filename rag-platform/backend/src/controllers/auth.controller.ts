import type { Response } from "express";
import {
  registerUser,
  loginUser,
  createOrJoinOrganization,
  getOrganizationMembers,
  inviteUserToOrganization,
  joinOrganizationBySlug,
} from "../services/auth.service.js";
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

export const createOrg = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { organizationName } = req.body;
    if (!organizationName) {
      return res.status(400).json({ message: "Organization name is required." });
    }

    const result = await createOrJoinOrganization(req.user.userId, organizationName);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Create org error:", error.message || error);
    return res.status(400).json({ message: error.message || "Failed to create organization" });
  }
};

export const getMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: "User does not belong to an organization." });
    }

    const members = await getOrganizationMembers(req.user.organizationId);
    return res.status(200).json(members);
  } catch (error: any) {
    console.error("Get members error:", error.message || error);
    return res.status(500).json({ message: "Failed to fetch organization members" });
  }
};

export const inviteMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: "User does not belong to an organization." });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required to invite a member." });
    }

    const result = await inviteUserToOrganization(req.user.organizationId, email);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Invite member error:", error.message || error);
    return res.status(400).json({ message: error.message || "Failed to invite member" });
  }
};

export const joinOrg = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ message: "Invite Code is required." });
    }

    const result = await joinOrganizationBySlug(req.user.userId, inviteCode);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Join org error:", error.message || error);
    return res.status(400).json({ message: error.message || "Failed to join organization" });
  }
};
