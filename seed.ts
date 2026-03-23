import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("Iniciando seed...");
    
    const passwordHash = await bcrypt.hash("senha_provisoria_123", 10);

    // @ts-ignore - Dependendo da versão o modelo pode ser 'user' ou 'User'
    const user = await prisma.user.upsert({
      where: { email: "admin@neurotracker.com" },
      update: {},
      create: {
        name: "Admin NeuroTracker",
        email: "admin@neurotracker.com",
        passwordHash: passwordHash,
        role: "ADMIN",
      },
    });

    console.log("-----------------------------------------");
    console.log("✅ Usuário Admin criado/verificado!");
    console.log(`ID: ${user.id}`);
    console.log("-----------------------------------------");
  } catch (error: any) {
    console.error("❌ Erro no seed:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
