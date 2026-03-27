'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { saveBehaviorLog } from '../app/actions';
import { 
  Plus, 
  History, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Clock, 
  MapPin, 
  Users, 
  Brain, 
  Activity, 
  HeartHandshake, 
  FileText,
  AlertCircle,
  TrendingUp,
  Search
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { BehaviorLog } from '../app/types';

interface BehaviorViewProps {
  behaviorLogs: BehaviorLog[];
  setActiveTab: (tab: string) => void;
  onRefresh: () => Promise<void>;
}

const COMMON_VULNERABILITIES = ['Fome', 'Sede', 'Cansaço', 'Calor', 'Frio', 'Sono inadequado', 'Fadiga', 'Dor/Desconforto físico', 'Excesso de demandas prévias'];
const COMMON_TRIGGERS = ['Barulho alto', 'Multidão/Aglomeração', 'Mudança na rotina', 'Receber um "Não"', 'Transição de atividade', 'Luz intensa', 'Cheiros fortes', 'Sobrecarga sensorial'];
const COMMON_STRATEGIES = ['Respiração profunda', 'Isolamento temporário', 'Abafo de ruído', 'Redirecionamento de atenção', 'Pressão profunda', 'Música', 'Contagem'];
const SENSORY_OVERLOAD_TYPES = ['Sobrecarga Visual', 'Sobrecarga Auditiva', 'Sobrecarga Tátil', 'Sobrecarga Olfativa', 'Sobrecarga Proprioceptiva', 'Sobrecarga Vestibular', 'Sobrecarga Gustativa', 'Misofonia', 'Interocepção'];
const EXECUTIVE_FUNCTION_IMPACTS = ['Iniciação de tarefas', 'Memória de trabalho', 'Foco/Atenção', 'Organização', 'Planejamento', 'Flexibilidade mental'];

export function BehaviorView({ behaviorLogs, setActiveTab, onRefresh }: BehaviorViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'add'>('timeline');
  const [filterType, setFilterType] = useState<string>('all');
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // ... (rest of form state remains the same)
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState('');
  const [peoplePresent, setPeoplePresent] = useState('');
  const [preCrisisArousal, setPreCrisisArousal] = useState(5);
  const [vulnerabilityFactors, setVulnerabilityFactors] = useState<string[]>([]);
  const [customVulnerability, setCustomVulnerability] = useState('');
  const [perceivedTriggers, setPerceivedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [sensorOverloadTypes, setSensorOverloadTypes] = useState<string[]>([]);
  const [eventType, setEventType] = useState('Desregulação');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState<number | ''>('');
  const [copingStrategies, setCopingStrategies] = useState<string[]>([]);
  const [customStrategy, setCustomStrategy] = useState('');
  const [efficacy, setEfficacy] = useState(3);
  const [environmentReaction, setEnvironmentReaction] = useState('');
  const [neurotypicalTranslation, setNeurotypicalTranslation] = useState('');
  const [warningSigns, setWarningSigns] = useState('');
  const [postCrisisState, setPostCrisisState] = useState('');
  const [notes, setNotes] = useState('');
  const [executiveFunctionImpact, setExecutiveFunctionImpact] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Timeline Filtering logic
  const filteredLogs = behaviorLogs.filter(log => {
    if (filterType === 'all') return true;
    if (filterType === 'sensory') return log.sensorOverloadTypes.length > 0;
    if (filterType === 'executive') return log.executiveFunctionImpact.length > 0;
    return log.eventType === filterType;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // ... (getIntensityColors and other helpers remain the same)

  const getIntensityColors = (intensity: number) => {
    if (intensity <= 3) return { 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200', 
      text: 'text-emerald-700',
      accent: 'bg-emerald-500',
      tag: 'bg-emerald-100 text-emerald-800'
    };
    if (intensity <= 6) return { 
      bg: 'bg-amber-50', 
      border: 'border-amber-200', 
      text: 'text-amber-700',
      accent: 'bg-amber-500',
      tag: 'bg-amber-100 text-amber-800'
    };
    return { 
      bg: 'bg-rose-50', 
      border: 'border-rose-200', 
      text: 'text-rose-700',
      accent: 'bg-rose-500',
      tag: 'bg-rose-100 text-rose-800'
    };
  };

  const toggleSelection = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleAddCustom = (value: string, setter: (v: string) => void, list: string[], setList: (v: string[]) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setter('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newLog = {
      timestamp: new Date(timestamp),
      location,
      peoplePresent,
      preCrisisArousal,
      vulnerabilityFactors,
      perceivedTriggers,
      sensorOverloadTypes,
      eventType,
      description,
      intensity,
      durationMinutes: duration === '' ? null : Number(duration),
      copingStrategies,
      efficacy,
      environmentReaction,
      neurotypicalTranslation,
      executiveFunctionImpact,
      warningSigns,
      postCrisisState,
      notes,
    };

    try {
      const response = await saveBehaviorLog(newLog);
      if (response && 'error' in response) {
        alert(`Erro: ${response.error}`);
        setIsSaving(false);
        return;
      }
      await onRefresh();
      setIsSaving(false);
      setViewMode('timeline');
      setStep(1);
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Eventos e Comportamento</h2>
          <p className="text-slate-500">Acompanhamento detalhado de desregulações e padrões.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button 
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'timeline' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <History size={18} /> Linha do Tempo
          </button>
          <button 
            onClick={() => setViewMode('add')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'add' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Plus size={18} /> Novo Registro
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {viewMode === 'timeline' ? (
          <motion.div 
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters UI */}
            <div className="flex flex-wrap gap-2 py-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Todos os Eventos', icon: <History size={14} /> },
                { id: 'sensory', label: 'Sobrecarga Sensorial', icon: <AlertCircle size={14} /> },
                { id: 'executive', label: 'Crises Executivas', icon: <TrendingUp size={14} /> },
                { id: 'Crise (Meltdown)', label: 'Meltdown', icon: <Activity size={14} /> },
                { id: 'Desligamento (Shutdown)', label: 'Shutdown', icon: <Clock size={14} /> },
                { id: 'Desregulação', label: 'Desregulação', icon: <Activity size={14} /> },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                    filterType === f.id 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            {sortedLogs.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-12 py-4">
                {sortedLogs.map((log, index) => {
                  const colors = getIntensityColors(log.intensity);
                  return (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white shadow-sm ${colors.accent}`} />

                      <div className={`bg-white rounded-3xl border ${colors.border} shadow-sm overflow-hidden hover:shadow-md transition-all duration-300`}>
                        {/* Intensity-colored Top Bar */}
                        <div className={`h-2 ${colors.accent}`} />
                        
                        <div className="p-6">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`${colors.bg} p-2.5 rounded-2xl`}>
                                <Activity size={20} className={colors.text} />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-lg">{log.eventType}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock size={12} /> {format(parseISO(log.timestamp), "eeee, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                              Intensidade {log.intensity}/10
                            </div>
                          </div>

                          {log.description && (
                            <p className="text-slate-700 text-sm leading-relaxed mb-6 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                              {log.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Nenhum evento registrado</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">Comece a registrar desregulações ou crises para entender melhor seus padrões.</p>
                <button 
                  onClick={() => setViewMode('add')}
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors inline-flex items-center gap-2 shadow-lg shadow-primary-200"
                >
                  <Plus size={20} /> Novo Registro
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="add"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Form Steps Indicator */}
            <div className="flex gap-2 max-w-sm mx-auto mb-8">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`h-2 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary-600' : 'bg-slate-200'}`} />
              ))}
            </div>

            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 relative">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-50 p-2 rounded-xl"><Clock className="text-primary-600" size={24} /></div>
                      <h3 className="text-xl font-bold text-slate-800">1. Contexto</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Data e Hora</label>
                        <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                      </section>
                      <section>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Local / Atividade</label>
                        <input type="text" placeholder="Ex: Escola, Trabalho, Shopping" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                      </section>
                    </div>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Pessoas Presentes</label>
                      <input type="text" placeholder="Ex: Família, Colegas, Sozinho" value={peoplePresent} onChange={(e) => setPeoplePresent(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    </section>

                    <section>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-bold text-slate-700">Estado de Alerta Prévio</label>
                        <span className="text-primary-600 font-bold px-3 py-1 bg-primary-50 rounded-lg">{preCrisisArousal}/10</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">Como você se sentia antes do evento começar? (1: Letárgico, 10: Hiperativo)</p>
                      <input type="range" min="1" max="10" value={preCrisisArousal} onChange={(e) => setPreCrisisArousal(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                    </section>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-50 p-2 rounded-xl"><Brain className="text-amber-600" size={24} /></div>
                      <h3 className="text-xl font-bold text-slate-800">2. Gatilhos</h3>
                    </div>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Vulnerabilidades do Dia</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {COMMON_VULNERABILITIES.map(v => (
                          <button key={v} onClick={() => toggleSelection(v, vulnerabilityFactors, setVulnerabilityFactors)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${vulnerabilityFactors.includes(v) ? 'bg-amber-500 border-amber-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{v}</button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Gatilhos Imediatos</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {COMMON_TRIGGERS.map(t => (
                          <button key={t} onClick={() => toggleSelection(t, perceivedTriggers, setPerceivedTriggers)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${perceivedTriggers.includes(t) ? 'bg-rose-500 border-rose-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{t}</button>
                        ))}
                      </div>
                    </section>
                    
                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sobrecarga Sensorial</label>
                      <div className="flex flex-wrap gap-2">
                        {SENSORY_OVERLOAD_TYPES.map(s => (
                          <button key={s} onClick={() => toggleSelection(s, sensorOverloadTypes, setSensorOverloadTypes)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${sensorOverloadTypes.includes(s) ? 'bg-purple-500 border-purple-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{s}</button>
                        ))}
                      </div>
                    </section>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-50 p-2 rounded-xl"><Activity className="text-rose-600" size={24} /></div>
                      <h3 className="text-xl font-bold text-slate-800">3. Comportamento</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Classificação</label>
                        <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none">
                          <option value="Desregulação">Desregulação / Agitação</option>
                          <option value="Crise (Meltdown)">Crise (Meltdown)</option>
                          <option value="Desligamento (Shutdown)">Desligamento (Shutdown)</option>
                          <option value="Agressão/Autoagressão">Agressão / Autoagressão</option>
                        </select>
                      </section>
                      <section>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Intensidade: {intensity}/10</label>
                        <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600" />
                      </section>
                    </div>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Descrição da Ação</label>
                      <textarea placeholder="O que aconteceu exatamente?" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[120px]" />
                    </section>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-sky-50 p-2 rounded-xl"><HeartHandshake className="text-sky-600" size={24} /></div>
                      <h3 className="text-xl font-bold text-slate-800">4. Manejo</h3>
                    </div>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Estratégias Adotadas</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {COMMON_STRATEGIES.map(s => (
                          <button key={s} onClick={() => toggleSelection(s, copingStrategies, setCopingStrategies)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${copingStrategies.includes(s) ? 'bg-sky-500 border-sky-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{s}</button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-4">Eficácia: {efficacy}/5</label>
                      <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button key={v} onClick={() => setEfficacy(v)} className={`flex-1 py-4 rounded-xl font-bold transition-all border ${efficacy === v ? 'bg-sky-600 border-sky-700 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>{v}</button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tradução Neurotípica</label>
                      <p className="text-xs text-slate-500 mb-4">Como explicar este evento para quem não conhece seu funcionamento?</p>
                      <textarea placeholder="Ex: Precisei de um tempo sozinho para processar o barulho..." value={neurotypicalTranslation} onChange={(e) => setNeurotypicalTranslation(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[100px]" />
                    </section>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-50 p-2 rounded-xl"><FileText className="text-emerald-600" size={24} /></div>
                      <h3 className="text-xl font-bold text-slate-800">5. Conclusão</h3>
                    </div>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Impacto em Funções Executivas</label>
                      <div className="flex flex-wrap gap-2">
                        {EXECUTIVE_FUNCTION_IMPACTS.map(i => (
                          <button key={i} onClick={() => toggleSelection(i, executiveFunctionImpact, setExecutiveFunctionImpact)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${executiveFunctionImpact.includes(i) ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{i}</button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Anotações Finais</label>
                      <textarea placeholder="Mais alguma observação importante?" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[120px]" />
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => step > 1 ? setStep(step - 1) : setViewMode('timeline')}
                  className="flex items-center gap-2 px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowLeft size={20} /> Voltar
                </button>

                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Avançar <ArrowRight size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : 'Finalizar Registro'} <Save size={20} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClipboardList({ className, size }: { className?: string, size?: number }) {
  return <FileText className={className} size={size} />;
}
