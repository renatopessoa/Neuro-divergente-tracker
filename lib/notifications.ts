import { CheckIn, Medication } from "@/app/types";
import { format, isSameDay } from "date-fns";

/**
 * Analisa os padrões de sono e retorna uma mensagem de alerta se necessário.
 */
export function checkSleepPatternAlert(checkIns: CheckIn[]): string | null {
  if (checkIns.length < 3) return null;

  // Ordenar por data descendente
  const sorted = [...checkIns].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Pegar os 3 mais recentes
  const last3 = sorted.slice(0, 3);

  // Critério: Média de sono inferior a 6h OU 3 dias seguidos com sono < 6h
  const poorSleepDays = last3.filter(c => c.sleepHours < 6);

  if (poorSleepDays.length === 3) {
    return "Percebi que você dormiu pouco nos últimos 3 dias. Que tal redobrar o cuidado com estímulos sensoriais hoje?";
  }

  return null;
}

/**
 * Agenda lembretes para os medicamentos configurados se o horário estiver próximo.
 * Nota: Como estamos no lado do cliente, esta função verifica se há remédios para agora.
 */
export function scheduleMedicationReminders(medications: Medication[]) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentHourMin = format(now, 'HH:mm');

  medications.forEach(med => {
    // 1. Verificar se já foi tomado hoje (usando os logs se existirem)
    const alreadyTaken = med.logs?.some(l => 
      format(new Date(l.date), 'yyyy-MM-dd') === todayStr
    );

    if (alreadyTaken) return;

    // 2. Se o horário configurado for IGUAL ao horário atual, notificar
    // (A checagem é feita a cada recarregamento de dados no app/page.tsx)
    if (med.time === currentHourMin) {
      sendLocalNotification(
        "Lembrete de Medicação 💊", 
        `Está na hora de tomar o seu ${med.name} (${med.dosage}).`
      );
    }
  });
}

/**
 * Solicita permissão para notificações e registra o service worker.
 */
export async function setupNotifications() {
  if (!("Notification" in window)) {
    console.log("Este navegador não suporta notificações desktop");
    return;
  }

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission === "granted" && "serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker de notificações registrado!");
    } catch (error) {
      console.error("Falha ao registrar Service Worker:", error);
    }
  }
}

/**
 * Dispara uma notificação local (se a aba estiver aberta) ou via SW.
 */
export function sendLocalNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    // Tentar via Service Worker para melhor compatibilidade mobile/background
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: "/assets/prisma-icon.png",
        badge: "/assets/prisma-icon.png",
        vibrate: [200, 100, 200],
        tag: `med-${title.replace(/\s+/g, '-')}` // Evitar notificações duplicadas idênticas
      } as NotificationOptions & { vibrate: number[] });
    }).catch(() => {
      // Fallback para notificação simples
      new Notification(title, {
        body,
        icon: "/assets/prisma-icon.png"
      });
    });
  }
}
