'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Activity, Plus, Pill, BrainCircuit, LineChart, LogOut, ClipboardList } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

// Components
import { DashboardView } from '@/components/DashboardView';
import { CheckInView } from '@/components/CheckInView';
import { MedicationsView } from '@/components/MedicationsView';
import { InsightsView } from '@/components/InsightsView';
import { ReportsView } from '@/components/ReportsView';
import { BehaviorView } from '@/components/BehaviorView';

// Types & Actions
import { CheckIn, Medication, Mood } from './types';
import { getCheckIns, getMedications, getBehaviorLogs } from './actions';

export default function SymptomTrackerApp() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = async () => {
    try {
      const [dbCheckIns, dbMeds, dbBehaviorLogs] = await Promise.all([
        getCheckIns(),
        getMedications(),
        getBehaviorLogs()
      ]);
      
      const formattedCheckIns = dbCheckIns.map((c: any) => ({
        ...c,
        date: c.date.toISOString(),
        mood: c.mood as Mood
      }));

      setCheckIns(formattedCheckIns);
      setMedications(dbMeds as any);
      setBehaviorLogs(dbBehaviorLogs as any);
    } catch (e) {
      console.error('Falha ao carregar dados', e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Carregando...</div>;

  const NavItem = ({ icon, label, tab }: { icon: any, label: string, tab: string }) => (
    <button 
      onClick={() => setActiveTab(tab)} 
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  const SidebarItem = ({ icon, label, tab, onClick, className }: any) => (
    <button 
      onClick={onClick || (() => setActiveTab(tab))} 
      className={className || `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0 md:pl-64">
      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 md:hidden z-50">
        <NavItem icon={<Activity />} label="Início" tab="dashboard" />
        <NavItem icon={<Plus />} label="Check-in" tab="checkin" />
        <NavItem icon={<ClipboardList />} label="Eventos" tab="behavior" />
        <NavItem icon={<Pill />} label="Remédios" tab="meds" />
        <NavItem icon={<BrainCircuit />} label="Insights" tab="insights" />
        <NavItem icon={<LineChart />} label="Relatórios" tab="reports" />
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 bg-white border-r border-slate-200 p-4 z-50">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Activity size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-800">NeuroTracker</h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem icon={<Activity />} label="Início" tab="dashboard" />
          <SidebarItem icon={<Plus />} label="Check-in Diário" tab="checkin" />
          <SidebarItem icon={<ClipboardList />} label="Registro de Eventos" tab="behavior" />
          <SidebarItem icon={<Pill />} label="Medicamentos" tab="meds" />
          <SidebarItem icon={<BrainCircuit />} label="Insights com IA" tab="insights" />
          <SidebarItem icon={<LineChart />} label="Relatórios" tab="reports" />
        </nav>

        <div className="border-t border-slate-100 pt-4 mt-auto">
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuário</p>
            <p className="text-sm font-medium text-slate-700 truncate">{session?.user?.name || 'Admin'}</p>
          </div>
          <SidebarItem 
            icon={<LogOut size={18} />} 
            label="Sair do Sistema" 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-rose-600 hover:bg-rose-50 w-full"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardView key="dashboard" checkIns={checkIns} medications={medications} behaviorLogs={behaviorLogs} setActiveTab={setActiveTab} onRefresh={loadData} />}
          {activeTab === 'checkin' && <CheckInView key="checkin" setActiveTab={setActiveTab} onRefresh={loadData} />}
          {activeTab === 'behavior' && <BehaviorView key="behavior" setActiveTab={setActiveTab} onRefresh={loadData} />}
          {activeTab === 'meds' && <MedicationsView key="meds" medications={medications} onRefresh={loadData} />}
          {activeTab === 'insights' && <InsightsView key="insights" checkIns={checkIns} />}
          {activeTab === 'reports' && <ReportsView key="reports" checkIns={checkIns} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
