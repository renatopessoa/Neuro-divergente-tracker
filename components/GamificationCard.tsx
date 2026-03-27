'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Flame, Award, Trophy, Star } from 'lucide-react';
import { CheckIn } from '@/app/types';
import { calculateStreak, getBadges } from '@/lib/gamification';

interface GamificationCardProps {
  checkIns: CheckIn[];
  medicationsCount: number;
  behaviorLogsCount: number;
}

export function GamificationCard({ checkIns, medicationsCount, behaviorLogsCount }: GamificationCardProps) {
  const streak = calculateStreak(checkIns);
  const badges = getBadges(checkIns, medicationsCount, behaviorLogsCount);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card de Ofensiva */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-rose-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={20} className="text-orange-200 fill-orange-200" />
              <span className="text-sm font-bold uppercase tracking-wider opacity-80">Ofensiva Atual</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h4 className="text-5xl font-black">{streak}</h4>
              <span className="text-xl font-bold">Dias</span>
            </div>
            <p className="mt-2 text-sm font-medium opacity-90">
              {streak > 0 
                ? 'Continue assim! Você está no caminho certo.' 
                : 'Faça seu check-in hoje para começar sua sequência!'}
            </p>
          </div>
          {/* Decoração */}
          <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
            <Flame size={120} />
          </div>
        </motion.div>

        {/* Card de Conquistas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Award className="text-indigo-500" size={20} />
              <span>Suas Conquistas</span>
            </div>
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-lg">
              {badges.length} desbloqueadas
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {badges.length > 0 ? (
              badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className="group relative cursor-help"
                  title={`${badge.name}: ${badge.description}`}
                >
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all">
                    {badge.icon}
                  </div>
                  {/* Tooltip simples customizado poderia ser aqui */}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 text-slate-400 py-2">
                <Star size={24} className="opacity-30" />
                <p className="text-sm font-medium italic">As conquistas aparecerão conforme você usa o app.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
