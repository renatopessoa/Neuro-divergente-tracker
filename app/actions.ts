'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';

import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id;
}

export async function registerUser(data: any) {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    throw new Error('Todos os campos são obrigatórios');
  }

  const existingUser = await (prisma as any).user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('E-mail já cadastrado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await (prisma as any).user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'ADMIN', // Defaulting to ADMIN as per schema default but explicit here if needed
    },
  });

  return { success: true };
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

import { GoogleGenAI } from '@google/genai';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export async function generateHealthInsights(checkIns: any[]) {
  const userId = await getUserId();
  if (!userId) throw new Error('Acesso não autorizado');

  // Uses server-side GEMINI_API_KEY environment variable securely
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Chave de API não configurada.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const dataString = checkIns.slice(0, 14).map(c => 
    `Data: ${format(parseISO(c.date), "dd 'de' MMM", { locale: ptBR })}, Humor: ${c.mood}/5, Dor: ${c.painLevel}/10, Sono: ${c.sleepHours}h (Qualidade: ${c.sleepQuality}/5), Dieta: ${c.dietNotes}, Sintomas: ${c.symptoms.join(', ')}`
  ).join('\n');

  const prompt = `
    Você é um assistente de saúde de IA empático e profissional analisando o diário de sintomas de um paciente nos últimos 14 dias.
    Analise os seguintes dados e forneça:
    1. Um resumo breve e encorajador do bem-estar geral.
    2. 2-3 possíveis padrões ou gatilhos que você notar (ex: "Em dias com menos de 6 horas de sono, seus níveis de dor tendem a ser maiores").
    3. 1-2 recomendações práticas e gentis para cuidados paliativos ou bem-estar mental (ex: reformulação de pensamentos baseada em TCC, higiene do sono).
    
    Mantenha o tom de apoio, clínico, mas acolhedor. Não use cabeçalhos markdown, apenas parágrafos claros.
    Responda em Português do Brasil.
    
    Dados:
    ${dataString}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
  });

  return response.text;
}
