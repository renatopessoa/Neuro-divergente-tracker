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
import { CheckIn } from '../app/types';

interface ReportsViewProps {
  checkIns: CheckIn[];
}

export function ReportsView({ checkIns }: ReportsViewProps) {
  const sortedData = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-14);
  
  const chartData = sortedData.map(c => ({
    date: format(parseISO(c.date), "dd 'de' MMM", { locale: ptBR }),
    pain: c.painLevel,
    mood: c.mood,
    sleep: c.sleepHours
  }));

  const averagePain = (chartData.reduce((acc, curr) => acc + curr.pain, 0) / chartData.length) || 0;
  const averageSleep = (chartData.reduce((acc, curr) => acc + curr.sleep, 0) / chartData.length) || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Relatórios de Saúde</h2>
          <p className="text-slate-500">Visão Geral de 14 Dias para o seu Médico</p>
        </div>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg">
          Exportar PDF
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-6">Tendências de Dor vs Humor</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 10]} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[1, 5]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="pain" name="Dor (0-10)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="mood" name="Humor (1-5)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-6">Duração do Sono</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 12]} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sleep" name="Sono (hrs)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg">
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
            <p className="text-xl font-medium mt-2">Dor de cabeça</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
