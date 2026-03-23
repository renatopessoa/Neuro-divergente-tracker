'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id;
}

export async function getCheckIns() {
  const userId = await getUserId();
  if (!userId) return [];
  
  return await prisma.checkIn.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
}

export async function saveCheckIn(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error('Acesso não autorizado');

  const { id, ...rest } = data;
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
  const userId = await getUserId();
  if (!userId) return [];

  return await prisma.medication.findMany({
    where: { userId },
    include: { logs: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addMedication(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error('Acesso não autorizado');

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
