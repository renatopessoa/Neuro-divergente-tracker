'use client';

import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { CheckIn, BehaviorLog } from '../app/types';
import { BehaviorTimeline } from './BehaviorTimeline';

interface ReportsViewProps {
  checkIns: CheckIn[];
  behaviorLogs: BehaviorLog[];
}

export function ReportsView({ checkIns, behaviorLogs }: ReportsViewProps) {
  const sortedData = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-14);
  
  const chartData = sortedData.map(c => ({
    date: format(parseISO(c.date), "dd 'de' MMM", { locale: ptBR }),
    pain: c.painLevel,
    mood: c.mood,
    sleep: c.sleepHours
  }));

  const averagePain = (chartData.reduce((acc, curr) => acc + curr.pain, 0) / chartData.length) || 0;
  const averageSleep = (chartData.reduce((acc, curr) => acc + curr.sleep, 0) / chartData.length) || 0;

  // Calcula o sintoma mais comum
  const symptomCounts: Record<string, number> = {};
  checkIns.forEach(c => {
    c.symptoms.forEach(s => {
      if (s) {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      }
    });
  });

  const mostCommonSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum sintoma';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Relatórios de Saúde</h2>
          <p className="text-slate-500">Visão Geral de 14 Dias para o seu Médico</p>
        </div>
        <button onClick={() => window.print()} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg">
          Exportar PDF
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:break-inside-avoid">
          <h3 className="font-semibold text-slate-800 mb-6">Evolução de Humor e Sono</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[1, 5]} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 12]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="mood" name="Humor (1-5)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="sleep" name="Sono (hrs)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:break-inside-avoid">
          <h3 className="font-semibold text-slate-800 mb-6">Nível de Dor</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 10]} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="pain" name="Dor (0-10)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:break-inside-avoid">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800">Histórico Completo de Check-ins</h3>
          <p className="text-sm text-slate-500">Detalhamento de todos os registros realizados</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Humor/Dor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sintomas</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Anotações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {format(parseISO(c.date), "dd 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="text-xs text-slate-400">
                      {format(parseISO(c.date), "yyyy")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mr-2">
                      H: {c.mood}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700">
                      D: {c.painLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {c.symptoms.length > 0 ? (
                        c.symptoms.map((s, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sem sintomas</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 line-clamp-2 max-w-xs" title={c.generalNotes || ''}>
                      {c.generalNotes || <span className="text-slate-400 italic">Nenhuma anotação</span>}
                    </p>
                  </td>
                </tr>
              ))}
              {checkIns.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                    Nenhum check-in registrado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="print:break-inside-avoid">
        <BehaviorTimeline behaviorLogs={behaviorLogs} />
      </div>

      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg print:break-inside-avoid">
        <h3 className="font-semibold text-slate-200 mb-6">Resumo de 14 Dias</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Nível Médio de Dor</p>
            <p className="text-3xl font-light">{averagePain.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Média de Sono</p>
            <p className="text-3xl font-light">{averageSleep.toFixed(1)}<span className="text-lg text-slate-500">h</span></p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Registros</p>
            <p className="text-3xl font-light">{chartData.length}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Sintoma Mais Comum</p>
            <p className="text-xl font-medium mt-2 capitalize">{mostCommonSymptom}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
