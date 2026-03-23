import { prisma } from "./lib/prisma";

async function checkPrisma() {
  try {
    console.log("-----------------------------------------");
    console.log("🔍 Inspecionando o objeto Prisma...");
    console.log("Chaves disponíveis no Prisma Client:");
    console.log(Object.keys(prisma).filter(key => !key.startsWith('_')));
    console.log("-----------------------------------------");
  } catch (error: any) {
    console.error("❌ Erro ao inspecionar Prisma:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrisma();
