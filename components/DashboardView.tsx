'use client';

import { motion } from 'motion/react';
import { Activity, Pill, Check, ChevronRight } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { MoodIcon } from './MoodIcon';
import { CheckIn, Medication } from '../app/types';
import { toggleMedLog } from '../app/actions';

interface DashboardViewProps {
  checkIns: CheckIn[];
  medications: Medication[];
  setActiveTab: (tab: string) => void;
  onRefresh: () => Promise<void>;
}

export function DashboardView({ checkIns, medications, setActiveTab, onRefresh }: DashboardViewProps) {
  const today = new Date();
  const todayCheckIn = checkIns.find((c: CheckIn) => isSameDay(parseISO(c.date), today));
  
  const isMedTaken = (medId: string) => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const med = medications.find((m) => m.id === medId);
    return med?.logs?.some((l) => format(new Date(l.date), 'yyyy-MM-dd') === todayStr);
  };

  const handleMedToggle = async (medId: string) => {
    const taken = !isMedTaken(medId);
    await toggleMedLog(medId, taken);
    await onRefresh();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Bom {format(today, 'a') === 'AM' ? 'dia' : 'tarde/noite'}</h2>
        <p className="text-slate-500">{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Activity size={18} className="text-indigo-500"/> Check-in Diário</h3>
            {todayCheckIn ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <Check size={12} /> Concluído
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Pendente</span>
            )}
          </div>
          
          {todayCheckIn ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-sm text-slate-500">Humor</span>
                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                  <MoodIcon mood={todayCheckIn.mood} size={20} />
                  <span>{todayCheckIn.mood}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-sm text-slate-500">Nível de Dor</span>
                <div className="flex items-center gap-2 text-rose-500 font-medium">
                  <Activity size={18} />
                  <span>{todayCheckIn.painLevel}/10</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 mb-4">Você ainda não registrou seus sintomas hoje.</p>
              <button onClick={() => setActiveTab('checkin')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors w-full">
                Registrar Agora
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Pill size={18} className="text-indigo-500"/> Medicamentos</h3>
            <button onClick={() => setActiveTab('meds')} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
              Gerenciar <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-3">
            {medications.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum medicamento adicionado.</p>
            ) : (
              medications.map((med) => {
                const taken = isMedTaken(med.id);
                return (
                  <div key={med.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors cursor-pointer ${taken ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 hover:border-indigo-200'}`} onClick={() => handleMedToggle(med.id)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${taken ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {taken ? <Check size={18} /> : <Pill size={18} />}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${taken ? 'text-emerald-900 line-through opacity-70' : 'text-slate-800'}`}>{med.name}</p>
                        <p className="text-xs text-slate-500">{med.dosage} • {med.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 md:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold text-slate-800">Rastreamento de Comportamento</h3>
              <p className="text-sm text-slate-500">Registre eventos de desregulação, gatilhos ou crises para posterior análise.</p>
            </div>
            <button onClick={() => setActiveTab('behavior')} className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors whitespace-nowrap w-full md:w-auto">
              Novo Evento
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
