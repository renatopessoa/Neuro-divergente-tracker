'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  AlertCircle, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  RefreshCcw 
} from 'lucide-react';
import { CheckIn } from '../app/types';
import { generateHealthInsights } from '../app/actions';

interface InsightSection {
  title: string;
  content: string;
  type: 'trend' | 'triggers' | 'regulation' | 'communication' | 'prevention';
}

interface InsightsViewProps {
  checkIns: CheckIn[];
}

// Helper para definir estilos e ícones por categoria
const getSectionStyle = (type: string) => {
  switch (type) {
    case 'trend': 
      return { icon: <TrendingUp size={20} />, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-900', iconColor: 'text-blue-600' };
    case 'triggers': 
      return { icon: <Zap size={20} />, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-900', iconColor: 'text-amber-600' };
    case 'regulation': 
      return { icon: <ShieldCheck size={20} />, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', iconColor: 'text-emerald-600' };
    case 'communication': 
      return { icon: <MessageSquare size={20} />, bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-900', iconColor: 'text-purple-600' };
    case 'prevention': 
      return { icon: <AlertCircle size={20} />, bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-900', iconColor: 'text-rose-600' };
    default: 
      return { icon: <Sparkles size={20} />, bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-900', iconColor: 'text-slate-600' };
  }
};

export function InsightsView({ checkIns }: InsightsViewProps) {
  const [insights, setInsights] = useState<InsightSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInsights = async () => {
    setLoading(true);
    setError('');
    try {
      // Espera um array de objetos JSON vindo da Server Action
      const response = await generateHealthInsights(checkIns);
      setInsights(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao gerar insights. Verifique sua chave de API ou o formato de resposta da IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-3xl mx-auto space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Análise Prisma com IA</h2>
          <p className="text-slate-500">Transformando dados em clareza e autoconhecimento</p>
        </div>
        {insights.length > 0 && !loading && (
          <button 
            onClick={generateInsights} 
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <RefreshCcw size={16} /> Atualizar
          </button>
        )}
      </header>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
            <Brain size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">Visão do Prisma</h3>
            <p className="text-sm text-slate-500">Nossa IA decompõe seus registros para encontrar padrões e sugerir caminhos de regulação específicos para você.</p>
          </div>
        </div>

        {/* Estado Inicial */}
        {insights.length === 0 && !loading && (
          <div className="text-center py-8">
            <button 
              onClick={generateInsights} 
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles size={18} /> Gerar Nova Análise
            </button>
            <p className="mt-4 text-xs text-slate-400">Isso pode levar alguns segundos enquanto processamos seus registros.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-600 animate-pulse">Consultando o Prisma...</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm flex items-start gap-3 border border-rose-100">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Lista de Insights (Cards) */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {insights.length > 0 && !loading && insights.map((section, index) => {
              const style = getSectionStyle(section.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-2xl border ${style.border} ${style.bg} transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${style.iconColor}`}>
                      {style.icon}
                    </div>
                    <h4 className={`font-bold ${style.text}`}>{section.title}</h4>
                  </div>
                  <div className={`text-sm md:text-base leading-relaxed ${style.text} opacity-80 whitespace-pre-wrap`}>
                    {section.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Aviso Legal Fixo */}
      <footer className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4 items-start">
        <ShieldCheck className="text-slate-400 shrink-0 mt-1" size={24} />
        <div>
           <h4 className="font-semibold text-slate-700 mb-1 text-sm">Aviso de Segurança Terapêutica</h4>
           <p className="text-xs text-slate-500 leading-relaxed">
             Estes insights são automáticos e baseados em dados de auto-relato. Eles servem como ferramenta de apoio ao autoconhecimento e não substituem diagnósticos médicos ou intervenções clínicas profissionais.
           </p>
        </div>
      </footer>
    </motion.div>
  );
}