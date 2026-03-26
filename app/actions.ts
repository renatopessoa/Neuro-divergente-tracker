'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function getUserId() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id as any | undefined;
  } catch (error) {
    console.error("Erro ao recuperar sessão:", error);
    return undefined;
  }
}

export async function registerUser(data: any) {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    throw new Error('Todos os campos são obrigatórios');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('E-mail já cadastrado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  return { success: true };
}

export async function getCheckIns() {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    return await prisma.checkIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error("Erro ao buscar check-ins:", error);
    return [];
  }
}

export async function saveCheckIn(data: any) {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.error("saveCheckIn: Sessão não encontrada ou expirada.");
      throw new Error('Acesso não autorizado: Sessão não encontrada');
    }

    const { date, symptoms, mood, painLevel, sleepHours, sleepQuality, dietNotes, generalNotes } = data;
    
    // Sanitização e tratamento de tipos
    const dateObj = date ? new Date(date) : new Date();
    const formattedSymptoms = Array.isArray(symptoms) ? symptoms : [];

    const result = await prisma.checkIn.create({
      data: {
        date: dateObj,
        mood: Number(mood) || 3,
        painLevel: Number(painLevel) || 0,
        sleepHours: Number(sleepHours) || 0,
        sleepQuality: Number(sleepQuality) || 0,
        dietNotes: dietNotes || "",
        generalNotes: generalNotes || "",
        symptoms: formattedSymptoms,
        userId: userId, // Conexão direta via ID é mais performática e menos propensa a erros de nesting
      },
    });

    revalidatePath('/');
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error("ERRO CRÍTICO AO SALVAR CHECK-IN:", {
      message: error.message,
      stack: error.stack,
      data: data
    });
    // Retornamos um objeto de erro amigável
    return { 
      error: "Não foi possível salvar seu check-in. Por favor, tente novamente.",
      details: error.message 
    };
  }
}

export async function getMedications() {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    return await prisma.medication.findMany({
      where: { userId },
      include: { logs: true },
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    console.error("Erro ao buscar medicamentos:", error);
    return [];
  }
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
  try {
    const userId = await getUserId();
    if (!userId) return [];
    
    return await prisma.behaviorLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  } catch (error) {
    console.error("Erro ao buscar behavior logs:", error);
    return [];
  }
}

export async function saveBehaviorLog(data: any) {
  try {
    const userId = await getUserId();
    if (!userId) return { error: 'Acesso não autorizado: Sessão expirada ou usuário não logado.' };

    const { timestamp, ...rest } = data;
    
    // Limpeza de dados para evitar erros de campos nulos ou tipos errados
    const cleanData = {
      ...rest,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      userId,
      // Garantir que campos opcionais novos tenham valores padrão se vazios
      preCrisisArousal: rest.preCrisisArousal || 5,
      sensorOverloadTypes: Array.isArray(rest.sensorOverloadTypes) ? rest.sensorOverloadTypes : [],
      executiveFunctionImpact: Array.isArray(rest.executiveFunctionImpact) ? rest.executiveFunctionImpact : [],
      neurotypicalTranslation: rest.neurotypicalTranslation || "",
    };

    const result = await prisma.behaviorLog.create({
      data: cleanData,
    });

    revalidatePath('/');
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error("ERRO NO SERVIDOR:", error);
    // Retornamos o erro como um objeto em vez de dar 'throw', para o Next.js não ocultar em produção
    return { 
      error: `Falha no Servidor: ${error.message}`, 
      code: error.code,
      meta: error.meta 
    };
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export async function generateHealthInsights(checkIns: any[]) {
  const userId = await getUserId();
  if (!userId) throw new Error('Acesso não autorizado');

  // Tenta buscar a chave de API da variável de ambiente GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY || '';
  
  if (!apiKey) {
    console.error("ERRO: GEMINI_API_KEY não configurada nas variáveis de ambiente.");
    return "A função de insights de IA não está configurada corretamente no servidor (GEMINI_API_KEY faltando).";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const behaviorLogs = await getBehaviorLogs();
  
  const dataString = checkIns.slice(0, 14).map(c => 
    `Data: ${format(new Date(c.date), "dd 'de' MMM", { locale: ptBR })}, Humor: ${c.mood}/5, Dor: ${c.painLevel}/10, Sono: ${c.sleepHours}h (Qualidade: ${c.sleepQuality}/5), Dieta: ${c.dietNotes}, Sintomas: ${c.symptoms.join(', ')}`
  ).join('\n');

  const behaviorString = behaviorLogs.slice(0, 14).map(b =>
    `Data: ${format(new Date(b.timestamp), "dd/MM HH:mm")}, 
     Evento: ${b.eventType}, 
     Contexto: ${b.location || 'N/A'} (Pessoas: ${b.peoplePresent || 'N/A'}), 
     Alerta Pré-Evento: ${b.preCrisisArousal || 'N/A'}/10,
     Sobrecarga Sensorial: ${b.sensorOverloadTypes?.join(', ') || 'N/A'},
     Gatilhos (Vulnerabilidade: ${b.vulnerabilityFactors?.join(', ')} | Imediatos: ${b.perceivedTriggers?.join(', ')}), 
     Comportamento (Crise: ${b.description || 'N/A'}, Intensidade: ${b.intensity}/10, Duração: ${b.durationMinutes || 0} min), 
     Consequência (Manejo: ${b.copingStrategies?.join(', ')}, Eficácia: ${b.efficacy || 'N/A'}/5, Ambiente: ${b.environmentReaction || 'N/A'}),
     Tradução Simultânea: ${b.neurotypicalTranslation || 'N/A'},
     Impacto em Funções Executivas: ${b.executiveFunctionImpact?.join(', ') || 'N/A'},
     Sinais: ${b.warningSigns || 'N/A'}, 
     Pós-Crise: ${b.postCrisisState || 'N/A'}, 
     Notas: ${b.notes || ''}`
  ).join('\n');

  const prompt = `
    Você é um assistente de saúde de IA empático e profissional analisando o diário de sintomas de um paciente nos últimos 14 dias, incluindo os registros diários e eventos de comportamento/desregulação.
    Seu foco é em pacientes com perfis neurodivergentes.
    Analise os seguintes dados e forneça:
    1. Um resumo breve e encorajador do bem-estar geral.
    2. Padrões e Gatilhos: Destaque correlações entre eventos diários (sono, dieta, sintomas) e os eventos de desregulação/crise, como "Barulho alto frequentemente leva a desregulação" ou "Falta de sono correlaciona com maior intensidade de crises".
    3. Estratégias Eficazes: Identifique quais estratégias de regulação parecem ser mais eficazes para o usuário.
    4. Tradução Simultânea: Ajude o usuário a entender como comunicar suas experiências neurodivergentes em contextos neurotípicos (trabalho, escola, família) com base nos registros de "Tradução Simultânea".
    5. Impacto em Funções Executivas: Identifique padrões de como os eventos afetam a capacidade de iniciação, memória de trabalho e foco.
    6. Recomendações práticas e gentis para cuidados e prevenção de futuras crises.
    7. Um aviso de que os insights não substituem o aconselhamento médico profissional.
    
    Mantenha o tom de apoio, clínico, mas acolhedor. Não use cabeçalhos markdown, apenas parágrafos claros ou marcadores quando necessário.
    Responda em Português do Brasil.
    
    Dados de Check-ins (Últimos 14 dias):
    ${dataString}
    
    Dados de Rastreamento de Comportamento e Desregulação (últimos 14 dias):
    ${behaviorString || 'Nenhum evento registrado.'}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Erro ao gerar insights com Gemini:", error);
    return "Houve um erro ao processar os insights com o Gemini.";
  }
}
