'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Moon } from 'lucide-react';
import { MoodIcon } from './MoodIcon';
import { Mood } from '../app/types';
import { saveCheckIn } from '../app/actions';

interface CheckInViewProps {
  setActiveTab: (tab: string) => void;
}

export function CheckInView({ setActiveTab }: CheckInViewProps) {
  const [mood, setMood] = useState<number>(3);
  const [pain, setPain] = useState<number>(0);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [dietNotes, setDietNotes] = useState('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState('');

  const handleSave = async () => {
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
    
    await saveCheckIn(newCheckIn);
    setActiveTab('dashboard');
    window.location.reload();
  };

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

        <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          Salvar Check-in
        </button>
      </div>
    </motion.div>
  );
}
