'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Busca o ID do usuário admin para testes (em prod viria da sessão)
async function getAdminId() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@neurotracker.com' }
  });
  return admin?.id;
}

export async function getCheckIns() {
  const userId = await getAdminId();
  if (!userId) return [];
  
  return await prisma.checkIn.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
}

export async function saveCheckIn(data: any) {
  const userId = await getAdminId();
  if (!userId) throw new Error('Usuário não encontrado');

  const { id, ...rest } = data;
  
  // No Prisma, o date precisa ser um objeto Date
  const dateObj = new Date(rest.date);

  await prisma.checkIn.create({
    data: {
      ...rest,
      date: dateObj,
      userId,
    },
  });

  revalidatePath('/');
}

export async function getMedications() {
  const userId = await getAdminId();
  if (!userId) return [];

  return await prisma.medication.findMany({
    where: { userId },
    include: { logs: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addMedication(data: any) {
  const userId = await getAdminId();
  if (!userId) throw new Error('Usuário não encontrado');

  await prisma.medication.create({
    data: {
      ...data,
      userId,
    },
  });

  revalidatePath('/');
}

export async function toggleMedLog(medId: string, taken: boolean) {
  // Simplificado para o dia atual
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (taken) {
    await prisma.medLog.create({
      data: {
        medId,
        date: new Date(),
      },
    });
  } else {
    // Remove logs de hoje para este remédio
    await prisma.medLog.deleteMany({
      where: {
        medId,
        date: {
          gte: today,
        },
      },
    });
  }

  revalidatePath('/');
}

export async function deleteMedication(id: string) {
  await prisma.medication.delete({
    where: { id },
  });
  revalidatePath('/');
}
