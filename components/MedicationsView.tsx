'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pill, X } from 'lucide-react';
import { Medication } from '../app/types';
import { addMedication, deleteMedication } from '../app/actions';

interface MedicationsViewProps {
  medications: Medication[];
}

export function MedicationsView({ medications }: MedicationsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', time: '' });

  const handleAdd = async () => {
    if (newMed.name) {
      await addMedication(newMed);
      setNewMed({ name: '', dosage: '', frequency: '', time: '' });
      setShowAdd(false);
      window.location.reload();
    }
  };

  const handleDeleteClick = async (id: string) => {
    await deleteMedication(id);
    window.location.reload();
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
        {medications.map((med) => (
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
            <button onClick={() => handleDeleteClick(med.id)} className="text-slate-400 hover:text-rose-500 p-2 transition-colors">
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
