
import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentType, MaintenancePlan, TaskDetail } from '../types';
import { CloseIcon, TargetIcon, ClipboardListIcon, PlusIcon, DeleteIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: Equipment) => void;
  existingEquipment: Equipment | null;
  equipmentTypes: EquipmentType[];
  maintenancePlans: MaintenancePlan[];
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({ isOpen, onClose, onSave, existingEquipment, equipmentTypes, maintenancePlans }) => {
  const { equipmentData } = useDataContext();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [model, setModel] = useState('');
  const [yearOfManufacture, setYearOfManufacture] = useState('');
  const [isKeyEquipment, setIsKeyEquipment] = useState(false);
  const [customPlanId, setCustomPlanId] = useState('');
  const [customChecklist, setCustomChecklist] = useState<TaskDetail[]>([]);
  const [useCustomChecklist, setUseCustomChecklist] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingEquipment) {
      setId(existingEquipment.id);
      setName(existingEquipment.name);
      setLocation(existingEquipment.location || '');
      setStatus(existingEquipment.status || 'Ativo');
      setModel(existingEquipment.model || '');
      setYearOfManufacture(String(existingEquipment.yearOfManufacture || ''));
      setIsKeyEquipment(existingEquipment.isKeyEquipment || false);
      setCustomPlanId(existingEquipment.customPlanId || '');
      
      if (existingEquipment.individualChecklist && existingEquipment.individualChecklist.length > 0) {
        setCustomChecklist(existingEquipment.individualChecklist);
        setUseCustomChecklist(true);
      } else {
        setUseCustomChecklist(false);
      }
    } else {
      setId(''); setName(''); setLocation(''); setStatus('Ativo'); setModel(''); 
      setYearOfManufacture(''); setIsKeyEquipment(false); setCustomPlanId('');
      setCustomChecklist([]); setUseCustomChecklist(false);
    }
    setError('');
  }, [existingEquipment, isOpen]);

  if (!isOpen) return null;

  const handleAddAction = () => setCustomChecklist([...customChecklist, { action: '', materials: '' }]);
  const handleRemoveAction = (idx: number) => setCustomChecklist(customChecklist.filter((_, i) => i !== idx));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de Duplicidade de ID
    if (!existingEquipment) {
        const isDuplicate = equipmentData.some(eq => eq.id.trim().toUpperCase() === id.trim().toUpperCase());
        if (isDuplicate) {
            setError(`O ID "${id}" já está cadastrado para outro equipamento.`);
            return;
        }
    }

    const data: Equipment = {
        ...(existingEquipment || { schedule: [] }),
        id: id.trim().toUpperCase(), 
        name, location, status, model, yearOfManufacture,
        isKeyEquipment,
        customPlanId: customPlanId || undefined,
        individualChecklist: useCustomChecklist ? customChecklist : []
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative border border-gray-200 dark:border-gray-700 max-h-[95vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <CloseIcon className="w-5 h-5"/>
        </button>

        <div className="mb-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ficha do Ativo</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Edição de identificação e tarefas específicas</p>
        </div>

        <div className="space-y-5">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg uppercase animate-pulse">
                    ⚠️ {error}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">ID (Identificação Única)</label>
                    <input type="text" value={id} onChange={e => setId(e.target.value)} required disabled={!!existingEquipment} className="form-input font-bold disabled:opacity-50 uppercase" placeholder="Ex: PH-21" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-blue-500 uppercase mb-1">Nome do Ativo *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="form-input font-bold border-blue-200" placeholder="Ex: Prensa Hidráulica 15T" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Família / Tipo</label>
                    <select value={model} onChange={e => setModel(e.target.value)} required className="form-input text-xs font-bold">
                        <option value="">Selecione...</option>
                        {equipmentTypes.map(t => <option key={t.id} value={t.id}>{t.description}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Localização</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="form-input text-xs" />
                </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/30">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <ClipboardListIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 tracking-tighter">Checklist de Campo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Usar Customizado?</span>
                        <input type="checkbox" checked={useCustomChecklist} onChange={e => setUseCustomChecklist(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    </div>
                </div>

                {!useCustomChecklist ? (
                    <p className="text-[10px] text-gray-500 italic">Herda as tarefas do plano mestre vinculado ao tipo <b>{model || '---'}</b>.</p>
                ) : (
                    <div className="space-y-2">
                        {customChecklist.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input type="text" value={item.action} onChange={e => {
                                    const newList = [...customChecklist];
                                    newList[idx].action = e.target.value;
                                    setCustomChecklist(newList);
                                }} className="flex-1 form-input text-xs" placeholder="Descreva a tarefa..." />
                                <button type="button" onClick={() => handleRemoveAction(idx)} className="p-2 text-red-400 hover:text-red-600"><DeleteIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddAction} className="mt-2 flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase hover:underline">
                            <PlusIcon className="w-3 h-3" /> Adicionar Tarefa Específica
                        </button>
                    </div>
                )}
            </div>

            <div className={`p-4 rounded-lg border-2 flex items-center justify-between ${isKeyEquipment ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isKeyEquipment ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <TargetIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase">Equipamento Crítico?</p>
                        <p className="text-[10px] text-gray-400 font-medium">Prioridade IATF.</p>
                    </div>
                </div>
                <input type="checkbox" checked={isKeyEquipment} onChange={(e) => setIsKeyEquipment(e.target.checked)} className="w-6 h-6 rounded text-orange-600" />
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-bold text-xs text-gray-400 hover:text-gray-600 uppercase transition-all">Cancelar</button>
          <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg transition-all uppercase tracking-wider">Salvar Ativo</button>
        </div>
      </form>
    </div>
  );
};