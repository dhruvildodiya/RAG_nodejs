import pool from "./db.js";

export const initDb = async () => {
  try {
    console.log("Running database migrations for multi-tenant Auth & Scoping...");

    // 1. Ensure pgvector extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    // 2. Create Organizations Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE SET NULL,
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Update Documents Table for Scoping
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536),
        source VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private';
    `);

    // 5. Create Conversations Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        scope VARCHAR(20) DEFAULT 'individual',
        organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255) REFERENCES conversations(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        sources TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create Indexes for query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_vis ON documents(user_id, visibility);
      CREATE INDEX IF NOT EXISTS idx_documents_org_vis ON documents(organization_id, visibility);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_scope ON conversations(user_id, scope);
      CREATE INDEX IF NOT EXISTS idx_conversations_org_scope ON conversations(organization_id, scope);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
    `);

    console.log("Database migration completed successfully. ✅");
  } catch (error) {
    console.error("Database migration failed ❌:", error);
  }
};
