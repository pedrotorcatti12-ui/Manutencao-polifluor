
import React, { useState } from 'react';
import { Equipment, MaintenanceTask, MaintenanceStatus, MaintenanceType as MType } from '../types';
import { PlusIcon, EditIcon, InfoIcon, ChevronDownIcon, DeleteIcon, TargetIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';
import { WorkOrderModal } from './WorkOrderModal';
import { ConfirmationModal } from './ConfirmationModal';

export const EditableEquipmentRow: React.FC<{
    equipment: Equipment;
    onView: (eq: Equipment) => void;
    onEdit: (eq: Equipment) => void;
    onDelete: (eq: Equipment) => void;
}> = ({ equipment, onView, onEdit, onDelete }) => {
    const { setEquipmentData, statusConfig, maintainers, requesters, standardTasks, standardMaterials } = useDataContext();
    const [isOpen, setIsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
    const [deletingTask, setDeletingTask] = useState<MaintenanceTask | null>(null);

    const handleTaskUpdate = (updatedTask: MaintenanceTask) => {
        setEquipmentData(prev => prev.map(eq => {
            if (eq.id === equipment.id) {
                const newSchedule = [...eq.schedule];
                const taskIndex = newSchedule.findIndex(t => t.id === updatedTask.id);
                if (taskIndex > -1) {
                    newSchedule[taskIndex] = updatedTask;
                } else {
                    newSchedule.push(updatedTask);
                }
                return { ...eq, schedule: newSchedule };
            }
            return eq;
        }));
    };
  
    const handleTaskDelete = () => {
        if (!deletingTask) return;
        setEquipmentData(prev => prev.map(eq => {
            if (eq.id === equipment.id) {
                return { ...eq, schedule: eq.schedule.filter(t => t.id !== deletingTask.id) };
            }
            return eq;
        }));
        setDeletingTask(null);
    }

    const handleAddNewTask = () => {
        const newTask: MaintenanceTask = {
            id: `new_task_${Date.now()}`,
            year: new Date().getFullYear(),
            month: 'Janeiro',
            status: MaintenanceStatus.Scheduled,
            type: MType.Preventive,
            description: '',
            details: []
        };
        setEditingTask(newTask);
    };

    const handleSaveTask = (task: MaintenanceTask) => {
        handleTaskUpdate(task);
        setEditingTask(null);
    };

    const tasksSorted = [...equipment.schedule].sort((a,b) => b.year - a.year || a.month.localeCompare(b.month));

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all ${equipment.isKeyEquipment ? 'border-l-4 border-orange-500 border-orange-100' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-3">
                     {equipment.isKeyEquipment && (
                         <div className="px-2 py-0.5 bg-orange-600 text-white text-[8px] font-black rounded uppercase flex items-center gap-1 shadow-sm">
                             <TargetIcon className="w-2 h-2" /> Crítico
                         </div>
                     )}
                     <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase">{equipment.id} - {equipment.name}</h3>
                     <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${equipment.status === 'Ativo' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {equipment.status.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onView(equipment); }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all"><InfoIcon className="w-4 h-4"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(equipment); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"><EditIcon className="w-4 h-4"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(equipment); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"><DeleteIcon className="w-4 h-4"/></button>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-300 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cronograma deste Ativo</h4>
                        <button onClick={handleAddNewTask} className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-black rounded-md text-[10px] uppercase shadow-sm">
                            <PlusIcon className="w-3 h-3" /> Nova Tarefa
                        </button>
                    </div>
                    
                    {tasksSorted.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {tasksSorted.map(task => (
                                <div key={task.id} className="bg-white dark:bg-gray-700 p-2.5 rounded-lg border border-gray-100 dark:border-gray-600 flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase">{task.description}</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{task.month} {task.year} • {task.status}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setEditingTask(task)} className="p-1 text-gray-300 hover:text-blue-500 transition-colors"><EditIcon className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => setDeletingTask(task)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><DeleteIcon className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] text-center text-gray-400 italic py-4">Sem tarefas programadas.</p>
                    )}
                </div>
            )}
             {editingTask && (
                <WorkOrderModal 
                    isOpen={!!editingTask} 
                    onClose={() => setEditingTask(null)} 
                    task={{ equipment, task: editingTask, year: editingTask.year, monthIndex: 0 }} 
                    onTaskUpdate={handleSaveTask} 
                    statusConfig={statusConfig} 
                    maintainers={maintainers}
                    requesters={requesters}
                    standardTasks={standardTasks}
                    standardMaterials={standardMaterials}
                />
            )}
            {deletingTask && (
                <ConfirmationModal
                    isOpen={!!deletingTask}
                    onClose={() => setDeletingTask(null)}
                    onConfirm={handleTaskDelete}
                    title="Excluir Tarefa"
                    message="Deseja remover esta tarefa do cronograma?"
                />
            )}
        </div>
    );
};
