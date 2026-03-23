import { prisma } from "./lib/prisma";

async function seed() {
  try {
    // Verificando se o prisma está definido
    if (!prisma) {
      throw new Error("Prisma client not initialized");
    }

    console.log("Iniciando seed...");
    
    // @ts-ignore - Dependendo da versão o modelo pode ser 'user' ou 'User'
    const user = await prisma.user.upsert({
      where: { email: "admin@neurotracker.com" },
      update: {},
      create: {
        name: "Admin NeuroTracker",
        email: "admin@neurotracker.com",
        passwordHash: "senha_provisoria_123",
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
