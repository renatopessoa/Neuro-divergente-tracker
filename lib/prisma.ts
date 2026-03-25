import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString && process.env.NODE_ENV === "production") {
    console.warn("DATABASE_URL não configurada em produção.");
  }

  const pool = new Pool({ 
    connectionString,
    // Adiciona suporte a SSL para bancos gerenciados (Neon, Supabase, Railway) em produção
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  
  const adapter = new PrismaPg(pool as any);
  
  return new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
