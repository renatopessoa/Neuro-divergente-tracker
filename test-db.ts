import { prisma } from './lib/prisma'

async function main() {
  const users = await prisma.user.findMany()
  console.log('Users in DB:', users.map(u => u.email))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
