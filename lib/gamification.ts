import { CheckIn } from "@/app/types";
import { parseISO, differenceInDays, isSameDay, subDays } from "date-fns";

/**
 * Calcula a ofensiva (streak) atual de check-ins consecutivos.
 */
export function calculateStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;

  // Ordenar check-ins por data descendente
  const sortedDates = checkIns
    .map(c => parseISO(c.date))
    .sort((a, b) => b.getTime() - a.getTime());

  // Remover duplicatas de data (mesmo dia)
  const uniqueDates: Date[] = [];
  sortedDates.forEach(date => {
    if (!uniqueDates.find(d => isSameDay(d, date))) {
      uniqueDates.push(date);
    }
  });

  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();

  // Se o último check-in não foi hoje nem ontem, a ofensiva quebrou
  const lastCheckIn = uniqueDates[0];
  const daysDiff = differenceInDays(currentDate, lastCheckIn);

  if (daysDiff > 1) return 0;

  // Se o último check-in foi hoje ou ontem, começamos a contar
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = subDays(lastCheckIn, i);
    if (isSameDay(uniqueDates[i], expectedDate)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Define badges baseadas no histórico do usuário.
 */
export function getBadges(checkIns: CheckIn[], medicationsCount: number, behaviorLogsCount: number) {
  const badges = [];

  // Badge de Iniciante
  if (checkIns.length >= 1) {
    badges.push({
      id: 'first_checkin',
      name: 'Primeiro Passo',
      description: 'Realizou o seu primeiro check-in diário.',
      icon: '🌱'
    });
  }

  // Badge de Constância
  const streak = calculateStreak(checkIns);
  if (streak >= 7) {
    badges.push({
      id: 'week_streak',
      name: 'Semana de Ouro',
      description: '7 dias seguidos de autocuidado.',
      icon: '🔥'
    });
  }

  // Badge de Auto-conhecimento (Eventos)
  if (behaviorLogsCount >= 5) {
    badges.push({
      id: 'self_aware',
      name: 'Explorador Interno',
      description: 'Registrou 5 ou mais eventos de comportamento.',
      icon: '🧠'
    });
  }

  // Badge de Responsabilidade (Medicamentos)
  if (medicationsCount > 0) {
    badges.push({
      id: 'med_pro',
      name: 'Mestre da Rotina',
      description: 'Mantendo o plano medicamentoso em dia.',
      icon: '🛡️'
    });
  }

  // NOVA: Badge de Sono Regulado (7 dias com sono >= 7h e qualidade >= 3)
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  if (recentCheckIns.length >= 7) {
    const isSleepRegulated = recentCheckIns.every(c => c.sleepHours >= 7 && c.sleepQuality >= 3);
    if (isSleepRegulated) {
      badges.push({
        id: 'sleep_master',
        name: 'Sono de Ouro',
        description: '7 dias consecutivos de sono regulado e reparador.',
        icon: '🌙'
      });
    }
  }

  // NOVA: Badge de Detetive de Gatilhos (Identificou gatilhos em registros de comportamento)
  if (behaviorLogsCount >= 3) {
    badges.push({
      id: 'trigger_hunter',
      name: 'Detetive de Gatilhos',
      description: 'Identificou com sucesso padrões que afetam seu bem-estar.',
      icon: '🔍'
    });
  }

  return badges;
}
