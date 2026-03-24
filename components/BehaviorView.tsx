'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { saveBehaviorLog } from '../app/actions';
import { ArrowLeft, ArrowRight, Save, Clock, MapPin, Users, Brain, Activity, HeartHandshake, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface BehaviorViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => Promise<void>;
}

const COMMON_VULNERABILITIES = ['Fome', 'Sede', 'Sono inadequado', 'Fadiga', 'Dor/Desconforto físico', 'Excesso de demandas prévias'];
const COMMON_TRIGGERS = ['Barulho alto', 'Multidão/Aglomeração', 'Mudança na rotina', 'Receber um "Não"', 'Transição de atividade', 'Luz intensa', 'Cheiros fortes', 'Sobrecarga sensorial'];
const COMMON_STRATEGIES = ['Respiração profunda', 'Isolamento temporário', 'Abafo de ruído', 'Redirecionamento de atenção', 'Pressão profunda', 'Música', 'Contagem'];
const SENSORY_OVERLOAD_TYPES = ['Visual', 'Auditiva', 'Tátil', 'Olfativa', 'Proprioceptiva', 'Vestibular', 'Gustativa'];
const EXECUTIVE_FUNCTION_IMPACTS = ['Iniciação de tarefas', 'Memória de trabalho', 'Foco/Atenção', 'Organização', 'Planejamento', 'Flexibilidade mental'];

export function BehaviorView({ setActiveTab, onRefresh }: BehaviorViewProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // 1. Contexto
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState('');
  const [peoplePresent, setPeoplePresent] = useState('');
  const [preCrisisArousal, setPreCrisisArousal] = useState(5);

  // 2. Antecedentes
  const [vulnerabilityFactors, setVulnerabilityFactors] = useState<string[]>([]);
  const [customVulnerability, setCustomVulnerability] = useState('');
  const [perceivedTriggers, setPerceivedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [sensorOverloadTypes, setSensorOverloadTypes] = useState<string[]>([]);

  // 3. Comportamento
  const [eventType, setEventType] = useState('Desregulação');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState<number | ''>('');

  // 4. Consequência
  const [copingStrategies, setCopingStrategies] = useState<string[]>([]);
  const [customStrategy, setCustomStrategy] = useState('');
  const [efficacy, setEfficacy] = useState(3);
  const [environmentReaction, setEnvironmentReaction] = useState('');
  const [neurotypicalTranslation, setNeurotypicalTranslation] = useState('');

  // 5. Pós-Crise e Notas
  const [warningSigns, setWarningSigns] = useState('');
  const [postCrisisState, setPostCrisisState] = useState('');
  const [notes, setNotes] = useState('');
  const [executiveFunctionImpact, setExecutiveFunctionImpact] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  // Helper Utils
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
        console.error("Erro no Servidor:", response.error);
        alert(`Erro ao salvar: ${response.error}\nCódigo: ${response.code || 'N/A'}`);
        setIsSaving(false);
        return;
      }

      await onRefresh();
      setIsSaving(false);
      setActiveTab('dashboard');
    } catch (error: any) {
      console.error("Erro no Cliente:", error);
      alert("Erro crítico na aplicação: " + (error.message || "Erro desconhecido"));
      setIsSaving(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2 w-full max-w-sm mx-auto">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`h-2 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary-500' : 'bg-surface-muted border border-border-subtle'}`} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-main mb-2">Registro de Evento</h2>
        <p className="text-text-muted text-sm">Registre contexto, antecedentes e consequências para identificar padrões.</p>
      </header>

      {renderStepIndicator()}

      <div className="bg-surface p-6 md:p-8 rounded-3xl shadow-sm border border-border-subtle overflow-hidden relative">
        <AnimatePresence mode="wait">

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-4"><Clock className="text-primary-500" size={20} /> 1. Contexto</h3>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Data e Hora exata</label>
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2 flex items-center gap-1"><MapPin size={16} /> Local e Atividade</label>
                <input
                  type="text"
                  placeholder=""
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2 flex items-center gap-1"><Users size={16} /> Pessoas Presentes</label>
                <input
                  type="text"
                  placeholder=""
                  value={peoplePresent}
                  onChange={(e) => setPeoplePresent(e.target.value)}
                  className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Nível de Alerta Pré-Evento: {preCrisisArousal}/10</label>
                <p className="text-xs text-text-muted mb-3">Como você estava antes do evento? (1=Muito letárgico, 10=Muito hiperativo)</p>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={preCrisisArousal} 
                  onChange={(e) => setPreCrisisArousal(parseInt(e.target.value))} 
                  className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary-500" 
                />
              </section>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-4"><Brain className="text-primary-500" size={20} /> 2. Antecedentes (Gatilhos)</h3>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Fatores de Vulnerabilidade (Fundo)</label>
                <p className="text-xs text-text-muted mb-3">Condições internas que baixam a tolerância no dia de hoje.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_VULNERABILITIES.map((vul) => (
                    <button type="button" key={vul} onClick={() => toggleSelection(vul, vulnerabilityFactors, setVulnerabilityFactors)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${vulnerabilityFactors.includes(vul) ? 'bg-amber-500 border-amber-600 text-white' : 'bg-surface-muted border-border-subtle text-text-muted hover:bg-border-subtle'}`}>
                      {vul}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Outra vulnerabilidade..." value={customVulnerability} onChange={(e) => setCustomVulnerability(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCustom(customVulnerability, setCustomVulnerability, vulnerabilityFactors, setVulnerabilityFactors)} className="flex-1 p-2 text-sm bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                  <button type="button" onClick={() => handleAddCustom(customVulnerability, setCustomVulnerability, vulnerabilityFactors, setVulnerabilityFactors)} className="px-4 py-2 bg-surface-muted text-text-main border border-border-subtle text-sm font-medium rounded-xl hover:bg-border-subtle transition-colors">Add</button>
                </div>
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2 mt-6">Gatilhos Imediatos (Fator Externo)</label>
                <p className="text-xs text-text-muted mb-3">O evento exato que iniciou a desregulação.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_TRIGGERS.map((trigger) => (
                    <button type="button" key={trigger} onClick={() => toggleSelection(trigger, perceivedTriggers, setPerceivedTriggers)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${perceivedTriggers.includes(trigger) ? 'bg-rose-500 border-rose-600 text-white' : 'bg-surface-muted border-border-subtle text-text-muted hover:bg-border-subtle'}`}>
                      {trigger}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Outro gatilho..." value={customTrigger} onChange={(e) => setCustomTrigger(e.target.value)} onKeyDown={(e) => { e.preventDefault(); e.key === 'Enter' && handleAddCustom(customTrigger, setCustomTrigger, perceivedTriggers, setPerceivedTriggers) }} className="flex-1 p-2 text-sm bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                  <button type="button" onClick={() => handleAddCustom(customTrigger, setCustomTrigger, perceivedTriggers, setPerceivedTriggers)} className="px-4 py-2 bg-surface-muted text-text-main border border-border-subtle text-sm font-medium rounded-xl hover:bg-border-subtle transition-colors">Add</button>
                </div>
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2 mt-6">Tipo de Sobrecarga Sensorial</label>
                <p className="text-xs text-text-muted mb-3">Qual tipo de sensação foi predominante?</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {SENSORY_OVERLOAD_TYPES.map((type) => (
                    <button 
                      type="button" 
                      key={type} 
                      onClick={() => toggleSelection(type, sensorOverloadTypes, setSensorOverloadTypes)} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        sensorOverloadTypes.includes(type) 
                          ? 'bg-purple-500 border-purple-600 text-white' 
                          : 'bg-surface-muted border-border-subtle text-text-muted hover:bg-border-subtle'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-4"><Activity className="text-primary-500" size={20} /> 3. Comportamento (A Crise)</h3>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Classificação do Evento</label>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none">
                  <option value="Desregulação">Desregulação / Agitação</option>
                  <option value="Crise (Meltdown)">Crise Externa (Meltdown)</option>
                  <option value="Desligamento (Shutdown)">Desligamento (Shutdown)</option>
                  <option value="Agressão/Autoagressão">Agressão / Autoagressão</option>
                  <option value="Fuga/Esquiva">Fuga / Esquiva</option>
                </select>
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Descrição Exata da Ação</label>
                <p className="text-xs text-text-muted mb-3">Foque apenas no que foi observado visualmente e auditivamente (Ex: "Gritou e atirou o objeto").</p>
                <textarea placeholder="O que a pessoa fez efetivamente?" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[80px]" />
              </section>

              <div className="grid grid-cols-2 gap-4">
                <section>
                  <label className="block text-sm font-semibold text-text-muted mb-2 focus:ring-primary-500">Intensidade: {intensity}/10</label>
                  <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-rose-500" />
                </section>
                <section>
                  <label className="block text-sm font-semibold text-text-muted mb-2">Duração (Minutos)</label>
                  <input type="number" min="0" placeholder="Ex: 5" value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full p-2 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </section>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-4"><HeartHandshake className="text-primary-500" size={20} /> 4. Consequência (Reação)</h3>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Estratégias de Manejo Adotadas</label>
                <p className="text-xs text-text-muted mb-3">O que você/cuidador fez quando a crise iniciou?</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_STRATEGIES.map((strategy) => (
                    <button type="button" key={strategy} onClick={() => toggleSelection(strategy, copingStrategies, setCopingStrategies)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${copingStrategies.includes(strategy) ? 'bg-sky-500 border-sky-600 text-white' : 'bg-surface-muted border-border-subtle text-text-muted hover:bg-border-subtle'}`}>
                      {strategy}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Outra estratégia..." value={customStrategy} onChange={(e) => setCustomStrategy(e.target.value)} onKeyDown={(e) => { e.preventDefault(); e.key === 'Enter' && handleAddCustom(customStrategy, setCustomStrategy, copingStrategies, setCopingStrategies) }} className="flex-1 p-2 text-sm bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                  <button type="button" onClick={() => handleAddCustom(customStrategy, setCustomStrategy, copingStrategies, setCopingStrategies)} className="px-4 py-2 bg-surface-muted border border-border-subtle text-text-main text-sm font-medium rounded-xl hover:bg-border-subtle transition-colors">Add</button>
                </div>
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Eficácia da Estratégia Adotada</label>
                <div className="flex flex-col gap-2">
                  {[
                    { val: 1, label: '1 - Piorou a crise severamente' },
                    { val: 2, label: '2 - Não ajudou e escalou levemente' },
                    { val: 3, label: '3 - Neutro / Nenhum efeito imediato' },
                    { val: 4, label: '4 - Ajudou a acalmar razoavelmente' },
                    { val: 5, label: '5 - Muito eficaz, resolveu e regulou a crise' }
                  ].map(e => (
                    <label key={e.val} className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${efficacy === e.val ? 'bg-sky-500 border-sky-600 text-white' : 'bg-surface-muted border-border-subtle text-text-muted hover:bg-border-subtle'}`}>
                      <input type="radio" name="efficacy" value={e.val} checked={efficacy === e.val} onChange={() => setEfficacy(e.val)} className="accent-primary-600 w-4 h-4 cursor-pointer" />
                      <span className="text-sm font-medium">{e.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Reação do Ambiente</label>
                <p className="text-xs text-text-muted mb-2">Ex: As pessoas cederam ao desejo? Ficaram assustadas? Brigaram?</p>
                <textarea placeholder="O que aconteceu imediatamente após o comportamento?" value={environmentReaction} onChange={(e) => setEnvironmentReaction(e.target.value)} className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[60px]" />
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2 mt-6">Tradução Simultânea</label>
                <p className="text-xs text-text-muted mb-2">Como você explicaria este evento para um neurotípico ou no contexto corporativo?</p>
                <p className="text-xs text-text-muted mb-3 italic">Ex: "Tive uma sobrecarga sensorial" → "Não consegui processar múltiplos estímulos ao mesmo tempo, então precisei de um tempo sozinho para recuperar a capacidade de concentração."</p>
                <textarea 
                  placeholder="Tradução para linguagem neurotípica..." 
                  value={neurotypicalTranslation} 
                  onChange={(e) => setNeurotypicalTranslation(e.target.value)} 
                  className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[80px]" 
                />
              </section>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-4"><FileText className="text-primary-500" size={20} /> 5. Observações Finais</h3>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Sinais Precursores (Aviso)</label>
                <p className="text-xs text-text-muted mb-2">O que aconteceu logo antes que poderia nos avisar de que a crise viria? (Ex: agitação motora, roer unhas, ficar pálido, respiração ofegante)</p>
                <textarea placeholder="Sinais físicos ou comportamentais percebidos antes do pico da crise..." value={warningSigns} onChange={(e) => setWarningSigns(e.target.value)} className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[60px]" />
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Estado Pós-Crise</label>
                <p className="text-xs text-text-muted mb-2">Como a pessoa ficou após o final do evento? (Ex: Exausto, dormiu, choramingando, não falou nada)</p>
                <input type="text" placeholder="Estado físico/mental subsequente..." value={postCrisisState} onChange={(e) => setPostCrisisState(e.target.value)} className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Impacto em Funções Executivas</label>
                <p className="text-xs text-text-muted mb-3">O evento afetou sua capacidade de executar funções cognitivas?</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {EXECUTIVE_FUNCTION_IMPACTS.map((impact) => (
                    <button 
                      type="button" 
                      key={impact} 
                      onClick={() => toggleSelection(impact, executiveFunctionImpact, setExecutiveFunctionImpact)} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        executiveFunctionImpact.includes(impact) 
                          ? 'bg-green-500 border-green-600 text-white' 
                          : 'bg-surface-muted border-border-subtle text-text-muted hover:bg-border-subtle'
                      }`}
                    >
                      {impact}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-sm font-semibold text-text-muted mb-2">Anotações Adicionais (Opcional)</label>
                <textarea placeholder="Qualquer outra observação da perspectiva do observador..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 bg-surface-muted border border-border-subtle text-text-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[60px]" />
              </section>
            </motion.div>
          )}

        </AnimatePresence>

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setActiveTab('dashboard');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 font-medium text-text-muted hover:text-text-main transition-colors"
          >
            <ArrowLeft size={18} /> {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                setStep(step + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              Avançar <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Registro Completo'} <Save size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
