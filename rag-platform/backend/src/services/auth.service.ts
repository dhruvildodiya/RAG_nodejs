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

export const createOrJoinOrganization = async (userId: string, organizationName: string) => {
  if (!organizationName || !organizationName.trim()) {
    throw new Error("Organization name is required.");
  }

  const orgNameTrimmed = organizationName.trim();
  let slug = generateSlug(orgNameTrimmed);

  // Check existing organization
  const existingOrg = await pool.query(
    "SELECT id, name FROM organizations WHERE slug = $1 OR LOWER(name) = LOWER($2)",
    [slug, orgNameTrimmed]
  );

  let orgId: string;
  let finalOrgName: string;

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

  // Update user's organization_id in PostgreSQL
  await pool.query(
    "UPDATE users SET organization_id = $1, role = 'admin' WHERE id = $2",
    [orgId, userId]
  );

  // Fetch updated user record
  const userQuery = await pool.query(
    "SELECT id, email, name FROM users WHERE id = $1",
    [userId]
  );

  if (userQuery.rows.length === 0) {
    throw new Error("User not found.");
  }

  const user = userQuery.rows[0];

  // Issue new JWT token with updated organizationId
  const secretKey = (env.JWT_SECRET || "default_secret") as string;
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: orgId,
      organizationName: finalOrgName,
    },
    secretKey,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: orgId,
      organizationName: finalOrgName,
    },
    token,
  };
};

export const getOrganizationMembers = async (organizationId: string) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.created_at, o.slug AS invite_code, o.name AS organization_name
     FROM users u
     JOIN organizations o ON u.organization_id = o.id
     WHERE u.organization_id = $1
     ORDER BY CASE WHEN u.role = 'admin' THEN 1 ELSE 2 END, u.name ASC`,
    [organizationId]
  );
  return result.rows;
};

export const inviteUserToOrganization = async (organizationId: string, emailToInvite: string) => {
  const normalizedEmail = emailToInvite.trim().toLowerCase();

  const userQuery = await pool.query(
    "SELECT id, name, email, organization_id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (userQuery.rows.length === 0) {
    throw new Error(`User with email "${normalizedEmail}" is not registered yet. Ask them to register, or they can join using your Organization Invite Code!`);
  }

  const targetUser = userQuery.rows[0];
  if (targetUser.organization_id === organizationId) {
    throw new Error(`User "${normalizedEmail}" is already a member of your organization.`);
  }

  await pool.query(
    "UPDATE users SET organization_id = $1, role = 'member' WHERE id = $2",
    [organizationId, targetUser.id]
  );

  return { message: `User ${targetUser.name} (${normalizedEmail}) added to organization successfully!` };
};

export const joinOrganizationBySlug = async (userId: string, inviteCode: string) => {
  const trimmedCode = inviteCode.trim().toLowerCase();

  const orgQuery = await pool.query(
    "SELECT id, name, slug FROM organizations WHERE slug = $1 OR id = $2 OR LOWER(name) = LOWER($3)",
    [trimmedCode, trimmedCode, trimmedCode]
  );

  if (orgQuery.rows.length === 0) {
    throw new Error("Invalid Organization Invite Code or Name.");
  }

  const org = orgQuery.rows[0];

  await pool.query(
    "UPDATE users SET organization_id = $1, role = 'member' WHERE id = $2",
    [org.id, userId]
  );

  const userQuery = await pool.query("SELECT id, email, name FROM users WHERE id = $1", [userId]);
  const user = userQuery.rows[0];

  const secretKey = (env.JWT_SECRET || "default_secret") as string;
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: org.id,
      organizationName: org.name,
    },
    secretKey,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: org.id,
      organizationName: org.name,
    },
    token,
  };
};
