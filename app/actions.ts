'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';
import { CheckIn, Medication, MedLog, BehaviorLog, MoodEntry } from '@prisma/client';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Interface para o retorno consolidado do relatório.
 */
export interface FullReportData {
  user: {
    name: string | null;
  };
  checkIns: CheckIn[];
  medications: (Medication & { logs: MedLog[] })[];
  behaviorLogs: BehaviorLog[];
  moodEntries: MoodEntry[];
}

async function getUserId() {
  try {
    const session = await getServerSession(authOptions) as any;
    return session?.user?.id as string | undefined;
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

import OpenAI from "openai";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export async function generateHealthInsights(checkIns: any[]) {
  const userId = await getUserId();
  if (!userId) throw new Error('Acesso não autorizado');

  const apiKey = process.env.OPENAI_API_KEY || '';
  
  if (!apiKey) {
    console.error("ERRO: OPENAI_API_KEY não configurada nas variáveis de ambiente.");
    return "A função de insights de IA não está configurada corretamente no servidor (OPENAI_API_KEY faltando).";
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const behaviorLogs = await getBehaviorLogs();
  const moodEntries = await getMoodEntries();
  
  const dataString = checkIns.slice(0, 14).map(c => 
    `Data: ${format(new Date(c.date), "dd 'de' MMM", { locale: ptBR })}, Humor: ${c.mood}/5, Dor: ${c.painLevel}/10, Sono: ${c.sleepHours}h (Qualidade: ${c.sleepQuality}/5), Dieta: ${c.dietNotes}, Sintomas: ${c.symptoms.join(', ')}`
  ).join('\n');

  const moodString = moodEntries.slice(0, 20).map(m =>
    `Hora: ${format(new Date(m.createdAt), "dd/MM HH:mm")}, Humor: ${m.moodLevel}/5, Energia: ${m.energyLevel}/5, Notas: ${m.note || ''}`
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
    Você é o Prisma AI, um Analista de Saúde Digital especializado em Neurodivergência. Sua função é processar dados quantitativos e qualitativos para oferecer suporte clínico, empático e preventivo.

    ### DADOS PARA ANÁLISE (Últimos 14 dias):
    DADOS DE CHECK-IN:
    ${dataString}

    ### DADOS DE OSCILAÇÃO INTRA-DIA (Micro-Ciclo):
    ${moodString || 'Nenhum registro.'}

    DADOS DE COMPORTAMENTO E DESREGULAÇÃO:
    ${behaviorString || 'Nenhum evento registrado no período.'}

    ### SUA TAREFA:
    Analise os dados acima procurando por correlações entre as variáveis (Sono, Humor, Sobrecarga Sensorial, Energia e Eventos). Siga estas diretrizes:

    1. **Análise de Tendências (Resumo):** Identifique a "temperatura" geral do período. O usuário está em uma curva de estabilidade ou de exaustão progressiva? Use um tom encorajador, mas realista.

    2. **Mapeamento de Gatilhos e Correlações:** Seja específico. Procure padrões como "Baixa qualidade de sono aumenta a intensidade das crises" ou "Fatores de vulnerabilidade específicos que precedem a sobrecarga sensorial". **Analise especificamente se quedas no nível de 'Energia' (Micro-Ciclo) coincidem ou precedem as crises descritas no BehaviorLog.**

    3. **Eficácia de Regulação:** Identifique quais estratégias de manejo (copingStrategies) tiveram os maiores índices de eficácia.

    4. **Ponte de Comunicação (Tradução Neurotípica):** Transforme os registros de "Tradução Simultânea" e "Impacto em Funções Executivas" em scripts curtos e profissionais que o usuário possa usar para comunicar suas necessidades a terceiros.

    5. **Prevenção Baseada em Sinais:** Identifique Sinais de Alerta (warningSigns) recorrentes e sugira uma ação imediata de prevenção.

    6. **Acessibilidade:** Responda com parágrafos curtos, bullets para dados técnicos e negrito em termos importantes para facilitar a leitura.

    ### AVISO LEGAL:
    Ao final, inclua: "Estes insights são gerados por IA com base nos seus registros e não substituem o acompanhamento médico ou terapêutico profissional."

    Responda em Português do Brasil, mantendo um tom profissional, clínico e acolhedor.

    ### FORMATO DE RESPOSTA OBRIGATÓRIO:
  Retorne a resposta EXCLUSIVAMENTE em formato JSON, sem blocos de código Markdown (como \`\`\`json), seguindo exatamente esta estrutura:
  [
    { "title": "Análise de Tendências (Resumo)", "content": "...", "type": "trend" },
    { "title": "Mapeamento de Gatilhos e Correlações", "content": "...", "type": "triggers" },
    { "title": "Eficácia de Regulação", "content": "...", "type": "regulation" },
    { "title": "Ponte de Comunicação (Tradução Neurotípica)", "content": "...", "type": "communication" },
    { "title": "Prevenção Baseada em Sinais", "content": "...", "type": "prevention" }
  ]

  `;

 try {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0].message.content || "[]";
  return JSON.parse(content); // Retorna o array de objetos em vez de uma string
} catch (error) {
  console.error("Erro ao gerar/parsear insights:", error);
  return []; // Retorna array vazio em caso de erro
}
}

/**
 * Retorna o relatório completo consolidado para o usuário logado.
 * Inclui: Check-ins (últimos 30 dias), Medicamentos (com logs) e Registros de Comportamento.
 */
export async function getFullReportData(): Promise<FullReportData> {
  const session = await getServerSession(authOptions) as any;
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado: Sessão inválida ou expirada.");
  }

  const userId = session.user.id;
  
  // Calcular data de 30 dias atrás
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const [checkIns, medications, behaviorLogs, moodEntries] = await Promise.all([
      // 1. Check-ins dos últimos 30 dias
      prisma.checkIn.findMany({
        where: { 
          userId,
          date: { gte: thirtyDaysAgo }
        },
        orderBy: { date: 'desc' },
      }),
      
      // 2. Todos os medicamentos e seus logs
      prisma.medication.findMany({
        where: { userId },
        include: { 
          logs: {
            orderBy: { date: 'desc' }
          } 
        },
        orderBy: { createdAt: 'asc' },
      }),
      
      // 3. Todos os registros de comportamento
      prisma.behaviorLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      }),

      // 4. Registros de humor dos últimos 30 dias
      prisma.moodEntry.findMany({
        where: { 
          userId,
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { createdAt: 'desc' },
      })
    ]);

    return {
      user: {
        name: session.user.name || "Usuário",
      },
      checkIns,
      medications,
      behaviorLogs,
      moodEntries
    };
  } catch (error) {
    console.error("Erro ao buscar dados do relatório completo:", error);
    throw new Error("Erro ao processar os dados do relatório.");
  }
}

export async function saveQuickMood(data: { moodLevel: number, energyLevel: number, note?: string }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error('Acesso não autorizado');
    }

    const result = await prisma.moodEntry.create({
      data: {
        moodLevel: Number(data.moodLevel),
        energyLevel: Number(data.energyLevel),
        note: data.note || "",
        userId,
      },
    });

    revalidatePath('/');
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error("Erro ao salvar quick mood:", error);
    return { error: "Não foi possível salvar seu humor." };
  }
}

export async function getMoodEntries() {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    return await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Erro ao buscar mood entries:", error);
    return [];
  }
}
