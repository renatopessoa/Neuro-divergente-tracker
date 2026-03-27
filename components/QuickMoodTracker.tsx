'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoodIcon } from './MoodIcon';
import { Zap, Send, CheckCircle2, AlertCircle, Loader2, BatteryLow, Battery, BatteryMedium, BatteryFull } from 'lucide-react';
import { saveQuickMood } from '@/app/actions';

interface QuickMoodTrackerProps {
  onSuccess?: () => void;
}

export function QuickMoodTracker({ onSuccess }: QuickMoodTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [moodLevel, setMoodLevel] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const moodLabels: Record<number, string> = {
    1: 'Muito Ruim',
    2: 'Ruim',
    3: 'Neutro',
    4: 'Bom',
    5: 'Muito Bom'
  };

  const energyLabels: Record<number, string> = {
    1: 'Esgotado',
    2: 'Muito Baixa',
    3: 'Baixa',
    4: 'Abaixo da Média',
    5: 'Média',
    6: 'Acima da Média',
    7: 'Boa',
    8: 'Alta',
    9: 'Muito Alta',
    10: 'Totalmente Carregado'
  };

  const getBatteryIcon = (level: number) => {
    if (level <= 2) return <BatteryLow size={20} className="text-rose-500" />;
    if (level <= 4) return <Battery size={20} className="text-orange-400" />;
    if (level <= 7) return <BatteryMedium size={20} className="text-amber-500" />;
    if (level <= 9) return <BatteryFull size={20} className="text-emerald-500" />;
    return <BatteryFull size={20} className="text-emerald-500 animate-pulse" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const result = await saveQuickMood({
        moodLevel,
        energyLevel,
        note,
      });

      if ('success' in result && result.success) {
        setStatus('success');
        setMessage('Registro salvo com sucesso!');
        
        // Reset states
        setNote('');
        setMoodLevel(3);
        setEnergyLevel(5);
        
        // Auto-close after showing success message
        setTimeout(() => {
          setIsExpanded(false);
          setStatus('idle');
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        throw new Error('error' in result ? result.error : 'Erro desconhecido');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Falha ao salvar.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const levels = [1, 2, 3, 4, 5];

  return (
    <motion.div 
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden relative"
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            layoutId="tracker-container"
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                <Zap size={18} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Registro Rápido</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Humor e Energia</p>
              </div>
            </div>
            <div className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Send size={14} />
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            layoutId="tracker-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Como está agora?</h3>
                  <p className="text-xs text-slate-400 font-medium">Micro-Ciclo de Rastreamento</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
              >
                <AlertCircle size={22} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mood Selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humor</span>
                  <motion.span 
                    key={moodLevel}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full"
                  >
                    {moodLabels[moodLevel]}
                  </motion.span>
                </div>
                <div className="flex justify-between gap-2 bg-slate-50/50 p-2 rounded-[24px]">
                  {levels.map((level) => (
                    <button
                      key={`mood-${level}`}
                      type="button"
                      onClick={() => setMoodLevel(level)}
                      className={`flex-1 aspect-square rounded-[18px] flex items-center justify-center transition-all ${
                        moodLevel === level 
                          ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 scale-105 z-10' 
                          : 'text-slate-300 hover:text-slate-400'
                      }`}
                    >
                      <MoodIcon mood={level} size={24} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Selector (Slider) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Energia</span>
                  <motion.div 
                    key={energyLevel}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full"
                  >
                    {getBatteryIcon(energyLevel)}
                    <span className="text-xs font-bold text-amber-600">{energyLevel}/10</span>
                  </motion.div>
                </div>
                
                <div className="bg-slate-50/50 p-6 rounded-[24px] space-y-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    style={{
                      background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(energyLevel-1)*11}%, #e2e8f0 ${(energyLevel-1)*11}%, #e2e8f0 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Esgotado</span>
                    <span className="text-amber-500 font-black">{energyLabels[energyLevel]}</span>
                    <span>Carregado</span>
                  </div>
                </div>
              </div>

              {/* Note Field */}
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Alguma nota rápida?"
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[80px] transition-all resize-none placeholder:text-slate-300"
                />
              </div>

              {/* Submit Button & Status */}
              <div className="pt-2">
                <AnimatePresence mode="wait">
                  {status === 'idle' || status === 'loading' ? (
                    <motion.button
                      key="submit-btn"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-slate-900 text-white py-4 rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-slate-200"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Salvar Registro
                        </>
                      )}
                    </motion.button>
                  ) : status === 'success' ? (
                    <motion.div
                      key="success-msg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500 text-white py-4 rounded-[20px] flex items-center justify-center gap-2 font-bold shadow-lg shadow-emerald-100"
                    >
                      <CheckCircle2 size={18} /> {message}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="error-msg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-rose-500 text-white py-4 rounded-[20px] flex items-center justify-center gap-2 font-bold shadow-lg shadow-rose-100"
                    >
                      <AlertCircle size={18} /> {message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
