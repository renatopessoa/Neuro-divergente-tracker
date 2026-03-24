import { prisma } from '../lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@neurotracker.com' }
  })

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('senha_provisoria_123', 10)
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@neurotracker.com',
        passwordHash,
        role: 'ADMIN'
      }
    })
    console.log('✅ Usuário admin criado com sucesso.')
  } else {
    console.log('✅ Usuário admin já existe.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
