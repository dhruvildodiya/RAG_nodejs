import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  accountType?: "individual" | "organization";
  organizationName?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const registerUser = async (dto: RegisterDTO) => {
  const { email, password, name, accountType = "individual", organizationName } = dto;

  const normalizedEmail = email.trim().toLowerCase();

  // Check existing email
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already registered. Please sign in instead.");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let orgId: string | null = null;
  let finalOrgName: string | null = null;

  // Handle Organization Creation
  if (accountType === "organization" && organizationName && organizationName.trim()) {
    const orgNameTrimmed = organizationName.trim();
    let slug = generateSlug(orgNameTrimmed);

    // Check if org slug exists
    const existingOrg = await pool.query(
      "SELECT id, name FROM organizations WHERE slug = $1 OR LOWER(name) = LOWER($2)",
      [slug, orgNameTrimmed]
    );

    if (existingOrg.rows.length > 0) {
      orgId = existingOrg.rows[0].id;
      finalOrgName = existingOrg.rows[0].name;
    } else {
      orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await pool.query(
        "INSERT INTO organizations (id, name, slug) VALUES ($1, $2, $3)",
        [orgId, orgNameTrimmed, slug]
      );
      finalOrgName = orgNameTrimmed;
    }
  }

  // Insert User
  await pool.query(
    "INSERT INTO users (id, email, password_hash, name, organization_id, role) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, normalizedEmail, passwordHash, name.trim(), orgId, orgId ? "admin" : "member"]
  );

  // Generate JWT
  const secretKey = (env.JWT_SECRET || "default_secret") as string;
  const token = jwt.sign(
    {
      userId,
      email: normalizedEmail,
      name: name.trim(),
      organizationId: orgId,
      organizationName: finalOrgName,
    },
    secretKey,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      organizationId: orgId,
      organizationName: finalOrgName,
    },
    token,
  };
};

export const loginUser = async (dto: LoginDTO) => {
  const { email, password } = dto;
  const normalizedEmail = email.trim().toLowerCase();

  const userQuery = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.name, u.organization_id, o.name AS organization_name
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     WHERE u.email = $1`,
    [normalizedEmail]
  );

  if (userQuery.rows.length === 0) {
    throw new Error("Invalid email or password.");
  }

  const user = userQuery.rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  const secretKey = (env.JWT_SECRET || "default_secret") as string;
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organization_id,
      organizationName: user.organization_name || null,
    },
    secretKey,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organization_id,
      organizationName: user.organization_name || null,
    },
    token,
  };
};
