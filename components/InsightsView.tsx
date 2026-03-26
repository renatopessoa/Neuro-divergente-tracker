'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, AlertCircle, MessageSquare, Sparkles } from 'lucide-react';
import { CheckIn } from '../app/types';
import { generateHealthInsights } from '../app/actions';

interface InsightsViewProps {
  checkIns: CheckIn[];
}

export function InsightsView({ checkIns }: InsightsViewProps) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const responseText = await generateHealthInsights(checkIns);
      setInsights(responseText || 'Nenhum insight gerado.');
    } catch (err: any) {
      console.error(err);
      setError('Falha ao gerar insights. Verifique sua chave de API ou tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Análise Prisma com IA</h2>
        <p className="text-slate-500">Transformando dados em clareza e autoconhecimento</p>
      </header>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center text-primary-600 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">Visão do Prisma</h3>
            <p className="text-sm text-slate-500">Nossa IA decompõe seus registros recentes para encontrar padrões invisíveis e sugerir caminhos de regulação.</p>
          </div>
        </div>

        {!insights && !loading && (
          <button onClick={generateInsights} className="w-full bg-indigo-50 text-indigo-700 py-4 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
            <Brain size={18} /> Gerar Insights
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 animate-pulse">Analisando seus dados de saúde...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {insights && !loading && (
          <div className="space-y-6">
            <div className="prose prose-slate prose-sm max-w-none">
              {insights.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-slate-700 leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <button onClick={generateInsights} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
              Atualizar Análise
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex gap-4 items-start">
        <MessageSquare className="text-emerald-600 shrink-0 mt-1" size={24} />
        <div>
           <h4 className="font-semibold text-emerald-900 mb-1">Apoio à Saúde Mental</h4>
           <p className="text-sm text-emerald-800 leading-relaxed">
             Lembre-se de que esses insights são para acompanhamento e autoconhecimento. Eles não substituem o aconselhamento médico profissional. Se você estiver se sentindo sobrecarregado, procure um profissional de saúde.
           </p>
        </div>
      </div>
    </motion.div>
  );
}
