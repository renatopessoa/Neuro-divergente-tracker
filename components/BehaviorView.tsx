'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { saveBehaviorLog } from '../app/actions';

interface BehaviorViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => Promise<void>;
}

const COMMON_TRIGGERS = [
  'Barulho alto', 'Multidão', 'Mudança de rotina', 'Falta de sono', 
  'Pressão social', 'Luz intensa', 'Cheiros fortes', 'Fome/Fadiga', 
  'Estresse', 'Sobrecarga sensorial'
];

const COMMON_STRATEGIES = [
  'Respiração profunda', 'Isolamento temporário', 'Música', 
  'Meditação', 'Conversa', 'Mudança de ambiente'
];

export function BehaviorView({ setActiveTab, onRefresh }: BehaviorViewProps) {
  const [eventType, setEventType] = useState('Desregulação');
  const [description, setDescription] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState<number | ''>('');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [customStrategy, setCustomStrategy] = useState('');
  const [notes, setNotes] = useState('');

  const toggleSelection = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustom = (value: string, setter: (v: string) => void, list: string[], setList: (v: string[]) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setter('');
    }
  };

  const handleSave = async () => {
    const newLog = {
      eventType,
      description,
      perceivedTriggers: selectedTriggers,
      intensity,
      durationMinutes: duration === '' ? null : Number(duration),
      copingStrategies: selectedStrategies,
      notes,
    };
    
    await saveBehaviorLog(newLog);
    await onRefresh();
    setActiveTab('dashboard');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Registro de Comportamento</h2>
        <p className="text-slate-500">Acompanhe desregulações, gatilhos e crises para ajudar a identificar padrões.</p>
      </header>

      <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-4">Tipo de Evento</label>
          <div className="flex flex-wrap gap-2">
            {['Desregulação', 'Gatilho', 'Crise'].map((type) => (
              <button
                key={type}
                onClick={() => setEventType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${eventType === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição do Evento</label>
          <textarea 
            placeholder="Descreva o que aconteceu e o contexto..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
          />
        </section>

        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Gatilhos Percebidos</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_TRIGGERS.map((trigger) => (
              <button
                key={trigger}
                onClick={() => toggleSelection(trigger, selectedTriggers, setSelectedTriggers)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${selectedTriggers.includes(trigger) ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {trigger}
              </button>
            ))}
            {selectedTriggers.filter(t => !COMMON_TRIGGERS.includes(t)).map(custom => (
                <button
                key={custom}
                onClick={() => toggleSelection(custom, selectedTriggers, setSelectedTriggers)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-rose-100 border-rose-200 text-rose-700"
              >
                {custom} ✕
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Outro gatilho..."
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom(customTrigger, setCustomTrigger, selectedTriggers, setSelectedTriggers)}
              className="flex-1 p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button 
              onClick={() => handleAddCustom(customTrigger, setCustomTrigger, selectedTriggers, setSelectedTriggers)}
              className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-300 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-sm font-semibold text-slate-700">Intensidade</label>
              <span className="text-sm font-medium text-rose-500">{intensity} / 10</span>
            </div>
            <input 
              type="range" 
              min="0" max="10" 
              value={intensity} 
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Duração (minutos)</label>
            <input 
              type="number" 
              min="0"
              placeholder="Opcional"
              value={duration} 
              onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </section>

        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Estratégias de Regulação Utilizadas</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_STRATEGIES.map((strategy) => (
              <button
                key={strategy}
                onClick={() => toggleSelection(strategy, selectedStrategies, setSelectedStrategies)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${selectedStrategies.includes(strategy) ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {strategy}
              </button>
            ))}
             {selectedStrategies.filter(t => !COMMON_STRATEGIES.includes(t)).map(custom => (
                <button
                key={custom}
                onClick={() => toggleSelection(custom, selectedStrategies, setSelectedStrategies)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-emerald-100 border-emerald-200 text-emerald-700"
              >
                {custom} ✕
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Outra estratégia..."
              value={customStrategy}
              onChange={(e) => setCustomStrategy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom(customStrategy, setCustomStrategy, selectedStrategies, setSelectedStrategies)}
              className="flex-1 p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button 
              onClick={() => handleAddCustom(customStrategy, setCustomStrategy, selectedStrategies, setSelectedStrategies)}
              className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-300 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </section>

        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Notas Adicionais</label>
          <textarea 
            placeholder="Qualquer outra observação importante..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
          />
        </section>

        <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          Salvar Registro
        </button>
      </div>
    </motion.div>
  );
}
