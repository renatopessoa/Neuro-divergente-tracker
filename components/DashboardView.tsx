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
  
  // Pegar os 3 check-ins mais recentes
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

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
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {(() => {
              const hour = today.getHours();
              if (hour >= 5 && hour < 12) return 'Bom dia';
              if (hour >= 12 && hour < 18) return 'Boa tarde';
              return 'Boa noite';
            })()}
          </h2>
          <p className="text-slate-500 font-medium">{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
        </div>
        
        {/* Atalhos de Ação */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('checkin')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Activity size={18} /> Novo Check-in
          </button>
          <button 
            onClick={() => setActiveTab('behavior')}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-2xl text-sm font-semibold shadow-sm hover:bg-rose-600 transition-all active:scale-95"
          >
            <Activity size={18} /> Relatar Crise
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-semibold shadow-sm hover:bg-slate-800 transition-all active:scale-95"
          >
            <ClipboardList size={18} /> Relatórios
          </button>
        </div>
      </header>

      {/* Correção aplicada aqui: Removido lg:grid-cols-3 e mantido o limite de 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-border-subtle">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-text-main flex items-center gap-2"><Activity size={18} className="text-primary-500"/> Hoje</h3>
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
                <div className="flex items-center justify-between p-3 bg-surface-muted rounded-xl">
                  <span className="text-sm text-text-muted">Humor</span>
                  <div className="flex items-center gap-2 text-primary-600 font-medium">
                    <MoodIcon mood={todayCheckIn.mood} size={20} />
                    <span>Nível {todayCheckIn.mood}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-muted rounded-xl">
                  <span className="text-sm text-text-muted">Nível de Dor</span>
                  <div className="flex items-center gap-2 text-rose-500 font-medium">
                    <Activity size={18} />
                    <span>{todayCheckIn.painLevel}/10</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-surface-muted rounded-xl border border-dashed border-border-subtle">
                <p className="text-sm text-text-muted mb-4">Registro pendente.</p>
                <button onClick={() => setActiveTab('checkin')} className="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium text-xs hover:bg-primary-600 opacity-90 transition-colors">
                  Registrar Agora
                </button>
              </div>
            )}
          </div>

          {/* Lista Compacta de Últimos Check-ins */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-border-subtle">
            <h3 className="font-semibold text-text-main mb-4 text-sm flex items-center gap-2">
              <ClipboardList size={16} className="text-text-muted" /> Últimos Check-ins
            </h3>
            <div className="space-y-3">
              {recentCheckIns.length > 0 ? (
                recentCheckIns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-surface-muted rounded-xl border border-border-subtle">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-main">{format(parseISO(c.date), "dd 'de' MMM", { locale: ptBR })}</span>
                      <span className="text-[10px] text-text-muted capitalize">{c.symptoms.slice(0, 2).join(', ') || 'Sem sintomas'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <MoodIcon mood={c.mood} size={14} />
                        <span className="text-xs font-bold text-text-main">{c.mood}</span>
                      </div>
                      <div className="w-px h-4 bg-border-subtle" />
                      <div className="flex items-center gap-1">
                        <Activity size={14} className="text-rose-400" />
                        <span className="text-xs font-bold text-text-main">{c.painLevel}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted text-center py-2 italic">Nenhum histórico disponível.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-sm border border-border-subtle">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-main flex items-center gap-2"><Pill size={18} className="text-primary-500"/> Medicamentos</h3>
            <button onClick={() => setActiveTab('meds')} className="text-xs font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Gerenciar <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-3">
            {medications.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Nenhum medicamento adicionado.</p>
            ) : (
              medications.map((med) => {
                const taken = isMedTaken(med.id);
                return (
                  <div key={med.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${taken ? 'bg-emerald-50 border-emerald-100' : 'bg-surface border-border-subtle hover:border-primary-200'}`} onClick={() => handleMedToggle(med.id)}>
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

        {/* Como o grid acima agora tem 2 colunas, esse elemento com md:col-span-2 vai ocupar 100% da largura, alinhando as bordas */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-border-subtle md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-main flex items-center gap-2"><ClipboardList size={18} className="text-primary-500"/> Registros Prisma de Hoje</h3>
          </div>
          
          <div className="space-y-3">
            {todayBehaviorLogs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Nenhum evento registrado hoje.</p>
            ) : (
              todayBehaviorLogs.map((log: any) => (
                <div key={log.id} className="p-4 rounded-xl border border-border-subtle bg-surface-muted">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-600 text-xs font-semibold rounded-md mb-1">{log.eventType}</span>
                      <p className="text-sm font-medium text-text-main">{log.description || 'Sem descrição'}</p>
                    </div>
                    <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Intensidade: {log.intensity}/10</span>
                  </div>
                  {(log.vulnerabilityFactors?.length > 0 || log.perceivedTriggers?.length > 0 || log.copingStrategies?.length > 0) && (
                    <div className="mt-3 text-xs flex flex-col gap-1 text-text-muted">
                      {log.vulnerabilityFactors?.length > 0 && <p><span className="font-medium text-text-main">Vulnerabilidades:</span> {log.vulnerabilityFactors.join(', ')}</p>}
                      {log.perceivedTriggers?.length > 0 && <p><span className="font-medium text-text-main">Gatilhos Imediatos:</span> {log.perceivedTriggers.join(', ')}</p>}
                      {log.copingStrategies?.length > 0 && <p><span className="font-medium text-text-main">Estratégia (Eficácia {log.efficacy ?? 'N/A'}/5):</span> {log.copingStrategies.join(', ')}</p>}
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