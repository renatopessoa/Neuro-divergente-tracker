import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Vamos criar um hash válido para "senha_provisoria_123"
  const hash = await bcrypt.hash("senha_provisoria_123", 10);
  
  try {
    const user = await prisma.user.update({
      where: { email: "admin@neurotracker.com" },
      data: { passwordHash: hash }
    });
    console.log("✅ Sucesso! A senha do admin@neurotracker.com foi criptografada e salva no banco de dados.");
  } catch (err) {
    console.error("❌ Erro ao atualizar:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
