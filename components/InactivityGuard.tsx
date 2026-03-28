'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function InactivityGuard() {
  const [isIdle, setIsIdle] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const IDLE_TIME = 14400000; // 4 hours in ms

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      // Feedback tátil se disponível
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }, IDLE_TIME);
  }, []);

  useEffect(() => {
    resetTimer();

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleEvent = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [resetTimer]);

  if (!isIdle) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl space-y-8">
        <h2 className="text-3xl font-black text-white">Guardião de Inatividade</h2>
        <p className="text-slate-300 text-lg font-medium">
          Notamos que você está inativo há algum tempo. Como você está se sentindo agora?
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              setIsIdle(false);
              resetTimer();
            }}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl transition-all"
          >
            Estou bem
          </button>
          <button
            onClick={() => {
              setIsIdle(false);
              resetTimer();
              router.push('/logs/novo?context=inactivity');
            }}
            className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl transition-all"
          >
            Não estou bem
          </button>
        </div>
      </div>
    </div>
  );
}
