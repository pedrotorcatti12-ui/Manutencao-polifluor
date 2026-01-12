// FIX: Implemented the missing MaintenancePlanModal component to resolve module not found errors.
import React, { useState, useEffect } from 'react';
import { MaintenancePlan, EquipmentType, TaskDetail } from '../types';
import { CloseIcon } from './icons';
import { TaskDetailsSection, DetailWithId } from './TaskDetailsSection';
// FIX: Corrected import names for constants.
import { INITIAL_PREDEFINED_ACTIONS, INITIAL_PREDEFINED_MATERIALS } from '../constants';

interface MaintenancePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: MaintenancePlan) => void;
    existingPlan: MaintenancePlan | null;
    equipmentTypes: EquipmentType[];
}

export const MaintenancePlanModal: React.FC<MaintenancePlanModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingPlan,
    equipmentTypes,
}) => {
    const [description, setDescription] = useState('');
    const [equipmentTypeId, setEquipmentTypeId] = useState('');
    const [frequency, setFrequency] = useState(1);
    const [tasks, setTasks] = useState<DetailWithId[]>([]);

    useEffect(() => {
        if (existingPlan) {
            setDescription(existingPlan.description);
            setEquipmentTypeId(existingPlan.equipmentTypeId);
            setFrequency(existingPlan.frequency);
            setTasks(existingPlan.tasks.map(t => ({ ...t, id: crypto.randomUUID() })));
        } else {
            setDescription('');
            setEquipmentTypeId('');
            setFrequency(1);
            setTasks([]);
        }
    }, [existingPlan]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const planData: MaintenancePlan = {
            id: existingPlan?.id || '',
            description,
            equipmentTypeId,
            frequency,
            tasks: tasks.map(({ id, ...rest }) => rest),
        };
        onSave(planData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 relative border border-gray-200 dark:border-gray-600 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                    <CloseIcon />
                </button>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {existingPlan ? 'Editar Plano de Manutenção' : 'Novo Plano de Manutenção'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Defina as tarefas e a frequência para um tipo de equipamento.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="plan-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Descrição do Plano
                        </label>
                        <input
                            type="text"
                            id="plan-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Ex: Manutenção Preventiva Mensal do Torno CNC"
                            className="mt-1 block w-full form-input"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="plan-equipment-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tipo de Equipamento
                            </label>
                            <select
                                id="plan-equipment-type"
                                value={equipmentTypeId}
                                onChange={e => setEquipmentTypeId(e.target.value)}
                                required
                                className="mt-1 block w-full form-input"
                            >
                                <option value="" disabled>Selecione um tipo...</option>
                                {equipmentTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.description}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="plan-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Frequência (em meses)
                            </label>
                            <input
                                type="number"
                                id="plan-frequency"
                                value={frequency}
                                onChange={(e) => setFrequency(Math.max(1, parseInt(e.target.value, 10)))}
                                required
                                min="1"
                                className="mt-1 block w-full form-input"
                            />
                        </div>
                    </div>
                    <div>
                        <TaskDetailsSection
                            details={tasks}
                            onDetailsChange={setTasks}
                            // FIX: Use correct constant names.
                            predefinedActions={INITIAL_PREDEFINED_ACTIONS}
                            predefinedMaterials={INITIAL_PREDEFINED_MATERIALS}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
                        Salvar Plano
                    </button>
                </div>
                <style>{`
                    .form-input { appearance: none; background-color: #fff; border-color: #d1d5db; border-width: 1px; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; width: 100%; } 
                    .dark .form-input { background-color: #374151; border-color: #4b5563; color: #f9fafb; }
                `}</style>
            </form>
        </div>
    );
};