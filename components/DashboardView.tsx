'use client';

import { motion } from 'motion/react';
import { Activity, Pill, Check, ChevronRight, ClipboardList } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { MoodIcon } from './MoodIcon';
import { CheckIn, Medication } from '../app/types';
import { toggleMedLog } from '../app/actions';

interface DashboardViewProps {
  checkIns: CheckIn[];
  medications: Medication[];
  behaviorLogs: any[];
  setActiveTab: (tab: string) => void;
  onRefresh: () => Promise<void>;
}

export function DashboardView({ checkIns, medications, behaviorLogs, setActiveTab, onRefresh }: DashboardViewProps) {
  const today = new Date();
  const todayCheckIn = checkIns.find((c: CheckIn) => isSameDay(parseISO(c.date), today));
  const todayBehaviorLogs = behaviorLogs.filter((b: any) => b.timestamp && isSameDay(new Date(b.timestamp), today));
  
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
        <h2 className="text-2xl font-bold text-text-main">
          {(() => {
            const hour = today.getHours();
            let greeting = 'boa noite';
            if (hour >= 5 && hour < 12) greeting = 'bom dia';
            else if (hour >= 12 && hour < 18) greeting = 'boa tarde';
            return greeting.charAt(0).toUpperCase() + greeting.slice(1);
          })()}
        </h2>
        <p className="text-text-muted">{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-3xl shadow-sm border border-border-subtle">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-text-main flex items-center gap-2"><Activity size={18} className="text-primary-500"/> Check-in Diário</h3>
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
              <div className="flex items-center justify-between p-3 bg-surface-muted rounded-2xl">
                <span className="text-sm text-text-muted">Humor</span>
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <MoodIcon mood={todayCheckIn.mood} size={20} />
                  <span>{todayCheckIn.mood}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-muted rounded-2xl">
                <span className="text-sm text-text-muted">Nível de Dor</span>
                <div className="flex items-center gap-2 text-rose-500 font-medium">
                  <Activity size={18} />
                  <span>{todayCheckIn.painLevel}/10</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-text-muted mb-4">Você ainda não registrou seus sintomas hoje.</p>
              <button onClick={() => setActiveTab('checkin')} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-600 opacity-90 transition-colors w-full">
                Registrar Agora
              </button>
            </div>
          )}
        </div>

        <div className="bg-surface p-6 rounded-3xl shadow-sm border border-border-subtle">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-main flex items-center gap-2"><Pill size={18} className="text-primary-500"/> Medicamentos</h3>
            <button onClick={() => setActiveTab('meds')} className="text-xs font-medium text-primary-600 hover:text-primary-500 flex items-center">
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
                  <div key={med.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors cursor-pointer ${taken ? 'bg-emerald-50 border-emerald-100' : 'bg-surface border-border-subtle hover:border-primary-200'}`} onClick={() => handleMedToggle(med.id)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${taken ? 'bg-emerald-100 text-emerald-600' : 'bg-surface-muted text-text-muted'}`}>
                        {taken ? <Check size={18} /> : <Pill size={18} />}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${taken ? 'text-emerald-900 line-through opacity-70' : 'text-text-main'}`}>{med.name}</p>
                        <p className="text-xs text-text-muted">{med.dosage} • {med.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl shadow-sm border border-border-subtle md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-main flex items-center gap-2"><ClipboardList size={18} className="text-primary-500"/> Eventos de Hoje</h3>
          </div>
          
          <div className="space-y-3">
            {todayBehaviorLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum evento registrado hoje.</p>
            ) : (
              todayBehaviorLogs.map((log: any) => (
                <div key={log.id} className="p-4 rounded-2xl border border-border-subtle bg-surface-muted">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-600 text-xs font-semibold rounded-md mb-1">{log.eventType}</span>
                      <p className="text-sm font-medium text-text-main">{log.description || 'Sem descrição'}</p>
                    </div>
                    <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Intensidade: {log.intensity}/10</span>
                  </div>
                  {(log.perceivedTriggers?.length > 0 || log.copingStrategies?.length > 0) && (
                    <div className="mt-3 text-xs flex flex-col gap-1 text-text-muted">
                      {log.perceivedTriggers?.length > 0 && <p><span className="font-medium text-text-main">Gatilhos:</span> {log.perceivedTriggers.join(', ')}</p>}
                      {log.copingStrategies?.length > 0 && <p><span className="font-medium text-text-main">Estratégias:</span> {log.copingStrategies.join(', ')}</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
