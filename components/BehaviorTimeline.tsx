'use client';

import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Clock, MapPin, Users, Brain, Activity, HeartHandshake, AlertTriangle, MessageSquare, Info } from 'lucide-react';
import { BehaviorLog } from '../app/types';

interface BehaviorTimelineProps {
  behaviorLogs: BehaviorLog[];
}

export function BehaviorTimeline({ behaviorLogs }: BehaviorTimelineProps) {
  if (!behaviorLogs || behaviorLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <Info className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Nenhum evento registrado</h3>
        <p className="text-slate-500 max-w-xs mt-2">Os eventos de comportamento e crises aparecerão aqui em uma linha do tempo detalhada.</p>
      </div>
    );
  }

  const sortedLogs = [...behaviorLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (intensity <= 6) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'crise (meltdown)': return <AlertTriangle size={18} className="text-rose-500" />;
      case 'desligamento (shutdown)': return <Clock size={18} className="text-slate-500" />;
      case 'desregulação': return <Activity size={18} className="text-amber-500" />;
      default: return <Activity size={18} className="text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Linha do Tempo de Eventos</h2>
        <p className="text-slate-500">Rastreamento detalhado de desregulações e crises</p>
      </header>

      <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-10">
        {sortedLogs.map((log, index) => (
          <motion.div 
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
              log.intensity > 7 ? 'bg-rose-500' : log.intensity > 4 ? 'bg-amber-500' : 'bg-indigo-500'
            }`} />

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Header: Date and Event Type */}
              <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    {getEventTypeIcon(log.eventType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 capitalize">{log.eventType}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {format(new Date(log.timestamp), "eeee, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getIntensityColor(log.intensity)}`}>
                  Intensidade {log.intensity}/10
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Description */}
                {log.description && (
                  <div className="text-slate-700 text-sm leading-relaxed bg-slate-50/50 p-4 rounded-2xl italic">
                    "{log.description}"
                  </div>
                )}

                {/* Context Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="text-slate-400 mt-0.5" size={16} />
                      <span className="text-slate-600"><strong>Local:</strong> {log.location || 'Não informado'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Users className="text-slate-400 mt-0.5" size={16} />
                      <span className="text-slate-600"><strong>Presentes:</strong> {log.peoplePresent || 'Ninguém'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Brain className="text-slate-400 mt-0.5" size={16} />
                      <span className="text-slate-600"><strong>Alerta Prévio:</strong> {log.preCrisisArousal || 'N/A'}/10</span>
                    </div>
                    {log.durationMinutes && (
                      <div className="flex items-start gap-2 text-sm">
                        <Clock className="text-slate-400 mt-0.5" size={16} />
                        <span className="text-slate-600"><strong>Duração:</strong> {log.durationMinutes} minutos</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges Section */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  {/* Triggers */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Brain size={12} /> Gatilhos e Vulnerabilidades
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {log.vulnerabilityFactors.map((v, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          {v}
                        </span>
                      ))}
                      {log.perceivedTriggers.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-100">
                          {t}
                        </span>
                      ))}
                      {log.sensorOverloadTypes.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strategies */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <HeartHandshake size={12} /> Estratégias e Manejo
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {log.copingStrategies.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-100">
                          {s}
                        </span>
                      ))}
                      {log.efficacy && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-white">
                          Eficácia: {log.efficacy}/5
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Neurotypical Translation */}
                {log.neurotypicalTranslation && (
                  <div className="pt-4 border-t border-slate-50">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MessageSquare size={12} /> Tradução Simultânea (Neurotípica)
                    </h4>
                    <p className="text-sm text-indigo-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 leading-relaxed">
                      {log.neurotypicalTranslation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
