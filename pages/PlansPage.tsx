
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { MaintenancePlan, EquipmentType } from '../types';
import { PlusIcon, EditIcon, DeleteIcon, TargetIcon, InfoIcon } from '../components/icons';
import { MaintenancePlanModal } from '../components/MaintenancePlanModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PlanInfoModal } from '../components/PlanInfoModal';

export const PlansPage: React.FC = () => {
    const { maintenancePlans, setMaintenancePlans, equipmentTypes, removePlan } = useDataContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<MaintenancePlan | null>(null);

    const handleSavePlan = (plan: MaintenancePlan) => {
        if (editingPlan) {
            setMaintenancePlans(prev => prev.map(p => p.id === plan.id ? plan : p));
        } else {
            const newPlan = { ...plan, id: `PL-${Date.now()}` };
            setMaintenancePlans(prev => [...prev, newPlan]);
        }
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const getTypeName = (id: string) => {
        return equipmentTypes.find(t => t.id === id)?.description || id;
    };

    return (
        <div className="space-y-6">
            <Header 
                title="Estratégia de Manutenção (Planos)" 
                subtitle="Defina o 'DNA' da sua manutenção: o que fazer e com qual frequência."
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => setIsInfoOpen(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <InfoIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => { setEditingPlan(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700">
                            <PlusIcon className="w-4 h-4"/> Criar Novo Plano
                        </button>
                    </div>
                }
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maintenancePlans.map(plan => (
                    <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase">{getTypeName(plan.equipmentTypeId)}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => setDeletingPlan(plan)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><DeleteIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase leading-tight">{plan.description}</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TargetIcon className="w-4 h-4 text-orange-500"/>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Frequência</span>
                                </div>
                                <span className="text-sm font-black text-blue-600">A cada {plan.frequency} {plan.frequency === 1 ? 'mês' : 'meses'}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Checklist de Tarefas ({plan.tasks.length})</p>
                                {plan.tasks.slice(0, 3).map((t, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                        <span className="truncate">{t.action}</span>
                                    </div>
                                ))}
                                {plan.tasks.length > 3 && <p className="text-[10px] text-blue-500 font-bold mt-1">+ {plan.tasks.length - 3} outras tarefas...</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {maintenancePlans.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <TargetIcon className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                    <p className="text-gray-500 font-medium">Nenhum plano estratégico criado ainda.</p>
                </div>
            )}

            <MaintenancePlanModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSavePlan} 
                existingPlan={editingPlan} 
                equipmentTypes={equipmentTypes} 
            />

            <PlanInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
            
            {deletingPlan && (
                <ConfirmationModal 
                    isOpen={!!deletingPlan} 
                    onClose={() => setDeletingPlan(null)} 
                    onConfirm={() => { removePlan(deletingPlan.id); setDeletingPlan(null); }} 
                    title="Excluir Plano" 
                    message={`Tem certeza que deseja excluir o plano "${deletingPlan.description}"? Isso não afetará tarefas já agendadas.`} 
                />
            )}
        </div>
    );
};
