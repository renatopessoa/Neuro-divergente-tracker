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

// --- Behavior Logs Actions ---

export async function getBehaviorLogs() {
  const userId = await getUserId();
  if (!userId) return [];
  
  return await prisma.behaviorLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
  });
}

export async function saveBehaviorLog(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error('Acesso não autorizado');

  const { timestamp, ...rest } = data;

  await prisma.behaviorLog.create({
    data: {
      ...rest,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      userId,
    },
  });

  revalidatePath('/');
}

import OpenAI from 'openai';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export async function generateHealthInsights(checkIns: any[]) {
  const userId = await getUserId();
  if (!userId) throw new Error('Acesso não autorizado');

  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Chave de API do OpenAI não configurada.');
  }

  const openai = new OpenAI({ apiKey });
  
  const behaviorLogs = await getBehaviorLogs();
  
  const dataString = checkIns.slice(0, 14).map(c => 
    `Data: ${format(parseISO(c.date), "dd 'de' MMM", { locale: ptBR })}, Humor: ${c.mood}/5, Dor: ${c.painLevel}/10, Sono: ${c.sleepHours}h (Qualidade: ${c.sleepQuality}/5), Dieta: ${c.dietNotes}, Sintomas: ${c.symptoms.join(', ')}`
  ).join('\n');

  const behaviorString = behaviorLogs.slice(0, 14).map(b =>
    `Data: ${format(new Date(b.timestamp), "dd/MM HH:mm")}, Evento: ${b.eventType}, Contexto: ${b.location || 'N/A'} (Pessoas: ${b.peoplePresent || 'N/A'}), Gatilhos (Vulnerabilidade: ${b.vulnerabilityFactors?.join(', ')} | Imediatos: ${b.perceivedTriggers?.join(', ')}), Comportamento (Crise: ${b.description || 'N/A'}, Intensidade: ${b.intensity}/10, Duração: ${b.durationMinutes || 0} min), Consequência (Manejo: ${b.copingStrategies?.join(', ')}, Eficácia: ${b.efficacy || 'N/A'}/5, Ambiente: ${b.environmentReaction || 'N/A'}), Sinais: ${b.warningSigns || 'N/A'}, Pós-Crise: ${b.postCrisisState || 'N/A'}, Notas: ${b.notes || ''}`
  ).join('\n');

  const prompt = `
    Você é um assistente de saúde de IA empático e profissional analisando o diário de sintomas de um paciente nos últimos 14 dias, incluindo os registros diários e eventos de comportamento/desregulação.
    Analise os seguintes dados e forneça:
    1. Um resumo breve e encorajador do bem-estar geral.
    2. Padrões e Gatilhos: Destaque correlações entre eventos diários (sono, dieta, sintomas) e os eventos de desregulação/crise, como "Barulho alto frequentemente leva a desregulação" ou "Falta de sono correlaciona com maior intensidade de crises".
    3. Estratégias Eficazes: Identifique quais estratégias de regulação parecem ser mais eficazes para o usuário.
    4. Recomendações práticas e gentis para cuidados e prevenção de futuras crises.
    5. Um aviso de que os insights não substituem o aconselhamento médico profissional.
    
    Mantenha o tom de apoio, clínico, mas acolhedor. Não use cabeçalhos markdown, apenas parágrafos claros ou marcadores quando necessário.
    Responda em Português do Brasil.
    
    Dados de Check-ins (Últimos 14 dias):
    ${dataString}
    
    Dados de Rastreamento de Comportamento e Desregulação (últimos 14 dias):
    ${behaviorString || 'Nenhum evento registrado.'}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Você é um assistente de saúde IA especialista em dados de diários de pacientes com perfis neurodivergentes." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "Houve um erro ao processar os insights.";
}
