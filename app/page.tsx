'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Calendar, 
  Pill, 
  BrainCircuit, 
  LineChart,
  Plus,
  Check,
  X,
  AlertCircle,
  Moon,
  Sun,
  Coffee,
  Frown,
  Smile,
  Meh,
  SmilePlus,
  Angry,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
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
import { GoogleGenAI } from '@google/genai';

// --- Types ---
type Mood = 1 | 2 | 3 | 4 | 5; // 1: Very Bad, 5: Very Good

interface CheckIn {
  id: string;
  date: string; // ISO string
  mood: Mood;
  painLevel: number; // 0-10
  sleepHours: number;
  sleepQuality: number; // 1-5
  dietNotes: string;
  symptoms: string[];
  generalNotes: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string; // HH:mm
}

interface MedLog {
  id: string;
  medId: string;
  date: string; // ISO string (just date part or full datetime)
  taken: boolean;
}

// --- Mock Data ---
const generateMockData = (): CheckIn[] => {
  const data: CheckIn[] = [];
  const today = new Date();
  for (let i = 14; i >= 0; i--) {
    const d = subDays(today, i);
    // Introduce some patterns for the AI to find
    // E.g., bad sleep -> high pain next day
    // Coffee -> bad sleep
    const hasCoffee = Math.random() > 0.6;
    const sleepHours = hasCoffee ? 4 + Math.random() * 2 : 6 + Math.random() * 3;
    const sleepQuality = hasCoffee ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 3;
    const painLevel = sleepHours < 6 ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 4);
    const mood = painLevel > 5 ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 3;

    data.push({
      id: `mock-${i}`,
      date: d.toISOString(),
      mood: mood as Mood,
      painLevel: painLevel,
      sleepHours: parseFloat(sleepHours.toFixed(1)),
      sleepQuality: sleepQuality,
      dietNotes: hasCoffee ? 'High caffeine intake, fast food' : 'Healthy meals, water',
      symptoms: painLevel > 6 ? ['Headache', 'Fatigue'] : [],
      generalNotes: ''
    });
  }
  return data;
};

const initialMeds: Medication[] = [
  { id: 'm1', name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', time: '08:00' },
  { id: 'm2', name: 'Sertraline', dosage: '50mg', frequency: 'Daily', time: '09:00' },
];

// --- Components ---

const MoodIcon = ({ mood, className, size }: { mood: number, className?: string, size?: number }) => {
  switch (mood) {
    case 1: return <Angry className={className} size={size} />;
    case 2: return <Frown className={className} size={size} />;
    case 3: return <Meh className={className} size={size} />;
    case 4: return <Smile className={className} size={size} />;
    case 5: return <SmilePlus className={className} size={size} />;
    default: return <Meh className={className} size={size} />;
  }
};

export default function SymptomTrackerApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkin' | 'meds' | 'insights' | 'reports'>('dashboard');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [medications, setMedications] = useState<Medication[]>(initialMeds);
  const [medLogs, setMedLogs] = useState<MedLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load data from local storage or use mock
    const loadData = () => {
      try {
        const savedCheckIns = localStorage.getItem('checkIns');
        if (savedCheckIns) {
          setCheckIns(JSON.parse(savedCheckIns));
        } else {
          const mock = generateMockData();
          setCheckIns(mock);
          localStorage.setItem('checkIns', JSON.stringify(mock));
        }

        const savedMeds = localStorage.getItem('medications');
        if (savedMeds) setMedications(JSON.parse(savedMeds));

        const savedLogs = localStorage.getItem('medLogs');
        if (savedLogs) setMedLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error('Failed to access localStorage', e);
        setCheckIns(generateMockData());
      } finally {
        setIsLoaded(true);
      }
    };
    
    setTimeout(loadData, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('checkIns', JSON.stringify(checkIns));
        localStorage.setItem('medications', JSON.stringify(medications));
        localStorage.setItem('medLogs', JSON.stringify(medLogs));
      } catch (e) {
        console.error('Failed to write to localStorage', e);
      }
    }
  }, [checkIns, medications, medLogs, isLoaded]);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0 md:pl-64">
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 md:hidden z-50">
        <NavItem icon={<Activity />} label="Início" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<Plus />} label="Check-in" active={activeTab === 'checkin'} onClick={() => setActiveTab('checkin')} />
        <NavItem icon={<Pill />} label="Remédios" active={activeTab === 'meds'} onClick={() => setActiveTab('meds')} />
        <NavItem icon={<BrainCircuit />} label="Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
        <NavItem icon={<LineChart />} label="Relatórios" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 bg-white border-r border-slate-200 p-4 z-50">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Activity size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-800">My Tracking</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <SidebarItem icon={<Activity />} label="Início" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Plus />} label="Check-in Diário" active={activeTab === 'checkin'} onClick={() => setActiveTab('checkin')} />
          <SidebarItem icon={<Pill />} label="Medicamentos" active={activeTab === 'meds'} onClick={() => setActiveTab('meds')} />
          <SidebarItem icon={<BrainCircuit />} label="Insights com IA" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
          <SidebarItem icon={<LineChart />} label="Relatórios" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardView key="dashboard" checkIns={checkIns} medications={medications} medLogs={medLogs} setMedLogs={setMedLogs} setActiveTab={setActiveTab} />}
          {activeTab === 'checkin' && <CheckInView key="checkin" checkIns={checkIns} setCheckIns={setCheckIns} setActiveTab={setActiveTab} />}
          {activeTab === 'meds' && <MedicationsView key="meds" medications={medications} setMedications={setMedications} />}
          {activeTab === 'insights' && <InsightsView key="insights" checkIns={checkIns} />}
          {activeTab === 'reports' && <ReportsView key="reports" checkIns={checkIns} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Navigation Components ---
const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    {icon}
    {label}
  </button>
);

// --- Views ---

function DashboardView({ checkIns, medications, medLogs, setMedLogs, setActiveTab }: any) {
  const today = new Date();
  const todayCheckIn = checkIns.find((c: CheckIn) => isSameDay(parseISO(c.date), today));
  
  const handleMedToggle = (medId: string) => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const existingLogIndex = medLogs.findIndex((l: MedLog) => l.medId === medId && l.date.startsWith(todayStr));
    
    if (existingLogIndex >= 0) {
      const newLogs = [...medLogs];
      newLogs[existingLogIndex].taken = !newLogs[existingLogIndex].taken;
      setMedLogs(newLogs);
    } else {
      const newId = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      setMedLogs([...medLogs, { id: newId, medId, date: today.toISOString(), taken: true }]);
    }
  };

  const isMedTaken = (medId: string) => {
    const todayStr = format(today, 'yyyy-MM-dd');
    return medLogs.some((l: MedLog) => l.medId === medId && l.date.startsWith(todayStr) && l.taken);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Bom {format(today, 'a') === 'AM' ? 'dia' : 'tarde/noite'}</h2>
        <p className="text-slate-500">{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Check-in Status */}
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

        {/* Medications */}
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
              medications.map((med: Medication) => {
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
      </div>
    </motion.div>
  );
}

function CheckInView({ checkIns, setCheckIns, setActiveTab }: any) {
  const [mood, setMood] = useState<number>(3);
  const [pain, setPain] = useState<number>(0);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [dietNotes, setDietNotes] = useState('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState('');

  const handleSave = () => {
    const newCheckIn: CheckIn = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      date: new Date().toISOString(),
      mood: mood as Mood,
      painLevel: pain,
      sleepHours,
      sleepQuality,
      dietNotes,
      symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
      generalNotes
    };
    
    // Remove existing check-in for today if it exists
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const filtered = checkIns.filter((c: CheckIn) => !c.date.startsWith(todayStr));
    
    setCheckIns([newCheckIn, ...filtered]);
    setActiveTab('dashboard');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Check-in Diário</h2>
        <p className="text-slate-500">Como você está se sentindo hoje?</p>
      </header>

      <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        
        {/* Mood */}
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-4">Humor Geral</label>
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((m) => (
              <button 
                key={m} 
                onClick={() => setMood(m)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${mood === m ? 'bg-indigo-50 text-indigo-600 scale-110 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <MoodIcon mood={m} size={32} />
              </button>
            ))}
          </div>
        </section>

        {/* Pain */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <label className="block text-sm font-semibold text-slate-700">Nível de Dor</label>
            <span className="text-sm font-medium text-rose-500">{pain} / 10</span>
          </div>
          <input 
            type="range" 
            min="0" max="10" 
            value={pain} 
            onChange={(e) => setPain(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Sem Dor</span>
            <span>Pior Dor Possível</span>
          </div>
        </section>

        {/* Sleep */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Duração do Sono (hrs)</label>
            <div className="flex items-center gap-3">
              <Moon className="text-slate-400" size={20} />
              <input 
                type="number" 
                step="0.5"
                value={sleepHours} 
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Qualidade do Sono</label>
            <select 
              value={sleepQuality} 
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
            >
              <option value={1}>Muito Ruim</option>
              <option value={2}>Ruim</option>
              <option value={3}>Razoável</option>
              <option value={4}>Boa</option>
              <option value={5}>Excelente</option>
            </select>
          </div>
        </section>

        {/* Diet & Symptoms */}
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dieta & Gatilhos</label>
            <textarea 
              placeholder="Ex: tomei 3 cafés, comi fast food..."
              value={dietNotes}
              onChange={(e) => setDietNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sintomas Específicos (separados por vírgula)</label>
            <input 
              type="text"
              placeholder="Dor de cabeça, náusea, fadiga..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </section>

        <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          Salvar Check-in
        </button>
      </div>
    </motion.div>
  );
}

function MedicationsView({ medications, setMedications }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', time: '' });

  const handleAdd = () => {
    if (newMed.name) {
      setMedications([...medications, { ...newMed, id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36) }]);
      setNewMed({ name: '', dosage: '', frequency: '', time: '' });
      setShowAdd(false);
    }
  };

  const handleDelete = (id: string) => {
    setMedications(medications.filter((m: Medication) => m.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medicamentos</h2>
          <p className="text-slate-500">Gerencie suas prescrições e lembretes</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-100 text-indigo-700 p-2 rounded-xl hover:bg-indigo-200 transition-colors">
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </header>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 space-y-4">
              <h3 className="font-semibold text-slate-800">Adicionar Novo Medicamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nome do Medicamento" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="text" placeholder="Dosagem (ex: 50mg)" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="text" placeholder="Frequência (ex: Diariamente)" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input type="time" value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                Salvar Medicamento
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {medications.map((med: Medication) => (
          <div key={med.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Pill size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">{med.name}</h4>
                <p className="text-sm text-slate-500">{med.dosage} • {med.frequency} às {med.time}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(med.id)} className="text-slate-400 hover:text-rose-500 p-2 transition-colors">
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function InsightsView({ checkIns }: { checkIns: CheckIn[] }) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Prepare data for AI
      const dataString = checkIns.slice(0, 14).map(c => 
        `Data: ${format(parseISO(c.date), "dd 'de' MMM", { locale: ptBR })}, Humor: ${c.mood}/5, Dor: ${c.painLevel}/10, Sono: ${c.sleepHours}h (Qualidade: ${c.sleepQuality}/5), Dieta: ${c.dietNotes}, Sintomas: ${c.symptoms.join(', ')}`
      ).join('\n');

      const prompt = `
        Você é um assistente de saúde de IA empático e profissional analisando o diário de sintomas de um paciente nos últimos 14 dias.
        Analise os seguintes dados e forneça:
        1. Um resumo breve e encorajador do bem-estar geral.
        2. 2-3 possíveis padrões ou gatilhos que você notar (ex: "Em dias com menos de 6 horas de sono, seus níveis de dor tendem a ser maiores").
        3. 1-2 recomendações práticas e gentis para cuidados paliativos ou bem-estar mental (ex: reformulação de pensamentos baseada em TCC, higiene do sono).
        
        Mantenha o tom de apoio, clínico, mas acolhedor. Não use cabeçalhos markdown, apenas parágrafos claros.
        Responda em Português do Brasil.
        
        Dados:
        ${dataString}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsights(response.text || 'Nenhum insight gerado.');
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
        <h2 className="text-2xl font-bold text-slate-900">Insights de Saúde com IA</h2>
        <p className="text-slate-500">Descubra padrões e gatilhos em seus registros diários</p>
      </header>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">Análise de Padrões</h3>
            <p className="text-sm text-slate-500">Nossa IA analisa seus check-ins recentes para encontrar correlações entre seu estilo de vida e sintomas.</p>
          </div>
        </div>

        {!insights && !loading && (
          <button onClick={generateInsights} className="w-full bg-indigo-50 text-indigo-700 py-4 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
            <BrainCircuit size={18} /> Gerar Insights
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

function ReportsView({ checkIns }: { checkIns: CheckIn[] }) {
  // Sort data chronologically for charts
  const sortedData = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-14);
  
  const chartData = sortedData.map(c => ({
    date: format(parseISO(c.date), "dd 'de' MMM", { locale: ptBR }),
    pain: c.painLevel,
    mood: c.mood,
    sleep: c.sleepHours
  }));

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
        {/* Pain & Mood Chart */}
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

        {/* Sleep Chart */}
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

      {/* Summary Stats */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg">
        <h3 className="font-semibold text-slate-200 mb-6">Resumo de 14 Dias</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Nível Médio de Dor</p>
            <p className="text-3xl font-light">{(chartData.reduce((acc, curr) => acc + curr.pain, 0) / chartData.length).toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Média de Sono</p>
            <p className="text-3xl font-light">{(chartData.reduce((acc, curr) => acc + curr.sleep, 0) / chartData.length).toFixed(1)}<span className="text-lg text-slate-500">h</span></p>
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
