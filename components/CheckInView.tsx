'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { MoodIcon } from './MoodIcon';
import { Mood } from '../app/types';
import { saveCheckIn } from '../app/actions';

interface CheckInViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => Promise<void>;
}

const MOTIVATIONAL_MESSAGES = [
  "Incrível! Cuidar de si mesmo é o primeiro passo para o bem-estar.",
  "Check-in concluído! Sua constância é sua maior força.",
  "Parabéns por dedicar um tempo para se ouvir hoje.",
  "Registro salvo! Pequenos passos levam a grandes mudanças.",
  "Você está fazendo um ótimo trabalho acompanhando sua jornada!"
];

export function CheckInView({ setActiveTab, onRefresh }: CheckInViewProps) {
  const [mood, setMood] = useState<number>(3);
  const [pain, setPain] = useState<number>(0);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [dietNotes, setDietNotes] = useState('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [randomMessage] = useState(() => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);

  const handleSave = async () => {
    setIsSaving(true);
    const newCheckIn = {
      date: new Date().toISOString(),
      mood: mood as Mood,
      painLevel: pain,
      sleepHours,
      sleepQuality,
      dietNotes,
      symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
      generalNotes
    };
    
    try {
      await saveCheckIn(newCheckIn);
      await onRefresh();
      setShowSuccess(true);
      // Aguardar 2 segundos para o usuário ver a mensagem de sucesso
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 2500);
    } catch (error) {
      console.error("Erro ao salvar check-in:", error);
      setIsSaving(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="max-w-md mx-auto h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="relative">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4 text-amber-400"
          >
            <Sparkles size={32} />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">Tudo pronto!</h3>
          <p className="text-slate-600 font-medium px-4">
            {randomMessage}
          </p>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              <Star className="text-amber-400 fill-amber-400" size={16} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Check-in Diário</h2>
        <p className="text-slate-500">Como você está se sentindo hoje?</p>
      </header>

      <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-4">Humor Geral</label>
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((m) => (
              <button 
                key={m} 
                onClick={() => setMood(m)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${mood === m ? 'bg-indigo-50 text-indigo-600 scale-110 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <MoodIcon mood={m} size={32} />
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4">
            <label className="block text-sm font-semibold text-slate-700">Nível de Dor</label>
            <span className="text-sm font-medium text-rose-500">{pain} / 10</span>
          </div>
          <input 
            type="range" 
            min="0" max="10" 
            value={pain} 
            onChange={(e) => setPain(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Sem Dor</span>
            <span>Pior Dor Possível</span>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Duração do Sono (hrs)</label>
            <div className="flex items-center gap-3">
              <Moon className="text-slate-400" size={20} />
              <input 
                type="number" 
                step="0.5"
                value={sleepHours} 
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Qualidade do Sono</label>
            <select 
              value={sleepQuality} 
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
            >
              <option value={1}>Muito Ruim</option>
              <option value={2}>Ruim</option>
              <option value={3}>Razoável</option>
              <option value={4}>Boa</option>
              <option value={5}>Excelente</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dieta & Gatilhos</label>
            <textarea 
              placeholder="Ex: tomei 3 cafés, comi fast food..."
              value={dietNotes}
              onChange={(e) => setDietNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sintomas Específicos (separados por vírgula)</label>
            <input 
              type="text"
              placeholder="Dor de cabeça, náusea, fadiga..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </section>

        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar Check-in'}
        </button>
      </div>
    </motion.div>
  );
}
